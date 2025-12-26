CREATE TABLE "ai_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text DEFAULT 'openai' NOT NULL,
	"api_key" text NOT NULL,
	"model" text DEFAULT 'gpt-4o-mini' NOT NULL,
	"endpoint" text DEFAULT 'https://api.openai.com/v1',
	"temperature" text DEFAULT '0.7',
	"max_tokens" text DEFAULT '2048',
	"is_active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
