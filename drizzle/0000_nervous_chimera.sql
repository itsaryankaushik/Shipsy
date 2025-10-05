CREATE TYPE "public"."shipment_mode" AS ENUM('LAND', 'AIR', 'WATER');--> statement-breakpoint
CREATE TYPE "public"."shipment_type" AS ENUM('LOCAL', 'NATIONAL', 'INTERNATIONAL');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"address" text NOT NULL,
	"email" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"type" "shipment_type" NOT NULL,
	"mode" "shipment_mode" NOT NULL,
	"start_location" varchar(500) NOT NULL,
	"end_location" varchar(500) NOT NULL,
	"cost" numeric(10, 2) NOT NULL,
	"calculated_total" numeric(10, 2) NOT NULL,
	"is_delivered" boolean DEFAULT false NOT NULL,
	"delivery_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customers_user_id_idx" ON "customers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "customers_phone_idx" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "customers_email_idx" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "shipments_user_id_idx" ON "shipments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "shipments_customer_id_idx" ON "shipments" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "shipments_type_idx" ON "shipments" USING btree ("type");--> statement-breakpoint
CREATE INDEX "shipments_is_delivered_idx" ON "shipments" USING btree ("is_delivered");--> statement-breakpoint
CREATE INDEX "shipments_created_at_idx" ON "shipments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "shipments_user_delivery_status_idx" ON "shipments" USING btree ("user_id","is_delivered");--> statement-breakpoint
CREATE INDEX "shipments_user_type_idx" ON "shipments" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "shipments_customer_delivery_idx" ON "shipments" USING btree ("customer_id","is_delivered");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");