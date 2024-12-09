import db from '@db/db';
import {
  architect,
  carpanter,
  customer,
  driver,
  item,
  log,
  order,
  order_item,
  order_movement,
  order_movement_item,
  order_movement_item_warehouse_quantity,
  warehouse_quantity,
} from "@db/schema";
import {
  createOrderType,
  editOrderNoteType,
  addOrderCustomerIdType,
  editOrderCarpanterIdType,
  editOrderArchitectIdType,
  editOrderPriorityType,
  editOrderDeliveryDateType,
  editOrderDeliveryAddressIdType,
  editOrderDiscountType,
  settleBalanceType,
  editOrderItemsType,
  getAllOrdersType,
  getOrderType,
  getOrderMovementType,
  createOrderMovementType,
  editOrderMovementType,
  deleteOrderMovementType,
  editOrderMovementStatusType,
  createPutSignedURLOrderMovementReciptType,
  deleteOrderMovementReciptType,
  createGetSignedURLOrderMovementReciptType,
} from "@type/api/order";
import * as S3 from "@aws-sdk/client-s3"
import mime from 'mime';
import { Request, Response } from "express";
import { calculatePaymentStatus, omit } from '../lib/utils';
import { eq, sql } from "drizzle-orm"
import { Bucket } from 'sst/node/bucket';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Config } from 'sst/node/config';

const createOrder = async (req: Request, res: Response) => {
  const createOrderTypeAnswer = createOrderType.safeParse(req.body);

  if(!createOrderTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createOrderTypeAnswer.error.flatten()})
  }

  try {
    const calculateCarpanterCommision = createOrderTypeAnswer.data.carpanter_id ? true : false;
    const calculateArchitectCommision = createOrderTypeAnswer.data.architect_id ? true : false;

    await db.transaction(async (tx) => {

      // check if duplicate items in order_items array
      let order_item_id: number[] = [];
      createOrderTypeAnswer.data.order_items.forEach((order_item) => order_item_id.push(order_item.item_id))
      const hasDuplicate = new Set(order_item_id).size !== createOrderTypeAnswer.data.order_items.length;
      if(hasDuplicate) {
        throw new Error("Multiple Order Items of same Kind!!!, Cannot Create Order!");
      }

      // calculate if we can deliver the order
      let canDeliver = true;
      const canDeliverPromises = createOrderTypeAnswer.data.order_items.map(async (oi) => {
        const foundItem = await tx.query.item.findFirst({
          where: (item, { eq }) => eq(item.id, oi.item_id),
          columns: {
            quantity: true
          }
        });

        if(!foundItem) return new Error("Unable to find the item");

        if(foundItem.quantity < oi.quantity) {
          canDeliver = false
        };
      });

      await Promise.all(canDeliverPromises);

      if(createOrderTypeAnswer.data.status == "Delivered" && !canDeliver){
        throw new Error("Cannot Deliver this order, Insufficient Quantity!")
      };

      // calculate the total value of the order
      const totalValue = createOrderTypeAnswer.data.order_items.reduce((acc, orderitem, _index) => {
        return acc + parseFloat(orderitem.total_value);
      }, 0);
      const actualtotalValue = totalValue - parseFloat(createOrderTypeAnswer.data.discount ?? "0.00");

      // calcualate customer balance
      const customerBalance = actualtotalValue - parseFloat(createOrderTypeAnswer.data.amount_paid ?? "0.00")

      if(customerBalance > 0 && !createOrderTypeAnswer.data.customer_id){
        throw new Error("Order with due payment cannot be created without Customer Details!!!");
      }
      
      // calculate the commision of the carpanter
      const carpanterCommision = createOrderTypeAnswer.data.order_items.reduce((acc, orderitem, _index) => {
        return acc + parseFloat(orderitem.carpanter_commision ?? "0.00");
      }, 0).toFixed(2);

      // calculate the commision of the architect
      const architectCommision = createOrderTypeAnswer.data.order_items.reduce((acc, orderitem, _index) => {
        return acc + parseFloat(orderitem.architect_commision ?? "0.00");
      }, 0).toFixed(2);


      // check if amount paid is not more than total order value
      if(actualtotalValue < parseFloat(createOrderTypeAnswer.data.amount_paid ?? "0.00")){
        throw new Error("Amount Paid Cannot Exceed Total Order Amount!!!")
      }

      // check if address belongs to a customer if address is given
      const customerId = createOrderTypeAnswer.data.customer_id;
      if (customerId !== undefined && customerId !== null && createOrderTypeAnswer.data.delivery_address_id) {
        const customerAddressIds = await tx.query.customer.findFirst({
          where: (customer, { eq }) => eq(customer.id, customerId),
          columns: {
            id: true
          },
          with: {
            addresses: {
              columns: {
                id: true
              }
            }
          }
        });

        if(!customerAddressIds) throw new Error("Unable to find Customer!!!");

        const foundId = customerAddressIds.addresses.filter((address) => address.id == createOrderTypeAnswer.data.delivery_address_id);

        if(foundId.length !== 1){
          throw new Error("Address does not belong to the customer!!!")
        }
      }

      // create order
      const tOrder = await tx.insert(order).values({
        note: createOrderTypeAnswer.data.note ?? "",
        customer_id: createOrderTypeAnswer.data.customer_id,
        carpanter_id: createOrderTypeAnswer.data.carpanter_id,
        architect_id: createOrderTypeAnswer.data.architect_id,
        status: canDeliver ? createOrderTypeAnswer.data.status : "Pending",
        priority: createOrderTypeAnswer.data.priority,
        payment_status: calculatePaymentStatus(actualtotalValue, parseFloat(createOrderTypeAnswer.data.amount_paid ?? "0.00")),
        delivery_date: createOrderTypeAnswer.data.status == "Delivered" && canDeliver ? createOrderTypeAnswer.data.delivery_date === null ? new Date(): createOrderTypeAnswer.data.delivery_date : null,
        delivery_address_id: createOrderTypeAnswer.data.customer_id ? createOrderTypeAnswer.data.delivery_address_id : null,
        discount: createOrderTypeAnswer.data.discount,
        amount_paid: createOrderTypeAnswer.data.amount_paid,
        total_order_amount: totalValue.toFixed(2),
        carpanter_commision: calculateCarpanterCommision ? carpanterCommision : null,
        architect_commision: calculateArchitectCommision ? architectCommision : null,
      }).returning({id: order.id});
      
      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          order_id: tOrder[0].id,
          customer_id: createOrderTypeAnswer.data.customer_id,
          architect_id: createOrderTypeAnswer.data.architect_id,
          carpanter_id: createOrderTypeAnswer.data.carpanter_id,
          linked_to: "ORDER",
          type: "CREATE",
          message: JSON.stringify(omit(createOrderTypeAnswer.data, ["architect_id", "carpanter_id", "customer_id"]), null, 2)
        });
      }

      // create order items
      const orderItems = await tx.insert(order_item).values(
        createOrderTypeAnswer.data.order_items.map((order_item) => {
          return {
            order_id: tOrder[0].id,
            item_id: order_item.item_id,
            quantity: order_item.quantity,
            delivered_quantity: (createOrderTypeAnswer.data.status == "Delivered" && canDeliver) ? order_item.quantity : 0,
            rate: order_item.rate,
            total_value: order_item.total_value,
            carpanter_commision: calculateCarpanterCommision ? order_item.carpanter_commision : null,
            carpanter_commision_type: calculateCarpanterCommision ? order_item.carpanter_commision_type : null,
            architect_commision: calculateArchitectCommision ? order_item.architect_commision : null,
            architect_commision_type: calculateArchitectCommision ? order_item.architect_commision_type : null,
          }
        })
      ).returning({
        id: order_item.id,
        item_id: order_item.item_id,
        quantity: order_item.quantity
      })

      // update total order value and balance for customer
      if(createOrderTypeAnswer.data.customer_id) {
        await tx
          .update(customer)
          .set({
            balance: sql`${customer.balance} + ${sql.placeholder("customerBalance")}`,
            total_order_value: sql`${customer.total_order_value} + ${sql.placeholder("totalOrderValue")}`,
          })
          .where(eq(customer.id, createOrderTypeAnswer.data.customer_id))
          .execute({ customerBalance: customerBalance.toFixed(2), totalOrderValue: actualtotalValue.toFixed(2) });
      }

      // update balance for carpanter
      if(createOrderTypeAnswer.data.carpanter_id){
        await tx.update(carpanter).set({
          balance: sql`${carpanter.balance} + ${sql.placeholder("CarpanterCommision")}`
        }).where(eq(carpanter.id, createOrderTypeAnswer.data.carpanter_id)).execute({
          CarpanterCommision: carpanterCommision
        })
      }

      // update balance for architect
      if(createOrderTypeAnswer.data.architect_id){
        await tx.update(architect).set({
          balance: sql`${architect.balance} + ${sql.placeholder("ArchitectCommision")}`
        }).where(eq(architect.id, createOrderTypeAnswer.data.architect_id)).execute({
          ArchitectCommision: architectCommision
        })
      }

      // create a order movement if the status is deliverd and can be delivered
      if (createOrderTypeAnswer.data.status == "Delivered" && canDeliver) {
        
        createOrderTypeAnswer.data.order_items.forEach(async (orderitem) => {
          // reduce quanitity of item
          await tx.update(item).set({
            quantity: sql`${item.quantity} - ${sql.placeholder('orderQuantity')}`
          })
            .where(eq(item.id, orderitem.item_id))
            .execute({ orderQuantity: orderitem.quantity });

          // check if the quanitity is more than 0 and warehouse_quantities are equal to quanitity
          const totalWarehouseQuantity = (orderitem.warehouse_quantities ?? [])?.reduce((acc, curr) => acc + curr.quantity, 0);
          if(orderitem.quantity > 0 && ((orderitem.warehouse_quantities ?? []).length == 0 || totalWarehouseQuantity !== orderitem.quantity)){
            throw new Error("Specify warehouse quantities equal to item delivered quantity");
          }

          // update the warehouse_quantity quantities
          (orderitem.warehouse_quantities ?? [])?.forEach(async (oiwq) => {
            const foundWarehouseItem = await tx.query.warehouse_quantity.findFirst({
              where: (warehouse_quantity, { eq }) => eq(warehouse_quantity.id, oiwq.warehouse_quantity_id),
              columns: {
                quantity: true
              },
            });

            if(!foundWarehouseItem) throw new Error("Unable to find the warehouse item!!!");

            if(foundWarehouseItem.quantity < oiwq.quantity) throw new Error("Insufficient quantity in warehouse!!!");

            await tx.update(warehouse_quantity).set({
              quantity: sql`${warehouse_quantity.quantity} - ${sql.placeholder('warehouseQuantity')}`
            }).where(eq(warehouse_quantity.id, oiwq.warehouse_quantity_id)).execute({ warehouseQuantity: oiwq.quantity });
          });
        });

        // create order movement
        const tOrderMovememt = await tx.insert(order_movement).values({
          order_id: tOrder[0].id,
          labour_frate_cost: 0,
          type: "DELIVERY",
          status: "Completed",
          created_at: !createOrderTypeAnswer.data.delivery_date ? new Date(): createOrderTypeAnswer.data.delivery_date,
          delivery_at: !createOrderTypeAnswer.data.delivery_date ? new Date(): createOrderTypeAnswer.data.delivery_date, 
        }).returning({
          id: order_movement.id
        });

        // create order movement items
        const insertedOrderMovementItems = await tx.insert(order_movement_item).values(
          orderItems.map((oi) => {
            return {
              order_movement_id: tOrderMovememt[0].id,
              order_item_id: oi.id,
              quantity: oi.quantity
            }
          })
        ).returning({
          id: order_movement_item.id,
          order_item_id: order_movement_item.order_item_id
        });

        createOrderTypeAnswer.data.order_items.forEach(async (oi) => {
          
          const orderMovementItemWarehouseQuantityId = insertedOrderMovementItems.find((iomi) => iomi.order_item_id == orderItems.find((coi) => coi.item_id == oi.item_id)?.id)?.id;
          
          if(!orderMovementItemWarehouseQuantityId) return new Error("Unable to find created order movement, this should not happen contact developer!")

          // create order_movement_item_warehouse_quantity for each order item's warehouse quantity
          await tx.insert(order_movement_item_warehouse_quantity).values(
            (oi.warehouse_quantities ?? []).map((oiwq) => {
              return {
                order_movement_item_id: orderMovementItemWarehouseQuantityId,
                warehouse_quantity_id: oiwq.warehouse_quantity_id,
                quantity: oiwq.quantity,
              }
            })
          )
        })

      };
    })

    return res.status(200).json({success: true, message: "Order created successfully"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create order", error: error.message ? error.message : error});
  }

}

