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
	"log_order_id" uuid,
	"log_heading" varchar(50),
	"log_message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log" ADD CONSTRAINT "log_log_user_id_user_user_id_fk" FOREIGN KEY ("log_user_id") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log" ADD CONSTRAINT "log_log_customer_id_customer_customer_id_fk" FOREIGN KEY ("log_customer_id") REFERENCES "public"."customer"("customer_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log" ADD CONSTRAINT "log_log_architect_id_architect_architect_id_fk" FOREIGN KEY ("log_architect_id") REFERENCES "public"."architect"("architect_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log" ADD CONSTRAINT "log_log_carpanter_id_carpanter_carpanter_id_fk" FOREIGN KEY ("log_carpanter_id") REFERENCES "public"."carpanter"("carpanter_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log" ADD CONSTRAINT "log_log_driver_id_driver_driver_id_fk" FOREIGN KEY ("log_driver_id") REFERENCES "public"."driver"("driver_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log" ADD CONSTRAINT "log_log_item_id_item_item_id_fk" FOREIGN KEY ("log_item_id") REFERENCES "public"."item"("item_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log" ADD CONSTRAINT "log_log_order_id_order_order_id_fk" FOREIGN KEY ("log_order_id") REFERENCES "public"."order"("order_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
