CREATE TABLE "firebase_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key" text,
	"auth_domain" text,
	"project_id" text,
	"storage_bucket" text,
	"messaging_sender_id" text,
	"app_id" text,
	"measurement_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "created_by" varchar;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "created_by" varchar;