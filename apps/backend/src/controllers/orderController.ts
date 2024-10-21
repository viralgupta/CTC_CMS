import db from '@db/db';
import { architect, carpanter, customer, driver, item, order, order_item } from '@db/schema';
import {
  createOrderType,
  editOrderNoteType,
  addOrderCustomerIdType,
  editOrderCarpanterIdType,
  editOrderArchitectIdType,
  editOrderDriverIdType,
  editOrderStatusType,
  editOrderPriorityType,
  editOrderDeliveryDateType,
  editOrderDeliveryAddressIdType,
  editOrderLabourAndFrateCostType,
  editOrderDiscountType,
  settleBalanceType,
  editOrderItemsType,
  getAllOrdersType,
  getOrderType,
} from "@type/api/order";
import { Request, Response } from "express";
import { calculatePaymentStatus } from '@utils/order';
import { eq, sql } from "drizzle-orm"

const createOrder = async (req: Request, res: Response) => {
  const createOrderTypeAnswer = createOrderType.safeParse(req.body);

  if(!createOrderTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: createOrderTypeAnswer.error.flatten()})
  }

  try {
    const calculateCarpanterCommision = createOrderTypeAnswer.data.carpanter_id ? true : false;
    const calculateArchitectCommision = createOrderTypeAnswer.data.architect_id ? true : false;

    const createdOrder = await db.transaction(async (tx) => {

      // check if duplicate items in order_items array
      let order_item_id: string[] = [];
      createOrderTypeAnswer.data.order_items.forEach((order_item) => order_item_id.push(order_item.item_id))
      const hasDuplicate = new Set(order_item_id).size !== createOrderTypeAnswer.data.order_items.length;
      if(hasDuplicate) {
        throw new Error("Multiple Order Items of same Kind!!!, Cannot Create Order!");
      }

      // update all the quantities of the items and return the updated quantities
      const quantities: {id: string, quantity: number}[] = [];
      createOrderTypeAnswer.data.order_items.forEach(async (orderitem) => {
        const foundTItem = await tx.update(item).set({
          quantity: sql`${item.quantity} - ${sql.placeholder('orderQuantity')}`
        })
        .where(eq(item.id, orderitem.item_id))
        .returning({
          id: item.id,
          quantity: item.quantity
        })
        .execute({ orderQuantity: orderitem.quantity });

        if(!foundTItem[0]) {
          throw new Error("Item not found")
        }

        quantities.push(foundTItem[0]);
      })

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

      // calculate order status
      const orderStatus = quantities.some(quantity => quantity.quantity < 0) ? "Pending" : createOrderTypeAnswer.data.status;

      // check if amount paid is not more than total order value
      if(actualtotalValue < parseFloat(createOrderTypeAnswer.data.amount_paid ?? "0.00")){
        throw new Error("Amount Paid Cannot Exceed Total Order Amount!!!")
      }

      // check if address belongs to a customer
      const customerId = createOrderTypeAnswer.data.customer_id;
      if (customerId !== undefined && customerId !== null) {
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
        note: createOrderTypeAnswer.data.note,
        customer_id: createOrderTypeAnswer.data.customer_id,
        carpanter_id: createOrderTypeAnswer.data.carpanter_id,
        architect_id: createOrderTypeAnswer.data.architect_id,
        driver_id: createOrderTypeAnswer.data.driver_id,
        status: orderStatus,
        priority: createOrderTypeAnswer.data.priority,
        payment_status: calculatePaymentStatus(actualtotalValue, parseFloat(createOrderTypeAnswer.data.amount_paid ?? "0.00")),
        delivery_date: createOrderTypeAnswer.data.status == "Delivered" ? createOrderTypeAnswer.data.delivery_date === null ? new Date(): createOrderTypeAnswer.data.delivery_date : null,
        delivery_address_id: createOrderTypeAnswer.data.customer_id ? createOrderTypeAnswer.data.delivery_address_id : null,
        labour_frate_cost: createOrderTypeAnswer.data.labour_frate_cost,
        discount: createOrderTypeAnswer.data.discount,
        amount_paid: createOrderTypeAnswer.data.amount_paid,
        total_order_amount: totalValue.toFixed(2),
        carpanter_commision: calculateCarpanterCommision ? carpanterCommision : null,
        architect_commision: calculateArchitectCommision ? architectCommision : null,
      }).returning({id: order.id})

      // create order items
      await tx.insert(order_item).values(
        createOrderTypeAnswer.data.order_items.map((order_item) => {
          return {
            order_id: tOrder[0].id,
            item_id: order_item.item_id,
            quantity: order_item.quantity,
            rate: order_item.rate,
            total_value: order_item.total_value,
            carpanter_commision: calculateCarpanterCommision ? order_item.carpanter_commision : null,
            carpanter_commision_type: calculateCarpanterCommision ? order_item.carpanter_commision_type : null,
            architect_commision: calculateArchitectCommision ? order_item.architect_commision : null,
            architect_commision_type: calculateArchitectCommision ? order_item.architect_commision_type : null,
          }
        })
      )

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

      // update activeOrders for driver
      if(createOrderTypeAnswer.data.driver_id && createOrderTypeAnswer.data.status == "Pending"){
        await tx.update(driver).set({
          activeOrders: sql`${driver.id} + 1`
        }).where(eq(driver.id, createOrderTypeAnswer.data.driver_id))
      }

      return tOrder[0].id;
    })

    return res.status(200).json({success: true, message: "Order created successfully", data: createdOrder});
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
          delivery_address_id: true,
          total_order_amount: true,
          discount: true,
          amount_paid: true
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
    })

    return res.status(200).json({success: true, message: "Updated Order Customer!!!"})
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
    const newCarpanterId = await db.transaction(async (tx) => {
      const oldOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, editOrderCarpanterIdTypeAnswer.data.order_id),
        columns: {
          carpanter_id: true,
          carpanter_commision: true
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
      const newOrder = await tx.update(order).set({
        carpanter_id: editOrderCarpanterIdTypeAnswer.data.carpanter_id
      }).where(eq(order.id, editOrderCarpanterIdTypeAnswer.data.order_id)).returning({
        carpanter_id: order.carpanter_id
      })

      return newOrder[0].carpanter_id;
    })

    return res.status(200).json({success: true, message: "Updated Carpanter in Order", data: newCarpanterId})    
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
    const newArchitectId = await db.transaction(async (tx) => {
      const oldOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, editOrderArchitectIdTypeAnswer.data.order_id),
        columns: {
          architect_id: true,
          architect_commision: true
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
      const newOrder = await tx.update(order).set({
        architect_id: editOrderArchitectIdTypeAnswer.data.architect_id
      }).where(eq(order.id, editOrderArchitectIdTypeAnswer.data.order_id)).returning({
        architect_id: order.architect_id
      })

      return newOrder[0].architect_id;
    })

    return res.status(200).json({success: true, message: "Updated Architect in Order", data: newArchitectId})    
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to Updated Architect in Order", error: error.message ? error.message : error});  
  }
}

