import db from '@db/db';
import { architect, log, phone_number } from '@db/schema';
import { createArchitectType, deleteArchitectType, editArchitectType, getArchitectOrdersType, getArchitectType, settleBalanceType } from '@type/api/architect';
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { omit } from '../lib/utils';

const createArchitect = async (req: Request, res: Response) => {
  const createArchitectTypeAnswer = createArchitectType.safeParse(req.body);

  if (!createArchitectTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createArchitectTypeAnswer.error.flatten()})
  }

  try {
    const createdArchitect = await db.transaction(async (tx) => {

      const tArchitect = await tx.insert(architect).values({
        name: createArchitectTypeAnswer.data.name,
        profileUrl: createArchitectTypeAnswer.data.profileUrl,
        area: createArchitectTypeAnswer.data.area,
        balance: createArchitectTypeAnswer.data.balance,
        tier_id: createArchitectTypeAnswer.data.tier_id
      }).returning({ id: architect.id });
      
      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          architect_id: tArchitect[0].id,
          linked_to: "ARCHITECT",
          type: "CREATE",
          message: JSON.stringify(createArchitectTypeAnswer.data)
        });
      }
        
      const numberswithPrimary = createArchitectTypeAnswer.data.phone_numbers.filter((phone_number) => phone_number.isPrimary);

      const primaryIndex = createArchitectTypeAnswer.data.phone_numbers.findIndex((phone_number) => phone_number.isPrimary);

      if(numberswithPrimary.length !== 1 && createArchitectTypeAnswer.data.phone_numbers.length > 0){
        createArchitectTypeAnswer.data.phone_numbers.forEach((phone_number) => {
          phone_number.isPrimary = false;
        })
        if (primaryIndex !== -1) {
          createArchitectTypeAnswer.data.phone_numbers[primaryIndex].isPrimary = true;
        } else {
          createArchitectTypeAnswer.data.phone_numbers[0].isPrimary = true;
        }
      }

      await tx.insert(phone_number).values(
        createArchitectTypeAnswer.data.phone_numbers.map((phone_number) => {
          return {
            architect_id: tArchitect[0].id,
            phone_number: phone_number.phone_number,
            country_code: phone_number.country_code,
            isPrimary: phone_number.isPrimary,
            whatsappChatId: phone_number.whatsappChatId
          };
        })
      );

      const txCreatedArchitect = await tx.query.architect.findFirst({
        where: (architect, { eq }) => eq(architect.id, tArchitect[0].id),
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

      return txCreatedArchitect;
    })
    
    return res.status(200).json({success: true, message: "Architect created successfully", update: [{ type: "architect", data: createdArchitect }]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create Architect", error: error.message ? error.message : error});
  }
};

const editArchitect = async (req: Request, res: Response) => {
  const editArchitectTypeAnswer = editArchitectType.safeParse(req.body);

  if (!editArchitectTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editArchitectTypeAnswer.error?.flatten()})
  }

  try {

    const updatedArchitect = await db.transaction(async (tx) => {
      const tArchitect = await tx.query.architect.findFirst({
        where: (architect, { eq }) =>
          eq(architect.id, editArchitectTypeAnswer.data.architect_id),
        columns: {
          id: true,
        },
      });

      if (!tArchitect) {
        throw new Error("Architect not found");
      }

      await tx
        .update(architect)
        .set({
          name: editArchitectTypeAnswer.data.name,
          profileUrl: editArchitectTypeAnswer.data.profileUrl,
          area: editArchitectTypeAnswer.data.area,
          tier_id: editArchitectTypeAnswer.data.tier_id,
        })
        .where(eq(architect.id, tArchitect.id));

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          architect_id: tArchitect.id,
          linked_to: "ARCHITECT",
          type: "UPDATE",
          message: JSON.stringify(
            omit(editArchitectTypeAnswer.data, "architect_id")
          ),
        });
      }

      const txUpdatedArchitect = await tx.query.architect.findFirst({
        where: (architect, { eq }) => eq(architect.id, tArchitect.id),
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

      return txUpdatedArchitect;
    });


    return res.status(200).json({success: true, message: "Architect Updated Successfully", update: [{ type: "architect", data: updatedArchitect }]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update Architect", error: error.message ? error.message : error});
  }
};

