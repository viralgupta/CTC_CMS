import db from '@db/db';
import { architect, carpenter, item, item_order, item_order_warehouse_quantity, log, order, tier, tier_item, warehouse, warehouse_quantity } from '@db/schema';
import { createItemType, deleteItemType, editItemType, getItemType, getItemRatesType, createItemOrderType, editItemOrderType, receiveItemOrderType, deleteItemOrderType, getWarehouseType, deleteWarehouseType, createWarehouseType, getWarehouseItemQuantitiesType, editWarehouseType, getMoreItemOrderItemsType, getMoreWarehouseQuantitiesType, getItemRatesWithCommissionType, editTierType, deleteTierType, createTierType, getTierType } from '@type/api/item';
import { Request, Response } from "express";
import { count, eq, sql } from "drizzle-orm";
import { omit } from '../lib/utils';

const createItem = async (req: Request, res: Response) => {
  const createItemTypeAnswer = createItemType.safeParse(req.body);

  if (!createItemTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createItemTypeAnswer.error.flatten()})
  }

  try {
    const createdItem = await db.transaction(async (tx) => {
      // check if the quanitity is more than 0 and warehouse_quantities are equal to quanitity
      const totalWarehouseQuantity = (createItemTypeAnswer.data.warehouse_quantities ?? [])?.reduce((acc, curr) => acc + curr.quantity, 0);
      if(createItemTypeAnswer.data.quantity > 0 && ((createItemTypeAnswer.data.warehouse_quantities ?? []).length == 0 || !createItemTypeAnswer.data.warehouse_quantities || totalWarehouseQuantity !== createItemTypeAnswer.data.quantity)){
        throw new Error("Specify warehouse quantities equal to item quantity");
      }

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
      });

      // create warehouse quantities all the warehouses
      const warehouses = await tx.query.warehouse.findMany({
        columns: {
          id: true
        }
      });
      (warehouses ?? []).forEach(async (warehouse) => {
        const warehouseWithQuantity = (createItemTypeAnswer.data.warehouse_quantities ?? []).find(wq => wq.warehouse_id === warehouse.id);
        if(warehouseWithQuantity){
          await tx.insert(warehouse_quantity).values({
            item_id: createdItem[0].id,
            warehouse_id: warehouse.id,
            quantity: warehouseWithQuantity.quantity
          })
        } else {
          await tx.insert(warehouse_quantity).values({
            item_id: createdItem[0].id,
            warehouse_id: warehouse.id,
            quantity: 0
          })
        }
      });

      if(!createdItem[0].id){
        throw new Error("Unable to create item");
      }

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          item_id: createdItem[0].id,
          linked_to: "ITEM",
          type: "CREATE",
          message: JSON.stringify(createItemTypeAnswer.data, null, 2)
        });
      }

      const txCreatedItem = await tx.query.item.findFirst({
        where: (item, { eq }) => eq(item.id, createdItem[0].id),
        columns: {
          min_rate: false,
          multiplier: false
        },
      });

      return txCreatedItem;
    });

    return res.status(200).json({success: true, message: "Item created successfully", update: [{ type: "item", data: createdItem }]});
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
          orderBy: (order_item, { desc }) => [desc(order_item.id)],
          limit: 10,
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
        },
        item_orders: {
          orderBy: (item_order, { desc }) => [desc(item_order.order_date)],
          limit: 10,
          columns: {
            item_id: false,
          },
          with: {
            i_o_w_q: {
              columns: {
                quantity: true,
                warehouse_quantity_id: true
              },
            }
          }
        },
        warehouse_quantities: {
          columns: {
            id: true,
            quantity: true
          },
          with: {
            warehouse: {
              columns: {
                name: true
              }
            }
          }
        }
      }
    })

    if(!foundItem){
      return res.status(400).json({success: false, message: "Unable to find item"})
    }

    return res.status(200).json({success: true, message: "Item fetched", data: foundItem});
  } catch (error: any) {
    console.log("error", error)
    return res.status(400).json({success: false, message: "Unable to fetch item", error: error.message ? error.message : error});
  }
}