const editOrderDriverId = async (req: Request, res: Response) => {
  const editOrderDriverIdTypeAnswer = editOrderDriverIdType.safeParse(req.body);

  if(!editOrderDriverIdTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editOrderDriverIdTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async(tx) => {
      const oldOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, editOrderDriverIdTypeAnswer.data.order_id),
        columns: {
          driver_id: true,
          status: true
        }
      })

      if(!oldOrder) {
        throw new Error("Unable to find Order!!!")
      }

      if(oldOrder.driver_id == editOrderDriverIdTypeAnswer.data.driver_id){
        throw new Error("Old and New Driver Ids cannot be same!!!");
      }

      // update no of active orders from old order
      if(oldOrder.driver_id && oldOrder.status == "Pending"){
        await tx.update(driver).set({
          activeOrders: sql`${driver.id} - 1`
        }).where(eq(driver.id, oldOrder.driver_id));
      }

      // update no of active orders in new Driver
      if(oldOrder.status == "Pending"){
        await tx.update(driver).set({
          activeOrders: sql`${driver.activeOrders} + 1`
        }).where(eq(driver.id, editOrderDriverIdTypeAnswer.data.driver_id));
      }

      // update new driver in order
      await tx.update(order).set({
        driver_id: editOrderDriverIdTypeAnswer.data.driver_id
      }).where(eq(order.id, editOrderDriverIdTypeAnswer.data.order_id));
    })

    return res.status(200).json({success: true, message: "Updated Driver in Order"})    
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update driver in order", error: error.message ? error.message : error});  
  }
}

