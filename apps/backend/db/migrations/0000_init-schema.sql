CREATE TABLE IF NOT EXISTS "address" (
	"a_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"a_house_number" varchar(15) NOT NULL,
	"a_area_id" uuid NOT NULL,
	"address" varchar(255) NOT NULL,
	"a_city" varchar(30) NOT NULL,
	"a_state" varchar(20) NOT NULL,
	"a_isPrimary" boolean DEFAULT false,
	"a_latitude" double precision,
	"a_longitude" double precision
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "address_area" (
	"aa_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aa_area" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "architect" (
	"ar_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ar_name" varchar(30) NOT NULL,
	"ar_profileUrl" text,
	"ar_area" varchar(20) NOT NULL,
	"ar_balance" numeric(10, 2) DEFAULT '0.00'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "carpanter" (
	"ca_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ca_name" varchar(30) NOT NULL,
	"ca_profileUrl" text,
	"ca_area" varchar(20) NOT NULL,
	"ca_balance" numeric(10, 2) DEFAULT '0.00'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer" (
	"c_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"c_name" varchar(50) NOT NULL,
	"c_profileUrl" text,
	"c_priority" varchar DEFAULT 'Low',
	"c_balance" numeric(10, 2) DEFAULT '0.00',
	"c_total_order_value" numeric(10, 2) DEFAULT '0.00'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "driver" (
	"d_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"d_name" varchar(30) NOT NULL,
	"d_profileUrl" text,
	"d_vehicle_number" varchar(20),
	"d_size_of_vehicle" varchar NOT NULL,
	"d_activeDeliveries" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "estimate" (
	"e_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"e_customer_id" uuid NOT NULL,
	"e_total_estimate_amount" numeric(10, 2) NOT NULL,
	"e_created_at" timestamp DEFAULT now() NOT NULL,
	"e_updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "estimate_item" (
	"ei_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ei_estimate_id" uuid NOT NULL,
	"ei_item_id" uuid NOT NULL,
	"ei_quantity" real NOT NULL,
	"ei_rate" real NOT NULL,
	"ei_total_value" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "item" (
	"i_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"i_name" varchar(255) NOT NULL,
	"i_multiplier" real DEFAULT 1 NOT NULL,
	"i_category" varchar NOT NULL,
	"i_quantity" real NOT NULL,
	"i_min_quantity" real NOT NULL,
	"i_min_rate" real,
	"i_sale_rate" real NOT NULL,
	"i_rate_dimension" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "item_order" (
	"io_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"io_vendor_name" varchar(255),
	"io_ordered_quantity" real,
	"io_date" timestamp NOT NULL,
	"io_received_quantity" real,
	"io_receive_date" timestamp,
	"io_item_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iowq" (
	"iowq_io_id" uuid NOT NULL,
	"iowq_wq_id" uuid NOT NULL,
	"iowq_quantity" real NOT NULL,
	CONSTRAINT "iowq_pk" PRIMARY KEY("iowq_io_id","iowq_wq_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "log" (
	"l_id" serial PRIMARY KEY NOT NULL,
	"l_user_id" uuid NOT NULL,
	"l_linked_to" varchar NOT NULL,
	"l_type" varchar NOT NULL,
	"l_customer_id" uuid,
	"l_architect_id" uuid,
	"l_carpanter_id" uuid,
	"l_driver_id" uuid,
	"l_item_id" uuid,
	"l_order_id" integer,
	"l_heading" varchar(50),
	"l_message" text NOT NULL,
	"l_created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order" (
	"o_id" serial PRIMARY KEY NOT NULL,
	"o_note" text,
	"o_customer_id" uuid,
	"o_carpanter_id" uuid,
	"o_architect_id" uuid,
	"o_status" varchar DEFAULT 'Pending' NOT NULL,
	"o_priority" varchar DEFAULT 'Low' NOT NULL,
	"o_payment_status" varchar DEFAULT 'UnPaid' NOT NULL,
	"o_delivery_date" timestamp,
	"o_delivery_address_id" uuid,
	"o_total_order_amount" numeric(10, 2) NOT NULL,
	"o_discount" numeric(10, 2) DEFAULT '0.00',
	"amount_paid" numeric(10, 2) DEFAULT '0.00',
	"o_carpanter_commision" numeric(10, 2),
	"o_architect_commision" numeric(10, 2),
	"o_created_at" timestamp DEFAULT now() NOT NULL,
	"o_updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"oi_order_id" integer NOT NULL,
	"oi_item_id" uuid NOT NULL,
	"oi_quantity" real NOT NULL,
	"oi_delivered_quantity" real NOT NULL,
	"oi_rate" real NOT NULL,
	"oi_total_value" numeric(10, 2) NOT NULL,
	"oi_carpanter_commision" numeric(10, 2),
	"oi_carpanter_commision_type" varchar,
	"oi_architect_commision" numeric(10, 2),
	"oi_architect_commision_type" varchar,
	"oi_created_at" timestamp DEFAULT now() NOT NULL,
	"oi_updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_movement" (
	"om_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"om_order_id" integer NOT NULL,
	"om_driver_id" uuid,
	"om_type" varchar NOT NULL,
	"om_status" varchar DEFAULT 'Pending' NOT NULL,
	"om_labour_frate_cost" real NOT NULL,
	"om_created_at" timestamp DEFAULT now() NOT NULL,
	"om_delivery_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "omi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"omi_order_movement_id" uuid NOT NULL,
	"omi_order_item_id" uuid NOT NULL,
	"omi_quantity" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "omiwq" (
	"omiwq_omi_id" uuid NOT NULL,
	"omiwq_wq_id" uuid NOT NULL,
	"omiwq_quantity" real NOT NULL,
	CONSTRAINT "omiwq_pk" PRIMARY KEY("omiwq_omi_id","omiwq_wq_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "phone_number" (
	"pn_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pn_customer_id" uuid,
	"pn_architect_id" uuid,
	"pn_carpanter_id" uuid,
	"pn_driver_id" uuid,
	"pn_country_code" varchar(5),
	"pn_phone_number" varchar(10) NOT NULL,
	"pn_whatsappChatId" varchar(20),
	"pn_isPrimary" boolean DEFAULT false,
	CONSTRAINT "phone_number_pn_phone_number_unique" UNIQUE("pn_phone_number"),
	CONSTRAINT "phone_number_pn_whatsappChatId_unique" UNIQUE("pn_whatsappChatId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resource" (
	"r_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"r_extension" varchar(10),
	"r_key" text NOT NULL,
	"r_previewKey" text,
	"r_name" varchar(100) NOT NULL,
	"r_description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"u_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"u_name" varchar(30) NOT NULL,
	"u_phone_number" varchar(10) NOT NULL,
	"u_isAdmin" boolean DEFAULT false,
	"u_otp" integer,
	CONSTRAINT "user_u_phone_number_unique" UNIQUE("u_phone_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "warehouse" (
	"w_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"w_name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "warehouse_quantity" (
	"wq_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wq_item_id" uuid NOT NULL,
	"wq_warehouse_id" uuid NOT NULL,
	"wq_quantity" real NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "address" ADD CONSTRAINT "address_customer_id_customer_c_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("c_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "address" ADD CONSTRAINT "address_a_area_id_address_area_aa_id_fk" FOREIGN KEY ("a_area_id") REFERENCES "public"."address_area"("aa_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estimate" ADD CONSTRAINT "estimate_e_customer_id_customer_c_id_fk" FOREIGN KEY ("e_customer_id") REFERENCES "public"."customer"("c_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estimate_item" ADD CONSTRAINT "estimate_item_ei_estimate_id_estimate_e_id_fk" FOREIGN KEY ("ei_estimate_id") REFERENCES "public"."estimate"("e_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estimate_item" ADD CONSTRAINT "estimate_item_ei_item_id_item_i_id_fk" FOREIGN KEY ("ei_item_id") REFERENCES "public"."item"("i_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "item_order" ADD CONSTRAINT "item_order_io_item_id_item_i_id_fk" FOREIGN KEY ("io_item_id") REFERENCES "public"."item"("i_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iowq" ADD CONSTRAINT "iowq_iowq_io_id_item_order_io_id_fk" FOREIGN KEY ("iowq_io_id") REFERENCES "public"."item_order"("io_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iowq" ADD CONSTRAINT "iowq_iowq_wq_id_warehouse_quantity_wq_id_fk" FOREIGN KEY ("iowq_wq_id") REFERENCES "public"."warehouse_quantity"("wq_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log" ADD CONSTRAINT "log_l_user_id_user_u_id_fk" FOREIGN KEY ("l_user_id") REFERENCES "public"."user"("u_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_o_customer_id_customer_c_id_fk" FOREIGN KEY ("o_customer_id") REFERENCES "public"."customer"("c_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_o_carpanter_id_carpanter_ca_id_fk" FOREIGN KEY ("o_carpanter_id") REFERENCES "public"."carpanter"("ca_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_o_architect_id_architect_ar_id_fk" FOREIGN KEY ("o_architect_id") REFERENCES "public"."architect"("ar_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_o_delivery_address_id_address_a_id_fk" FOREIGN KEY ("o_delivery_address_id") REFERENCES "public"."address"("a_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_item" ADD CONSTRAINT "order_item_oi_order_id_order_o_id_fk" FOREIGN KEY ("oi_order_id") REFERENCES "public"."order"("o_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_item" ADD CONSTRAINT "order_item_oi_item_id_item_i_id_fk" FOREIGN KEY ("oi_item_id") REFERENCES "public"."item"("i_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_movement" ADD CONSTRAINT "order_movement_om_order_id_order_o_id_fk" FOREIGN KEY ("om_order_id") REFERENCES "public"."order"("o_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_movement" ADD CONSTRAINT "order_movement_om_driver_id_driver_d_id_fk" FOREIGN KEY ("om_driver_id") REFERENCES "public"."driver"("d_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "omi" ADD CONSTRAINT "omi_omi_order_movement_id_order_movement_om_id_fk" FOREIGN KEY ("omi_order_movement_id") REFERENCES "public"."order_movement"("om_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "omi" ADD CONSTRAINT "omi_omi_order_item_id_order_item_id_fk" FOREIGN KEY ("omi_order_item_id") REFERENCES "public"."order_item"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "omiwq" ADD CONSTRAINT "omiwq_omiwq_omi_id_omi_id_fk" FOREIGN KEY ("omiwq_omi_id") REFERENCES "public"."omi"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "omiwq" ADD CONSTRAINT "omiwq_omiwq_wq_id_warehouse_quantity_wq_id_fk" FOREIGN KEY ("omiwq_wq_id") REFERENCES "public"."warehouse_quantity"("wq_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "phone_number" ADD CONSTRAINT "phone_number_pn_customer_id_customer_c_id_fk" FOREIGN KEY ("pn_customer_id") REFERENCES "public"."customer"("c_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "phone_number" ADD CONSTRAINT "phone_number_pn_architect_id_architect_ar_id_fk" FOREIGN KEY ("pn_architect_id") REFERENCES "public"."architect"("ar_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "phone_number" ADD CONSTRAINT "phone_number_pn_carpanter_id_carpanter_ca_id_fk" FOREIGN KEY ("pn_carpanter_id") REFERENCES "public"."carpanter"("ca_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "phone_number" ADD CONSTRAINT "phone_number_pn_driver_id_driver_d_id_fk" FOREIGN KEY ("pn_driver_id") REFERENCES "public"."driver"("d_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "warehouse_quantity" ADD CONSTRAINT "warehouse_quantity_wq_item_id_item_i_id_fk" FOREIGN KEY ("wq_item_id") REFERENCES "public"."item"("i_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "warehouse_quantity" ADD CONSTRAINT "warehouse_quantity_wq_warehouse_id_warehouse_w_id_fk" FOREIGN KEY ("wq_warehouse_id") REFERENCES "public"."warehouse"("w_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "e_updated_at_idx" ON "estimate" USING btree ("e_updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "io_order_date_idx" ON "item_order" USING btree ("io_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "l_id_idx" ON "log" USING btree ("l_id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "o_id_idx" ON "order" USING btree ("o_id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "o_id_status_idx" ON "order" USING btree ("o_id" DESC NULLS LAST,"o_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "o_id_payment_status_idx" ON "order" USING btree ("o_id" DESC NULLS LAST,"o_payment_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "o_id_priority_idx" ON "order" USING btree ("o_id" DESC NULLS LAST,"o_priority");