const getMoreItemOrderItems = async (req: Request, res: Response) => {
  const getMoreItemOrderItemsTypeAnswer = getMoreItemOrderItemsType.safeParse(req.query);

  if (!getMoreItemOrderItemsTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getMoreItemOrderItemsTypeAnswer.error.flatten()})
  }

  try {
    const foundOrderItems = await db.query.order_item.findMany({
      where: (order_item, { and, eq, lt }) =>
        and(
          eq(order_item.item_id, getMoreItemOrderItemsTypeAnswer.data.item_id),
          lt(order_item.id, getMoreItemOrderItemsTypeAnswer.data.cursor)
        ),
      orderBy: (order_item, { desc }) => [desc(order_item.id)],
      limit: 10,
      columns: {
        item_id: false,
      },
      with: {
        order: {
          with: {
            customer: {
              columns: {
                name: true,
              },
            },
          },
          columns: {
            customer_id: true,
          },
        },
      },
    });

    return res.status(200).json({success: true, message: "More Order Items fetched", data: foundOrderItems});
  } catch (error: any) {
    console.log("error", error)
    return res.status(400).json({success: false, message: "Unable to fetch more order items!", error: error.message ? error.message : error});
  }
}

const getItemRatesWithCommission = async (req: Request, res: Response) => {
  const getItemRatesWithCommissionTypeAnswer = getItemRatesWithCommissionType.safeParse(req.query);

  if (!getItemRatesWithCommissionTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getItemRatesWithCommissionTypeAnswer.error.flatten()})
  }

  try {
    const foundItem = await db.query.item.findFirst({
      where: (item, { eq }) => eq(item.id, getItemRatesWithCommissionTypeAnswer.data.item_id),
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
            carpenter_commision: true,
            carpenter_commision_type: true
          }
        }
      }
    });

    if(!foundItem){
      return res.status(400).json({success: false, message: "Unable to find item!"})
    }

    let data: typeof foundItem & {
      carpenter_rates?: {
        commision: string | null,
        commision_type: "percentage" | "perPiece" | null;
      },
      architect_rates?: {
        commision: string | null,
        commision_type: "percentage" | "perPiece" | null;
      }
    } = {
      ...foundItem,
    }

    const carpenterId = getItemRatesWithCommissionTypeAnswer.data.carpenter_id;
    if(carpenterId){ 
      const carpenterTier = await db.query.carpenter.findFirst({
        where: (carpenter, { eq }) => eq(carpenter.id, carpenterId),
        columns: {
          tier_id: true
        }
      });

      if(!carpenterTier) throw new Error("Unable to find carpenter!");

      const carpenterTierRates = await db.query.tier_item.findFirst({
        where: (tier_item, { and, eq }) => and(
          eq(tier_item.tier_id, carpenterTier.tier_id),
          eq(tier_item.item_id, getItemRatesWithCommissionTypeAnswer.data.item_id)
        ),
        columns: {
          commision: true,
          commision_type: true
        }
      });
      data = {
        ...data,
        carpenter_rates: carpenterTierRates
      }
    }

    const architectId = getItemRatesWithCommissionTypeAnswer.data.architect_id;
    if(architectId){ 
      const architectTier = await db.query.architect.findFirst({
        where: (architect, { eq }) => eq(architect.id, architectId),
        columns: {
          tier_id: true
        }
      });

      if(!architectTier) throw new Error("Unable to find architect!");

      const architectTierRates = await db.query.tier_item.findFirst({
        where: (tier_item, { and, eq }) => and(
          eq(tier_item.tier_id, architectTier.tier_id),
          eq(tier_item.item_id, getItemRatesWithCommissionTypeAnswer.data.item_id)
        ),
        columns: {
          commision: true,
          commision_type: true
        }
      });
      data = {
        ...data,
        architect_rates: architectTierRates
      }
    }

    return res.status(200).json({success: true, message: "Item Rates Found!!!", data: data});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to find Rates!", error: error.message ? error.message : error});
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
            carpenter_commision: true,
            carpenter_commision_type: true
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
    const updatedItem = await db.transaction(async (tx) => {
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

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          item_id: updatedItem[0].id,
          linked_to: "ITEM",
          type: "UPDATE",
          message: JSON.stringify(omit(editItemTypeAnswer.data, "item_id"), null, 2)
        });
      }

      const txUpdatedItem = await tx.query.item.findFirst({
        where: (item, { eq }) => eq(item.id, editItemTypeAnswer.data.item_id),
        columns: {
          min_rate: false,
          multiplier: false
        },
      });

      return txUpdatedItem;
    });

    return res.status(200).json({success: true, message: "Item edited successfully", update: [{ type: "item", data: updatedItem }]});
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

      if(createItemOrderTypeAnswer.data.received_quantity == 0){
        createItemOrderTypeAnswer.data.receive_date = undefined;
      } else {
        if(!createItemOrderTypeAnswer.data.receive_date) createItemOrderTypeAnswer.data.receive_date = new Date();
      }

      const createdItemOrder = await tx.insert(item_order).values({
        item_id: createItemOrderTypeAnswer.data.item_id,
        vendor_name: createItemOrderTypeAnswer.data.vendor_name,
        ordered_quantity: createItemOrderTypeAnswer.data.ordered_quantity,
        order_date: createItemOrderTypeAnswer.data.order_date,
        received_quantity: createItemOrderTypeAnswer.data.received_quantity,
        receive_date: createItemOrderTypeAnswer.data.receive_date
      }).returning({
        id: item_order.id
      })

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          item_id: createItemOrderTypeAnswer.data.item_id,
          linked_to: "ITEM_ORDER",
          type: "CREATE",
          message: JSON.stringify(omit(createItemOrderTypeAnswer.data, "item_id"), null, 2)
        });
      }

      if (createItemOrderTypeAnswer.data.received_quantity){
        // increase item quantity
        await tx.update(item).set({
          quantity: foundItem.quantity + createItemOrderTypeAnswer.data.received_quantity
        }).where(eq(item.id, createItemOrderTypeAnswer.data.item_id));

        // check if the quanitity is more than 0 and warehouse_quantities are equal to quanitity
        const totalWarehouseQuantity = (createItemOrderTypeAnswer.data.warehouse_quantities ?? [])?.reduce((acc, curr) => acc + curr.quantity, 0);
        if(createItemOrderTypeAnswer.data.received_quantity > 0 && ((createItemOrderTypeAnswer.data.warehouse_quantities ?? []).length == 0 || !createItemOrderTypeAnswer.data.warehouse_quantities || totalWarehouseQuantity !== createItemOrderTypeAnswer.data.received_quantity)){
          throw new Error("Specify warehouse quantities equal to item receivied quantity");
        }

        // update the warehouse item quantities if already exists else create warehouse item
        createItemOrderTypeAnswer.data.warehouse_quantities?.forEach(async (wq) => {

          await tx.update(warehouse_quantity).set({
            quantity: sql`${warehouse_quantity.quantity} + ${sql.placeholder("quantity")}`
          }).where(eq(warehouse_quantity.id, wq.warehouse_quantity_id)).execute({
            quantity: wq.quantity
          })

          // create item_order_warehouse_quantity
          await tx.insert(item_order_warehouse_quantity).values({
            item_order_id: createdItemOrder[0].id,
            warehouse_quantity_id: wq.warehouse_quantity_id,
            quantity: wq.quantity
          })
        })

      }
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
        item_id: item_order.item_id,
      })

      if(!foundItemOrdertx[0].id){
        throw new Error("Unable to find item order!")
      }

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          item_id: foundItemOrdertx[0].item_id,
          linked_to: "ITEM_ORDER",
          type: "UPDATE",
          message: JSON.stringify(omit(editItemOrderTypeAnswer.data, "id"), null, 2)
        });
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
    const updatedItem = await db.transaction(async (tx) => {
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

      if ((foundItemOrderTx.received_quantity ?? 0) > 0) {
        throw new Error("Item Order is already received, cannot update the quantity!");
      }

      if(receiveItemOrderTypeAnswer.data.received_quantity < 1){
        throw new Error("Received quantity must be more than 0");
      }

      // check if the quanitity is more than 0 and warehouse_quantities are equal to quanitity
      const totalWarehouseQuantity = (receiveItemOrderTypeAnswer.data.warehouse_quantities ?? [])?.reduce((acc, curr) => acc + curr.quantity, 0);
      if(receiveItemOrderTypeAnswer.data.received_quantity > 0 && ((receiveItemOrderTypeAnswer.data.warehouse_quantities ?? []).length == 0 || !receiveItemOrderTypeAnswer.data.warehouse_quantities || totalWarehouseQuantity !== receiveItemOrderTypeAnswer.data.received_quantity)){
        throw new Error("Specify warehouse quantities equal to item receivied quantity");
      }

      // update item quantity
      await tx.update(item).set({
        quantity: sql`${item.quantity} + ${sql.placeholder("recievedQuantity")}`
      }).where(eq(item.id, foundItemOrderTx.item_id)).execute({
        recievedQuantity: receiveItemOrderTypeAnswer.data.received_quantity
      });

      // update warehouse quantities and create item_order_warehouse_quantity
      receiveItemOrderTypeAnswer.data.warehouse_quantities.forEach(async(riowq) => {
        await tx.update(warehouse_quantity).set({
          quantity: sql`${warehouse_quantity.quantity} + ${sql.placeholder("quantity")}`
        }).where(eq(warehouse_quantity.id, riowq.warehouse_quantity_id)).execute({
          quantity: riowq.quantity
        });

        await tx.insert(item_order_warehouse_quantity).values({
          item_order_id: foundItemOrderTx.id,
          warehouse_quantity_id: riowq.warehouse_quantity_id,
          quantity: riowq.quantity
        });
      });

      if(!receiveItemOrderTypeAnswer.data.receive_date) receiveItemOrderTypeAnswer.data.receive_date = new Date();

      await tx.update(item_order).set({
        receive_date: receiveItemOrderTypeAnswer.data.receive_date,
        received_quantity: receiveItemOrderTypeAnswer.data.received_quantity
      }).where(eq(item_order.id, receiveItemOrderTypeAnswer.data.id));

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          item_id: foundItemOrderTx.item_id,
          linked_to: "ITEM_ORDER",
          type: "UPDATE",
          heading: "Item Quanitity Updated, Item Order was Updated",
          message: JSON.stringify(omit(receiveItemOrderTypeAnswer.data, "id"), null, 2)
        });
      }

      const txUpdatedItem = await tx.query.item.findFirst({
        where: (item, { eq }) => eq(item.id, foundItemOrderTx.item_id),
        columns: {
          min_rate: false,
          multiplier: false
        },
      });

      return txUpdatedItem;
    })

    return res.status(200).json({success: true, message: "Item Order updated, Quanity Updated!", update: [{ type: "item", data: updatedItem }]});
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
    const updatedItem = await db.transaction(async (tx) => {
      const foundItemOrderTx = await tx.query.item_order.findFirst({
        where: (item_order, { eq }) => eq(item_order.id, deleteItemOrderTypeAnswer.data.id),
        with: {
          i_o_w_q: {
            columns: {
              warehouse_quantity_id: true,
              quantity: true
            }
          }
        }
      });

      if(!foundItemOrderTx) throw new Error("Unable to find item order!");

      if((foundItemOrderTx.received_quantity ?? 0) > 0){
        // reduce the receive quantity
        await tx.update(item).set({
          quantity: sql`${item.quantity} - ${foundItemOrderTx.received_quantity}`
        }).where(eq(item.id, foundItemOrderTx.item_id));

        const foundItemOrderWarehouseQuantities = foundItemOrderTx.i_o_w_q;

        const promises = foundItemOrderWarehouseQuantities.map(async (iowq) => {
          // reduce the warehouse item quantities
          await tx.update(warehouse_quantity).set({
            quantity: sql`${warehouse_quantity.quantity} - ${iowq.quantity}`
          }).where(eq(warehouse_quantity.id, iowq.warehouse_quantity_id));
        });

        await Promise.all(promises);
      }

      await tx.delete(item_order).where(eq(item_order.id, deleteItemOrderTypeAnswer.data.id));

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          item_id: foundItemOrderTx.item_id,
          linked_to: "ITEM_ORDER",
          type: "DELETE",
          heading: "Item Quanitity Updated, Item Order was Deleted",
          message: JSON.stringify(omit(foundItemOrderTx, ["id", "item_id"]), null, 2)
        });
      }

      const txUpdatedItem = await tx.query.item.findFirst({
        where: (item, { eq }) => eq(item.id, foundItemOrderTx.item_id),
        columns: {
          min_rate: false,
          multiplier: false
        },
      });

      return txUpdatedItem;
    })

    return res.status(200).json({success: true, message: "Item Order deleted, Quanity Updated!", update: [{ type: "item", data: updatedItem }]});
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
      })

      if(!foundItem){
        throw new Error("Unable to find item");
      }

      if(foundItem.order_items.length > 0){
        throw new Error("Item is being used in orders, cannot delete!");
      }

      await tx.delete(item).where(eq(item.id, deleteItemTypeAnswer.data.item_id));

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          item_id: deleteItemTypeAnswer.data.item_id,
          linked_to: "ITEM",
          type: "DELETE",
          message: JSON.stringify(omit(foundItem, ["id", "order_items"]), null, 2)
        });
      }
    });

    return res.status(200).json({success: true, message: "Item deleted successfully", update: [{ type: "item", data: { id: deleteItemTypeAnswer.data.item_id, _: true }}]});
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

