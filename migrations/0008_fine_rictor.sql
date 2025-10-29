CREATE TABLE "storage_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text DEFAULT 'digitalocean',
	"space_name" text NOT NULL,
	"endpoint" text NOT NULL,
	"region" text NOT NULL,
	"access_key" text NOT NULL,
	"secret_key" text NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
