CREATE TABLE "sites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"name" text NOT NULL,
	"domain" text NOT NULL,
	"widget_code" text NOT NULL,
	"widget_enabled" boolean DEFAULT true NOT NULL,
	"widget_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ai_training_config" jsonb DEFAULT '{"trainFromKB": false, "trainFromDocuments": true}'::jsonb NOT NULL,
	"auto_assignment_config" jsonb DEFAULT '{"enabled": false, "strategy": "round_robin"}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sites_widget_code_unique" UNIQUE("widget_code")
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_email_unique" UNIQUE("email")
);
