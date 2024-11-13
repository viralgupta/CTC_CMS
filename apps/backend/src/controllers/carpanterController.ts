import db from '@db/db';
import { carpanter, log, phone_number } from '@db/schema';
import { createCarpanterType, deleteCarpanterType, editCarpanterType, getCarpanterType, settleBalanceType } from '@type/api/carpanter';
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { omit } from '../lib/utils';

const createCarpanter = async (req: Request, res: Response) => {
  const createCarpanterTypeAnswer = createCarpanterType.safeParse(req.body);

  if (!createCarpanterTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createCarpanterTypeAnswer.error.flatten()})
  }

  try {
    const createdCarpenter = await db.transaction(async (tx) => {

      const tCarpanter = await tx.insert(carpanter).values({
        name: createCarpanterTypeAnswer.data.name,
        profileUrl: createCarpanterTypeAnswer.data.profileUrl,
        area: createCarpanterTypeAnswer.data.area,
        balance: createCarpanterTypeAnswer.data.balance
      }).returning({id: carpanter.id});
      
      if(res.locals.session.user.id){

        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          carpanter_id: tCarpanter[0].id,
          linked_to: "CARPANTER",
          type: "CREATE",
          message: JSON.stringify(createCarpanterTypeAnswer.data)
        });
      }
      
      const numberswithPrimary = createCarpanterTypeAnswer.data.phone_numbers.filter((phone_number) => phone_number.isPrimary);

      const primaryIndex = createCarpanterTypeAnswer.data.phone_numbers.findIndex((phone_number) => phone_number.isPrimary);

      if(numberswithPrimary.length !== 1 && createCarpanterTypeAnswer.data.phone_numbers.length > 0){
        createCarpanterTypeAnswer.data.phone_numbers.forEach((phone_number) => {
          phone_number.isPrimary = false;
        })
        if (primaryIndex !== -1) {
          createCarpanterTypeAnswer.data.phone_numbers[primaryIndex].isPrimary = true;
        } else {
          createCarpanterTypeAnswer.data.phone_numbers[0].isPrimary = true;
        }
      }

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

      const txCreatedCarpenter = await tx.query.carpanter.findFirst({
        where: (architect, { eq }) => eq(architect.id, tCarpanter[0].id),
        columns: {
          profileUrl: false
        },
        with: {
          phone_numbers: {
            where: (phone_number, { eq }) => eq(phone_number.isPrimary, true),
            columns: {
              phone_number: true,
            },
            limit: 1
          }
        }
      })

      return txCreatedCarpenter;
    })
    
    return res.status(200).json({success: true, message: "Carpanter created successfully", update: [{ type: "carpenter", data: createdCarpenter }]});
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
    const updatedCarpenter = await db.transaction(async (tx) => {
      const tCarpanter = await tx.query.carpanter.findFirst({
        where: (carpanter, { eq }) => eq(carpanter.id, editCarpanterTypeAnswer.data.carpanter_id),
        columns: {
          id: true
        }
      })

      if(!tCarpanter){
        throw new Error("Carpanter not found");
      }

      await tx.update(carpanter).set({
        name: editCarpanterTypeAnswer.data.name,
        profileUrl: editCarpanterTypeAnswer.data.profileUrl,
        area: editCarpanterTypeAnswer.data.area,
      }).where(eq(carpanter.id, tCarpanter.id));

      if(res.locals.session.user.id){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          carpanter_id: tCarpanter.id,
          linked_to: "CARPANTER",
          type: "UPDATE",
          message: JSON.stringify(omit(editCarpanterTypeAnswer.data, "carpanter_id"))
        });
      }

      const txUpdatedCarpenter = await tx.query.architect.findFirst({
        where: (carpenter, { eq }) => eq(carpenter.id, tCarpanter.id),
        columns: {
          profileUrl: false
        },
        with: {
          phone_numbers: {
            where: (phone_number, { eq }) => eq(phone_number.isPrimary, true),
            columns: {
              phone_number: true,
            },
            limit: 1
          }
        }
      });

      return txUpdatedCarpenter;
    });

    return res.status(200).json({success: true, message: "Carpanter Update Successfully",  update: [{ type: "carpenter", data: updatedCarpenter }]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update Carpanter", error: error.message ? error.message : error});
  }
};

