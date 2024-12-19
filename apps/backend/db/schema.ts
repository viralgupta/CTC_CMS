import { relations } from "drizzle-orm";
import {
  serial,
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
  primaryKey,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: serial("u_id").notNull().primaryKey(),
  name: varchar("u_name", { length: 30 }).notNull(),
  phone_number: varchar("u_phone_number", { length: 10 }).unique().notNull(),
  isAdmin: boolean("u_isAdmin").default(false),
  otp: integer("u_otp"),
});

export const customer = pgTable("customer", {
  id: serial("c_id").notNull().primaryKey(),
  name: varchar("c_name", { length: 50 }).notNull(),
  profileUrl: text("c_profileUrl"),
  priority: varchar("c_priority", {
    enum: ["Low", "Mid", "High"],
  })
    .default("Low"),
  balance: numeric("c_balance", { precision: 10, scale: 2 })
    .default("0.00"),
  total_order_value: numeric("c_total_order_value", {
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
  id: serial("aa_id").notNull().primaryKey(),
  area: varchar("aa_area", { length: 50 }).notNull(),
})

export const address_area_relation = relations(address_area, ({ many }) => ({
  addresses: many(address),
}));

export const address = pgTable("address", {
  id: serial("a_id").notNull().primaryKey(),
  customer_id: integer("a_customer_id")
    .references(() => customer.id, { onDelete: "cascade" })
    .notNull(),
  house_number: varchar("a_house_number", { length: 15 }).notNull(),
  address_area_id: integer("a_area_id")
    .references(() => address_area.id)
    .notNull(),
  address: varchar("a_address", { length: 255 }).notNull(),
  city: varchar("a_city", { length: 30 }).notNull(),
  state: varchar("a_state", { length: 20 }).notNull(),
  isPrimary: boolean("a_isPrimary").default(false),
  latitude: doublePrecision("a_latitude"),
  longitude: doublePrecision("a_longitude"),
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
  id: serial("ar_id").notNull().primaryKey(),
  name: varchar("ar_name", { length: 30 }).notNull(),
  profileUrl: text("ar_profileUrl"),
  area: varchar("ar_area", { length: 20 }).notNull(),
  balance: numeric("ar_balance", { precision: 10, scale: 2 })
    .default("0.00"),
  tier_id: integer("ar_tier_id").references(() => tier.id).notNull(),
});

export const architect_relation = relations(architect, ({ many, one }) => ({
  phone_numbers: many(phone_number),
  orders: many(order),
  tier: one(tier, {
    fields: [architect.tier_id],
    references: [tier.id],
  }),
}));

export const carpanter = pgTable("carpanter", {
  id: serial("ca_id").notNull().primaryKey(),
  name: varchar("ca_name", { length: 30 }).notNull(),
  profileUrl: text("ca_profileUrl"),
  area: varchar("ca_area", { length: 20 }).notNull(),
  balance: numeric("ca_balance", { precision: 10, scale: 2 })
    .default("0.00"),
  tier_id: integer("ca_tier_id").references(() => tier.id).notNull(),
});

export const carpanter_relation = relations(carpanter, ({ many, one }) => ({
  phone_numbers: many(phone_number),
  orders: many(order),
  tier: one(tier, {
    fields: [carpanter.tier_id],
    references: [tier.id],
  }),
}));

export const tier = pgTable("tier", {
  id: serial("t_id").notNull().primaryKey(),
  name: varchar("t_name", { length: 255 }).notNull(),
});

export const tier_relation = relations(tier, ({ many }) => ({
  carpanters: many(carpanter),
  architects: many(architect),
  tier_items: many(tier_item),
}));

export const tier_item = pgTable("tier_item", {
  id: serial("ti_id").notNull().primaryKey(),
  tier_id: integer("ti_tier_id").references(() => tier.id, { onDelete: "cascade" }).notNull(),
  item_id: integer("ti_item_id").references(() => item.id, { onDelete: "cascade" }).notNull(),
  commision: numeric("t_carpanter_commision", {
    precision: 10,
    scale: 2,
  }).notNull(),
  commision_type: varchar("t_carpanter_commision_type", {
    enum: ["percentage", "perPiece"],
  }).notNull(),
});

export const tier_item_relation = relations(tier_item, ({ one }) => ({
  tier: one(tier, {
    fields: [tier_item.tier_id],
    references: [tier.id],
  }),
  item: one(item, {
    fields: [tier_item.item_id],
    references: [item.id],
  }),
}));

export const driver = pgTable("driver", {
  id: serial("d_id").notNull().primaryKey(),
  name: varchar("d_name", { length: 30 }).notNull(),
  profileUrl: text("d_profileUrl"),
  vehicle_number: varchar("d_vehicle_number", { length: 20 }),
  size_of_vehicle: varchar("d_size_of_vehicle", {
    enum: ["rickshaw", "tempo", "chota-hathi", "tata", "truck"],
  }).notNull(),
  activeDeliveries: integer("d_activeDeliveries").default(0),
});

export const driver_relation = relations(driver, ({ many }) => ({
  phone_numbers: many(phone_number),
  order_movements: many(order_movement),
}));

export const phone_number = pgTable("phone_number", {
  id: serial("pn_id").notNull().primaryKey(),
  customer_id: integer("pn_customer_id").references(() => customer.id, { onDelete: "cascade" }),
  architect_id: integer("pn_architect_id").references(() => architect.id, { onDelete: "cascade" }),
  carpanter_id: integer("pn_carpanter_id").references(() => carpanter.id, { onDelete: "cascade" }),
  driver_id: integer("pn_driver_id").references(() => driver.id, { onDelete: "cascade" }),
  country_code: varchar("pn_country_code", { length: 5 }),
  phone_number: varchar("pn_phone_number", { length: 10 }).notNull().unique(),
  whatsappChatId: varchar("pn_whatsappChatId", { length: 20 }).unique(),
  isPrimary: boolean("pn_isPrimary").default(false),
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
  id: serial("i_id").primaryKey().notNull(),
  name: varchar("i_name", { length: 255 }).notNull(),
  multiplier: real("i_multiplier").notNull().default(1.00),
  category: varchar("i_category", {
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
  quantity: real("i_quantity")
    .notNull(),
  min_quantity: real("i_min_quantity").notNull(),
  min_rate: real("i_min_rate"),
  sale_rate: real("i_sale_rate").notNull(),
  rate_dimension: varchar("i_rate_dimension", {
    enum: ["Rft", "sq/ft", "piece"],
  }).notNull(),
});

export const item_relation = relations(item, ({ many }) => ({
  warehouse_quantities: many(warehouse_quantity),
  order_items: many(order_item),
  item_orders: many(item_order),
  estimate_items: many(estimate_item),
}));

export const warehouse = pgTable("warehouse", {
  id: serial("w_id").primaryKey().notNull(),
  name: varchar("w_name", { length: 255 }).notNull(),
});

export const warehouse_relation = relations(warehouse, ({ many }) => ({
  warehouse_quantities: many(warehouse_quantity),
}));

export const warehouse_quantity = pgTable("warehouse_quantity", {
  id: serial("wq_id").primaryKey().notNull(),
  item_id: integer("wq_item_id").references(() => item.id, { onDelete: "cascade" }).notNull(),
  warehouse_id: integer("wq_warehouse_id").references(() => warehouse.id, { onDelete: "cascade" }).notNull(),
  quantity: real("wq_quantity").notNull(),
});

export const warehouse_quantity_relation = relations(warehouse_quantity, ({ one, many }) => ({
  warehouse: one(warehouse, {
    fields: [warehouse_quantity.warehouse_id],
    references: [warehouse.id],
  }),
  item: one(item, {
    fields: [warehouse_quantity.item_id],
    references: [item.id],
  }),
  i_o_w_q: many(item_order_warehouse_quantity),
  o_m_i_w_q: many(order_movement_item_warehouse_quantity)
}));

export const item_order = pgTable("item_order", {
  id: serial("io_id").primaryKey().notNull(),
  vendor_name: varchar("io_vendor_name", { length: 255 }),
  ordered_quantity: real("io_ordered_quantity"),
  order_date: timestamp("io_date", { mode: "date" }).notNull(),
  received_quantity: real("io_received_quantity"),
  receive_date: timestamp("io_receive_date", { mode: "date" }),
  item_id: integer("io_item_id")
    .references(() => item.id, { onDelete: "cascade" })
    .notNull(),
}, (table) => {
  return {
    order_dateIdx: index("io_order_date_idx").on(table.order_date.desc())
  }
});

export const item_order_relation = relations(item_order, ({ one, many }) => ({
  item: one(item, {
    fields: [item_order.item_id],
    references: [item.id]
  }),
  i_o_w_q: many(item_order_warehouse_quantity),
}));

export const item_order_warehouse_quantity = pgTable("iowq", {
  item_order_id: integer("iowq_io_id")
    .references(() => item_order.id, { onDelete: "cascade" })
    .notNull(),
  warehouse_quantity_id: integer("iowq_wq_id")
    .references(() => warehouse_quantity.id)
    .notNull(),
  quantity: real("iowq_quantity").notNull(),
}, (table) => {
  return {
    pk: primaryKey({name: "iowq_pk", columns: [table.item_order_id, table.warehouse_quantity_id]}),
  }
})

export const item_order_warehouse_quantity_relation = relations(item_order_warehouse_quantity, ({ one }) => ({
  i_o: one(item_order, {
    fields: [item_order_warehouse_quantity.item_order_id],
    references: [item_order.id],
  }),
  w_q: one(warehouse_quantity, {
    fields: [item_order_warehouse_quantity.warehouse_quantity_id],
    references: [warehouse_quantity.id],
  }),
}))

export const order = pgTable("order", {
  id: serial("o_id").primaryKey().notNull(),

  note: text("o_note"),

  customer_id: integer("o_customer_id").references(() => customer.id),
  carpanter_id: integer("o_carpanter_id").references(() => carpanter.id),
  architect_id: integer("o_architect_id").references(() => architect.id),

  status: varchar("o_status", {
    enum: ["Pending", "Delivered"],
  })
    .notNull()
    .default("Pending"),
  priority: varchar("o_priority", {
    enum: ["High", "Medium", "Low"],
  })
    .notNull()
    .default("Low"),
  payment_status: varchar("o_payment_status", {
    enum: ["UnPaid", "Partial", "Paid"],
  })
    .notNull()
    .default("UnPaid"),

  delivery_date: timestamp("o_delivery_date", { mode: "date" }),
  delivery_address_id: integer("o_delivery_address_id").references(
    () => address.id
  ),

  total_order_amount: numeric("o_total_order_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  discount: numeric("o_discount", { precision: 10, scale: 2 }).default("0.00"),
  amount_paid: numeric("amount_paid", { precision: 10, scale: 2 }).default("0.00"),

  carpanter_commision: numeric("o_carpanter_commision", {
    precision: 10,
    scale: 2,
  }),
  architect_commision: numeric("o_architect_commision", {
    precision: 10,
    scale: 2,
  }),

  created_at: timestamp("o_created_at", { mode: "date" }).defaultNow().notNull(),
  updated_at: timestamp("o_updated_at", { mode: "date" }).defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => {
  return {
    order_idIdx: index("o_id_idx").on(table.id.desc()),
    order_updated_statusIdx: index("o_id_status_idx").on(table.id.desc(), table.status),
    order_updated_payment_statusIdx: index("o_id_payment_status_idx").on(table.id.desc(), table.payment_status),
    order_updated_priorityIdx: index("o_id_priority_idx").on(table.id.desc(), table.priority),
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
  id: serial("id").primaryKey().notNull(),

  order_id: integer("oi_order_id")
    .references(() => order.id)
    .notNull(),
  item_id: integer("oi_item_id")
    .references(() => item.id)
    .notNull(),

  quantity: real("oi_quantity").notNull(),
  delivered_quantity: real("oi_delivered_quantity").notNull(),
  rate: real("oi_rate").notNull(),
  total_value: numeric("oi_total_value", {
    precision: 10,
    scale: 2,
  }).notNull(),

  carpanter_commision: numeric("oi_carpanter_commision", {
    precision: 10,
    scale: 2,
  }),
  carpanter_commision_type: varchar("oi_carpanter_commision_type", {
    enum: ["percentage", "perPiece"],
  }),
  architect_commision: numeric("oi_architect_commision", {
    precision: 10,
    scale: 2,
  }),
  architect_commision_type: varchar("oi_architect_commision_type", {
    enum: ["percentage", "perPiece"],
  }),

  created_at: timestamp("oi_created_at", { mode: "date" }).defaultNow().notNull(),
  updated_at: timestamp("oi_updated_at", { mode: "date" }).defaultNow().notNull().$onUpdate(() => new Date())
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
  id: serial("om_id").primaryKey().notNull(),
  order_id: integer("om_order_id")
    .references(() => order.id)
    .notNull(),
  driver_id: integer("om_driver_id")
    .references(() => driver.id),
  type: varchar("om_type", {
    enum: ["DELIVERY", "RETURN"],
  }).notNull(),
  delivered: boolean("om_delivered").default(false).notNull(),
  labour_frate_cost: real("om_labour_frate_cost").notNull(),
  recipt_key: text("om_recipt_key"),
  created_at: timestamp("om_created_at", { mode: "date" }).defaultNow().notNull(),
  delivery_at: timestamp("om_delivery_at", { mode: "date" }),
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

export const order_movement_item = pgTable("omi", {
  id: serial("id").primaryKey().notNull(),
  order_movement_id: integer("omi_order_movement_id")
    .references(() => order_movement.id, { onDelete: "cascade" })
    .notNull(),
  order_item_id: integer("omi_order_item_id")
    .references(() => order_item.id)
    .notNull(),
  quantity: real("omi_quantity").notNull(),
})

export const order_movement_item_relation = relations(order_movement_item, ({ one, many }) => ({
  order_movement: one(order_movement, {
    fields: [order_movement_item.order_movement_id],
    references: [order_movement.id],
  }),
  order_item: one(order_item, {
    fields: [order_movement_item.order_item_id],
    references: [order_item.id],
  }),
  o_m_i_w_q: many(order_movement_item_warehouse_quantity)
}))

export const order_movement_item_warehouse_quantity = pgTable("omiwq", {
  order_movement_item_id: integer("omiwq_omi_id")
    .references(() => order_movement_item.id, { onDelete: "cascade" })
    .notNull(),
  warehouse_quantity_id: integer("omiwq_wq_id")
    .references(() => warehouse_quantity.id)
    .notNull(),
  quantity: real("omiwq_quantity").notNull(),
}, (table) => {
  return {
    pk: primaryKey({ name: "omiwq_pk", columns: [table.order_movement_item_id, table.warehouse_quantity_id]}),
  }
})

export const order_movement_item_warehouse_quantity_relation = relations(order_movement_item_warehouse_quantity, ({ one }) => ({
  o_m_i: one(order_movement_item, {
    fields: [order_movement_item_warehouse_quantity.order_movement_item_id],
    references: [order_movement_item.id],
  }),
  w_q: one(warehouse_quantity, {
    fields: [order_movement_item_warehouse_quantity.warehouse_quantity_id],
    references: [warehouse_quantity.id],
  }),
}))

export const estimate = pgTable("estimate", {
  id: serial("e_id").primaryKey().notNull(),
  customer_id: integer("e_customer_id").references(() => customer.id, { onDelete: "cascade" }).notNull(),

  total_estimate_amount: numeric("e_total_estimate_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),

  created_at: timestamp("e_created_at", { mode: "date" }).defaultNow().notNull(),
  updated_at: timestamp("e_updated_at", { mode: "date" }).defaultNow().notNull().$onUpdate(() => new Date())
}, (table) => {
  return {
    updated_atIdx: index("e_updated_at_idx").on(table.updated_at.desc())
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
  id: serial("ei_id").primaryKey().notNull(),
  estimate_id: integer("ei_estimate_id")
    .references(() => estimate.id, { onDelete: "cascade" })
    .notNull(),
  item_id: integer("ei_item_id")
    .references(() => item.id)
    .notNull(),
  
  quantity: real("ei_quantity").notNull(),
  rate: real("ei_rate").notNull(),
  total_value: numeric("ei_total_value", {
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
  id: serial("r_id").primaryKey().notNull(),
  extension: varchar("r_extension", { length: 10 }),
  key: text("r_key").notNull(),
  previewKey: text("r_previewKey"),
  name: varchar("r_name", { length: 100 }).notNull(),
  description: text("r_description"),
})

export const log = pgTable("log", {
  id: serial("l_id").primaryKey(),
  user_id: integer("l_user_id")
  .references(() => user.id)
  .notNull(),
  linked_to: varchar("l_linked_to", {
    enum: ["ARCHITECT", "CARPANTER", "CUSTOMER", "DRIVER", "ITEM", "ITEM_ORDER", "ORDER", "ORDER_MOVEMENT"],
  }).notNull(),
  type: varchar("l_type", {
    enum: ["CREATE", "UPDATE", "DELETE"],
  }).notNull(),
  customer_id: integer("l_customer_id"),
  architect_id: integer("l_architect_id"),
  carpanter_id: integer("l_carpanter_id"),
  driver_id: integer("l_driver_id"),
  item_id: integer("l_item_id"),
  order_id: integer("l_order_id"),
  heading: varchar("l_heading", { length: 50 }),
  message: text("l_message").notNull(),
  created_at: timestamp("l_created_at", { mode: "date" }).defaultNow().notNull(),
}, (table) => {
  return {
    log_idIdx: index("l_id_idx").on(table.id.desc()),
  }
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