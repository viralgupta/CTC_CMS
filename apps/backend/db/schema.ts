import { relations } from "drizzle-orm";
import {
  uuid,
  text,
  pgTable,
  boolean,
  integer,
  numeric,
  timestamp,
  varchar,
  real,
  doublePrecision,
  index,
  serial,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("user_id").defaultRandom().notNull().primaryKey(),
  name: varchar("user_name", { length: 30 }).notNull(),
  phone_number: varchar("user_phone_number", { length: 10 }).unique().notNull(),
  isAdmin: boolean("user_isAdmin").default(false),
  otp: integer("user_otp"),
});

export const customer = pgTable("customer", {
  id: uuid("customer_id").defaultRandom().notNull().primaryKey(),
  name: varchar("customer_name", { length: 50 }).notNull(),
  profileUrl: text("customer_profileUrl"),
  priority: varchar("customer_priority", {
    enum: ["Low", "Mid", "High"],
  })
    .default("Low"),
  balance: numeric("customer_balance", { precision: 10, scale: 2 })
    .default("0.00"),
  total_order_value: numeric("customer_total_order_value", {
    precision: 10,
    scale: 2,
  })
    .default("0.00"),
});

export const customer_relation = relations(customer, ({ many }) => ({
  phone_numbers: many(phone_number),
  addresses: many(address),
  orders: many(order),
  estimates: many(estimate),
}));

export const address_area = pgTable("address_area", {
  id: uuid("address_area_id").defaultRandom().notNull().primaryKey(),
  area: varchar("address_area_area", { length: 50 }).notNull(),
})

export const address_area_relation = relations(address_area, ({ many }) => ({
  addresses: many(address),
}));

export const address = pgTable("address", {
  id: uuid("address_id").defaultRandom().notNull().primaryKey(),
  customer_id: uuid("customer_id")
    .references(() => customer.id, { onDelete: "cascade" })
    .notNull(),
  house_number: varchar("address_house_number", { length: 15 }).notNull(),
  address_area_id: uuid("address_area_id")
    .references(() => address_area.id)
    .notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("address_city", { length: 30 }).notNull(),
  state: varchar("address_state", { length: 20 }).notNull(),
  isPrimary: boolean("address_isPrimary").default(false),
  latitude: doublePrecision("address_latitude"),
  longitude: doublePrecision("address_longitude"),
});

export const address_relation = relations(
  address,
  ({ one, many }) => ({
    customer: one(customer, {
      fields: [address.customer_id],
      references: [customer.id],
    }),
    address_area: one(address_area, {
      fields: [address.address_area_id],
      references: [address_area.id],
    }),
    orders: many(order),
  })
);

export const architect = pgTable("architect", {
  id: uuid("architect_id").defaultRandom().notNull().primaryKey(),
  name: varchar("architect_name", { length: 30 }).notNull(),
  profileUrl: text("architect_profileUrl"),
  area: varchar("architect_area", { length: 20 }).notNull(),
  balance: numeric("architect_balance", { precision: 10, scale: 2 })
    .default("0.00"),
});

export const architect_relation = relations(architect, ({ many }) => ({
  phone_numbers: many(phone_number),
  orders: many(order),
}));

export const carpanter = pgTable("carpanter", {
  id: uuid("carpanter_id").defaultRandom().notNull().primaryKey(),
  name: varchar("carpanter_name", { length: 30 }).notNull(),
  profileUrl: text("carpanter_profileUrl"),
  area: varchar("carpanter_area", { length: 20 }).notNull(),
  balance: numeric("carpanter_balance", { precision: 10, scale: 2 })
    .default("0.00"),
});

export const carpanter_relation = relations(carpanter, ({ many }) => ({
  phone_numbers: many(phone_number),
  orders: many(order),
}));

export const driver = pgTable("driver", {
  id: uuid("driver_id").defaultRandom().notNull().primaryKey(),
  name: varchar("driver_name", { length: 30 }).notNull(),
  profileUrl: text("driver_profileUrl"),
  vehicle_number: varchar("driver_vehicle_number", { length: 20 }),
  size_of_vehicle: varchar("driver_size_of_vehicle", {
    enum: ["rickshaw", "tempo", "chota-hathi", "tata", "truck"],
  }).notNull(),
  activeDeliveries: integer("driver_activeDeliveries").default(0),
});