const editOrderNote = async (req: Request, res: Response) => {
  const editOrderNoteTypeAnswer = editOrderNoteType.safeParse(req.body);

  if(!editOrderNoteTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editOrderNoteTypeAnswer.error.flatten()})
  }

  try {

    await db.transaction(async (tx) => {
      await tx.update(order).set({
        note: editOrderNoteTypeAnswer.data.note
      }).where(eq(order.id, editOrderNoteTypeAnswer.data.order_id))

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          order_id: editOrderNoteTypeAnswer.data.order_id,
          linked_to: "ORDER",
          type: "UPDATE",
          heading: "Order Note Updated",
          message: JSON.stringify(omit(editOrderNoteTypeAnswer.data, "order_id"), null, 2)
        });
      }
    })
    
    return res.status(200).json({success: true, message: "Edited Order Note"})    
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to edit order note!", error: error.message ? error.message : error});  
  }
}

const addOrderCustomerId = async (req: Request, res: Response) => {
  const addOrderCustomerIdTypeAnswer = addOrderCustomerIdType.safeParse(req.body);

  if(!addOrderCustomerIdTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: addOrderCustomerIdTypeAnswer.error.flatten()})
  }

  try {

    await db.transaction(async (tx) => {
      const oldOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, addOrderCustomerIdTypeAnswer.data.order_id),
        columns: {
          customer_id: true,
          total_order_amount: true,
          discount: true,
          amount_paid: true
        },
        with: {
          customer: {
            columns: {
              name: true
            }
          }
        }
      })

      if(!oldOrder) {
        throw new Error("Unable to find the order!!!");
      }

      if(oldOrder.customer_id) throw new Error("Cannot change customer once linked to a order!!!");
      
      // update total order value and balance for new customer
      const totalActualOrderValue = parseFloat(oldOrder.total_order_amount) - parseFloat(oldOrder.discount ?? "0.00")
      const balance = totalActualOrderValue - parseFloat(oldOrder.amount_paid ?? "0.00");

      await tx.update(customer).set({
        balance: sql`${customer.balance} + ${sql.placeholder("balance")}`,
        total_order_value: sql`${customer.total_order_value} + ${sql.placeholder("TAOV")}`,
      }).where(eq(customer.id, addOrderCustomerIdTypeAnswer.data.customer_id)).execute({
        balance: balance.toFixed(2),
        TAOV: totalActualOrderValue.toFixed(2)
      })
      
      // update customer id in order
      await tx.update(order).set({
        customer_id: addOrderCustomerIdTypeAnswer.data.customer_id,
        delivery_address_id: null
      }).where(eq(order.id, addOrderCustomerIdTypeAnswer.data.order_id));

      const newCustomer = await tx.query.customer.findFirst({
        where: (customer, { eq }) => eq(customer.id, addOrderCustomerIdTypeAnswer.data.customer_id),
        columns: {
          name: true
        }
      });

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          order_id: addOrderCustomerIdTypeAnswer.data.order_id,
          customer_id: addOrderCustomerIdTypeAnswer.data.customer_id,
          linked_to: "ORDER",
          type: "UPDATE",
          heading: "Customer Updated for Order",
          message: `
            Old Customer: ${oldOrder.customer?.name ?? ""}
            New Customer: ${newCustomer?.name ?? ""}
          `
        });
      }
    })

    return res.status(200).json({success: true, message: "Updated Order's Customer!!!"})
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update customer for order!", error: error.message ? error.message : error});  
  }
}

const editOrderCarpanterId = async (req: Request, res: Response) => {
  const editOrderCarpanterIdTypeAnswer = editOrderCarpanterIdType.safeParse(req.body);

  if(!editOrderCarpanterIdTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editOrderCarpanterIdTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const oldOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, editOrderCarpanterIdTypeAnswer.data.order_id),
        columns: {
          carpanter_id: true,
          carpanter_commision: true
        },
        with: {
          carpanter: {
            columns: {
              name: true
            }
          }
        }
      })

      if(!oldOrder) {
        throw new Error("Order Does not Exists!!!");
      }
      
      if(oldOrder.carpanter_id === editOrderCarpanterIdTypeAnswer.data.carpanter_id){
        throw new Error("Old and new Carpanter Id cannot be same")!!!
      }

      // update / reduce commision from old carpanter
      if(oldOrder.carpanter_id){
        await tx.update(carpanter).set({
          balance: sql`${carpanter.balance} - ${sql.placeholder("OldCarpanterCommision")}`
        }).where(eq(carpanter.id, oldOrder.carpanter_id)).execute({
          OldCarpanterCommision: oldOrder.carpanter_commision
        })
      }

      // update / add commision to new carpanter
      await tx.update(carpanter).set({
        balance: sql`${carpanter.balance} + ${sql.placeholder("NewCarpanterCommision")}`
      }).where(eq(carpanter.id, editOrderCarpanterIdTypeAnswer.data.carpanter_id))
      .execute({
        NewCarpanterCommision: oldOrder.carpanter_commision
      })

      // update carpanter in order
      await tx.update(order).set({
        carpanter_id: editOrderCarpanterIdTypeAnswer.data.carpanter_id
      }).where(eq(order.id, editOrderCarpanterIdTypeAnswer.data.order_id)).returning({
        carpanter_id: order.carpanter_id
      })

      const newCarpanter = await tx.query.carpanter.findFirst({
        where: (carpanter, { eq }) => eq(carpanter.id, editOrderCarpanterIdTypeAnswer.data.carpanter_id),
        columns: {
          name: true
        }
      });

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          order_id: editOrderCarpanterIdTypeAnswer.data.order_id,
          carpanter_id: editOrderCarpanterIdTypeAnswer.data.carpanter_id,
          linked_to: "ORDER",
          type: "UPDATE",
          heading: "Carpanter Updated for Order",
          message: `
            Old Carpanter: ${oldOrder.carpanter?.name ?? ""}
            New Carpanter: ${newCarpanter?.name ?? ""}
          `
        });
      }
    })

    return res.status(200).json({success: true, message: "Updated Carpanter in Order"})    
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to Updated Carpanter in Order", error: error.message ? error.message : error});  
  }
}

const editOrderArchitectId = async (req: Request, res: Response) => {
  const editOrderArchitectIdTypeAnswer = editOrderArchitectIdType.safeParse(req.body);

  if(!editOrderArchitectIdTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editOrderArchitectIdTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const oldOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, editOrderArchitectIdTypeAnswer.data.order_id),
        columns: {
          architect_id: true,
          architect_commision: true
        },
        with: {
          architect: {
            columns: {
              name: true
            }
          }
        }
      })

      if(!oldOrder) {
        throw new Error("Order Does not Exists!!!");
      }
      
      if(oldOrder.architect_id === editOrderArchitectIdTypeAnswer.data.architect_id){
        throw new Error("Old and new Architect Id cannot be same")!!!
      }

      // update / reduce commision from old architect
      if(oldOrder.architect_id){
        await tx.update(architect).set({
          balance: sql`${architect.balance} - ${sql.placeholder("OldArchitectCommision")}`
        }).where(eq(architect.id, oldOrder.architect_id)).execute({
          OldArchitectCommision: oldOrder.architect_commision
        })
      }

      // update / add commision to new architect
      await tx.update(architect).set({
        balance: sql`${architect.balance} + ${sql.placeholder("NewArchitectCommision")}`
      }).where(eq(architect.id, editOrderArchitectIdTypeAnswer.data.architect_id))
      .execute({
        NewArchitectCommision: oldOrder.architect_commision
      })

      // update architect in order
      await tx.update(order).set({
        architect_id: editOrderArchitectIdTypeAnswer.data.architect_id
      }).where(eq(order.id, editOrderArchitectIdTypeAnswer.data.order_id)).returning({
        architect_id: order.architect_id
      });

      const newArchitect = await tx.query.architect.findFirst({
        where: (architect, { eq }) => eq(architect.id, editOrderArchitectIdTypeAnswer.data.architect_id),
        columns: {
          name: true
        }
      });

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          order_id: editOrderArchitectIdTypeAnswer.data.order_id,
          architect_id: editOrderArchitectIdTypeAnswer.data.architect_id,
          linked_to: "ORDER",
          type: "UPDATE",
          heading: "Architect Updated for Order",
          message: `
            Old Architect: ${oldOrder.architect?.name ?? ""}
            New Architect: ${newArchitect?.name ?? ""}
          `
        });
      }
    })

    return res.status(200).json({success: true, message: "Updated Architect in Order"})    
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to Updated Architect in Order", error: error.message ? error.message : error});  
  }
}

