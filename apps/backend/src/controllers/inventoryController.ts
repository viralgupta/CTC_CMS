import db from '@db/db';
import { item } from '@db/schema';
import { createItemType, deleteItemType, editQuantityType, editItemType, getItemType } from '@type/api/item';
import { Request, Response } from "express";
import { eq } from "drizzle-orm";

const createItem = async (req: Request, res: Response) => {
  const createItemTypeAnswer = createItemType.safeParse(req.body);

  if (!createItemTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createItemTypeAnswer.error.flatten()})
  }

  try {
    const createdItem = await db.insert(item).values({
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
      return res.status(400).json({success: false, message: "Unable to create item"})
    }

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
        }
      }
    })

    if(!foundItem){
      return res.status(400).json({success: false, message: "Unable to find item"})
    }

    return res.status(200).json({success: true, message: "Item found successfully", data: foundItem});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to find item", error: error.message ? error.message : error});
  }
}

const editItem = async (req: Request, res: Response) => {
  const editItemTypeAnswer = editItemType.safeParse(req.body);

  if (!editItemTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editItemTypeAnswer.error.flatten()})
  }

  try {
    const updatedItem = await db.update(item).set({
      name: editItemTypeAnswer.data.name,
      multiplier: editItemTypeAnswer.data.multiplier,
      category: editItemTypeAnswer.data.category,
      min_quantity: editItemTypeAnswer.data.min_quantity,
      min_rate: editItemTypeAnswer.data.min_rate,
      sale_rate: editItemTypeAnswer.data.sale_rate,
      rate_dimension: editItemTypeAnswer.data.rate_dimension
    }).where(eq(item.id, editItemTypeAnswer.data.item_id)).returning()

    if(!updatedItem[0].id){
      return res.status(400).json({success: false, message: "Unable to edit item"})
    }

    return res.status(200).json({success: true, message: "Item edited successfully", data: updatedItem});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to edit item", error: error.message ? error.message : error});
  }
}

const editQuantity = async (req: Request, res: Response) => { 
  const editQuantityTypeAnswer = editQuantityType.safeParse(req.body);

  if (!editQuantityTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editQuantityTypeAnswer.error.flatten()})
  }

  try {
    const foundItem = await db.query.item.findFirst({
      where: (item, { eq }) => eq(item.id, editQuantityTypeAnswer.data.item_id),
      columns: {
        quantity: true
      }
    })

    if(!foundItem){
      return res.status(400).json({success: false, message: "Unable to find item"})
    }

    const newQuantity =
      editQuantityTypeAnswer.data.operation === "add"
      ? foundItem.quantity + editQuantityTypeAnswer.data.quantity
      : foundItem.quantity - editQuantityTypeAnswer.data.quantity;

    const updatedItem = await db.update(item).set({
      quantity: newQuantity
    }).where(eq(item.id, editQuantityTypeAnswer.data.item_id)).returning()

    if(!updatedItem[0].id){
      return res.status(400).json({success: false, message: "Unable to edit item quantity"})
    }

    return res.status(200).json({success: true, message: "Item quantity edited successfully", data: updatedItem});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to edit item quantity", error: error.message ? error.message : error});
  }
}

const deleteItem = async (req: Request, res: Response) => {
  const deleteItemTypeAnswer = deleteItemType.safeParse(req.body);

  if (!deleteItemTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: deleteItemTypeAnswer.error.flatten()})
  }

  try {
    const foundItem = await db.query.item.findFirst({
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
      return res.status(400).json({success: false, message: "Unable to find item"})
    }

    if(foundItem.order_items.length > 0){
      return res.status(400).json({success: false, message: "Item is being used in orders, cannot delete!"})
    }

    if(foundItem.quantity !== 0){
      return res.status(400).json({success: false, message: "Item quantity is not 0, cannot delete!"})
    }

    const deletedItem = await db.delete(item).where(eq(item.id, deleteItemTypeAnswer.data.item_id)).returning()

    return res.status(200).json({success: true, message: "Item deleted successfully", data: deletedItem});
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
        rate_dimension: true
      }
    });
    return res.status(200).json({success: true, message: "Items Found", data: items});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to fetch items", error: error.message ? error.message : error});
  }
}

export {
  createItem,
  getAllItems,
  getItem,
  editItem,
  editQuantity,
  deleteItem
}