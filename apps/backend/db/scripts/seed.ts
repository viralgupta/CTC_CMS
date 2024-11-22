import {
  user,
  customer,
  address_area,
  address,
  architect,
  carpanter,
  driver,
  phone_number,
  item,
  warehouse,
  warehouse_quantity,
  item_order,
  item_order_warehouse_quantity,
  order,
  order_item,
  order_movement,
  order_movement_item,
  order_movement_item_warehouse_quantity,
  // estimate,
  // estimate_item,
  // resource,
} from "../schema";
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema';
import dotenv from "dotenv"

dotenv.config();

const seedClient = postgres(process.env.WORKING_DB_URL ?? "");
const db = drizzle(seedClient, { schema });


async function main() {
  
  // insert users
  await db.insert(user).values([
    {
      name: "User 1",
      phone_number: "1234567890",
      isAdmin: true,
      otp: 123123
    },
    {
      name: "User 2",
      phone_number: "1234567891",
      isAdmin: false,
    }
  ])

  // insert addressAreas
  const addressAreaIds = await db.insert(address_area).values([
    {
      area: "Kavi Nagar",
    },
    {
      area: "Raj Nagar",
    },
    {
      area: "Ajay Nagar",
    },
    {
      area: "Sector 62",
    }
  ]).returning({
    id: address_area.id
  })

  // insert customers
  const customerIds = await db.insert(customer).values([
    {
      name: "Customer 1",
      priority: "Low",
      balance: "4500.00",
      total_order_value: "10000.00"
    },
    {
      name: "Customer 2",
      priority: "Low",
      balance: "0.00",
      total_order_value: "0.00"
    },
    {
      name: "Customer 3",
      priority: "Low",
      balance: "0.00",
      total_order_value: "0.00"
    },
    ...Array.from({ length: 100 }).map((_, i) => ({
      name: "Customer " + (i + 4),
      priority: "Low" as const,
      balance: "0.00",
      total_order_value: "0.00"
    })),
  ]).returning({
    id: customer.id
  })

  // insert addresses
  const addressIds = await db.insert(address).values([
    {
      house_number: "1",
      address: "Address 1",
      address_area_id: addressAreaIds[0].id,
      customer_id: customerIds[0].id,
      city: "Ghaziabad",
      state: "UP",
      isPrimary: true,
    },
    {
      house_number: "2",
      address: "Address 2",
      address_area_id: addressAreaIds[1].id,
      customer_id: customerIds[0].id,
      city: "Ghaziabad",
      state: "UP",
      isPrimary: false,
    },
    {
      house_number: "3",
      address: "Address 3",
      address_area_id: addressAreaIds[2].id,
      customer_id: customerIds[1].id,
      city: "Faridabad",
      state: "Haryana",
      isPrimary: true,
    },
    {
      house_number: "4",
      address: "Address 4",
      address_area_id: addressAreaIds[3].id,
      customer_id: customerIds[2].id,
      city: "Noida",
      state: "UP",
      isPrimary: true,
    }
  ]).returning({
    id: address.id
  })


  // insert architects
  const architectIds = await db.insert(architect).values([
    {
      area: "Navug Market",
      name: "Architect 1",
      balance: "100.00",
    },
    {
      area: "Raj Nagar",
      name: "Architect 2",
      balance: "0.00",
    }
  ]).returning({
    id: architect.id
  })

  // insert carpenters
  const carpanterIds = await db.insert(carpanter).values([
    {
      area: "Navug Market",
      name: "Carpanter 1",
      balance: "100.00",
    },
    {
      area: "Raj Nagar",
      name: "Carpanter 2",
      balance: "100.00",
    }
  ]).returning({
    id: carpanter.id
  })

  // insert drivers
  const driverIds = await db.insert(driver).values([
    {
      name: "Driver 1",
      size_of_vehicle: "rickshaw",
      activeDeliveries: 1,
      vehicle_number: "UP 14 XX 00"
    },
    {
      name: "Driver 2",
      size_of_vehicle: "tata",
      activeDeliveries: 0,
      vehicle_number: "UP 14 XX 01"
    }
  ]).returning({
    id: driver.id
  });

  // insert phone_numbers
  const phone_numberIds = await db.insert(phone_number).values([
    {
      customer_id: customerIds[0].id,
      isPrimary: true,
      country_code: "91",
      phone_number: "9999999990"
    },
    {
      customer_id: customerIds[0].id,
      isPrimary: false,
      country_code: "91",
      phone_number: "9999999991"
    },
    {
      customer_id: customerIds[1].id,
      isPrimary: true,
      country_code: "91",
      phone_number: "9999999992"
    },
    {
      customer_id: customerIds[2].id,
      isPrimary: true,
      country_code: "91",
      phone_number: "9999999993"
    },
    {
      architect_id: architectIds[0].id,
      isPrimary: true,
      country_code: "91",
      phone_number: "8888888880"
    },
    {
      architect_id: architectIds[1].id,
      isPrimary: true,
      country_code: "91",
      phone_number: "8888888881"
    },
    {
      carpanter_id: carpanterIds[0].id,
      isPrimary: true,
      country_code: "91",
      phone_number: "7777777770"
    },
    {
      carpanter_id: carpanterIds[1].id,
      isPrimary: true,
      country_code: "91",
      phone_number: "7777777771"
    },
    {
      driver_id: driverIds[0].id,
      isPrimary: true,
      country_code: "91",
      phone_number: "6666666660"
    },
    {
      driver_id: driverIds[1].id,
      isPrimary: true,
      country_code: "91",
      phone_number: "6666666661"
    }
  ])

  // insert warehouses
  const warehouseIds = await db.insert(warehouse).values([
    {
      name: "Shop",
    },
    {
      name: "Godown 1",
    }
  ]).returning({
    id: warehouse.id
  })

  // insert items
  const itemIds = await db.insert(item).values([
    {
      category: "Adhesives",
      name: "Mahacol 5kg",
      min_quantity: 2,
      quantity: 9,
      rate_dimension: "piece",
      sale_rate: 5000.00,
      multiplier: 1.00,
      min_rate: 4500.00,
    },
    {
      category: "Miscellaneous",
      name: "Cutter 10 Inch",
      min_quantity: 19,
      quantity: 9,
      rate_dimension: "piece",
      sale_rate: 130.00,
      multiplier: 1.00,
      min_rate: 100.00,
    },
    {
      category: "Plywood",
      name: "Mdf 8x4 18mm",
      min_quantity: 100,
      quantity: 40,
      rate_dimension: "sq/ft",
      sale_rate: 85.00,
      multiplier: 32,
      min_rate: 82.00,
    }
  ]).returning({
    id: item.id
  });

  // insert warehouse_quantities
  const warehouseQuantityIds = await db.insert(warehouse_quantity).values([
    {
      warehouse_id: warehouseIds[0].id,
      item_id: itemIds[0].id,
      quantity: 5,
    },
    {
      warehouse_id: warehouseIds[1].id,
      item_id: itemIds[0].id,
      quantity: 4,
    },
    {
      warehouse_id: warehouseIds[0].id,
      item_id: itemIds[1].id,
      quantity: 9,
    },
    {
      warehouse_id: warehouseIds[1].id,
      item_id: itemIds[1].id,
      quantity: 0,
    },
    {
      warehouse_id: warehouseIds[0].id,
      item_id: itemIds[2].id,
      quantity: 0,
    },
    {
      warehouse_id: warehouseIds[1].id,
      item_id: itemIds[2].id,
      quantity: 40,
    },
  ]).returning({
    id: warehouse_quantity.id
  })

  // insert item_orders
  const itemOrderIds = await db.insert(item_order).values([
    {
      vendor_name: "Mahacol Vendor",
      item_id: itemIds[0].id,
      order_date: new Date(),
      ordered_quantity: 10,
      receive_date: new Date(),
      received_quantity: 10,
    },
    {
      vendor_name: "Cutter Vendor",
      item_id: itemIds[1].id,
      order_date: new Date(),
      ordered_quantity: 8,
      receive_date: new Date(),
      received_quantity: 10,
    },
    {
      vendor_name: "Plywood Vendor",
      item_id: itemIds[2].id,
      order_date: new Date(),
      ordered_quantity: 40,
      receive_date: new Date(),
      received_quantity: 40,
    },
  ]).returning({
    id: item_order.id
  });

  // insert item_order_warehouse_quantities
  const itemOrderWarehouseQuantityIds = await db.insert(item_order_warehouse_quantity).values([
    {
      item_order_id: itemOrderIds[0].id,
      warehouse_quantity_id: warehouseQuantityIds[0].id,
      quantity: 6,
    },
    {
      item_order_id: itemOrderIds[0].id,
      warehouse_quantity_id: warehouseQuantityIds[1].id,
      quantity: 4,
    },
    {
      item_order_id: itemOrderIds[1].id,
      warehouse_quantity_id: warehouseQuantityIds[2].id,
      quantity: 10,
    },
    {
      item_order_id: itemOrderIds[2].id,
      warehouse_quantity_id: warehouseQuantityIds[5].id,
      quantity: 40,
    },
  ])
  
  const statuses = ["Pending", "Delivered"] as const;
  const priorities = ["High", "Medium", "Low"] as const;
  const paymentStatuses = ["UnPaid", "Partial", "Paid"] as const;

  // Function to pick a random value from an array
  function getRandomValue<T>(array: readonly T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // insert orders
  const orderIds = await db.insert(order).values([
    {
      note: "This is a test note",
      customer_id: customerIds[0].id,
      architect_id: architectIds[0].id,
      carpanter_id: carpanterIds[0].id,
      status: "Pending",
      priority: "Low",
      payment_status: "Partial",
      delivery_address_id: addressIds[0].id,
      total_order_amount: "5100.00",
      discount: "100.00",
      amount_paid: "500.00",
      architect_commision: "100.00",
      carpanter_commision: "100.00",
    },
    {
      note: "This is a test note 2",
      customer_id: customerIds[0].id,
      carpanter_id: carpanterIds[1].id,
      status: "Delivered",
      priority: "Low",
      payment_status: "Paid",
      delivery_address_id: addressIds[1].id,
      total_order_amount: "5000.00",
      discount: "0.00",
      amount_paid: "5000.00",
      carpanter_commision: "100.00",
    },
    ...Array.from({ length: 100 }).map(() => ({
      status: getRandomValue(statuses),
      priority: getRandomValue(priorities),
      payment_status: getRandomValue(paymentStatuses),
      total_order_amount: "0.00",
      discount: "0.00",
      amount_paid: "0.00",
    })),
  ]).returning({
    id: order.id
  });

  // insert order_items
  const orderItemsIds = await db.insert(order_item).values([
    {
      item_id: itemIds[0].id,
      order_id: orderIds[0].id,
      quantity: 1,
      delivered_quantity: 0,
      rate: 5000.00,
      total_value: "5000.00",
      carpanter_commision: "100.00",
      architect_commision: "100.00",
      carpanter_commision_type: "perPiece",
      architect_commision_type: "perPiece",
    },
    {
      item_id: itemIds[1].id,
      order_id: orderIds[0].id,
      quantity: 1,
      delivered_quantity: 1,
      rate: 100.00,
      total_value: "100.00",
    },
    {
      item_id: itemIds[0].id,
      order_id: orderIds[1].id,
      quantity: 1,
      delivered_quantity: 1,
      rate: 5000.00,
      total_value: "5000.00",
      carpanter_commision: "100.00",
      carpanter_commision_type: "perPiece",
    }
  ]).returning({
    id: order_item.id
  });
  
  // insert order_movements
  const orderMovementsIds = await db.insert(order_movement).values([
    {
      order_id: orderIds[0].id,
      labour_frate_cost: 100,
      type: "DELIVERY",
      driver_id: driverIds[0].id,
      status: "Pending",
      created_at: new Date(),
    },
    {
      order_id: orderIds[0].id,
      labour_frate_cost: 0,
      type: "DELIVERY",
      status: "Completed",
      created_at: new Date(),
      delivery_at: new Date(),
    },
    {
      order_id: orderIds[1].id,
      labour_frate_cost: 100,
      type: "DELIVERY",
      driver_id: driverIds[1].id,
      status: "Completed",
      created_at: new Date(),
      delivery_at: new Date(),
    },
  ]).returning({
    id: order_movement.id
  });

  // insert order_movement_items
  const orderMovementItemsIds = await db.insert(order_movement_item).values([
    {
      order_movement_id: orderMovementsIds[0].id,
      order_item_id: orderItemsIds[0].id,
      quantity: 1,
    },
    {
      order_movement_id: orderMovementsIds[1].id,
      order_item_id: orderItemsIds[1].id,
      quantity: 1,
    },
    {
      order_movement_id: orderMovementsIds[2].id,
      order_item_id: orderItemsIds[2].id,
      quantity: 1,
    },
  ]).returning({
    id: order_movement_item.id
  });

  // insert order_movement_item_warehouse_quantities
  const orderMovementItemWarehouseQuantityIds = await db.insert(order_movement_item_warehouse_quantity).values([
    {
      order_movement_item_id: orderMovementItemsIds[0].id,
      warehouse_quantity_id: warehouseQuantityIds[0].id,
      quantity: 1,
    },
    {
      order_movement_item_id: orderMovementItemsIds[1].id,
      warehouse_quantity_id: warehouseQuantityIds[2].id,
      quantity: 1,
    },
    {
      order_movement_item_id: orderMovementItemsIds[2].id,
      warehouse_quantity_id: warehouseQuantityIds[0].id,
      quantity: 1,
    },
  ]);
  
  // insert estimates
  // insert estimate_items
  // insert resources

  console.log("All Tables Seeded!!!");
  process.exit(0);
}

main();