const settleBalance = async (req: Request, res: Response) => {
  const settleBalanceTypeAnswer = settleBalanceType.safeParse(req.body);

  if (!settleBalanceTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: settleBalanceTypeAnswer.error.flatten()})
  }

  try {
    const updatedCarpenter = await db.transaction(async (tx) => {
      const tCarpanter = await tx.query.carpanter.findFirst({
        where: (carpanter, { eq }) => eq(carpanter.id, settleBalanceTypeAnswer.data.carpanter_id),
        columns: {
          id: true,
          balance: true
        }
      });

      if(!tCarpanter){
        throw new Error("Carpanter not found");
      }

      if(!tCarpanter.balance){
        tCarpanter.balance = "0.00";
      }

      const newBalance = settleBalanceTypeAnswer.data.operation == "add" 
      ? parseFloat(parseFloat(tCarpanter.balance).toFixed(2)) + settleBalanceTypeAnswer.data.amount 
      : parseFloat(parseFloat(tCarpanter.balance).toFixed(2)) - settleBalanceTypeAnswer.data.amount;

      
      await tx.update(carpanter).set({
        balance: newBalance.toFixed(2)
      }).where(eq(carpanter.id, tCarpanter.id));

      if(res.locals.session.user.id){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          carpanter_id: tCarpanter.id,
          linked_to: "CARPANTER",
          type: "UPDATE",
          heading: "Carpanter Balance Updated",
          message: `
          Old Balance:${tCarpanter.balance}
          New Balance:${newBalance}
          `
        });
      }

      const txUpdatedCarpenter = await tx.query.architect.findFirst({
        where: (carpenter, { eq }) => eq(carpenter.id, tCarpanter.id),
        columns: {
          profileUrl: false
        },
        with: {
          phone_numbers: {
            where: (phone_number, { eq }) => eq(phone_number.isPrimary, true),
            columns: {
              phone_number: true,
            },
            limit: 1
          }
        }
      });

      return txUpdatedCarpenter;
    });

    return res.status(200).json({success: true, message: "Carpanter balance updated", update: [{ type: "carpenter", data: updatedCarpenter }]});
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
            id: true,
            phone_number: true,
            country_code: true,
            isPrimary: true,
            whatsappChatId: true
          }
        },
        orders: {
          orderBy: (order, { desc }) => [desc(order.created_at)],
          columns: {
            id: true,
            carpanter_commision: true,
            status: true,
            created_at: true
          },
          with: {
            delivery_address: {
               columns: {
                 house_number: true,
                 address: true,
               }
            },
            customer: {
              columns: {
                name: true
              }
            }
          },
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
        throw new Error("Carpanter has been linked to orders, Cannot Delete Carpanter!")
      }
      
      await tx.delete(carpanter).where(eq(carpanter.id, deleteCarpanterTypeAnswer.data.carpanter_id));

      if(res.locals.session.user.id){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          carpanter_id: deleteCarpanterTypeAnswer.data.carpanter_id,
          linked_to: "CARPANTER",
          type: "DELETE",
          message: `Carpenter deleted: ${JSON.stringify(omit(tCarpanter, ["orders", "id"]), null, 2)}`
        });
      }
    });

    return res.status(200).json({success: true, message: "Carpanter deleted successfully", update: [{ type: "carpenter", data: { id: deleteCarpanterTypeAnswer.data.carpanter_id, _: true } }]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to delete carpanter", error: error.message ? error.message : error});
  }
};

const getAllCarpanters = async (_req: Request, res: Response) => {
  try {
    const carpanters = await db.query.carpanter.findMany({
      columns: {
        profileUrl: false
      },
      with: {
        phone_numbers: {
          columns: {
            phone_number: true
          },
          where: (phone_number, { eq }) => eq(phone_number.isPrimary, true),
          limit: 1
        }
      }
    });

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