export const driver_relation = relations(driver, ({ many }) => ({
  phone_numbers: many(phone_number),
  order_movements: many(order_movement),
}));

export const phone_number = pgTable("phone_number", {
  id: uuid("phone_number_id").defaultRandom().notNull().primaryKey(),
  customer_id: uuid("customer_id").references(() => customer.id, { onDelete: "cascade" }),
  architect_id: uuid("architect_id").references(() => architect.id, { onDelete: "cascade" }),
  carpanter_id: uuid("carpanter_id").references(() => carpanter.id, { onDelete: "cascade" }),
  driver_id: uuid("driver_id").references(() => driver.id, { onDelete: "cascade" }),
  country_code: varchar("phone_number_country_code", { length: 5 }),
  phone_number: varchar("phone_number", { length: 10 }).notNull().unique(),
  whatsappChatId: varchar("phone_number_whatsappChatId", { length: 20 }).unique(),
  isPrimary: boolean("phone_number_isPrimary").default(false),
});

export const phone_number_relation = relations(phone_number, ({ one }) => ({
  customer: one(customer, {
    fields: [phone_number.customer_id],
    references: [customer.id],
  }),
  architect: one(architect, {
    fields: [phone_number.architect_id],
    references: [architect.id],
  }),
  carpanter: one(carpanter, {
    fields: [phone_number.carpanter_id],
    references: [carpanter.id],
  }),
  driver: one(driver, {
    fields: [phone_number.driver_id],
    references: [driver.id],
  }),
}));

export const item = pgTable("item", {
  id: uuid("item_id").primaryKey().defaultRandom().notNull(),
  name: varchar("item_name", { length: 255 }).notNull(),
  multiplier: real("item_multiplier").notNull().default(1.00),
  category: varchar("item_category", {
    enum: [
      "Adhesives",
      "Plywood",
      "Laminate",
      "Veneer",
      "Decorative",
      "Moulding",
      "Miscellaneous",
      "Door",
    ],
  }).notNull(),
  quantity: real("item_quantity")
    .notNull(),
  min_quantity: real("item_min_quantity").notNull(),
  min_rate: real("item_min_rate"),
  sale_rate: real("item_sale_rate").notNull(),
  rate_dimension: varchar("item_rate_dimension", {
    enum: ["Rft", "sq/ft", "piece"],
  }).notNull(),
});

export const item_relation = relations(item, ({ many }) => ({
  order_items: many(order_item),
  item_orders: many(item_order),
  estimate_items: many(estimate_item),
}));

export const item_order = pgTable("item_order", {
  id: uuid("item_order_id").primaryKey().defaultRandom().notNull(),
  vendor_name: varchar("vendor_name", { length: 255 }),
  ordered_quantity: real("ordered_quantity"),
  order_date: timestamp("item_order_date", { mode: "date" }).notNull(),
  received_quantity: real("received_quantity"),
  receive_date: timestamp("item_receive_date", { mode: "date" }),
  item_id: uuid("item_order_item_id")
    .references(() => item.id)
    .notNull(),
}, (table) => {
  return {
    order_dateIdx: index("item_order_order_date_idx").on(table.order_date.desc())
  }
});

export const item_order_relation = relations(item_order, ({ one }) => ({
  item: one(item, {
    fields: [item_order.item_id],
    references: [item.id]
  }),
}));

