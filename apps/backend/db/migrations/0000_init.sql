CREATE TABLE IF NOT EXISTS "address" (
	"address_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"address_house_number" varchar(15) NOT NULL,
	"address_area_id" uuid NOT NULL,
	"address" varchar(255) NOT NULL,
	"address_city" varchar(30) NOT NULL,
	"address_state" varchar(20) NOT NULL,
	"address_isPrimary" boolean DEFAULT false,
	"address_latitude" double precision,
	"address_longitude" double precision
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "address_area" (
	"address_area_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address_area_area" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "architect" (
	"architect_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"architect_name" varchar(30) NOT NULL,
	"architect_profileUrl" text,
	"architect_area" varchar(20) NOT NULL,
	"architect_balance" numeric(10, 2) DEFAULT '0.00'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "carpanter" (
	"carpanter_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"carpanter_name" varchar(30) NOT NULL,
	"carpanter_profileUrl" text,
	"carpanter_area" varchar(20) NOT NULL,
	"carpanter_balance" numeric(10, 2) DEFAULT '0.00'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer" (
	"customer_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_name" varchar(50) NOT NULL,
	"customer_profileUrl" text,
	"customer_priority" varchar DEFAULT 'Low',
	"customer_balance" numeric(10, 2) DEFAULT '0.00',
	"customer_total_order_value" numeric(10, 2) DEFAULT '0.00'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "driver" (
	"driver_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driver_name" varchar(30) NOT NULL,
	"driver_profileUrl" text,
	"driver_vehicle_number" varchar(20),
	"driver_size_of_vehicle" varchar NOT NULL,
	"driver_activeDeliveries" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "estimate" (
	"estimate_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"total_estimate_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "estimate_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"estimate_item_estimate_id" uuid NOT NULL,
	"estimate_item_item_id" uuid NOT NULL,
	"estimate_item_quantity" real NOT NULL,
	"estimate_item_rate" real NOT NULL,
	"estimate_item_total_value" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "item" (
	"item_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"item_multiplier" real DEFAULT 1 NOT NULL,
	"item_category" varchar NOT NULL,
	"item_quantity" real NOT NULL,
	"item_min_quantity" real NOT NULL,
	"item_min_rate" real,
	"item_sale_rate" real NOT NULL,
	"item_rate_dimension" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "item_order" (
	"item_order_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_name" varchar(255),
	"ordered_quantity" real,
	"item_order_date" timestamp NOT NULL,
	"received_quantity" real,
	"item_receive_date" timestamp,
	"item_order_item_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "log" (
	"log_id" serial PRIMARY KEY NOT NULL,
	"log_user_id" uuid NOT NULL,
	"log_linked_to" varchar NOT NULL,
	"log_type" varchar NOT NULL,
	"log_customer_id" uuid,
	"log_architect_id" uuid,
	"log_carpanter_id" uuid,
	"log_driver_id" uuid,
	"log_item_id" uuid,
	"log_order_id" integer,
	"log_heading" varchar(50),
	"log_message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order" (
	"order_id" serial PRIMARY KEY NOT NULL,
	"order_note" text,
	"customer_id" uuid,
	"carpanter_id" uuid,
	"architect_id" uuid,
	"order_status" varchar DEFAULT 'Pending' NOT NULL,
	"order_priority" varchar DEFAULT 'Low' NOT NULL,
	"order_payment_status" varchar DEFAULT 'UnPaid' NOT NULL,
	"order_delivery_date" timestamp,
	"order_delivery_address_id" uuid,
	"total_order_amount" numeric(10, 2) NOT NULL,
	"order_discount" numeric(10, 2) DEFAULT '0.00',
	"amount_paid" numeric(10, 2) DEFAULT '0.00',
	"order_carpanter_commision" numeric(10, 2),
	"order_architect_commision" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_item_order_id" integer NOT NULL,
	"order_item_item_id" uuid NOT NULL,
	"order_item_quantity" real NOT NULL,
	"order_item_delivered_quantity" real NOT NULL,
	"order_item_rate" real NOT NULL,
	"order_item_total_value" numeric(10, 2) NOT NULL,
	"order_item_carpanter_commision" numeric(10, 2),
	"order_item_carpanter_commision_type" varchar,
	"order_item_architect_commision" numeric(10, 2),
	"order_item_architect_commision_type" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_movement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_movement_order_id" integer NOT NULL,
	"order_movement_driver_id" uuid,
	"order_movement_type" varchar NOT NULL,
	"order_status" varchar DEFAULT 'Pending' NOT NULL,
	"order_labour_frate_cost" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"delivery_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_movement_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_movement_item_order_movement_id" uuid NOT NULL,
	"order_movement_item_order_item_id" uuid NOT NULL,
	"order_movement_item_quantity" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "phone_number" (
	"phone_number_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"architect_id" uuid,
	"carpanter_id" uuid,
	"driver_id" uuid,
	"phone_number_country_code" varchar(5),
	"phone_number" varchar(10) NOT NULL,
	"phone_number_whatsappChatId" varchar(20),
	"phone_number_isPrimary" boolean DEFAULT false,
	CONSTRAINT "phone_number_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "phone_number_phone_number_whatsappChatId_unique" UNIQUE("phone_number_whatsappChatId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resource" (
	"resource_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_extension" varchar(10),
	"resource_key" text NOT NULL,
	"resource_previewKey" text,
	"resource_name" varchar(100) NOT NULL,
	"resource_description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_name" varchar(30) NOT NULL,
	"user_phone_number" varchar(10) NOT NULL,
	"user_isAdmin" boolean DEFAULT false,
	"user_otp" integer,
	CONSTRAINT "user_user_phone_number_unique" UNIQUE("user_phone_number")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "address" ADD CONSTRAINT "address_customer_id_customer_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("customer_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "address" ADD CONSTRAINT "address_address_area_id_address_area_address_area_id_fk" FOREIGN KEY ("address_area_id") REFERENCES "public"."address_area"("address_area_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estimate" ADD CONSTRAINT "estimate_customer_id_customer_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("customer_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estimate_item" ADD CONSTRAINT "estimate_item_estimate_item_estimate_id_estimate_estimate_id_fk" FOREIGN KEY ("estimate_item_estimate_id") REFERENCES "public"."estimate"("estimate_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estimate_item" ADD CONSTRAINT "estimate_item_estimate_item_item_id_item_item_id_fk" FOREIGN KEY ("estimate_item_item_id") REFERENCES "public"."item"("item_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "item_order" ADD CONSTRAINT "item_order_item_order_item_id_item_item_id_fk" FOREIGN KEY ("item_order_item_id") REFERENCES "public"."item"("item_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log" ADD CONSTRAINT "log_log_user_id_user_user_id_fk" FOREIGN KEY ("log_user_id") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_customer_id_customer_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("customer_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_carpanter_id_carpanter_carpanter_id_fk" FOREIGN KEY ("carpanter_id") REFERENCES "public"."carpanter"("carpanter_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_architect_id_architect_architect_id_fk" FOREIGN KEY ("architect_id") REFERENCES "public"."architect"("architect_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_order_delivery_address_id_address_address_id_fk" FOREIGN KEY ("order_delivery_address_id") REFERENCES "public"."address"("address_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_item_order_id_order_order_id_fk" FOREIGN KEY ("order_item_order_id") REFERENCES "public"."order"("order_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_item_item_id_item_item_id_fk" FOREIGN KEY ("order_item_item_id") REFERENCES "public"."item"("item_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_movement" ADD CONSTRAINT "order_movement_order_movement_order_id_order_order_id_fk" FOREIGN KEY ("order_movement_order_id") REFERENCES "public"."order"("order_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_movement" ADD CONSTRAINT "order_movement_order_movement_driver_id_driver_driver_id_fk" FOREIGN KEY ("order_movement_driver_id") REFERENCES "public"."driver"("driver_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_movement_item" ADD CONSTRAINT "order_movement_item_order_movement_item_order_movement_id_order_movement_id_fk" FOREIGN KEY ("order_movement_item_order_movement_id") REFERENCES "public"."order_movement"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_movement_item" ADD CONSTRAINT "order_movement_item_order_movement_item_order_item_id_order_item_id_fk" FOREIGN KEY ("order_movement_item_order_item_id") REFERENCES "public"."order_item"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "phone_number" ADD CONSTRAINT "phone_number_customer_id_customer_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("customer_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "phone_number" ADD CONSTRAINT "phone_number_architect_id_architect_architect_id_fk" FOREIGN KEY ("architect_id") REFERENCES "public"."architect"("architect_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "phone_number" ADD CONSTRAINT "phone_number_carpanter_id_carpanter_carpanter_id_fk" FOREIGN KEY ("carpanter_id") REFERENCES "public"."carpanter"("carpanter_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "phone_number" ADD CONSTRAINT "phone_number_driver_id_driver_driver_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."driver"("driver_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimate_updated_at_idx" ON "estimate" USING btree ("updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "item_order_order_date_idx" ON "item_order" USING btree ("item_order_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "log_id_idx" ON "log" USING btree ("log_id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_id_idx" ON "order" USING btree ("order_id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_id_status_idx" ON "order" USING btree ("order_id" DESC NULLS LAST,"order_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_id_payment_status_idx" ON "order" USING btree ("order_id" DESC NULLS LAST,"order_payment_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_id_priority_idx" ON "order" USING btree ("order_id" DESC NULLS LAST,"order_priority");