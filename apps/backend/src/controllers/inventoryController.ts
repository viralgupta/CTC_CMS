import db from '@db/db';
import { item, item_order } from '@db/schema';
import { createItemType, deleteItemType, editItemType, getItemType, getItemRatesType, createItemOrderType, editItemOrderType, receiveItemOrderType, deleteItemOrderType } from '@type/api/item';
import { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";

const createItem = async (req: Request, res: Response) => {
  const createItemTypeAnswer = createItemType.safeParse(req.body);

  if (!createItemTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createItemTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const createdItem = await tx.insert(item).values({
        name: createItemTypeAnswer.data.name,
        multiplier: createItemTypeAnswer.data.multiplier,
        category: createItemTypeAnswer.data.category,
        quantity: createItemTypeAnswer.data.quantity,
        min_quantity: createItemTypeAnswer.data.min_quantity,
        min_rate: createItemTypeAnswer.data.min_rate,
        sale_rate: createItemTypeAnswer.data.sale_rate,
        rate_dimension: createItemTypeAnswer.data.rate_dimension
      }).returning({
        id: item.id,
      })

      if(!createdItem[0].id){
        throw new Error("Unable to create item");
      }
    });

    return res.status(200).json({success: true, message: "Item created successfully"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create item", error: error.message ? error.message : error});
  }
}

const getItem = async (req: Request, res: Response) => {
  const getItemTypeAnswer = getItemType.safeParse(req.query);

  if (!getItemTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getItemTypeAnswer.error.flatten()})
  }

  try {
    const foundItem = await db.query.item.findFirst({
      where: (item, { eq }) => eq(item.id, getItemTypeAnswer.data.item_id),
      with: {
        order_items: {
          columns: {
            item_id: false,
          },
          with: {
            order: {
              with: {
                customer: {
                  columns: {
                    name: true
                  }
                }
              },
              columns: {
                customer_id: true
              }
            }
          },
          orderBy: (item, { desc }) => [desc(item.created_at)],
          limit: 20
        },
        item_orders: {
          columns: {
            item_id: false,
          },
          orderBy: (item_order, { desc }) => [desc(item_order.order_date)],
          limit: 10
        }
      }
    })

    if(!foundItem){
      return res.status(400).json({success: false, message: "Unable to find item"})
    }

    return res.status(200).json({success: true, message: "Item fetched", data: foundItem});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to fetch item", error: error.message ? error.message : error});
  }
}

const getItemRates = async (req: Request, res: Response) => {
  const getItemRateTypeAnswer = getItemRatesType.safeParse(req.query);

  if (!getItemRateTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getItemRateTypeAnswer.error.flatten()})
  }

  try {
    const foundItem = await db.query.item.findFirst({
      where: (item, { eq }) => eq(item.id, getItemRateTypeAnswer.data.item_id),
      columns: {
        multiplier: true,
        min_rate: true,
        sale_rate: true
      },
      with: {
        order_items: {
          limit: 1,
          orderBy: (item, { desc }) => [desc(item.updated_at)],
          columns: {
            rate: true,
            architect_commision: true,
            architect_commision_type: true,
            carpanter_commision: true,
            carpanter_commision_type: true
          }
        }
      }
    })

    if(!foundItem){
      return res.status(400).json({success: false, message: "Unable to find item!"})
    }

    return res.status(200).json({success: true, message: "Item Rates Found!!!", data: foundItem});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to find Rates!", error: error.message ? error.message : error});
  }
}

const editItem = async (req: Request, res: Response) => {
  const editItemTypeAnswer = editItemType.safeParse(req.body);

  if (!editItemTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editItemTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const updatedItem = await tx.update(item).set({
        name: editItemTypeAnswer.data.name,
        multiplier: editItemTypeAnswer.data.multiplier,
        category: editItemTypeAnswer.data.category,
        min_quantity: editItemTypeAnswer.data.min_quantity,
        min_rate: editItemTypeAnswer.data.min_rate,
        sale_rate: editItemTypeAnswer.data.sale_rate,
        rate_dimension: editItemTypeAnswer.data.rate_dimension
      }).where(eq(item.id, editItemTypeAnswer.data.item_id)).returning({ id: item.id })

      if(!updatedItem[0].id){
        throw new Error("Unable to edit item")
      }
    });

    return res.status(200).json({success: true, message: "Item edited successfully"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to edit item", error: error.message ? error.message : error});
  }
}