const createWarehouse = async (req: Request, res: Response) => {
  const createWarehouseTypeAnswer = createWarehouseType.safeParse(req.body);

  if (!createWarehouseTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createWarehouseTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const createdWarehouse = await tx.insert(warehouse).values({
        name: createWarehouseTypeAnswer.data.name,
      }).returning({
        id: warehouse.id,
      })

      // find all items and then insert the warehouse quantity for each item as 0
      const items = await tx.query.item.findMany({
        columns: {
          id: true
        }
      });

      if(items.length == 0) return;
      
      let insertWarehouseQuantity: {
        item_id: number,
        warehouse_id: number,
        quantity: number
      }[] = [];
    
      (items ?? []).forEach(async (item) => {
        insertWarehouseQuantity = [
          ...insertWarehouseQuantity,
          {
            item_id: item.id,
            warehouse_id: createdWarehouse[0].id,
            quantity: 0
          }
        ]
      });

      await tx.insert(warehouse_quantity).values(insertWarehouseQuantity);
    });

    return res.status(200).json({success: true, message: "Warehouse Created!"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create warehouse", error: error.message ? error.message : error});
  }
}

const getWarehouse = async (req: Request, res: Response) => {
  const getWarehouseTypeAnswer = getWarehouseType.safeParse(req.query);

  if (!getWarehouseTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getWarehouseTypeAnswer.error.flatten()})
  }

  try {
    let FoundWarehouse = await db.query.warehouse.findFirst({
      where: (warehouse, { eq }) => eq(warehouse.id, getWarehouseTypeAnswer.data.warehouse_id),
      with: {
        warehouse_quantities: {
          orderBy: (warehouse_quantity, { desc }) => desc(warehouse_quantity.id),
          where: (warehouse_quantity, { ne }) => ne(warehouse_quantity.quantity, 0),
          limit: 20,
          columns: {
            item_id: true,
            quantity: true,
          },
          with: {
            item: {
              columns: {
                name: true,
              }
            }
          }
        }
      }
    });

    if(!FoundWarehouse){
      return res.status(400).json({success: false, message: "Unable to find warehouse"})
    }

    return res.status(200).json({success: true, message: "All Warehouse Quantiites Fetched!", data: FoundWarehouse});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to fetch warehouse quantitiy", error: error.message ? error.message : error});
  }
}