const editOrderPriority = async (req: Request, res: Response) => { 
  const editOrderPriorityTypeAnswer = editOrderPriorityType.safeParse(req.body);

  if(!editOrderPriorityTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editOrderPriorityTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      await tx.update(order).set({
        priority: editOrderPriorityTypeAnswer.data.priority
      }).where(eq(order.id, editOrderPriorityTypeAnswer.data.order_id));

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          order_id: editOrderPriorityTypeAnswer.data.order_id,
          linked_to: "ORDER",
          type: "UPDATE",
          heading: "Order Priority Updated",
          message: JSON.stringify(omit(editOrderPriorityTypeAnswer.data, "order_id"), null, 2)
        });
      }
    })
    
    return res.status(200).json({success: true, message: "Updated Order Priority!!!"})
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update order priority!!!", error: error.message ? error.message : error});  
  }
}

const editOrderDeliveryDate = async (req: Request, res: Response) => {
  const editOrderDeliveryDateTypeAnswer = editOrderDeliveryDateType.safeParse(req.body);

  if(!editOrderDeliveryDateTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editOrderDeliveryDateTypeAnswer.error.flatten()})
  }

  try {

    await db.transaction(async (tx) => {
      const oldOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, editOrderDeliveryDateTypeAnswer.data.order_id),
        columns: {
          status: true
        }
      })

      if(!oldOrder){
        throw new Error("Unable to find the order!!!");
      }

      if(oldOrder.status === "Pending"){
        throw new Error("Cannot update delivery date for a pending order!!! Change order status first!")
      }

      await tx.update(order).set({
        delivery_date: editOrderDeliveryDateTypeAnswer.data.delivery_date
      }).where(eq(order.id, editOrderDeliveryDateTypeAnswer.data.order_id));

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          order_id: editOrderDeliveryDateTypeAnswer.data.order_id,
          linked_to: "ORDER",
          type: "UPDATE",
          heading: "Order Delivery Date Updated",
          message: JSON.stringify(omit(editOrderDeliveryDateTypeAnswer.data, "order_id"), null,2)
        });
      }
    })
    
    return res.status(200).json({success: true, message: "Updated Order Delivery Date!!!"})
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to Updated Order Delivery Date!!!", error: error.message ? error.message : error});  
  }
}

const editOrderDeliveryAddressId = async (req: Request, res: Response) => {
  const editOrderDeliveryAddressIdTypeAnswer = editOrderDeliveryAddressIdType.safeParse(req.body);

  if(!editOrderDeliveryAddressIdTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editOrderDeliveryAddressIdTypeAnswer.error.flatten()})
  }

  try {

    await db.transaction(async (tx) => {
      // check if address belongs to customer
      const oldOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, editOrderDeliveryAddressIdTypeAnswer.data.order_id),
        columns: {
          customer_id: true
        },
        with: {
          customer: {
            with: {
              addresses: {
                columns: {
                  id: true,
                  house_number: true,
                  address: true
                }
              }
            },
            columns: {
              id: true
            }
          },
          delivery_address: {
            columns: {
              house_number: true,
              address: true
            }
          }
        }
      })

      if(!oldOrder) {
        throw new Error("Unable to find any order!!!");
      }

      const customerId = oldOrder.customer_id;

      if(!customerId || customerId == null || !oldOrder.customer) {
        throw new Error("Customer needs to be added to link a Address to order!!!");
      }

      const foundId = oldOrder.customer.addresses.filter((address) => address.id == editOrderDeliveryAddressIdTypeAnswer.data.delivery_address_id);

      if(foundId.length !== 1){
        throw new Error("Address does not belong to the customer!!!")
      }

      await tx.update(order).set({
        delivery_address_id: editOrderDeliveryAddressIdTypeAnswer.data.delivery_address_id
      }).where(eq(order.id, editOrderDeliveryAddressIdTypeAnswer.data.order_id));

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          order_id: editOrderDeliveryAddressIdTypeAnswer.data.order_id,
          linked_to: "ORDER",
          type: "UPDATE",
          heading: "Order Address Updated",
          message: `
            Old Address: ${oldOrder?.delivery_address?.house_number ?? ""} ${oldOrder?.delivery_address?.address ?? ""}
            New Address: ${oldOrder.customer.addresses.filter((address) => address.id == editOrderDeliveryAddressIdTypeAnswer.data.delivery_address_id)[0].house_number} ${oldOrder.customer.addresses.filter((address) => address.id == editOrderDeliveryAddressIdTypeAnswer.data.delivery_address_id)[0].address}
          `
        });
      }
    })

    return res.status(200).json({success: true, message: "Updated Order Address!!!"})
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to Updated Order Address", error: error.message ? error.message : error});  
  }
}

const editOrderDiscount = async (req: Request, res: Response) => {
  const editOrderDiscountTypeAnswer = editOrderDiscountType.safeParse(req.body);

  if(!editOrderDiscountTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editOrderDiscountTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const oldOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, editOrderDiscountTypeAnswer.data.order_id),
        columns: {
          total_order_amount: true,
          amount_paid: true,
          discount: true,
        },
        with: {
          customer: {
            columns: {
              id: true,
              balance: true
            }
          }
        }
      })

      if(!oldOrder) {
        throw new Error("Unable to find the order!!!");
      }

      if(parseFloat(editOrderDiscountTypeAnswer.data.discount) == parseFloat(oldOrder.discount ?? "0.00")){
        throw new Error("Same balance as before, cannot update!");
      }
      
      const amountPending = parseFloat(oldOrder.total_order_amount) - parseFloat(editOrderDiscountTypeAnswer.data.discount ?? "0.00") - parseFloat(oldOrder.amount_paid ?? "0.00");

      if(amountPending < 0){
        throw new Error("Amount Paid cannot be more than Total Order Value!!!");
      } else if(amountPending > 0 && !oldOrder.customer){
        throw new Error("Order with due payment cannot be created without Customer Details!!!");
      }
      
      // update balance for customer
      if(oldOrder.customer){
        const discountDifference = parseFloat(editOrderDiscountTypeAnswer.data.discount) - parseFloat(oldOrder.discount ?? "0.00");
        const operator = discountDifference > 0 ? "Addition" : "Subtraction";

        if(operator == "Addition"){
          await tx.update(customer).set({
            balance: sql`${customer.balance} - ${sql.placeholder("difference")}`,
            total_order_value: sql`${customer.total_order_value} - ${sql.placeholder("tov_difference")}`
          }).where(eq(customer.id, oldOrder.customer.id)).execute({
            difference: discountDifference.toFixed(2),
            tov_difference: discountDifference.toFixed(2)
          })
        } else {
          await tx.update(customer).set({
            balance: sql`${customer.balance} + ${sql.placeholder("difference")}`,
            total_order_value: sql`${customer.total_order_value} + ${sql.placeholder("tov_difference")}`
          }).where(eq(customer.id, oldOrder.customer.id)).execute({
            difference: discountDifference.toFixed(2),
            tov_difference: discountDifference.toFixed(2)
          })
        }
      }

      // update the order discount and payment status according to new discount
      await tx.update(order).set({
        discount: editOrderDiscountTypeAnswer.data.discount,
        payment_status: calculatePaymentStatus(parseFloat(oldOrder.total_order_amount) - parseFloat(editOrderDiscountTypeAnswer.data.discount), parseFloat(oldOrder.amount_paid ?? "0.00"))
      });

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          order_id: editOrderDiscountTypeAnswer.data.order_id,
          linked_to: "ORDER",
          type: "UPDATE",
          heading: "Order Discount Updated",
          message: JSON.stringify(omit(editOrderDiscountTypeAnswer.data, "order_id"), null, 2)
        });
      }
    })

    return res.status(200).json({success: true, message: "Updated Order discount!!!"})
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to Updated Order discount", error: error.message ? error.message : error});  
  }
}