const settleBalance = async (req: Request, res: Response) => {
  const settleBalanceTypeAnswer = settleBalanceType.safeParse(req.body);

  if (!settleBalanceTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: settleBalanceTypeAnswer.error.flatten()})
  }

  try {
    const updatedArchitect = await db.transaction(async (tx) => {
      const tArchitect = await tx.query.architect.findFirst({
        where: (architect, { eq }) => eq(architect.id, settleBalanceTypeAnswer.data.architect_id),
        columns: {
          id: true,
          balance: true
        }
      });

      if(!tArchitect){
        throw new Error("Architect not found");
      }

      if(!tArchitect.balance){
        tArchitect.balance = "0.00";
      }

      const newBalance = settleBalanceTypeAnswer.data.operation == "add" 
      ? parseFloat(parseFloat(tArchitect.balance).toFixed(2)) + settleBalanceTypeAnswer.data.amount 
      : parseFloat(parseFloat(tArchitect.balance).toFixed(2)) - settleBalanceTypeAnswer.data.amount;

      
      await tx.update(architect).set({
        balance: newBalance.toFixed(2)
      }).where(eq(architect.id, tArchitect.id));
      
      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          architect_id: tArchitect.id,
          linked_to: "ARCHITECT",
          type: "UPDATE",
          heading: "Architect Balance was updated",
          message: `
          Old Balance:${tArchitect.balance}
          New Balance:${newBalance}
          `
        });
      }

      const txUpdatedArchitect = await tx.query.architect.findFirst({
        where: (architect, { eq }) => eq(architect.id, tArchitect.id),
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

      return txUpdatedArchitect;
    });

    return res.status(200).json({success: true, message: "Architect balance updated", update: [{ type: "architect", update: [{type: "architect", data: updatedArchitect}] }]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update architect balance", error: error.message ? error.message : error});
  }
};

const getArchitect = async (req: Request, res: Response) => {
  const getArchitectTypeAnswer = getArchitectType.safeParse(req.query);

  if (!getArchitectTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getArchitectTypeAnswer.error.flatten()})
  }

  try {
    const tArchitect = await db.query.architect.findFirst({
      where: (architect, { eq }) => eq(architect.id, getArchitectTypeAnswer.data.architect_id),
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
            architect_commision: true,
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

    if(!tArchitect){
      return res.status(400).json({ success: false, message: "Architect not found" });
    }

    return res.status(200).json({success: true, message: "Architect found", data: tArchitect});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to get Architect", error: error.message ? error.message : error});
  }
};

const getArchitectOrders = async (req: Request, res: Response) => {
  const getArchitectOrderTypeAnswer = getArchitectOrdersType.safeParse(req.query);

  if (!getArchitectOrderTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getArchitectOrderTypeAnswer.error.flatten()})
  }

  try {
    const tArchitect = await db.query.architect.findFirst({
      where: (architect, { eq }) => eq(architect.id, getArchitectOrderTypeAnswer.data.architect_id),
      columns: {
        id: true,
      },
      with: {
        orders: {
          where: (order, { lt }) => lt(order.id, getArchitectOrderTypeAnswer.data.cursor),
          orderBy: (order, { desc }) => [desc(order.id)],
          limit: 10,
          columns: {
            id: true,
            architect_commision: true,
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

    if(!tArchitect){
      return res.status(400).json({ success: false, message: "Architect not found" });
    }

    return res.status(200).json({success: true, message: "More Architect Orders Fetched!", data: tArchitect.orders});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Error while fetching Architect Orders!!", error: error.message ? error.message : error});
  }
}

const deleteArchitect = async (req: Request, res: Response) => {
  const deleteArchitectTypeAnswer = deleteArchitectType.safeParse(req.body);

  if (!deleteArchitectTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: deleteArchitectTypeAnswer.error?.flatten()})
  }

  try {
    await db.transaction(async (tx) => {

      const tArchitect = await tx.query.architect.findFirst({
        where: (architect, { eq }) => eq(architect.id, deleteArchitectTypeAnswer.data.architect_id),
        with: {
          orders: {
            limit: 1,
            columns: {
              id: true
            }
          }
        },
      })
      
      if(!tArchitect){
        throw new Error("Customer not found");
      }
      
      if(tArchitect.balance && parseFloat(parseFloat(tArchitect.balance).toFixed(2)) !== 0.00){
        throw new Error("Architect has balance pending, Settle Balance first!")
      }

      if(tArchitect.orders.length > 0){
        throw new Error("Architect has been linked to orders, Cannot Delete Architect!")
      }
      
      await tx.delete(architect).where(eq(architect.id, deleteArchitectTypeAnswer.data.architect_id));

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          architect_id: deleteArchitectTypeAnswer.data.architect_id,
          linked_to: "ARCHITECT",
          type: "DELETE",
          message: `Architect deleted: ${JSON.stringify(omit(tArchitect, ["orders", "id"]), null, 2)}`
        });
      }
    });

    return res.status(200).json({success: true, message: "Architect deleted successfully", update: [{ type: "architect", data: { id: deleteArchitectTypeAnswer.data.architect_id, _: true } }]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to delete architect", error: error.message ? error.message : error});
  }
};

const getAllArchitects = async (_req: Request, res: Response) => {
  try {
    const architects = await db.query.architect.findMany({
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

    return res.status(200).json({success: true, message: "Architects found", data: architects});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to get architects", error: error.message ? error.message : error});
  }
};

export {
  createArchitect,
  editArchitect,
  settleBalance,
  getArchitect,
  getArchitectOrders,
  deleteArchitect,
  getAllArchitects,
};