export const order = pgTable("order", {
  id: uuid("order_id").primaryKey().defaultRandom().notNull(),

  note: text("order_note"),

  customer_id: uuid("customer_id").references(() => customer.id),
  carpanter_id: uuid("carpanter_id").references(() => carpanter.id),
  architect_id: uuid("architect_id").references(() => architect.id),

  status: varchar("order_status", {
    enum: ["Pending", "Delivered"],
  })
    .notNull()
    .default("Pending"),
  priority: varchar("order_priority", {
    enum: ["High", "Medium", "Low"],
  })
    .notNull()
    .default("Low"),
  payment_status: varchar("order_payment_status", {
    enum: ["UnPaid", "Partial", "Paid"],
  })
    .notNull()
    .default("UnPaid"),

  delivery_date: timestamp("order_delivery_date", { mode: "date" }),
  delivery_address_id: uuid("order_delivery_address_id").references(
    () => address.id
  ),

  total_order_amount: numeric("total_order_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  discount: numeric("order_discount", { precision: 10, scale: 2 }).default("0.00"),
  amount_paid: numeric("amount_paid", { precision: 10, scale: 2 }).default("0.00"),

  carpanter_commision: numeric("order_carpanter_commision", {
    precision: 10,
    scale: 2,
  }),
  architect_commision: numeric("order_architect_commision", {
    precision: 10,
    scale: 2,
  }),

  created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => {
  return {
    order_updated_statusIdx: index("order_updated_status_idx").on(table.updated_at.desc(), table.status),
    order_updated_payment_statusIdx: index("order_updated_payment_status_idx").on(table.updated_at.desc(), table.payment_status),
    order_updated_priorityIdx: index("order_updated_priority_idx").on(table.updated_at.desc(), table.priority),
    order_updatedIdx: index("order_updated_idx").on(table.updated_at.desc()),
  }
});

export const order_relation = relations(order, ({ one, many }) => ({
  customer: one(customer, {
    fields: [order.customer_id],
    references: [customer.id],
  }),
  carpanter: one(carpanter, {
    fields: [order.carpanter_id],
    references: [carpanter.id],
  }),
  architect: one(architect, {
    fields: [order.architect_id],
    references: [architect.id],
  }),
  delivery_address: one(address, {
    fields: [order.delivery_address_id],
    references: [address.id],
  }),
  order_items: many(order_item),
  order_movements: many(order_movement),
}));

export const order_item = pgTable("order_item", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),

  order_id: uuid("order_item_order_id")
    .references(() => order.id)
    .notNull(),
  item_id: uuid("order_item_item_id")
    .references(() => item.id)
    .notNull(),

  quantity: real("order_item_quantity").notNull(),
  delivered_quantity: real("order_item_delivered_quantity").notNull(),
  rate: real("order_item_rate").notNull(),
  total_value: numeric("order_item_total_value", {
    precision: 10,
    scale: 2,
  }).notNull(),

  carpanter_commision: numeric("order_item_carpanter_commision", {
    precision: 10,
    scale: 2,
  }),
  carpanter_commision_type: varchar("order_item_carpanter_commision_type", {
    enum: ["percentage", "perPiece"],
  }),
  architect_commision: numeric("order_item_architect_commision", {
    precision: 10,
    scale: 2,
  }),
  architect_commision_type: varchar("order_item_architect_commision_type", {
    enum: ["percentage", "perPiece"],
  }),

  created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow().notNull().$onUpdate(() => new Date())
});

export const order_item_relation = relations(order_item, ({ one }) => ({
  order: one(order, {
    fields: [order_item.order_id],
    references: [order.id],
  }),
  item: one(item, {
    fields: [order_item.item_id],
    references: [item.id],
  }),
}));

export const order_movement = pgTable("order_movement", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  order_id: uuid("order_movement_order_id")
    .references(() => order.id)
    .notNull(),
  driver_id: uuid("order_movement_driver_id")
    .references(() => driver.id),
  type: varchar("order_movement_type", {
    enum: ["DELIVERY", "RETURN"],
  }).notNull(),
  status: varchar("order_status", {
    enum: ["Pending", "Completed"],
  })
    .notNull()
    .default("Pending"),
  labour_frate_cost: real("order_labour_frate_cost").notNull(),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  delivery_at: timestamp("delivery_at", { mode: "date" }),
})

export const order_movement_relation = relations(order_movement, ({ one, many }) => ({
  order: one(order, {
    fields: [order_movement.order_id],
    references: [order.id],
  }),
  driver: one(driver, {
    fields: [order_movement.driver_id],
    references: [driver.id],
  }),
  order_movement_items: many(order_movement_item),
}));