const settleBalance = async (req: Request, res: Response) => {
  const settleBalanceTypeAnswer = settleBalanceType.safeParse(req.body);

  if(!settleBalanceTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: settleBalanceTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const oldOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, settleBalanceTypeAnswer.data.order_id),
        columns: {
          payment_status: true,
          total_order_amount: true,
          discount: true,
          amount_paid: true
        }
      })

      if(!oldOrder) {
        throw new Error("Unable to find Order!!!");
      }
      
      const actualTotalOrderValue = parseFloat(oldOrder.total_order_amount) - parseFloat(oldOrder.discount ?? "0.00");
      
      const newAmountPaid = settleBalanceTypeAnswer.data.operator === "subtract" ? parseFloat(oldOrder.amount_paid ?? "0.00") + parseFloat(settleBalanceTypeAnswer.data.amount) : parseFloat(oldOrder.amount_paid ?? "0.00") - parseFloat(settleBalanceTypeAnswer.data.amount)
      
      if(actualTotalOrderValue < newAmountPaid) {
        throw new Error("Updated Amount Paid cannot be more than Total Order Value");
      }

      const newPaymentStatus = calculatePaymentStatus(actualTotalOrderValue, newAmountPaid);

      // update the order amountPaid and Payment Status for order
      const updatedOrder = await tx.update(order).set({
        payment_status: newPaymentStatus,
        amount_paid: newAmountPaid.toFixed(2)
      }).where(eq(order.id, settleBalanceTypeAnswer.data.order_id)).returning({
        customer_id: order.customer_id
      });

      // update balance for customer
      if(updatedOrder[0].customer_id){
        if(settleBalanceTypeAnswer.data.operator == "add"){
          await tx.update(customer).set({
            balance: sql`${customer.balance} + ${sql.placeholder("AmountIncreased")}`
          })
          .where(eq(customer.id, updatedOrder[0].customer_id)).execute({
            AmountIncreased: settleBalanceTypeAnswer.data.amount
          })
        } else {
          await tx.update(customer).set({
            balance: sql`${customer.balance} - ${sql.placeholder("AmountReduced")}`
          })
          .where(eq(customer.id, updatedOrder[0].customer_id)).execute({
            AmountReduced: settleBalanceTypeAnswer.data.amount
          })
        }
      }

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          order_id: settleBalanceTypeAnswer.data.order_id,
          customer_id: updatedOrder[0].customer_id ?? undefined,
          linked_to: "ORDER",
          type: "UPDATE",
          heading: "Order Payment Updated",
          message: `
          Old Amount Paid: ${oldOrder.amount_paid ?? "0.00"}
          Old Balance: ${(actualTotalOrderValue - parseFloat(oldOrder.amount_paid ?? "0.00")).toFixed(2) ?? "0.00"}
          New Amount Paid: ${newAmountPaid.toFixed(2)}
          New Balance: ${(actualTotalOrderValue - newAmountPaid).toFixed(2) ?? "0.00"}
          `
        });
      }
    })

    return res.status(200).json({success: true, message: "Settled Order Payment!!!"})
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable Settled Order Payment!!!", error: error.message ? error.message : error});  
  }
}

const editOrderItems = async (req: Request, res: Response) => {
  const editOrderItemsTypeAnswer = editOrderItemsType.safeParse(req.body);

  if(!editOrderItemsTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editOrderItemsTypeAnswer.error.flatten()})
  }

  try {
    // check if duplicate items in order_items array
    let new_order_item_ids: number[] = [];
    editOrderItemsTypeAnswer.data.order_items.forEach((order_item) => new_order_item_ids.push(order_item.item_id))
    const hasDuplicate = new Set(new_order_item_ids).size !== editOrderItemsTypeAnswer.data.order_items.length;
    if(hasDuplicate) {
      throw new Error("Multiple Order Items of same Kind!!!, Cannot update order items!");
    }

    await db.transaction(async (tx) => {
      const oldOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, editOrderItemsTypeAnswer.data.order_id),
        columns: {
          amount_paid: true,
          architect_commision: true,
          carpanter_commision: true,
          discount: true,
          status: true,
          total_order_amount: true,
          architect_id: true,
          carpanter_id: true,
          customer_id: true
        },
        with: {
          order_items: {
            columns: {
              id: true,
              item_id: true,
              carpanter_commision: true,
              architect_commision: true,
              total_value: true,
              quantity: true,
              delivered_quantity: true,
              rate: true,
            }
          }
        }
      })

      if(!oldOrder) {
        throw new Error("Unable to find the order!!!");
      }

      let old_order_item_ids: number[] = [];
      oldOrder.order_items.forEach((oldItem) => old_order_item_ids.push(oldItem.item_id))

      const sameItems = oldOrder.order_items.filter((oldItem) => new_order_item_ids.includes(oldItem.item_id));
      const removedItems = oldOrder.order_items.filter((oldItem) => !new_order_item_ids.includes(oldItem.item_id));
      const addedItems = editOrderItemsTypeAnswer.data.order_items.filter((newItem) => !old_order_item_ids.includes(newItem.item_id));
      
      let newCarpanterCommision = 0;
      let newArchitectCommision = 0;
      let new_total_order_amount = 0;

      const quantities: {id: string, quantity: number}[] = [];
      
      sameItems.forEach(async (sameOldItem) => {
        const sameNewItem = editOrderItemsTypeAnswer.data.order_items.find((newItem) => newItem.item_id == sameOldItem.item_id);

        if(!sameNewItem) throw new Error("Unable to find the new items, this should not happen!!!, Contact Developer!!!");

        newCarpanterCommision += parseFloat(sameNewItem.carpanter_commision ?? "0.00");
        newArchitectCommision += parseFloat(sameNewItem.architect_commision ?? "0.00");
        new_total_order_amount += parseFloat(sameNewItem.total_value ?? "0.00");

        // update order_item
        await tx.update(order_item).set({
          quantity: sameNewItem.quantity,
          rate: sameNewItem.rate,
          total_value: sameNewItem.total_value,
          carpanter_commision: oldOrder.carpanter_id ? sameNewItem.carpanter_commision : null,
          carpanter_commision_type: oldOrder.carpanter_id ? sameNewItem.carpanter_commision_type : null,
          architect_commision: oldOrder.architect_id ? sameNewItem.architect_commision : null,
          architect_commision_type: oldOrder.architect_id ? sameNewItem.architect_commision_type: null
        }).where(eq(order_item.id, sameOldItem.id));
      })
      
      addedItems.forEach(async (addedItem) => {
        newCarpanterCommision += parseFloat(addedItem.carpanter_commision ?? "0.00");
        newArchitectCommision += parseFloat(addedItem.architect_commision ?? "0.00");
        new_total_order_amount += parseFloat(addedItem.total_value ?? "0.00");

        // add order_item
        await tx.insert(order_item).values({
          order_id: editOrderItemsTypeAnswer.data.order_id,
          item_id: addedItem.item_id,
          quantity: addedItem.quantity,
          delivered_quantity: 0,
          rate: addedItem.rate,
          total_value: addedItem.total_value,
          carpanter_commision: oldOrder.carpanter_id ? addedItem.carpanter_commision : null,
          carpanter_commision_type: oldOrder.carpanter_id ? addedItem.carpanter_commision_type : null,
          architect_commision: oldOrder.architect_id ? addedItem.architect_commision : null,
          architect_commision_type: oldOrder.architect_id ? addedItem.architect_commision_type : null
        });
      })
      
      removedItems.forEach(async (removedOrderItem) => {
        // update order_item
        await tx.update(order_item).set({
          quantity: 0,
          rate: removedOrderItem.rate,
          total_value: "0.00",
          carpanter_commision: null,
          carpanter_commision_type: null,
          architect_commision: null,
          architect_commision_type: null
        }).where(eq(order_item.id, removedOrderItem.id));
      });
      
      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          order_id: editOrderItemsTypeAnswer.data.order_id,
          linked_to: "ORDER",
          type: "UPDATE",
          heading: "Order Items Updated",
          message: JSON.stringify(omit(editOrderItemsTypeAnswer.data, "order_id"), null, 2)
        });
      }

      // update carpanter commission
      const oldCarpanterCommision = parseFloat(oldOrder.carpanter_commision ?? "0.00");
      if(oldOrder.carpanter_id){

        if(newCarpanterCommision == oldCarpanterCommision) {
          // do nothing
        } else if (newCarpanterCommision > oldCarpanterCommision) {
          const carpanterCommisionDiff = newCarpanterCommision - oldCarpanterCommision;
          await tx.update(carpanter).set({
            balance: sql`${carpanter.balance} + ${sql.placeholder("carpanterCommisionDiff")}`,
          }).where(eq(carpanter.id, oldOrder.carpanter_id)).execute({
            carpanterCommisionDiff: carpanterCommisionDiff.toFixed(2)
          });
        } else {
          const carpanterCommisionDiff = oldCarpanterCommision - newCarpanterCommision;
          await tx.update(carpanter).set({
            balance: sql`${carpanter.balance} - ${sql.placeholder("carpanterCommisionDiff")}`,
          }).where(eq(carpanter.id, oldOrder.carpanter_id)).execute({
            carpanterCommisionDiff: carpanterCommisionDiff.toFixed(2)
          });
        }
      }

      // update architect commission
      const oldArchitectCommision = parseFloat(oldOrder.architect_commision ?? "0.00");
      if(oldOrder.architect_id){

        if(newArchitectCommision == oldArchitectCommision){ 
          // do nothing
        } else if (newArchitectCommision > oldArchitectCommision) {
          const architectCommisionDiff = newArchitectCommision - oldArchitectCommision;
          await tx.update(architect).set({
            balance: sql`${architect.balance} + ${sql.placeholder("architectCommisionDiff")}`,
          }).where(eq(architect.id, oldOrder.architect_id)).execute({
            architectCommisionDiff: architectCommisionDiff.toFixed(2)
          });
        } else {
          const architectCommisionDiff = oldArchitectCommision - newArchitectCommision;
          await tx.update(architect).set({
            balance: sql`${architect.balance} - ${sql.placeholder("architectCommisionDiff")}`,
          }).where(eq(architect.id, oldOrder.architect_id)).execute({
            architectCommisionDiff: architectCommisionDiff.toFixed(2)
          });
        }
      }
      
      // update total order value, carpanter commision, architect commision, payment status, status for order
      const newPaymentStatus = calculatePaymentStatus((new_total_order_amount - parseFloat(oldOrder.discount ?? "0.00")), parseFloat(oldOrder.amount_paid ?? "0.00"));
      const orderStatus = quantities.some(quantity => quantity.quantity < 0) ? "Pending" : oldOrder.status;
      await tx.update(order).set({
        total_order_amount: new_total_order_amount.toFixed(2),
        carpanter_commision: oldOrder.carpanter_id ? newCarpanterCommision.toFixed(2) : null,
        architect_commision: oldOrder.architect_id ? newArchitectCommision.toFixed(2) : null,
        payment_status: newPaymentStatus,
        status: orderStatus,
      }).where(eq(order.id, editOrderItemsTypeAnswer.data.order_id));
      
      
      // update total order value, balance for customer
      const oldActualTotalOrderValue = parseFloat(oldOrder.total_order_amount) - parseFloat(oldOrder.discount ?? "0.00");
      const newActualTotalOrderValue = new_total_order_amount - parseFloat(oldOrder.discount ?? "0.00")
      if(oldOrder.customer_id){
        if(newActualTotalOrderValue == oldActualTotalOrderValue) {
          // do nothing
        } else if(newActualTotalOrderValue > oldActualTotalOrderValue){
          const difference = newActualTotalOrderValue - oldActualTotalOrderValue;
          await tx.update(customer).set({
            total_order_value: sql`${customer.total_order_value} + ${sql.placeholder("difference")}`,
            balance: sql`${customer.balance} + ${sql.placeholder("difference")}`
          }).where(eq(customer.id, oldOrder.customer_id)).execute({
            difference: difference.toFixed(2)
          });
        } else {
          const difference = oldActualTotalOrderValue - newActualTotalOrderValue;
          await tx.update(customer).set({
            total_order_value: sql`${customer.total_order_value} - ${sql.placeholder("difference")}`,
            balance: sql`${customer.balance} - ${sql.placeholder("difference")}`
          }).where(eq(customer.id, oldOrder.customer_id)).execute({
            difference: difference.toFixed(2)
          });
        }
      }
    })

    return res.status(200).json({success: true, message: "Updated Order Items!!!"})
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update order items!", error: error.message ? error.message : error});  
  }
}