const editOrderStatus = async (req: Request, res: Response) => {
  const editOrderStatusTypeAnswer = editOrderStatusType.safeParse(req.body);

  if(!editOrderStatusTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editOrderStatusTypeAnswer.error.flatten()})
  }

  try {

    await db.transaction(async (tx) => {
      const oldOrder = await tx.query.order.findFirst({
        where: (order, { eq }) => eq(order.id, editOrderStatusTypeAnswer.data.order_id),
        columns: {
          driver_id: true,
          status: true
        }
      })
      
      if(!oldOrder) {
        throw new Error("Unable to find Order!!!");
      }

      if(oldOrder.status == editOrderStatusTypeAnswer.data.status) {
        return;
      }

      // Delivered -> Pending
      if(oldOrder.status == "Delivered" && oldOrder.driver_id){
        // update / increase active order
        await tx.update(driver).set({
          activeOrders: sql`${driver.activeOrders} + 1`
        }).where(eq(driver.id, oldOrder.driver_id));
      }

      // Pending -> Delivered 
      if(oldOrder.status == "Pending" && oldOrder.driver_id){
        // update / reduce active order
        await tx.update(driver).set({
          activeOrders: sql`${driver.activeOrders} - 1`
        }).where(eq(driver.id, oldOrder.driver_id));
      }

      const deliveryDate = new Date();

      // update order status
      if(editOrderStatusTypeAnswer.data.status == "Delivered") {
        await tx.update(order).set({
          status: editOrderStatusTypeAnswer.data.status,
          delivery_date: deliveryDate
        }).where(eq(order.id, editOrderStatusTypeAnswer.data.order_id));
      } else {
        await tx.update(order).set({
          status: editOrderStatusTypeAnswer.data.status,
        }).where(eq(order.id, editOrderStatusTypeAnswer.data.order_id));
      }
    })

    return res.status(200).json({success: true, message: "Updated Order Status!!!"})    
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to update Order Status!!!", error: error.message ? error.message : error});  
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
                  id: true
                }
              }
            },
            columns: {
              id: true
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
    })

    return res.status(200).json({success: true, message: "Updated Order Address!!!"})
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to Updated Order Address", error: error.message ? error.message : error});  
  }
}

