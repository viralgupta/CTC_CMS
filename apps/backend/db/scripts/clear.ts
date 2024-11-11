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
  order,
  order_item,
  order_movement,
  order_movement_item,
  estimate,
  estimate_item,
  resource,
  item_order,
  log
} from "../schema";
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema';
import dotenv from "dotenv"

dotenv.config();

const seedClient = postgres(process.env.WORKING_DB_URL ?? "", {
  connect_timeout: 60
});
const db = drizzle(seedClient, { schema });


async function main() {
  try {
    // Deleting order-related tables sequentially (if needed to avoid foreign key issues)
    await db.delete(log);
    await db.delete(item_order);
    await db.delete(order_movement_item);
    await db.delete(order_movement);
    await db.delete(order_item);
    await db.delete(order);

    // Deleting all other tables in parallel
    const promiseArray = [
      db.delete(user),
      db.delete(customer),
      db.delete(address),
      db.delete(address_area),
      db.delete(architect),
      db.delete(carpanter),
      db.delete(driver),
      db.delete(phone_number),
      db.delete(item),
      db.delete(estimate),
      db.delete(estimate_item),
      db.delete(resource),
    ];

    await Promise.all(promiseArray);

    console.log("All tables cleared successfully.");
    process.exit(0);
  } catch (error) {
    console.error("An error occurred during the delete operations:", error);
    process.exit(1);
  }
}

main();