const getAllOrders = async (req: Request, res: Response) => {
  const getAllOrdersTypeAnswer = getAllOrdersType.safeParse(req.query);

  if(!getAllOrdersTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getAllOrdersTypeAnswer.error.flatten()})
  }

  try {
      const fetchedOrders = await db.query.order.findMany({
        limit: 10,
        where(order, { lt, eq, and }) {
          switch (getAllOrdersTypeAnswer.data.filter) {
            case "Status-Pending":
              if (getAllOrdersTypeAnswer.data.cursor) {
                return and(
                  lt(order.id, getAllOrdersTypeAnswer.data.cursor),
                  eq(order.status, "Pending")
                );
              } else {
                return eq(order.status, "Pending");
              }
            case "Status-Delivered":
              if (getAllOrdersTypeAnswer.data.cursor) {
                return and(
                  lt(order.id, getAllOrdersTypeAnswer.data.cursor),
                  eq(order.status, "Delivered")
                );
              } else {
                return eq(order.status, "Delivered");
              }
            case "Payment-UnPaid":
              if (getAllOrdersTypeAnswer.data.cursor) {
                return and(
                  lt(order.id, getAllOrdersTypeAnswer.data.cursor),
                  eq(order.payment_status, "UnPaid")
                );
              } else {
                return eq(order.payment_status, "UnPaid");
              }
            case "Payment-Partial":
              if (getAllOrdersTypeAnswer.data.cursor) {
                return and(
                  lt(order.id, getAllOrdersTypeAnswer.data.cursor),
                  eq(order.payment_status, "Partial")
                );
              } else {
                return eq(order.payment_status, "Partial");
              }
            case "Payment-Paid":
              if (getAllOrdersTypeAnswer.data.cursor) {
                return and(
                  lt(order.id, getAllOrdersTypeAnswer.data.cursor),
                  eq(order.payment_status, "Paid")
                );
              } else {
                return eq(order.payment_status, "Paid");
              }
            case "Priority-Low":
              if (getAllOrdersTypeAnswer.data.cursor) {
                return and(
                  lt(order.id, getAllOrdersTypeAnswer.data.cursor),
                  eq(order.priority, "Low")
                );
              } else {
                return eq(order.priority, "Low");
              }
            case "Priority-Medium":
              if (getAllOrdersTypeAnswer.data.cursor) {
                return and(
                  lt(order.id, getAllOrdersTypeAnswer.data.cursor),
                  eq(order.priority, "Medium")
                );
              } else {
                return eq(order.priority, "Medium");
              }
            case "Priority-High":
              if (getAllOrdersTypeAnswer.data.cursor) {
                return and(
                  lt(order.id, getAllOrdersTypeAnswer.data.cursor),
                  eq(order.priority, "High")
                );
              } else {
                return eq(order.priority, "High");
              }
            case "All":
              if (getAllOrdersTypeAnswer.data.cursor) {
                return lt(
                  order.id,
                  getAllOrdersTypeAnswer.data.cursor
                );
              } else {
                return undefined;
              }
            default:
              undefined;
              break;
          }
        },
        orderBy: (order, { desc }) => [desc(order.id)],
        columns: {
          id: true,
          status: true,
          payment_status: true,
          priority: true,
          updated_at: true,
        },
        with: {
          delivery_address: {
            columns: {
              house_number: true,
              address: true,
            },
          },
          customer: {
            columns: {
              name: true,
            },
          },
        },
      });

    return res.status(200).json({success: true, message: "All Orders fetched", data: fetchedOrders});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to fetch orders", error: error.message ? error.message : error});
  }
}

const getOrder = async (req: Request, res: Response) => {
  const getOrderTypeAnswer = getOrderType.safeParse(req.query);

  if(!getOrderTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getOrderTypeAnswer.error.flatten()})
  }

  try {
    const fetchedOrder = await db.transaction(async (tx) => {
      const tOrder = await tx.query.order.findFirst({
        where: (order, { eq }) =>
          eq(order.id, getOrderTypeAnswer.data.order_id),
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
                  phone_number: true
                }
              }
            }
          },
          architect: {
            columns: {
              name: true,
              profileUrl: true
            }
          },
          carpanter: {
            columns: {
              name: true,
              profileUrl: true
            }
          },
          order_movements: {
            orderBy: (order_movement, { desc }) => desc(order_movement.created_at),
            columns: {
              labour_frate_cost: false,
              order_id: false,
              delivery_at: false
            },
            with: {
              driver: {
                columns: {
                  name: true
                }
              }
            },
          },
          delivery_address: {
            columns: {
              id: true,
              house_number: true,
              address: true,
            },
            with: {
              address_area: {
                columns: {
                  area: true
                }
              }
            }
          },
          order_items: {
            columns: {
              id: true,
              quantity: true,
              delivered_quantity: true,
              rate: true,
              total_value: true,
              architect_commision: true,
              architect_commision_type: true,
              carpanter_commision: true,
              carpanter_commision_type: true,
              item_id: true
            },
            with: {
              item: {
                columns: {
                  name: true,
                  rate_dimension: true
                }
              }
            }
          }
        },
      });

      return tOrder;
    })
    
    return res.status(200).json({success: true, message: "Order fetched", data: fetchedOrder});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to fetch order", error: error.message ? error.message : error});
  }

}