const editOrderLabourAndFrateCost = async (req: Request, res: Response) => {
  const editOrderLabourAndFrateCostTypeAnswer = editOrderLabourAndFrateCostType.safeParse(req.body);

  if(!editOrderLabourAndFrateCostTypeAnswer.success){
    return res.status(400).json({success: false, message: "Input fields are not correct", error: editOrderLabourAndFrateCostTypeAnswer.error.flatten()})
  }

  try {
    await db.transaction(async (tx) => {
      await tx.update(order).set({
        labour_frate_cost: editOrderLabourAndFrateCostTypeAnswer.data.labour_frate_cost
      }).where(eq(order.id, editOrderLabourAndFrateCostTypeAnswer.data.order_id));
    })

    return res.status(200).json({success: true, message: "Updated Order Labour and Frate Cost!!!"})
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to Updated Order Labour and Frate Cost", error: error.message ? error.message : error});  
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
        return;
      }
      
      // update balance for customer
      if(oldOrder.customer){
        const discountDifference = parseFloat(editOrderDiscountTypeAnswer.data.discount) - parseFloat(oldOrder.discount ?? "0.00");
        const operator: "Addition" | "Subtraction" = discountDifference > 0 ? "Addition" : "Subtraction";

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
      })
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
      
      const newAmountPaid = settleBalanceTypeAnswer.data.operator === "Addition" ? parseFloat(oldOrder.amount_paid ?? "0.00") + parseFloat(settleBalanceTypeAnswer.data.amount) : parseFloat(oldOrder.amount_paid ?? "0.00") - parseFloat(settleBalanceTypeAnswer.data.amount)
      
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
        if(settleBalanceTypeAnswer.data.operator == "Addition"){
          await tx.update(customer).set({
            balance: sql`${customer.balance} - ${sql.placeholder("AmountPaid")}`
          })
          .where(eq(customer.id, updatedOrder[0].customer_id)).execute({
            AmountPaid: settleBalanceTypeAnswer.data.amount
          })
        } else {
          await tx.update(customer).set({
            balance: sql`${customer.balance} + ${sql.placeholder("AmountReduced")}`
          })
          .where(eq(customer.id, updatedOrder[0].customer_id)).execute({
            AmountReduced: settleBalanceTypeAnswer.data.amount
          })
        }
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
    let new_order_item_ids: string[] = [];
    editOrderItemsTypeAnswer.data.order_items.forEach((order_item) => new_order_item_ids.push(order_item.item_id))
    const hasDuplicate = new Set(new_order_item_ids).size !== editOrderItemsTypeAnswer.data.order_items.length;
    if(hasDuplicate) {
      throw new Error("Multiple Order Items of same Kind!!!, Cannot Create Order!");
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
              rate: true,
            }
          }
        }
      })

      if(!oldOrder) {
        throw new Error("Unable to find the order!!!");
      }

      let old_order_item_ids: string[] = [];
      oldOrder.order_items.forEach((oldItem) => old_order_item_ids.push(oldItem.item_id))

      const sameItems = oldOrder.order_items.filter((oldItem) => new_order_item_ids.includes(oldItem.item_id));
      const addedItems = editOrderItemsTypeAnswer.data.order_items.filter((newItem) => !old_order_item_ids.includes(newItem.item_id));
      const removedItems = oldOrder.order_items.filter((oldItem) => !new_order_item_ids.includes(oldItem.item_id));
      
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

        
        // check quantity, rate, totalValue of the item is same or not, update item, update order_item

        if(sameNewItem.quantity == sameOldItem.quantity && sameNewItem.rate == sameOldItem.rate && sameNewItem.total_value == sameOldItem.total_value){
          return;
        }

        // update quantity of item
        if(sameNewItem.quantity == sameOldItem.quantity){
          return;
        } else if(sameNewItem.quantity > sameOldItem.quantity){
          // quantity increased
          const updatedItem = await tx.update(item).set({
            quantity: sql`${item.quantity} - ${sql.placeholder("difference")}`
          }).where(eq(item.id, sameOldItem.item_id)).returning({
            id: item.id,
            quantity: item.quantity
          }).execute({
            difference: sameNewItem.quantity - sameOldItem.quantity
          });

          if(!updatedItem) {
            throw new Error("Unable to find Item to update!!!")
          }

          quantities.push(updatedItem[0])
        } else {
          // quantity decreased
          const updatedItem = await tx.update(item).set({
            quantity: sql`${item.quantity} + ${sql.placeholder("difference")}`
          }).where(eq(item.id, sameOldItem.item_id)).returning({
            id: item.id,
            quantity: item.quantity
          }).execute({
            difference: sameOldItem.quantity - sameNewItem.quantity
          });

          
          if(!updatedItem) {
            throw new Error("Unable to find Item to update!!!")
          }

          quantities.push(updatedItem[0])
        }

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

        // update quantity of item
        const updatedItem = await tx.update(item).set({
          quantity: sql`${item.quantity} - ${sql.placeholder("quantity")}`
        }).where(eq(item.id, addedItem.item_id)).returning({
          id: item.id,
          quantity: item.quantity
        }).execute({
          quantity: addedItem.quantity
        });

        
        if(!updatedItem) {
          throw new Error("Unable to find Item to update!!!")
        }

        quantities.push(updatedItem[0])

        // add order_item
        await tx.insert(order_item).values({
          order_id: editOrderItemsTypeAnswer.data.order_id,
          item_id: addedItem.item_id,
          quantity: addedItem.quantity,
          rate: addedItem.rate,
          total_value: addedItem.total_value,
          carpanter_commision: oldOrder.carpanter_id ? addedItem.carpanter_commision : null,
          carpanter_commision_type: oldOrder.carpanter_id ? addedItem.carpanter_commision_type : null,
          architect_commision: oldOrder.architect_id ? addedItem.architect_commision : null,
          architect_commision_type: oldOrder.architect_id ? addedItem.architect_commision_type : null
        });
      })
      
      removedItems.forEach(async (sameItem) => {
        // update / add quantity of deleted items
        await tx.update(item).set({
          quantity: sql`${item.quantity} + ${sql.placeholder("quantity")}`
        }).where(eq(item.id, sameItem.item_id)).execute({
          quantity: sameItem.quantity
        });

        // delete order_item
        await tx.delete(order_item).where(eq(order_item.id, sameItem.id));
      });

      // update carpanter commission
      const oldCarpanterCommision = parseFloat(oldOrder.carpanter_commision ?? "0.00");
      if(oldOrder.carpanter_id){

        if(newCarpanterCommision == oldCarpanterCommision) return;

        if (newCarpanterCommision > oldCarpanterCommision) {
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

        if(newArchitectCommision == oldArchitectCommision) return;

        if (newArchitectCommision > oldArchitectCommision) {
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
      const oldTotalOrderValue = parseFloat(oldOrder.total_order_amount);
      if(oldOrder.customer_id){
        if(new_total_order_amount == oldTotalOrderValue) return;

        if(new_total_order_amount > oldTotalOrderValue){
          const difference = new_total_order_amount - oldTotalOrderValue;
          await tx.update(customer).set({
            total_order_value: sql`${customer.total_order_value} + ${sql.placeholder("difference")}`,
            balance: sql`${customer.balance} + ${sql.placeholder("difference")}`
          }).where(eq(customer.id, oldOrder.customer_id)).execute({
            difference: difference.toFixed(2)
          });
        } else {
          const difference = oldTotalOrderValue - new_total_order_amount;
          await tx.update(customer).set({
            total_order_value: sql`${customer.total_order_value} - ${sql.placeholder("difference")}`,
            balance: sql`${customer.balance} - ${sql.placeholder("difference")}`
          }).where(eq(customer.id, oldOrder.customer_id)).execute({
            difference: difference.toFixed(2)
          });
        }
      }
    })

    return res.status(200).json({success: true, message: "Updated Order Status!!!"})
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to create order", error: error.message ? error.message : error});  
  }
}

