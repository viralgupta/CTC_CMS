import db from '@db/db';
import { carpanter, phone_number } from '@db/schema';
import { createCarpanterType, deleteCarpanterType, editCarpanterType, getCarpanterType, settleBalanceType } from '@type/api/carpanter';
import { Request, Response } from "express";
import { eq } from "drizzle-orm";

const createCarpanter = async (req: Request, res: Response) => {
  const createCarpanterTypeAnswer = createCarpanterType.safeParse(req.body);

  if (!createCarpanterTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createCarpanterTypeAnswer.error.flatten()})
  }

  try {
    const createdCarpanter = await db.transaction(async (tx) => {

      const tCarpanter = await tx.insert(carpanter).values({
        name: createCarpanterTypeAnswer.data.name,
        profileUrl: createCarpanterTypeAnswer.data.profileUrl,
        area: createCarpanterTypeAnswer.data.area,
        balance: createCarpanterTypeAnswer.data.balance
      }).returning();

      await tx.insert(phone_number).values(
        createCarpanterTypeAnswer.data.phone_numbers.map((phone_number) => {
          return {
            carpanter_id: tCarpanter[0].id,
            phone_number: phone_number.phone_number,
            country_code: phone_number.country_code,
            isPrimary: phone_number.isPrimary,
            whatsappChatId: phone_number.whatsappChatId
          };
        })
      );

      return tCarpanter[0];
    })
    
    return res.status(200).json({success: true, message: "Carpanter created successfully", data: createdCarpanter});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create Carpanter", error: error.message ? error.message : error});
  }
};

const editCarpanter = async (req: Request, res: Response) => {
  const editCarpanterTypeAnswer = editCarpanterType.safeParse(req.body);

  if (!editCarpanterTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editCarpanterTypeAnswer.error?.flatten()})
  }

  try {

    const tCarpanter = await db.query.carpanter.findFirst({
      where: (carpanter, { eq }) => eq(carpanter.id, editCarpanterTypeAnswer.data.carpanter_id),
      columns: {
        id: true
      }
    })

    if(!tCarpanter){
      return res.status(400).json({ success: false, message: "Carpanter not found" });
    }

    const updatedCarpanter = await db.update(carpanter).set({
      name: editCarpanterTypeAnswer.data.name,
      profileUrl: editCarpanterTypeAnswer.data.profileUrl,
      area: editCarpanterTypeAnswer.data.area,
    }).where(eq(carpanter.id, tCarpanter.id))
    .returning();

    return res.status(200).json({success: true, message: "Carpanter Edited Successfully", data: updatedCarpanter[0]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to edit Carpanter", error: error.message ? error.message : error});
  }
};

const settleBalance = async (req: Request, res: Response) => {
  const settleBalanceTypeAnswer = settleBalanceType.safeParse(req.body);

  if (!settleBalanceTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: settleBalanceTypeAnswer.error.flatten()})
  }

  try {
    const tCarpanter = await db.query.carpanter.findFirst({
      where: (carpanter, { eq }) => eq(carpanter.id, settleBalanceTypeAnswer.data.carpanter_id),
      columns: {
        id: true,
        balance: true
      }
    });

    if(!tCarpanter){
      return res.status(400).json({ success: false, message: "Carpanter not found" });
    }

    if(!tCarpanter.balance){
      tCarpanter.balance = "0.00";
    }

    const newBalance = settleBalanceTypeAnswer.data.operation == "add" 
    ? parseFloat(parseFloat(tCarpanter.balance).toFixed(2)) + settleBalanceTypeAnswer.data.amount 
    : parseFloat(parseFloat(tCarpanter.balance).toFixed(2)) - settleBalanceTypeAnswer.data.amount;

    
    const updatedCarpanter = await db.update(carpanter).set({
      balance: newBalance.toFixed(2)
    }).where(eq(carpanter.id, tCarpanter.id)).returning();

    return res.status(200).json({success: true, message: "Carpanter balance updated", data: updatedCarpanter[0]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update carpanter balance", error: error.message ? error.message : error});
  }
};

const getCarpanter = async (req: Request, res: Response) => {
  const getCarpanterTypeAnswer = getCarpanterType.safeParse(req.query);

  if (!getCarpanterTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getCarpanterTypeAnswer.error.flatten()})
  }

  try {
    const tCarpanter = await db.query.carpanter.findFirst({
      where: (carpanter, { eq }) => eq(carpanter.id, getCarpanterTypeAnswer.data.carpanter_id),
      with: {
        phone_numbers: {
          columns: {
            phone_number: true,
            country_code: true,
            isPrimary: true,
            whatsappChatId: true
          }
        },
        orders: {
          columns: {
            id: true,
            carpanter_commision: true,
          },
          with: {
            delivery_address: {
               columns: {
                 address: true,
               }
            }
          }
        }
      }
    });

    if(!tCarpanter){
      return res.status(400).json({ success: false, message: "Carpanter not found" });
    }

    return res.status(200).json({success: true, message: "Carpanter found", data: tCarpanter});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to get Carpanter", error: error.message ? error.message : error});
  }
};

const deleteCarpanter = async (req: Request, res: Response) => {
  const deleteCarpanterTypeAnswer = deleteCarpanterType.safeParse(req.body);

  if (!deleteCarpanterTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: deleteCarpanterTypeAnswer.error?.flatten()})
  }

  try {
    await db.transaction(async (tx) => {

      const tCarpanter = await tx.query.carpanter.findFirst({
        where: (carpanter, { eq }) => eq(carpanter.id, deleteCarpanterTypeAnswer.data.carpanter_id),
        with: {
          orders: {
            where: (order, {  isNotNull }) => isNotNull(order.carpanter_commision),
            limit: 1,
            columns: {
              id: true
            }
          }
        },
        columns: {
          id: true,
          balance: true
        }
      })
      
      if(!tCarpanter){
        throw new Error("Customer not found");
      }
      
      if(tCarpanter.balance && parseFloat(parseFloat(tCarpanter.balance).toFixed(2)) !== 0.00){
        throw new Error("Carpanter has balance pending, Settle Balance first!")
      }

      if(tCarpanter.orders.length > 0){
        throw new Error("Carpanter has orders which have Not Null Commision, Cannot Delete Carpanter!")
      }
      
      await tx.delete(carpanter).where(eq(carpanter.id, deleteCarpanterTypeAnswer.data.carpanter_id));
    });

    return res.status(200).json({success: true, message: "Carpanter deleted successfully"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to delete carpanter", error: error.message ? error.message : error});
  }
};

const getAllCarpanters = async (_req: Request, res: Response) => {
  try {
    const carpanters = await db.query.carpanter.findMany();

    return res.status(200).json({success: true, message: "Carpanters found", data: carpanters});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to get carpanters", error: error.message ? error.message : error});
  }
};

export {
  createCarpanter,
  editCarpanter,
  settleBalance,
  getCarpanter,
  deleteCarpanter,
  getAllCarpanters,
};