const createMovement = async (req: Request, res: Response) => {
  const createMovementTypeAnswer = createOrderMovementType.safeParse(req.body);

  if(!createMovementTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createMovementTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const fetchedTxOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, createMovementTypeAnswer.data.order_id),
        columns: {
          status: true
        },
        with: {
          order_items: {
            columns: {
              id: true,
              quantity: true,
              delivered_quantity: true
            },
            with: {
              item: {
                columns: {
                  id: true,
                  name: true,
                  quantity: true
                }
              }
            }
          }
        }
      });

      if(!fetchedTxOrder) throw new Error("Unable to find the order");

      // create order movement
      const order_movement_id = await tx.insert(order_movement).values({
        order_id: createMovementTypeAnswer.data.order_id,
        labour_frate_cost: createMovementTypeAnswer.data.labour_frate_cost ?? 0,
        type: createMovementTypeAnswer.data.type,
        created_at: createMovementTypeAnswer.data.created_at,
        delivery_at: createMovementTypeAnswer.data.status == "Completed" ? createMovementTypeAnswer.data.delivery_at : null,
        driver_id: createMovementTypeAnswer.data.driver_id,
        status: createMovementTypeAnswer.data.status
      }).returning({ id: order_movement.id });

      // create order movement items
      const createdOrderMovementItems = await tx.insert(order_movement_item).values(
        createMovementTypeAnswer.data.order_movement_items.map((omi) => {
          return {
            order_movement_id: order_movement_id[0].id,
            order_item_id: omi.order_item_id,
            quantity: omi.quantity
          }
        })
      ).returning({
        id: order_movement_item.id,
        order_item_id: order_movement_item.order_item_id
      })

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          order_id: createMovementTypeAnswer.data.order_id,
          driver_id: createMovementTypeAnswer.data.driver_id ?? undefined,
          linked_to: "ORDER_MOVEMENT",
          type: "CREATE",
          message: JSON.stringify(omit(createMovementTypeAnswer.data, ["order_id", "driver_id"]), null, 2)
        });
      }


      if(createMovementTypeAnswer.data.type == "DELIVERY"){

        if(fetchedTxOrder.status == "Delivered") throw new Error("Order is already Delivered, Cannot create movement of type Delivery!");
        
        if(createMovementTypeAnswer.data.status == "Completed"){

          // check if enough quantity is there
          let errorMessage = createMovementTypeAnswer.data.order_movement_items.reduce((acc, omi) => {
            const foundOrderItem = fetchedTxOrder.order_items.filter((oi) => oi.id == omi.order_item_id)[0];
            if(!foundOrderItem) throw new Error("Unable to find the order item!");
            
            if((foundOrderItem.item.quantity ?? 0) < omi.quantity){
              return acc += `${foundOrderItem?.item.name} has ${foundOrderItem?.item.quantity} Quantity Available (Requested ${omi.quantity})! `
            } else {
              return acc;
            }
          }, "");

          if(errorMessage !== "") throw new Error(errorMessage);

          const promises = createMovementTypeAnswer.data.order_movement_items.map(async (omi) => {
            const foundOrderItem = fetchedTxOrder.order_items.filter((oi) => oi.id == omi.order_item_id)[0];
            if(!foundOrderItem) throw new Error("Unable to find the order item!");

            // reduce quantities from item
            await tx.update(item).set({
              quantity: sql`${item.quantity} - ${sql.placeholder('orderQuantity')}`
            })
            .where(eq(item.id, foundOrderItem.item.id))
            .execute({ orderQuantity: omi.quantity });

            // increase delivered quantities in order_item
            await tx.update(order_item).set({
              delivered_quantity: sql`${order_item.delivered_quantity} + ${sql.placeholder("deliveredQuantities")}`
            })
            .where(eq(order_item.id, omi.order_item_id))
            .execute({
              deliveredQuantities: omi.quantity
            });

            // check if the quanitity is more than 0 and warehouse_quantities are equal to quanitity
            const totalWarehouseQuantity = (omi.warehouse_quantities ?? [])?.reduce((acc, curr) => acc + curr.quantity, 0);
            if(omi.quantity > 0 && ((omi.warehouse_quantities ?? []).length == 0 || totalWarehouseQuantity !== omi.quantity)){
              throw new Error("Specify warehouse quantities equal to item delivered quantity");
            }

            const createdOrderMovementItemId = createdOrderMovementItems.find((comi) => comi.order_item_id == omi.order_item_id)?.id;

            if(!createdOrderMovementItemId) throw new Error("Unable to find created order movement item, this should not happen contact developer.")

            const promises = omi.warehouse_quantities.map(async (omiwq) => {

              const foundWarehouseItem = await db.query.warehouse_quantity.findFirst({
                where: (warehouse_quantity, { eq }) => eq(warehouse_quantity.id, omiwq.warehouse_quantity_id),
                columns: {
                  quantity: true
                }
              });

              if(!foundWarehouseItem) throw new Error("Unable to find the warehouse item!!!");
              if(foundWarehouseItem.quantity < omiwq.quantity) throw new Error("Insufficient quantity in warehouse!!!");
              
              // decrease the warehouse_quantity quantity
              await tx.update(warehouse_quantity).set({
                quantity: sql`${warehouse_quantity.quantity} - ${sql.placeholder('warehouseQuantity')}`
              }).where(eq(warehouse_quantity.id, omiwq.warehouse_quantity_id)).execute({ warehouseQuantity: omiwq.quantity });

              // create order_movement_item_warehouse_quantity
              await tx.insert(order_movement_item_warehouse_quantity).values({
                warehouse_quantity_id: omiwq.warehouse_quantity_id,
                quantity: omiwq.quantity,
                order_movement_item_id: createdOrderMovementItemId
              });
            });

            await Promise.all(promises);
            
          });

          await Promise.all(promises);

        } else { // Pending Delivery

          // update the activeDeliveries for driver if exists
          if(createMovementTypeAnswer.data.driver_id){
            await tx.update(driver).set({
              activeDeliveries: sql`${driver.activeDeliveries} + 1`
            }).where(eq(driver.id, createMovementTypeAnswer.data.driver_id));
          }

          // create order movement items warehouse quantities
          createMovementTypeAnswer.data.order_movement_items.forEach(async (omi) => {

            const createdOrderMovementItemId = createdOrderMovementItems.find((comi) => comi.order_item_id == omi.order_item_id)?.id;
            if(!createdOrderMovementItemId) throw new Error("Unable to find created order movement item, this should not happen contact developer.")

            omi.warehouse_quantities.forEach(async (omiwq) => {
              // create order_movement_item_warehouse_quantity
              await tx.insert(order_movement_item_warehouse_quantity).values({
                warehouse_quantity_id: omiwq.warehouse_quantity_id,
                quantity: omiwq.quantity,
                order_movement_item_id: createdOrderMovementItemId
              });
            });

          });

        }

      } else { // RETURN Type Movement
        
        const promises = createMovementTypeAnswer.data.order_movement_items.map(async (omi) => {

          // increase quantities from item
          const foundOrderItem = fetchedTxOrder.order_items.filter((oi) => oi.id == omi.order_item_id)[0];
          if(!foundOrderItem) throw new Error("Unable to find the order item!");

          await tx.update(item).set({
            quantity: sql`${item.quantity} + ${sql.placeholder('returnQuantity')}`
          })
          .where(eq(item.id, foundOrderItem.item.id))
          .execute({ returnQuantity: omi.quantity });
          
          // decrease delivered quantities in order_item
          await tx.update(order_item).set({
            delivered_quantity: sql`${order_item.delivered_quantity} - ${sql.placeholder("returnedQuantities")}`
          })
          .where(eq(order_item.id, omi.order_item_id))
          .execute({
            returnedQuantities: omi.quantity
          });

          // check if the quanitity is more than 0 and warehouse_quantities are equal to quanitity
          const totalWarehouseQuantity = (omi.warehouse_quantities ?? [])?.reduce((acc, curr) => acc + curr.quantity, 0);
          if(omi.quantity > 0 && ((omi.warehouse_quantities ?? []).length == 0 || totalWarehouseQuantity !== omi.quantity)){
            throw new Error("Specify warehouse quantities equal to item returned quantity");
          }

          const createdOrderMovementItemId = createdOrderMovementItems.find((comi) => comi.order_item_id == omi.order_item_id)?.id;

          if(!createdOrderMovementItemId) throw new Error("Unable to find created order movement item, this should not happen contact developer.")

          const promises = omi.warehouse_quantities.map(async (omiwq) => {
            // increase the warehouse_item quantity
            await tx.update(warehouse_quantity).set({
              quantity: sql`${warehouse_quantity.quantity} + ${sql.placeholder('warehouseQuantity')}`
            }).where(eq(warehouse_quantity.id, omiwq.warehouse_quantity_id)).execute({ warehouseQuantity: omiwq.quantity });
            
            // create order_movement_item_warehouse_quantity
            await tx.insert(order_movement_item_warehouse_quantity).values({
              warehouse_quantity_id: omiwq.warehouse_quantity_id,
              quantity: omiwq.quantity,
              order_movement_item_id: createdOrderMovementItemId
            });
          });

          await Promise.all(promises);
        });

        await Promise.all(promises);
      }

        if(!fetchedTxOrder) throw new Error("Unable to find the order");
        if(!createMovementTypeAnswer.data) throw new Error("Unable to find the order movement");
        
        // check if all the items are delivered fully then update the order status
        const updatedOrderItems = await tx.query.order_item.findMany({
          where: (order_item, { eq }) => eq(order_item.order_id, createMovementTypeAnswer.data.order_id),
          columns: {
            delivered_quantity: true,
            quantity: true
          }
        });

        let orderDelivered = true;
        updatedOrderItems.map((oi) => {
          if(oi.quantity !== oi.delivered_quantity){
            orderDelivered = false;
          }
        });
              
        if(orderDelivered && fetchedTxOrder.status !== "Delivered"){ 
          await tx.update(order).set({
            status: "Delivered",
            delivery_date: createMovementTypeAnswer.data.delivery_at ?? new Date()
          }).where(eq(order.id, createMovementTypeAnswer.data.order_id));
        } else if(!orderDelivered && fetchedTxOrder.status == "Delivered"){
          await tx.update(order).set({
            status: "Pending",
            delivery_date: null
          }).where(eq(order.id, createMovementTypeAnswer.data.order_id));
        }
    })
    
    return res.status(200).json({success: true, message: "Order Movement Created!"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create order movement!", error: error.message ? error.message : error});
  }
}

const editMovement = async (req: Request, res: Response) => {
  const editMovementTypeAnswer = editOrderMovementType.safeParse(req.body);

  if(!editMovementTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editMovementTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const foundMovementTx = await tx.query.order_movement.findFirst({
        where: (order_movement, { eq }) => eq(order_movement.id, editMovementTypeAnswer.data.id),
        columns: {
          status: true,
          driver_id: true,
          order_id: true
        }
      });

      if(!foundMovementTx) throw new Error("Unable to find order movement!");

      await tx.update(order_movement).set({
        created_at: editMovementTypeAnswer.data.created_at,
        delivery_at: foundMovementTx.status == "Completed" ? editMovementTypeAnswer.data.delivery_at : null,
        labour_frate_cost: editMovementTypeAnswer.data.labour_frate_cost,
        driver_id: editMovementTypeAnswer.data.driver_id,
      });

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          order_id: foundMovementTx.order_id,
          driver_id: editMovementTypeAnswer.data.driver_id,
          linked_to: "ORDER_MOVEMENT",
          type: "UPDATE",
          message: JSON.stringify(omit(editMovementTypeAnswer.data, ["id", "driver_id"]), null, 2)
        });
      }

      if(editMovementTypeAnswer.data.driver_id == foundMovementTx.driver_id) return;

      if(editMovementTypeAnswer.data.driver_id && foundMovementTx.status == "Pending"){
        if(foundMovementTx.driver_id && foundMovementTx.driver_id !== editMovementTypeAnswer.data.driver_id){
          await tx.update(driver).set({
            activeDeliveries: sql`${driver.activeDeliveries} - 1`
          }).where(eq(driver.id, foundMovementTx.driver_id));
        }

        await tx.update(driver).set({
          activeDeliveries: sql`${driver.activeDeliveries} + 1`
        }).where(eq(driver.id, editMovementTypeAnswer.data.driver_id));
      }
    })
    
    return res.status(200).json({success: true, message: "Order Movement Updated!"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create order movement!", error: error.message ? error.message : error});
  }
}

