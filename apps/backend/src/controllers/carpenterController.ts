import db from '@db/db';
import { carpenter, log, phone_number } from '@db/schema';
import { createCarpenterType, deleteCarpenterType, editCarpenterType, getCarpenterOrderType, getCarpenterType, settleBalanceType } from '@type/api/carpenter';
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { omit } from '../lib/utils';

const createCarpenter = async (req: Request, res: Response) => {
  const createCarpenterTypeAnswer = createCarpenterType.safeParse(req.body);

  if (!createCarpenterTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createCarpenterTypeAnswer.error.flatten()})
  }

  try {
    const createdCarpenter = await db.transaction(async (tx) => {

      const tCarpenter = await tx.insert(carpenter).values({
        name: createCarpenterTypeAnswer.data.name,
        profileUrl: createCarpenterTypeAnswer.data.profileUrl,
        area: createCarpenterTypeAnswer.data.area,
        balance: createCarpenterTypeAnswer.data.balance,
        tier_id: createCarpenterTypeAnswer.data.tier_id
      }).returning({id: carpenter.id});
      
      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          carpenter_id: tCarpenter[0].id,
          linked_to: "CARPANTER",
          type: "CREATE",
          message: JSON.stringify(createCarpenterTypeAnswer.data)
        });
      }
      
      const numberswithPrimary = createCarpenterTypeAnswer.data.phone_numbers.filter((phone_number) => phone_number.isPrimary);

      const primaryIndex = createCarpenterTypeAnswer.data.phone_numbers.findIndex((phone_number) => phone_number.isPrimary);

      if(numberswithPrimary.length !== 1 && createCarpenterTypeAnswer.data.phone_numbers.length > 0){
        createCarpenterTypeAnswer.data.phone_numbers.forEach((phone_number) => {
          phone_number.isPrimary = false;
        })
        if (primaryIndex !== -1) {
          createCarpenterTypeAnswer.data.phone_numbers[primaryIndex].isPrimary = true;
        } else {
          createCarpenterTypeAnswer.data.phone_numbers[0].isPrimary = true;
        }
      }

      await tx.insert(phone_number).values(
        createCarpenterTypeAnswer.data.phone_numbers.map((phone_number) => {
          return {
            carpenter_id: tCarpenter[0].id,
            phone_number: phone_number.phone_number,
            country_code: phone_number.country_code,
            isPrimary: phone_number.isPrimary,
            whatsappChatId: phone_number.whatsappChatId
          };
        })
      );

      const txCreatedCarpenter = await tx.query.carpenter.findFirst({
        where: (architect, { eq }) => eq(architect.id, tCarpenter[0].id),
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
    
    return res.status(200).json({success: true, message: "Carpenter created successfully", update: [{ type: "carpenter", data: createdCarpenter }]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create Carpenter", error: error.message ? error.message : error});
  }
};

const editCarpenter = async (req: Request, res: Response) => {
  const editCarpenterTypeAnswer = editCarpenterType.safeParse(req.body);

  if (!editCarpenterTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editCarpenterTypeAnswer.error?.flatten()})
  }

  try {
    const updatedCarpenter = await db.transaction(async (tx) => {
      const tCarpenter = await tx.query.carpenter.findFirst({
        where: (carpenter, { eq }) => eq(carpenter.id, editCarpenterTypeAnswer.data.carpenter_id),
        columns: {
          id: true
        }
      })

      if(!tCarpenter){
        throw new Error("Carpenter not found");
      }

      await tx.update(carpenter).set({
        name: editCarpenterTypeAnswer.data.name,
        profileUrl: editCarpenterTypeAnswer.data.profileUrl,
        area: editCarpenterTypeAnswer.data.area,
        tier_id: editCarpenterTypeAnswer.data.tier_id
      }).where(eq(carpenter.id, tCarpenter.id));

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          carpenter_id: tCarpenter.id,
          linked_to: "CARPANTER",
          type: "UPDATE",
          message: JSON.stringify(omit(editCarpenterTypeAnswer.data, "carpenter_id"))
        });
      }

      const txUpdatedCarpenter = await tx.query.architect.findFirst({
        where: (carpenter, { eq }) => eq(carpenter.id, tCarpenter.id),
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

    return res.status(200).json({success: true, message: "Carpenter Update Successfully",  update: [{ type: "carpenter", data: updatedCarpenter }]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update Carpenter", error: error.message ? error.message : error});
  }
};

const settleBalance = async (req: Request, res: Response) => {
  const settleBalanceTypeAnswer = settleBalanceType.safeParse(req.body);

  if (!settleBalanceTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: settleBalanceTypeAnswer.error.flatten()})
  }

  try {
    const updatedCarpenter = await db.transaction(async (tx) => {
      const tCarpenter = await tx.query.carpenter.findFirst({
        where: (carpenter, { eq }) => eq(carpenter.id, settleBalanceTypeAnswer.data.carpenter_id),
        columns: {
          id: true,
          balance: true
        }
      });

      if(!tCarpenter){
        throw new Error("Carpenter not found");
      }

      if(!tCarpenter.balance){
        tCarpenter.balance = "0.00";
      }

      const newBalance = settleBalanceTypeAnswer.data.operation == "add" 
      ? parseFloat(parseFloat(tCarpenter.balance).toFixed(2)) + settleBalanceTypeAnswer.data.amount 
      : parseFloat(parseFloat(tCarpenter.balance).toFixed(2)) - settleBalanceTypeAnswer.data.amount;

      
      await tx.update(carpenter).set({
        balance: newBalance.toFixed(2)
      }).where(eq(carpenter.id, tCarpenter.id));

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          carpenter_id: tCarpenter.id,
          linked_to: "CARPANTER",
          type: "UPDATE",
          heading: "Carpenter Balance Updated",
          message: `
          Old Balance:${tCarpenter.balance}
          New Balance:${newBalance}
          `
        });
      }

      const txUpdatedCarpenter = await tx.query.architect.findFirst({
        where: (carpenter, { eq }) => eq(carpenter.id, tCarpenter.id),
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

    return res.status(200).json({success: true, message: "Carpenter balance updated", update: [{ type: "carpenter", data: updatedCarpenter }]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update carpenter balance", error: error.message ? error.message : error});
  }
};

const getCarpenter = async (req: Request, res: Response) => {
  const getCarpenterTypeAnswer = getCarpenterType.safeParse(req.query);

  if (!getCarpenterTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getCarpenterTypeAnswer.error.flatten()})
  }

  try {
    const tCarpenter = await db.query.carpenter.findFirst({
      where: (carpenter, { eq }) => eq(carpenter.id, getCarpenterTypeAnswer.data.carpenter_id),
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
          orderBy: (order, { desc }) => [desc(order.id)],
          limit: 10,
          columns: {
            id: true,
            carpenter_commision: true,
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
        },
        tier: {
          columns: {
            name: true,
          }
        }
      }
    });

    if(!tCarpenter){
      return res.status(400).json({ success: false, message: "Carpenter not found" });
    }

    return res.status(200).json({success: true, message: "Carpenter found", data: tCarpenter});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to get Carpenter", error: error.message ? error.message : error});
  }
};

const getCarpenterOrders = async (req: Request, res: Response) => {
  const getCarpenterOrderTypeAnswer = getCarpenterOrderType.safeParse(req.query);

  if (!getCarpenterOrderTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getCarpenterOrderTypeAnswer.error.flatten()})
  }

  try {
    const tCarpenter = await db.query.carpenter.findFirst({
      where: (carpenter, { eq }) => eq(carpenter.id, getCarpenterOrderTypeAnswer.data.carpenter_id),
      columns: {
        id: true,
      },
      with: {
        orders: {
          where: (order, { lt }) => lt(order.id, getCarpenterOrderTypeAnswer.data.cursor),
          orderBy: (order, { desc }) => [desc(order.id)],
          limit: 10,
          columns: {
            id: true,
            carpenter_commision: true,
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

    if(!tCarpenter){
      return res.status(400).json({ success: false, message: "Carpenter not found" });
    }

    return res.status(200).json({success: true, message: "More Carpenter Orders Fetched", data: tCarpenter.orders});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to fetch more Carpenter Orders", error: error.message ? error.message : error});
  }
};

const deleteCarpenter = async (req: Request, res: Response) => {
  const deleteCarpenterTypeAnswer = deleteCarpenterType.safeParse(req.body);

  if (!deleteCarpenterTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: deleteCarpenterTypeAnswer.error?.flatten()})
  }

  try {
    await db.transaction(async (tx) => {

      const tCarpenter = await tx.query.carpenter.findFirst({
        where: (carpenter, { eq }) => eq(carpenter.id, deleteCarpenterTypeAnswer.data.carpenter_id),
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
      
      if(!tCarpenter){
        throw new Error("Customer not found");
      }
      
      if(tCarpenter.balance && parseFloat(parseFloat(tCarpenter.balance).toFixed(2)) !== 0.00){
        throw new Error("Carpenter has balance pending, Settle Balance first!")
      }

      if(tCarpenter.orders.length > 0){
        throw new Error("Carpenter has been linked to orders, Cannot Delete Carpenter!")
      }
      
      await tx.delete(carpenter).where(eq(carpenter.id, deleteCarpenterTypeAnswer.data.carpenter_id));

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          carpenter_id: deleteCarpenterTypeAnswer.data.carpenter_id,
          linked_to: "CARPANTER",
          type: "DELETE",
          message: `Carpenter deleted: ${JSON.stringify(omit(tCarpenter, ["orders", "id"]), null, 2)}`
        });
      }
    });

    return res.status(200).json({success: true, message: "Carpenter deleted successfully", update: [{ type: "carpenter", data: { id: deleteCarpenterTypeAnswer.data.carpenter_id, _: true } }]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to delete carpenter", error: error.message ? error.message : error});
  }
};

const getAllCarpenters = async (_req: Request, res: Response) => {
  try {
    const carpenters = await db.query.carpenter.findMany({
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

    return res.status(200).json({success: true, message: "Carpenters found", data: carpenters});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to get carpenters", error: error.message ? error.message : error});
  }
};

export {
  createCarpenter,
  editCarpenter,
  settleBalance,
  getCarpenter,
  getCarpenterOrders,
  deleteCarpenter,
  getAllCarpenters,
};