const createItemOrder = async (req: Request, res: Response) => { 
  const createItemOrderTypeAnswer = createItemOrderType.safeParse(req.body);

  if (!createItemOrderTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createItemOrderTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const foundItem = await tx.query.item.findFirst({
        where: (item, { eq }) => eq(item.id, createItemOrderTypeAnswer.data.item_id),
        columns: {
          quantity: true
        }
      })
      
      if(!foundItem){
        throw new Error("Unable to find item");
      }

      if (createItemOrderTypeAnswer.data.received_quantity){
        await tx.update(item).set({
          quantity: foundItem.quantity + createItemOrderTypeAnswer.data.received_quantity
        }).where(eq(item.id, createItemOrderTypeAnswer.data.item_id));
      }

      
      if(createItemOrderTypeAnswer.data.received_quantity == 0){
        createItemOrderTypeAnswer.data.receive_date = undefined;
      }

      await tx.insert(item_order).values({
        item_id: createItemOrderTypeAnswer.data.item_id,
        vendor_name: createItemOrderTypeAnswer.data.vendor_name,
        ordered_quantity: createItemOrderTypeAnswer.data.ordered_quantity,
        order_date: createItemOrderTypeAnswer.data.order_date,
        received_quantity: createItemOrderTypeAnswer.data.received_quantity,
        receive_date: createItemOrderTypeAnswer.data.receive_date
      })
    })

    return res.status(200).json({success: true, message: "Item Order created"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create item order!", error: error.message ? error.message : error});
  }

}

const editItemOrder = async (req: Request, res: Response) => { 
  const editItemOrderTypeAnswer = editItemOrderType.safeParse(req.body);

  if (!editItemOrderTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editItemOrderTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const foundItemOrdertx = await tx.update(item_order).set({
        vendor_name: editItemOrderTypeAnswer.data.vendor_name,
        ordered_quantity: editItemOrderTypeAnswer.data.ordered_quantity,
        order_date: editItemOrderTypeAnswer.data.order_date
      }).where(eq(item_order.id, editItemOrderTypeAnswer.data.id)).returning({
        id: item_order.id,
      })

      if(!foundItemOrdertx[0].id){
        throw new Error("Unable to find item order!")
      }
    })

    return res.status(200).json({success: true, message: "Item Order updated"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update item order!", error: error.message ? error.message : error});
  }
}