const editMovementStatus = async (req: Request, res: Response) => {
  const editMovementStatusTypeAnswer = editOrderMovementStatusType.safeParse(req.body);

  if(!editMovementStatusTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editMovementStatusTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const foundMovementTx = await tx.query.order_movement.findFirst({
        where: (order_movement, { eq }) => eq(order_movement.id, editMovementStatusTypeAnswer.data.id),
        columns: {
          order_id: true,
          status: true,
          driver_id: true,
          type: true
        },
        with: {
          order_movement_items: {
            columns: {
              id: true,
              quantity: true,
              order_item_id: true
            }
          }
        }
      });

      
      if(!foundMovementTx) throw new Error("Unable to find order movement!");
      if(foundMovementTx.type == "RETURN") throw new Error("Cannot change type for RETURN type order movement!");
      
      const foundOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, foundMovementTx?.order_id),
        columns: {
          status: true
        },
        with: {
          order_items: {
            columns: {
              id: true,
            },
            with: {
              item: {
                columns: {
                  id: true,
                  name: true,
                  quantity: true
                }
              }
            }
          }
        }
      });

      if(!foundOrder) throw new Error("Unable to find order linked to movement!");

      if(foundMovementTx.status == "Pending"){ // Pending -> Completed

        // check if enough quanitity is there in inventory
        let errorMessage = foundMovementTx.order_movement_items.reduce((acc, cur) => {
          const foundOrderItem = foundOrder.order_items.filter((oi) => oi.id == cur.order_item_id)[0];
          if(!order_item) throw new Error("Unable to find the order item!");
          
          if((foundOrderItem.item.quantity ?? 0) < cur.quantity){
            return acc += `${foundOrderItem?.item.name} has ${foundOrderItem?.item.quantity} Quantity Available (Requested ${cur.quantity})! `
          } else {
            return acc;
          }
        }, "");

        if(errorMessage !== "") throw new Error(errorMessage);

        let errorMessage2 = "";

        const pendingStatusPromises = foundMovementTx.order_movement_items.map(async (omi) => {
          const orderMovementItemWarehouseQuantity = await tx.query.order_movement_item_warehouse_quantity.findMany({
            where: (omiwq_table, { eq }) => eq(omiwq_table.order_movement_item_id, omi.id),
            columns: {
              warehouse_quantity_id: true,
              quantity: true
            }
          });

          const decreaseWarehouseQuantityPromises = orderMovementItemWarehouseQuantity.map(async (omiwq) => {
            // get actual quantity
            const foundWarehouseQuantity = await tx.query.warehouse_quantity.findFirst({
              where: (warehouse_quantity, { eq }) => eq(warehouse_quantity.id, omiwq.warehouse_quantity_id),
              columns: {
                quantity: true
              },
              with: {
                item: {
                  columns: {
                    name: true
                  }
                },
                warehouse: {
                  columns: {
                    name: true
                  }
                }
              }
            });

            // check if enough warehouse quantity
            if((foundWarehouseQuantity?.quantity ?? 0) < omiwq.quantity) {
              errorMessage2 += `${foundWarehouseQuantity?.item.name} has less quantity in Warehouse: ${foundWarehouseQuantity?.warehouse.name} then requested. `
            }

            // reduce quantity in warehouse_quanitity for now, if there will be any error then errorMessage2 will rollback the transaction
            await tx.update(warehouse_quantity).set({
              quantity: sql`${warehouse_quantity.quantity} - ${sql.placeholder("OrderMovementWarehouseQuantity")}`
            }).where(eq(warehouse_quantity.id, omiwq.warehouse_quantity_id)).execute({
              OrderMovementWarehouseQuantity: omiwq.quantity
            });
          });

          await Promise.all(decreaseWarehouseQuantityPromises);
        });

        await Promise.all(pendingStatusPromises);

        if(errorMessage2 !== "") throw new Error(errorMessage2);

        // increase delivered quanitites for order item and decrease item quantity
        foundMovementTx.order_movement_items.forEach(async(omi) => {
          const updatedOrderItemItemId = await tx.update(order_item).set({
            delivered_quantity: sql`${order_item.delivered_quantity} + ${omi.quantity}`
          }).where(eq(order_item.id, omi.order_item_id)).returning({
            item_id: order_item.item_id
          })
          
          await tx.update(item).set({
            quantity: sql`${item.quantity} - ${omi.quantity}`
          }).where(eq(item.id, updatedOrderItemItemId[0].item_id));        
        });

        if(foundMovementTx.driver_id) {
          await tx.update(driver).set({
            activeDeliveries: sql`${driver.activeDeliveries} - 1`
          }).where(eq(driver.id, foundMovementTx.driver_id));
        }
      } else { // Completed -> Pending

        const completedPromises = foundMovementTx.order_movement_items.map(async(omi) => {
          // decrease delivered quanitites for order item and increase item quantity

          const updatedOrderItemItemId = await tx.update(order_item).set({
            delivered_quantity: sql`${order_item.delivered_quantity} - ${omi.quantity}`
          }).where(eq(order_item.id, omi.order_item_id)).returning({
            item_id: order_item.item_id
          })
          
          await tx.update(item).set({
            quantity: sql`${item.quantity} + ${omi.quantity}`
          }).where(eq(item.id, updatedOrderItemItemId[0].item_id));

          // increase the warehouse quantity
          const orderMovementItemWarehouseQuantity = await tx.query.order_movement_item_warehouse_quantity.findMany({
            where: (order_movement_item_warehouse_quantity, { eq }) => eq(order_movement_item_warehouse_quantity.order_movement_item_id, omi.id),
            columns: {
              warehouse_quantity_id: true,
              quantity: true
            }
          });
          orderMovementItemWarehouseQuantity.forEach(async (omiwq) => {
            await tx.update(warehouse_quantity).set({
              quantity: sql`${warehouse_quantity.quantity} + ${sql.placeholder("OrderMovementWarehouseQuantity")}`
            }).where(eq(warehouse_quantity.id, omiwq.warehouse_quantity_id)).execute({
              OrderMovementWarehouseQuantity: omiwq.quantity
            });
          });

        });

        
        if(foundMovementTx.driver_id) {
          await tx.update(driver).set({
            activeDeliveries: sql`${driver.activeDeliveries} + 1`
          }).where(eq(driver.id, foundMovementTx.driver_id));
        }

        await Promise.all(completedPromises);
      }

      // update status for the order_movement
      await tx.update(order_movement).set({
        status: foundMovementTx.status == "Completed" ? "Pending" : "Completed",
        delivery_at: foundMovementTx.status == "Completed" ? null : new Date()
      }).where(eq(order_movement.id, editMovementStatusTypeAnswer.data.id));
      
      // update the status based on delivered quanitites of the order
      const updatedOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, foundMovementTx.order_id),
        columns: {
          id: true,
        },
        with: {
          order_items: {
            columns: {
              quantity: true,
              delivered_quantity: true
            }
          }
        }
      });

      let orderCompleted = true;
      updatedOrder?.order_items.forEach((oi) => {
        if(oi.delivered_quantity != oi.quantity){
          orderCompleted = false; 
        }
      });
      
      await tx.update(order).set({
        status: orderCompleted ? "Delivered" : "Pending",
        delivery_date: orderCompleted ? new Date() : null
      }).where(eq(order.id, foundMovementTx.order_id));

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          order_id: foundMovementTx.order_id,
          driver_id: foundMovementTx.driver_id,
          linked_to: "ORDER_MOVEMENT",
          type: "UPDATE",
          heading: "Order Movement Status Updated",
          message: `${foundMovementTx.status == "Completed" ? "Completed" : "Pending"} -> ${foundMovementTx.status == "Completed" ? "Pending" : "Completed"}`
        });
      }
    })
    
    return res.status(200).json({success: true, message: "Order Movement Updated!"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create order movement!", error: error.message ? error.message : error});
  }
}

const deleteMovement = async (req: Request, res: Response) => {
  const deleteMovementTypeAnswer = deleteOrderMovementType.safeParse(req.body);

  if(!deleteMovementTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: deleteMovementTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      const foundMovementTx = await tx.query.order_movement.findFirst({
        where: (order_movement, { eq }) => eq(order_movement.id, deleteMovementTypeAnswer.data.id),
        with: {
          order_movement_items: {
            columns: {
              id: true,
              order_item_id: true,
              quantity: true
            },
            with: {
              o_m_i_w_q: {
                columns: {
                  warehouse_quantity_id: true,
                  quantity: true
                }
              }
            }
          }
        }
      });

      if(!foundMovementTx) throw new Error("Unable to find the order movement");

      const latestMovement = await tx.query.order_movement.findMany({
        where: (order_movement, { eq }) => eq(order_movement.order_id, foundMovementTx.order_id),
        orderBy: (order_movement, { desc }) => desc(order_movement.created_at),
        limit: 1,
        columns: {
          id: true
        }
      });

      if(latestMovement[0].id !== deleteMovementTypeAnswer.data.id) throw new Error("Can Only Delete Latest Order's Movement!");

      if(foundMovementTx.type == "RETURN"){
        // increase the deliverd quantites in order_item and decrease the quantity of item
        const IncreaseDeliveryQuantitiesPromises = foundMovementTx.order_movement_items.map(async (omi) => {
          const oi = await tx.update(order_item).set({
            delivered_quantity: sql`${order_item.delivered_quantity} + ${omi.quantity ?? 0}`
          }).where(eq(order_item.id, omi.order_item_id)).returning({
            item_id: order_item.item_id
          })

          await tx.update(item).set({
            quantity: sql`${item.quantity} - ${sql.placeholder("quantity")}`
          }).where(eq(item.id, oi[0].item_id)).execute({
            quantity: omi.quantity
          });

          let errorMessage = ''
          // decrease the warehouse quantity
          const decreaseWarehouseQuantityPromises = omi.o_m_i_w_q.map(async (omiwq) => {
            // get actual warehouse quantity
            const foundWarehouseQuantity = await tx.query.warehouse_quantity.findFirst({
              where: (warehouse_quantity, { eq }) => eq(warehouse_quantity.id, omiwq.warehouse_quantity_id),
              columns: {
                quantity: true
              },
              with: {
                item: {
                  columns: {
                    name: true
                  }
                },
                warehouse: {
                  columns: {
                    name: true
                  }
                }
              }
            });

            if((foundWarehouseQuantity?.quantity ?? 0) < omiwq.quantity) {
              errorMessage += `${foundWarehouseQuantity?.item.name} has less quantity in Warehouse: ${foundWarehouseQuantity?.warehouse.name} then requested. `
            }

            // reduce quantity in warehouse_quanitity for now, if there will be any error then errorMessage2 will rollback the transaction
            await tx.update(warehouse_quantity).set({
              quantity: sql`${warehouse_quantity.quantity} - ${sql.placeholder("OrderMovementWarehouseQuantity")}`
            }).where(eq(warehouse_quantity.id, omiwq.warehouse_quantity_id)).execute({
              OrderMovementWarehouseQuantity: omiwq.quantity
            });
          })

          await Promise.all(decreaseWarehouseQuantityPromises);

          if(errorMessage !== '') throw new Error(errorMessage);
        });

        await Promise.all(IncreaseDeliveryQuantitiesPromises);
      } else {
        if(foundMovementTx.status == "Completed"){
          // decrease the deliverd quantity in order_item and increase quanitity in item
          const decreaseDeliveredQuantityPromises = foundMovementTx.order_movement_items.map(async (omi) => {
            const oi = await tx.update(order_item).set({
              delivered_quantity: sql`${order_item.delivered_quantity} - ${omi.quantity ?? 0}`
            }).where(eq(order_item.id, omi.order_item_id)).returning({
              item_id: order_item.item_id
            })
  
            await tx.update(item).set({
              quantity: sql`${item.quantity} + ${sql.placeholder("quantity")}`
            }).where(eq(item.id, oi[0].item_id)).execute({
              quantity: omi.quantity
            });

            // increase the warehouse quantity
            const increaseWarehouseQuantitiesPromises = omi.o_m_i_w_q.map(async (omiwq) => {
              // increase quantity in warehouse_quanitity
              await tx.update(warehouse_quantity).set({
                quantity: sql`${warehouse_quantity.quantity} + ${sql.placeholder("OrderMovementWarehouseQuantity")}`
              }).where(eq(warehouse_quantity.id, omiwq.warehouse_quantity_id)).execute({
                OrderMovementWarehouseQuantity: omiwq.quantity
              });
            });

            await Promise.all(increaseWarehouseQuantitiesPromises);
          });

          await Promise.all(decreaseDeliveredQuantityPromises);

        } else {
          if(foundMovementTx.driver_id){
            // decrease active deliveries from driver
            await tx.update(driver).set({
              activeDeliveries: sql`${driver.activeDeliveries} - 1`
            }).where(eq(driver.id, foundMovementTx.driver_id));
          }
        }
      }

      const updatedOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, foundMovementTx.order_id),
        columns: {
          id: true,
        },
        with: {
          order_items: {
            columns: {
              quantity: true,
              delivered_quantity: true
            }
          }
        }
      });

      let orderCompleted = true;
      updatedOrder?.order_items.forEach((oi) => {
        if(oi.delivered_quantity != oi.quantity){
          orderCompleted = false; 
        }
      });

      await tx.update(order).set({ status: orderCompleted ? "Delivered" : "Pending" })
      .where(eq(order.id, foundMovementTx.order_id));

      await tx.delete(order_movement).where(eq(order_movement.id, deleteMovementTypeAnswer.data.id));

      if(res.locals.session){
        await tx.insert(log).values({
          user_id: res.locals.session.user.id,
          order_id: foundMovementTx.order_id,
          driver_id: foundMovementTx.driver_id,
          linked_to: "ORDER_MOVEMENT",
          type: "DELETE",
          message: `Deleted Order Movement: ${JSON.stringify(omit(foundMovementTx, ["id", "order_id", "driver_id"]), null, 2)}`
        });
      }
    })
    
    return res.status(200).json({success: true, message: "Order Movement Deleted!"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to delete order movement!", error: error.message ? error.message : error});
  }
}

