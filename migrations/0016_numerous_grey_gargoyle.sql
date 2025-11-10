CREATE TABLE "plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"icon" varchar,
	"popular" boolean DEFAULT false,
	"badge" varchar,
	"color" varchar,
	"button_color" varchar,
	"monthly_price" numeric(10, 2) DEFAULT '0',
	"annual_price" numeric(10, 2) DEFAULT '0',
	"permissions" jsonb,
	"features" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "channel_id" varchar;