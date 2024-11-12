import db from '@db/db';
import { estimate, estimate_item } from '@db/schema';
import { createEstimateType, deleteEstimateType, editEstimateCustomerIdType, editEstimateOrderItemsType, getEstimateType } from '@type/api/estimate';
import { Request, Response } from "express";
import { eq } from 'drizzle-orm';

const createEstimate = async (req: Request, res: Response ) => {
  const createEstimateTypeAnswer = createEstimateType.safeParse(req.body);

  if (!createEstimateTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createEstimateTypeAnswer.error.flatten()})
  }

  try {
    const createdEstimate = await db.transaction(async (tx) => {
      const total_estimate_value = (createEstimateTypeAnswer.data.estimate_items.reduce((acc, item) => acc + parseFloat(item.total_value), 0)).toFixed(2);

      const tcreatedEstimate = await tx.insert(estimate).values({
        customer_id: createEstimateTypeAnswer.data.customer_id,
        total_estimate_amount: total_estimate_value
      }).returning({
        id: estimate.id,
      })

      await tx.insert(estimate_item).values(
        createEstimateTypeAnswer.data.estimate_items.map((item) => {
          return {
            estimate_id: tcreatedEstimate[0].id,
            item_id: item.item_id,
            quantity: item.quantity,
            rate: item.rate,
            total_value: item.total_value
          }
        })
      );

      const txCreatedEstimate = await tx.query.estimate.findFirst({
        where: (estimate, { eq }) => eq(estimate.id, tcreatedEstimate[0].id),
        columns: {
          id: true,
          updated_at: true,
          total_estimate_amount: true
        },
        with: {
          customer: {
            columns: {
              id: true,
              name: true
            }
          }
        }
      });

      return txCreatedEstimate;
    })

    return res.status(200).json({success: true, message: "Estimate created successfully", update: [{ type: "estimate", data: createdEstimate }]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create estimate", error: error.message ? error.message : error});
  }
}

const getEstimate = async (req: Request, res: Response ) => {
  const getEstimateTypeAnswer = getEstimateType.safeParse(req.query);

  if (!getEstimateTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getEstimateTypeAnswer.error.flatten()})
  }

  try {
    const foundEstimate = await db.query.estimate.findFirst({
      where: (estimate, { eq }) => eq(estimate.id, getEstimateTypeAnswer.data.estimate_id),
      with: {
        customer: {
          columns: {
            id: true,
            name: true,
            profileUrl: true,
            balance: true
          },
          with: {
            phone_numbers: {
              where: (phone_number, { eq }) => eq(phone_number.isPrimary, true),
              columns: {
                country_code: true,
                phone_number: true,
              }
            }
          }
        },
        estimate_items: {
          columns: {
            id: true,
            quantity: true,
            rate: true,
            total_value: true,
            item_id: true
          },
          with: {
            item: {
              columns: {
                name: true,
                rate_dimension: true,
              }
            }
          }
        }
      }
    })

    if(!foundEstimate){
      return res.status(400).json({success: false, message: "Estimate not found"});
    }

    return res.status(200).json({success: true, message: "Estimate found", data: foundEstimate});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to find estimate", error: error.message ? error.message : error});
  }
}

const editEstimateCustomerId = async (req: Request, res: Response) => {
  const editEstimateCustomerIdTypeAnswer = editEstimateCustomerIdType.safeParse(req.body);

  if(!editEstimateCustomerIdTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editEstimateCustomerIdTypeAnswer.error.flatten()})
  }

  try {

    await db.transaction(async (tx) => {
      const oldOrder = await tx.query.estimate.findFirst({
        where: (estimate, { eq }) => eq(estimate.id, editEstimateCustomerIdTypeAnswer.data.estimate_id),
        columns: {
          id: true,
        }
      })

      if(!oldOrder) {
        throw new Error("Unable to find the order!!!");
      }
      
      // update customer id in estimate
      await tx.update(estimate).set({
        customer_id: editEstimateCustomerIdTypeAnswer.data.customer_id,
      }).where(eq(estimate.id, editEstimateCustomerIdTypeAnswer.data.estimate_id));
    })

    return res.status(200).json({success: true, message: "Updated Estimate Customer!!!"})
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update customer for estimate!", error: error.message ? error.message : error});  
  }
}