const receiveItemOrder = async (req: Request, res: Response) => { 
  const receiveItemOrderTypeAnswer = receiveItemOrderType.safeParse(req.body);

  if (!receiveItemOrderTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: receiveItemOrderTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const foundItemOrderTx = await tx.query.item_order.findFirst({
        where: (item_order, { eq }) => eq(item_order.id, receiveItemOrderTypeAnswer.data.id),
        columns: {
          id: true,
          item_id: true,
          received_quantity: true
        }
      });

      if(!foundItemOrderTx?.id){
        throw new Error("Unable to find item order!")
      }

      if ((foundItemOrderTx.received_quantity ?? 0) === receiveItemOrderTypeAnswer.data.received_quantity) {
        throw new Error("Unable to update, same quantity as before!");
      }


      if ((foundItemOrderTx.received_quantity ?? 0) > 0){
        const diff = (foundItemOrderTx.received_quantity ?? 0) - receiveItemOrderTypeAnswer.data.received_quantity;
        const operator = diff < 0 ? "add" : "subtract"
        if(operator == "add"){
          await tx.update(item).set({
            quantity: sql`${item.quantity} + ${sql.placeholder("difference")}`
          }).where(eq(item.id, foundItemOrderTx.item_id)).execute({
            difference: (diff * -1)
          });
        } else {
          await tx.update(item).set({
            quantity: sql`${item.quantity} - ${sql.placeholder("difference")}`
          }).where(eq(item.id, foundItemOrderTx.item_id)).execute({
            difference: diff
          });
        }
      } else {
        await tx.update(item).set({
          quantity: sql`${item.quantity} + ${sql.placeholder("quantity")}`
        }).where(eq(item.id, foundItemOrderTx.item_id)).execute({
          quantity: receiveItemOrderTypeAnswer.data.received_quantity
        });
      }

      if(receiveItemOrderTypeAnswer.data.received_quantity == 0){
        receiveItemOrderTypeAnswer.data.receive_date = undefined;
      }

      await tx.update(item_order).set({
        receive_date: receiveItemOrderTypeAnswer.data.receive_date,
        received_quantity: receiveItemOrderTypeAnswer.data.received_quantity
      }).where(eq(item_order.id, receiveItemOrderTypeAnswer.data.id));
    })

    return res.status(200).json({success: true, message: "Item Order updated, Quanity Updated!"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update item order and quantity!", error: error.message ? error.message : error});
  }
}

const deleteItemOrder = async (req: Request, res: Response) => { 
  const deleteItemOrderTypeAnswer = deleteItemOrderType.safeParse(req.body);

  if (!deleteItemOrderTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: deleteItemOrderTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const foundItemOrderTx = await tx.delete(item_order).where(eq(item_order.id, deleteItemOrderTypeAnswer.data.id)).returning({
        id: item_order.id,
        item_id: item_order.item_id,
        received_quantity: item_order.received_quantity
      });

      if(!foundItemOrderTx[0]?.id){
        throw new Error("Unable to find item order!")
      }

      if((foundItemOrderTx[0].received_quantity ?? 0) > 0){
        // reduce the receive quantity
        await tx.update(item).set({
          quantity: sql`${item.quantity} - ${foundItemOrderTx[0].received_quantity}`
        }).where(eq(item.id, foundItemOrderTx[0].item_id));
      }
    })

    return res.status(200).json({success: true, message: "Item Order deleted, Quanity Updated!"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to delete item order!", error: error.message ? error.message : error});
  }
}

const deleteItem = async (req: Request, res: Response) => {
  const deleteItemTypeAnswer = deleteItemType.safeParse(req.body);

  if (!deleteItemTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: deleteItemTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const foundItem = await tx.query.item.findFirst({
        where: (item, { eq }) => eq(item.id, deleteItemTypeAnswer.data.item_id),
        with: {
          order_items: {
            limit: 1,
            columns: {
              id: true
            }
          }
        },
        columns: {
          quantity: true
        }
      })

      if(!foundItem){
        throw new Error("Unable to find item");
      }

      if(foundItem.order_items.length > 0){
        throw new Error("Item is being used in orders, cannot delete!");
      }

      if(foundItem.quantity !== 0){
        throw new Error("Item quantity is not 0, cannot delete!");
      }

      await tx.delete(item).where(eq(item.id, deleteItemTypeAnswer.data.item_id));
    });

    return res.status(200).json({success: true, message: "Item deleted successfully"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to delete item", error: error.message ? error.message : error});
  }
}

const getAllItems = async (_req: Request, res: Response) => {
  try {
    const items = await db.query.item.findMany({
      columns: {
        id: true,
        name: true,
        category: true,
        quantity: true,
        min_quantity: true,
        sale_rate: true,
        rate_dimension: true,
      }
    });
    return res.status(200).json({success: true, message: "All Items Fetched!", data: items});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to fetch items", error: error.message ? error.message : error});
  }
}

export {
  createItem,
  getAllItems,
  getItem,
  getItemRates,
  editItem,
  createItemOrder,
  editItemOrder,
  receiveItemOrder,
  deleteItemOrder,
  deleteItem
}