export const order_movement_item = pgTable("order_movement_item", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  order_movement_id: uuid("order_movement_item_order_movement_id")
    .references(() => order_movement.id, { onDelete: "cascade" })
    .notNull(),
  order_item_id: uuid("order_movement_item_order_item_id")
    .references(() => order_item.id)
    .notNull(),
  quantity: real("order_movement_item_quantity").notNull(),
})

export const order_movement_item_relation = relations(order_movement_item, ({ one }) => ({
  order_movement: one(order_movement, {
    fields: [order_movement_item.order_movement_id],
    references: [order_movement.id],
  }),
  order_item: one(order_item, {
    fields: [order_movement_item.order_item_id],
    references: [order_item.id],
  }),
}))

export const estimate = pgTable("estimate", {
  id: uuid("estimate_id").primaryKey().defaultRandom().notNull(),
  customer_id: uuid("customer_id").references(() => customer.id, { onDelete: "cascade" }).notNull(),

  total_estimate_amount: numeric("total_estimate_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),

  created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => {
  return {
    updated_atIdx: index("estimate_updated_at_idx").on(table.updated_at.desc())
  }
});

export const estimate_relation = relations(estimate, ({ one, many }) => ({
  customer: one(customer, {
    fields: [estimate.customer_id],
    references: [customer.id],
  }),
  estimate_items: many(estimate_item),
}));

export const estimate_item = pgTable("estimate_item", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  estimate_id: uuid("estimate_item_estimate_id")
    .references(() => estimate.id, { onDelete: "cascade" })
    .notNull(),
  item_id: uuid("estimate_item_item_id")
    .references(() => item.id)
    .notNull(),
  
  quantity: real("estimate_item_quantity").notNull(),
  rate: real("estimate_item_rate").notNull(),
  total_value: numeric("estimate_item_total_value", {
    precision: 10,
    scale: 2,
  }).notNull(),
});

export const estimate_item_relation = relations(estimate_item, ({ one }) => ({
  estimate: one(estimate, {
    fields: [estimate_item.estimate_id],
    references: [estimate.id],
  }),
  item: one(item, {
    fields: [estimate_item.item_id],
    references: [item.id],
  }),
}));

export const resource = pgTable("resource", {
  id: uuid("resource_id").primaryKey().defaultRandom().notNull(),
  extension: varchar("resource_extension", { length: 10 }),
  key: text("resource_key").notNull(),
  previewKey: text("resource_previewKey"),
  name: varchar("resource_name", { length: 100 }).notNull(),
  description: text("resource_description"),
})

export const log = pgTable("log", {
  id: serial("log_id").primaryKey(),
  user_id: uuid("log_user_id")
  .references(() => user.id)
  .notNull(),
  linked_to: varchar("log_linked_to", {
    enum: ["ARCHITECT", "CARPANTER", "CUSTOMER", "DRIVER", "ITEM", "ITEM_ORDER", "ORDER", "ORDER_MOVEMENT"],
  }).notNull(),
  type: varchar("log_type", {
    enum: ["CREATE", "UPDATE", "DELETE"],
  }).notNull(),
  customer_id: uuid("log_customer_id")
  .references(() => customer.id),
  architect_id: uuid("log_architect_id")
  .references(() => architect.id),
  carpanter_id: uuid("log_carpanter_id")
  .references(() => carpanter.id),
  driver_id: uuid("log_driver_id")
    .references(() => driver.id),
  item_id: uuid("log_item_id")
    .references(() => item.id),
  order_id: uuid("log_order_id")
  .references(() => order.id),
  heading: varchar("log_heading", { length: 50 }),
  message: text("log_message").notNull(),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const log_relation = relations(log, ({ one }) => ({
  user: one(user, {
    fields: [log.user_id],
    references: [user.id],
  }),
  customer: one(customer, {
    fields: [log.customer_id],
    references: [customer.id],
  }),
  architect: one(architect, {
    fields: [log.architect_id],
    references: [architect.id],
  }),
  carpanter: one(carpanter, {
    fields: [log.carpanter_id],
    references: [carpanter.id],
  }),
  driver: one(driver, {
    fields: [log.driver_id],
    references: [driver.id],
  }),
  item: one(item, {
    fields: [log.item_id],
    references: [item.id],
  }),
  order: one(order, {
    fields: [log.order_id],
    references: [order.id],
  }),
}));