const editEstimateItems = async (req: Request, res: Response ) => {
  const editEstimateOrderItemsTypeAnswer = editEstimateOrderItemsType.safeParse(req.body);

  if (!editEstimateOrderItemsTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editEstimateOrderItemsTypeAnswer.error.flatten()})
  }

  try {
    const updatedEstimate = await db.transaction(async (tx) => {

      const oldEstimate = await tx.query.estimate.findFirst({
        where: (estimate, { eq }) => eq(estimate.id, editEstimateOrderItemsTypeAnswer.data.estimate_id),
        columns: {
          id: true,
        },
        with: {
          estimate_items: {
            columns: {
              id: true,
              item_id: true
            }
          }
        }
      })

      editEstimateOrderItemsTypeAnswer.data.estimate_items.forEach(async (item) => {
        const foundItem = oldEstimate?.estimate_items.filter((oei) => oei.item_id == item.item_id);
        if(foundItem && foundItem.length > 0){
          await tx.update(estimate_item).set({
            item_id: item.item_id,
            quantity: item.quantity,
            rate: item.rate,
            total_value: item.total_value
          }).where(eq(estimate_item.id, foundItem[0].id))
        } else {
          await tx.insert(estimate_item).values({
            estimate_id: editEstimateOrderItemsTypeAnswer.data.estimate_id,
            item_id: item.item_id,
            quantity: item.quantity,
            rate: item.rate,
            total_value: item.total_value
          })
        }
      });

      const deletedItem = oldEstimate?.estimate_items.filter((oei) => {
        return !editEstimateOrderItemsTypeAnswer.data.estimate_items.reduce((pre, cur) => {
          return pre || cur.item_id === oei.item_id;
        }, false);
      });

      deletedItem?.forEach(async (item) => {
        await tx.delete(estimate_item).where(eq(estimate_item.id, item.id));
      });

      const total_estimate_amount = editEstimateOrderItemsTypeAnswer.data.estimate_items.reduce((pre, cur) => {
        return (pre ?? 0) + (parseFloat(cur.total_value) ?? 0)
      }, 0).toFixed(2);

      // update the new total balance;
      await tx.update(estimate).set({
        total_estimate_amount
      }).where(eq(estimate.id, editEstimateOrderItemsTypeAnswer.data.estimate_id));

      const txUpdatedEstimate = await tx.query.estimate.findFirst({
        where: (estimate, { eq }) => eq(estimate.id, editEstimateOrderItemsTypeAnswer.data.estimate_id),
        columns: {
          id: true,
          updated_at: true,
          total_estimate_amount: true
        },
        with: {
          customer: {
            columns: {
              id: true,
              name: true
            }
          }
        }
      });

      return txUpdatedEstimate;
    })

    return res.status(200).json({success: true, message: "Estimate edited successfully", update: [{ type: "estimate", data: updatedEstimate }]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to edit estimate", error: error.message ? error.message : error});
  }
}

const getAllEstimates = async (_req: Request, res: Response ) => {
  try {
    const allEstimates = await db.transaction(async (tx) => {
      return tx.query.estimate.findMany({
        columns: {
          id: true,
          updated_at: true,
          total_estimate_amount: true
        },
        with: {
          customer: {
            columns: {
              id: true,
              name: true
            }
          }
        },
        orderBy: (estimate, { desc }) => [desc(estimate.updated_at)],
      })
    })

    return res.status(200).json({success: true, message: "Estimates Found!", data: allEstimates});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to edit estimate", error: error.message ? error.message : error});
  }
}

const deleteEstimate = async (req: Request, res: Response ) => {
  const deleteEstimateTypeAnswer = deleteEstimateType.safeParse(req.body);

  if (!deleteEstimateTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: deleteEstimateTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      await tx.delete(estimate).where(eq(estimate.id, deleteEstimateTypeAnswer.data.estimate_id));
    });

    return res.status(200).json({success: true, message: "Estimate Deleted Successfully!", update: [{ type: "estimate", data: { id: deleteEstimateTypeAnswer.data.estimate_id, _: true } }]});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to delete estimate!", error: error.message ? error.message : error});
  }
}

export {
  createEstimate,
  editEstimateCustomerId,
  getEstimate,
  editEstimateItems,
  getAllEstimates,
  deleteEstimate
}