const getMoreWarehouseQuantities = async (req: Request, res: Response) => {
  const getMoreWarehouseQuantitiesTypeAnswer = getMoreWarehouseQuantitiesType.safeParse(req.query);

  if (!getMoreWarehouseQuantitiesTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getMoreWarehouseQuantitiesTypeAnswer.error.flatten()})
  }

  try {
    let FoundWarehouse = await db.query.warehouse_quantity.findMany({
      orderBy: (warehouse_quantity, { desc }) => desc(warehouse_quantity.id),
      where: (warehouse_quantity, { and, eq, lt, ne }) =>
        and(
          eq(
            warehouse_quantity.warehouse_id,
            getMoreWarehouseQuantitiesTypeAnswer.data.warehouse_id
          ),
          lt(
            warehouse_quantity.id,
            getMoreWarehouseQuantitiesTypeAnswer.data.cursor
          ),
          ne(warehouse_quantity.quantity, 0)
        ),
      limit: 20,
      columns: {
        item_id: true,
        quantity: true,
      },
      with: {
        item: {
          columns: {
            name: true,
          },
        },
      },
    });

    return res.status(200).json({success: true, message: "More Warehouse Quantities Fetched!", data: FoundWarehouse});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to fetch more warehouse quantities!", error: error.message ? error.message : error});
  }
}

