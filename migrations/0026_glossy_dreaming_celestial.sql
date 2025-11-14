ALTER TABLE "firebase_config" ADD COLUMN "private_key" text;--> statement-breakpoint
ALTER TABLE "firebase_config" ADD COLUMN "client_email" text;--> statement-breakpoint
ALTER TABLE "firebase_config" ADD COLUMN "vapid_key" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "fcm_token" varchar(512);