const getMovement = async (req: Request, res: Response) => {
  const getMovementTypeAnswer = getOrderMovementType.safeParse(req.query);

  if(!getMovementTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getMovementTypeAnswer.error.flatten()})
  }

  try {
    const fetchedMovement = await db.transaction(async (tx) => {
      const tMovement = await tx.query.order_movement.findFirst({
        where: (order_movement, { eq }) => eq(order_movement.id, getMovementTypeAnswer.data.id),
        with: {
          driver: {
            columns: {
              name: true,
              profileUrl: true,
              vehicle_number: true
            },
            with: {
              phone_numbers: {
                where: (phone_number, { eq }) => eq(phone_number.isPrimary, true),
                columns: {
                  phone_number: true
                }
              }
            }
          },
          order: {
            columns: {
              id: true
            },
            with: {
              customer: {
                columns: {
                  id: true,
                  name: true,
                  profileUrl: true
                }
              },
              delivery_address: {
                columns: {
                  id: true,
                  house_number: true,
                  address: true,
                },
                with: {
                  address_area: {
                    columns: {
                      area: true
                    }
                  }
                }
              },
            }
          },
          order_movement_items: {
            columns: {
              id: true,
              quantity: true
            },
            with: {
              order_item: {
                columns: {
                  quantity: true,
                },
                with: {
                  item: {
                    columns: {
                      name: true
                    }
                  }
                }
              },
              o_m_i_w_q: {
                columns: {
                  quantity: true,
                  warehouse_quantity_id: true
                },
              }
            }
          }
        }
      });

      if(!tMovement) throw new Error("Unable to find the order movement!");

      const allWarehouseQuantitiesIds = tMovement.order_movement_items.map((omi) =>
        omi.o_m_i_w_q.map(
          (omiwq) => omiwq.warehouse_quantity_id
        )
      ).flat()

      const UniqueAllWarehouseQuantitiesIds = [...new Set(allWarehouseQuantitiesIds)];

      if(UniqueAllWarehouseQuantitiesIds.length < 1) throw new Error("No Warehouse Quantities found linked to Some Order Movement Item!");

      const allWarehouseQuantities = await tx.query.warehouse_quantity.findMany(
        {
          where: (warehouse_quantity, { inArray }) =>
            inArray(warehouse_quantity.id, UniqueAllWarehouseQuantitiesIds),
          columns: {
            id: true,
          },
          with: {
            warehouse: {
              columns: {
                name: true,
              },
            },
          },
        }
      );

      type MovementWithQuantities = typeof tMovement & {
        warehouse_quantities?: Array<{
          id: number;
          warehouse: {
            name: string;
          };
        }>;
      };
      const fetchedMovementWithQuantities: MovementWithQuantities = {
        ...tMovement,
        warehouse_quantities: allWarehouseQuantities,
      };

      return fetchedMovementWithQuantities;
    })
    
    return res.status(200).json({success: true, message: "Order Movement fetched", data: fetchedMovement});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to fetch order movement!", error: error.message ? error.message : error});
  }
}

const createPutSignedURLOrderMovementRecipt = async (req: Request, res: Response) => {
  const createPutSignedURLOrderMovementReciptTypeAnswer = createPutSignedURLOrderMovementReciptType.safeParse(req.body);

  if (!createPutSignedURLOrderMovementReciptTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createPutSignedURLOrderMovementReciptTypeAnswer.error.flatten()})
  }

  try {
    const key = `${createPutSignedURLOrderMovementReciptTypeAnswer.data.order_movement_id}.${createPutSignedURLOrderMovementReciptTypeAnswer.data.extension.toLowerCase()}`;

    const command = new S3.PutObjectCommand({
      ACL: "private",
      Key: key,
      Bucket: Bucket.ReciptBucket.bucketName,
      ContentType: mime.getType(createPutSignedURLOrderMovementReciptTypeAnswer.data.extension.toLowerCase()) || "application/octet-stream",
      Metadata: {
        "id": createPutSignedURLOrderMovementReciptTypeAnswer.data.order_movement_id.toString(),
        "key": key
      }
    });

    const url = await getSignedUrl(new S3.S3Client({}), command, {
      expiresIn: Config.STAGE == 'dev' ? 60 * 60 : 60 * 5, // 60 / 5 minutes
    });

    return res.status(200).json({success: true, message: "Signed URL created", data: url});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create signed URL", error: error.message ? error.message : error});
  }
}

const createGetSignedURLOrderMovementRecipt = async (req: Request, res: Response) => {
  const createGetSignedURLOrderMovementReciptTypeAnswer = createGetSignedURLOrderMovementReciptType.safeParse(req.query);

  if (!createGetSignedURLOrderMovementReciptTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createGetSignedURLOrderMovementReciptTypeAnswer.error.flatten()})
  }

  try {

    const foundMovement = await db.query.order_movement.findFirst({
      where: (order_movement, { eq }) => eq(order_movement.id, createGetSignedURLOrderMovementReciptTypeAnswer.data.id),
      columns: {
        recipt_key: true
      }
    });

    if(!foundMovement){
      return res.status(400).json({success: false, message: "Order Movement not found"});
    }

    if(!foundMovement.recipt_key){
      return res.status(400).json({success: false, message: "Order Movement Recipt not found"});
    }

    const command = new S3.GetObjectCommand({
      Bucket: Bucket.ReciptBucket.bucketName,
      Key: foundMovement.recipt_key,
    });

    const url = await getSignedUrl(new S3.S3Client({}), command, {
      expiresIn: Config.STAGE == 'dev' ? 60 * 60 : 60 * 10, // 60 / 10 minutes
    });

    return res.status(200).json({success: true, message: "Get Url Created", data: url});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to get url for recipt!", error: error.message ? error.message : error});
  }
}

const deleteOrderMovementRecipt = async (req: Request, res: Response) => {
  const deleteOrderMovementReciptTypeAnswer = deleteOrderMovementReciptType.safeParse(req.body);

  if (!deleteOrderMovementReciptTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: deleteOrderMovementReciptTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async(tx) => {
      const reciptKey = await tx.query.order_movement.findFirst({
        where: (order_movement, { eq }) => eq(order_movement.id, deleteOrderMovementReciptTypeAnswer.data.id),
        columns: {
          recipt_key: true
        }
      });

      if(!reciptKey || !reciptKey.recipt_key) throw new Error("Unable to find the recipt key!");
        
      const s3 = new S3.S3Client({});

      const deleteObjectCommand = new S3.DeleteObjectCommand({
        Bucket: Bucket.ReciptBucket.bucketName,
        Key: reciptKey.recipt_key,
      });

      const deleteObjectRes = await s3.send(deleteObjectCommand);

      if(deleteObjectRes.$metadata.httpStatusCode !== 204) throw new Error("Unable to delete the recipt key!");
        
      await tx.update(order_movement).set({
        recipt_key: null
      }).where(eq(order_movement.id, deleteOrderMovementReciptTypeAnswer.data.id));
    })
    
    return res.status(200).json({success: true, message: "Recipt Deleted!"});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to delete recipt Linked to Order Movement!", error: error.message ? error.message : error});
  }
}

export {
  createOrder,
  editOrderNote,
  addOrderCustomerId,
  editOrderCarpanterId,
  editOrderArchitectId,
  editOrderPriority,
  editOrderDeliveryDate,
  editOrderDeliveryAddressId,
  editOrderDiscount,
  settleBalance,
  editOrderItems,
  getAllOrders,
  getOrder,
  createMovement,
  editMovement,
  editMovementStatus,
  getMovement,
  deleteMovement,
  createPutSignedURLOrderMovementRecipt,
  createGetSignedURLOrderMovementRecipt,
  deleteOrderMovementRecipt
}

/*
- order.total_order_amount DOES NOT take discount into account, actual total value -> order.total_order_value - order.discount
- customer.total_order_value DOES take discount into account 
*/