const getAllOrders = async (req: Request, res: Response) => {
  const getAllOrdersTypeAnswer = getAllOrdersType.safeParse(req.body);

  if(!getAllOrdersTypeAnswer.success) {
    return res.status(400).json({success: false, message: "Input fields are not correct", error: getAllOrdersTypeAnswer.error.flatten()})
  }

  try {
    const fetchedOrders = await db.transaction(async (tx) => {
       const tOrders = await tx.query.order.findMany({
         limit: 10,
         where(order, { lt, eq, and }) {
           switch (getAllOrdersTypeAnswer.data.filter) {
             case "Status-Pending":
               if (getAllOrdersTypeAnswer.data.cursor) {
                 return and(
                   lt(order.updated_at, getAllOrdersTypeAnswer.data.cursor),
                   eq(order.status, "Pending")
                 );
               } else {
                 return eq(order.status, "Pending");
               }
             case "Status-Delivered":
               if (getAllOrdersTypeAnswer.data.cursor) {
                 return and(
                   lt(order.updated_at, getAllOrdersTypeAnswer.data.cursor),
                   eq(order.status, "Delivered")
                 );
               } else {
                 return eq(order.status, "Delivered");
               }
             case "Payment-UnPaid":
               if (getAllOrdersTypeAnswer.data.cursor) {
                 return and(
                   lt(order.updated_at, getAllOrdersTypeAnswer.data.cursor),
                   eq(order.payment_status, "UnPaid")
                 );
               } else {
                 return eq(order.payment_status, "UnPaid");
               }
             case "Payment-Partial":
               if (getAllOrdersTypeAnswer.data.cursor) {
                 return and(
                   lt(order.updated_at, getAllOrdersTypeAnswer.data.cursor),
                   eq(order.payment_status, "Partial")
                 );
               } else {
                 return eq(order.payment_status, "Partial");
               }
             case "Payment-Paid":
               if (getAllOrdersTypeAnswer.data.cursor) {
                 return and(
                   lt(order.updated_at, getAllOrdersTypeAnswer.data.cursor),
                   eq(order.payment_status, "Paid")
                 );
               } else {
                 return eq(order.payment_status, "Paid");
               }
             case "Priority-Low":
               if (getAllOrdersTypeAnswer.data.cursor) {
                 return and(
                   lt(order.updated_at, getAllOrdersTypeAnswer.data.cursor),
                   eq(order.priority, "Low")
                 );
               } else {
                 return eq(order.priority, "Low");
               }
             case "Priority-Medium":
               if (getAllOrdersTypeAnswer.data.cursor) {
                 return and(
                   lt(order.updated_at, getAllOrdersTypeAnswer.data.cursor),
                   eq(order.priority, "Medium")
                 );
               } else {
                 return eq(order.priority, "Medium");
               }
             case "Priority-High":
               if (getAllOrdersTypeAnswer.data.cursor) {
                 return and(
                   lt(order.updated_at, getAllOrdersTypeAnswer.data.cursor),
                   eq(order.priority, "High")
                 );
               } else {
                 return eq(order.priority, "High");
               }
             case "All":
               if (getAllOrdersTypeAnswer.data.cursor) {
                 return lt(
                   order.updated_at,
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
         orderBy: (order, { desc }) => [desc(order.updated_at)],
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
       return tOrders;
    })

    return res.status(200).json({success: true, message: "Orders fetched successfully", data: fetchedOrders});
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
          driver: {
            columns: {
              name: true,
              vehicle_number: true
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
              quantity: true,
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
    
    return res.status(200).json({success: true, message: "Order fetched successfully", data: fetchedOrder});
  } catch (error: any) {
    return res.status(400).json({success: false, message: "Unable to fetch order", error: error.message ? error.message : error});
  }
}

export {
  createOrder,
  editOrderNote,
  addOrderCustomerId,
  editOrderCarpanterId,
  editOrderArchitectId,
  editOrderDriverId,
  editOrderStatus,
  editOrderPriority,
  editOrderDeliveryDate,
  editOrderDeliveryAddressId,
  editOrderLabourAndFrateCost,
  editOrderDiscount,
  settleBalance,
  editOrderItems,
  getAllOrders,
  getOrder
}