const getAllWarehouse = async (_req: Request, res: Response) => {
  try {
    const warehousees = await db.query.warehouse.findMany();
    return res.status(200).json({success: true, message: "All Warehouses Fetched!", data: warehousees});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to fetch warehouses", error: error.message ? error.message : error});
  }
}

const editWarehouse = async (req: Request, res: Response) => {
  const editWarehouseTypeAnswer = editWarehouseType.safeParse(req.body);

  if (!editWarehouseTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editWarehouseTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {

      const foundWarehouse = await db.query.warehouse.findFirst({
        where: (warehouse, { eq }) => eq(warehouse.id, editWarehouseTypeAnswer.data.warehouse_id),
        columns: {
          id: true
        },
      });

      if(!foundWarehouse){
        throw new Error("Unable to find warehouse");
      }

      await tx.update(warehouse).set({
        name: editWarehouseTypeAnswer.data.name
      }).where(eq(warehouse.id, editWarehouseTypeAnswer.data.warehouse_id));
    })

    return res.status(200).json({success: true, message: "Warehouse Updated!"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update warehouse", error: error.message ? error.message : error});
  }
}

const deleteWarehouse = async (req: Request, res: Response) => {
  const deleteWarehouseTypeAnswer = deleteWarehouseType.safeParse(req.body);

  if (!deleteWarehouseTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: deleteWarehouseTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {

      const foundWarehouse = await tx.query.warehouse.findFirst({
        where: (warehouse, { eq }) => eq(warehouse.id, deleteWarehouseTypeAnswer.data.warehouse_id),
        columns: {
          id: true
        },
        with: {
          warehouse_quantities: {
            columns: {
              quantity: true
            },
            with: {
              i_o_w_q: {
                columns: {
                  quantity: true
                },
                limit: 1
              },
              o_m_i_w_q: {
                columns: {
                  quantity: true
                },
                limit: 1
              }
            }
          }
        },
      });

      const warehouseQuantityNotZero = (foundWarehouse?.warehouse_quantities ?? []).find(wq => wq.quantity !== 0);
      if(warehouseQuantityNotZero){
        throw new Error("Warehouse is being used in items, cannot delete!");
      }
      if(foundWarehouse?.warehouse_quantities.find(wq => wq.i_o_w_q.length > 0 )) throw new Error("Warehouse items is being used in item orders, cannot delete!");
      if(foundWarehouse?.warehouse_quantities.find(wq => wq.o_m_i_w_q.length > 0 )) throw new Error("Warehouse items is being used in orders, cannot delete!");

      await tx.delete(warehouse).where(eq(warehouse.id, deleteWarehouseTypeAnswer.data.warehouse_id));
    })

    return res.status(200).json({success: true, message: "Warehouse Deleted!"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to delete warehouse", error: error.message ? error.message : error});
  }
}

const createTier = async (req: Request, res: Response) => {
  const createTierTypeAnswer = createTierType.safeParse(req.body);

  if (!createTierTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createTierTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const createdTier = await tx.insert(tier).values({
        name: createTierTypeAnswer.data.name,
      }).returning({
        id: tier.id,
      });

      const createTierItemsSet = new Set(createTierTypeAnswer.data.tier_items.map(ti => ti.item_id));
      if(createTierItemsSet.size !== createTierTypeAnswer.data.tier_items.length){
        throw new Error("Duplicate Items found in Tier Items");
      }

      let insertTierItems: {
        tier_id: number,
        item_id: number,
        commision: string,
        commision_type: "percentage" | "perPiece"
      }[] = [];
    
      (createTierTypeAnswer.data.tier_items ?? []).forEach(async (tier_item) => {
        insertTierItems = [
          ...insertTierItems,
          {
            tier_id: createdTier[0].id,
            item_id: tier_item.item_id,
            commision: tier_item.commision,
            commision_type: tier_item.commision_type
          }
        ]
      });

      await tx.insert(tier_item).values(insertTierItems);
    });

    return res.status(200).json({success: true, message: "Tier & Tier Items Created!"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create Tier and Tier Items", error: error.message ? error.message : error});
  }
}

const editTier = async (req: Request, res: Response) => {
  const editTierTypeAnswer = editTierType.safeParse(req.body);

  if (!editTierTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editTierTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {

      const foundTier = await db.query.tier.findFirst({
        where: (tier, { eq }) => eq(tier.id, editTierTypeAnswer.data.tier_id),
        with: {
          tier_items: {
            columns: {
              id: true,
              item_id: true,
              commision: true,
              commision_type: true,
            }
          }
        }
      });

      if(!foundTier){
        throw new Error("Unable to find tier!");
      }

      if(foundTier.name !== editTierTypeAnswer.data.name){
        await tx.update(tier).set({
          name: editTierTypeAnswer.data.name
        }).where(eq(tier.id, editTierTypeAnswer.data.tier_id));
      }

      const newTierItemsSet = new Set(editTierTypeAnswer.data.tier_items.map(ti => ti.item_id));
      if(newTierItemsSet.size !== editTierTypeAnswer.data.tier_items.length){
        throw new Error("Duplicate Items found in Tier Items");
      }

      const sameTierItems = editTierTypeAnswer.data.tier_items.filter((ti) => foundTier.tier_items.find((fti) => fti.item_id === ti.item_id));
      const newTierItems = editTierTypeAnswer.data.tier_items.filter((ti) => !foundTier.tier_items.find((fti) => fti.item_id === ti.item_id));
      const deletedTierItems = foundTier.tier_items.filter((fti) => !editTierTypeAnswer.data.tier_items.find((ti) => ti.item_id === fti.item_id));

      sameTierItems.forEach(async (sti) => {
        const foundSameTierItem = foundTier.tier_items.find((fti) => fti.item_id === sti.item_id);

        if(!foundSameTierItem) throw new Error("Unable to find tier item!, this should not happen, please contact developer!");

        if(foundSameTierItem.commision === sti.commision && foundSameTierItem.commision_type === sti.commision_type) return;

        await tx.update(tier_item).set({
          commision: sti.commision,
          commision_type: sti.commision_type
        }).where(eq(tier_item.id, foundSameTierItem.id));
      });

      newTierItems.forEach(async (nti) => {
        await tx.insert(tier_item).values({
          tier_id: editTierTypeAnswer.data.tier_id,
          item_id: nti.item_id,
          commision: nti.commision,
          commision_type: nti.commision_type
        });
      });

      deletedTierItems.forEach(async (dti) => {
        await tx.delete(tier_item).where(eq(tier_item.id, dti.id));
      })
    })

    return res.status(200).json({success: true, message: "Tier and Tier Items Updated!"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update Tier & Tier Items", error: error.message ? error.message : error});
  }
}

const deleteTier = async (req: Request, res: Response) => {
  const deleteTierTypeAnswer = deleteTierType.safeParse(req.body);

  if (!deleteTierTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: deleteTierTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {

      const foundTier = await tx.query.tier.findFirst({
        where: (tier, { eq }) => eq(tier.id, deleteTierTypeAnswer.data.tier_id),
        with: {
          architects: {
            limit: 1,
            columns: {
              id: true
            }
          },
          carpenters: {
            limit: 1,
            columns: {
              id: true
            }
          },
        },
      });

      if(!foundTier){
        throw new Error("Unable to find tier");
      }

      if(foundTier.architects.length > 0 || foundTier.carpenters.length > 0){
        throw new Error("Tier is being used in architect or carpenter, cannot delete!");
      }

      await tx.delete(tier).where(eq(tier.id, deleteTierTypeAnswer.data.tier_id));
    })

    return res.status(200).json({success: true, message: "Tier Deleted!"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to delete tier!", error: error.message ? error.message : error});
  }
}

const getTier = async (req: Request, res: Response) => {
  const getTierTypeAnswer = getTierType.safeParse(req.query);

  if (!getTierTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getTierTypeAnswer.error.flatten()})
  }

  try {
    const foundTiers = await db.query.tier.findFirst({
      where: (tier, { eq }) => eq(tier.id, getTierTypeAnswer.data.tier_id),
      columns: {
        id: true,
        name: true,
      },
      with: {
        tier_items: {
          columns: {
            id: true,
            item_id: true,
            commision: true,
            commision_type: true
          },
          with: {
            item: {
              columns: {
                name: true
              }
            }
          }
        }
      }
    });

    const carpenterCount = await db.select({ count: count() }).from(carpenter).where(eq(carpenter.tier_id, getTierTypeAnswer.data.tier_id));
    const architectCount = await db.select({ count: count() }).from(architect).where(eq(architect.tier_id, getTierTypeAnswer.data.tier_id));

    const newFoundTier = {
      ...foundTiers,
      tier_items: foundTiers?.tier_items.map((ti) => ({
        ...ti,
        commision: parseFloat(ti.commision).toFixed(2),
      })),
      carpenterCount: carpenterCount[0].count,
      architectCount: architectCount[0].count
    }

    return res.status(200).json({success: true, message: "Tier Found!", data: newFoundTier});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to find Tier!", error: error.message ? error.message : error});
  }
}

const getAllTiers = async (req: Request, res: Response) => {
  try {
    const foundTiers = await db.query.tier.findMany();
    return res.status(200).json({success: true, message: "Tiers Found!", data: foundTiers});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to find Tiers!", error: error.message ? error.message : error});
  }
}

const getWarehouseItemQuantities = async (req: Request, res: Response) => {
  const getWarehouseItemQuantitiesTypeAnswer = getWarehouseItemQuantitiesType.safeParse(req.query);

  if (!getWarehouseItemQuantitiesTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getWarehouseItemQuantitiesTypeAnswer.error.flatten()})
  }

  try {
    const foundWarehouseQuantity = await db.query.warehouse_quantity.findMany({
      where: (warehouse_quantity, { eq }) => eq(warehouse_quantity.item_id, getWarehouseItemQuantitiesTypeAnswer.data.item_id),
      columns: {
        id: true,
        quantity: true
      },
      with: {
        warehouse: {
          columns: {
            name: true
          }
        }
      }
    });

    return res.status(200).json({success: true, message: "Warehouse Quantities Found!", data: foundWarehouseQuantity});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to find warehouse quantities!", error: error.message ? error.message : error});
  }
}

export {
  createItem,
  getAllItems,
  getItem,
  getMoreItemOrderItems,
  getItemRates,
  getItemRatesWithCommission,
  editItem,
  createItemOrder,
  editItemOrder,
  receiveItemOrder,
  deleteItemOrder,
  deleteItem,
  createWarehouse,
  getWarehouse,
  getMoreWarehouseQuantities,
  getAllWarehouse,
  editWarehouse,
  deleteWarehouse,
  getWarehouseItemQuantities,
  createTier,
  editTier,
  deleteTier,
  getTier,
  getAllTiers,
}