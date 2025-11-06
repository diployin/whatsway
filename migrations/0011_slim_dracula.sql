CREATE TABLE "chatbots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uuid" text NOT NULL,
	"title" text NOT NULL,
	"bubble_message" text,
	"welcome_message" text,
	"instructions" text,
	"connect_message" text,
	"language" text DEFAULT 'en',
	"interaction_type" text DEFAULT 'ai-only',
	"avatar_id" integer,
	"avatar_emoji" text,
	"avatar_color" text,
	"primary_color" text DEFAULT '#3B82F6',
	"logo_url" text,
	"embed_width" integer DEFAULT 420,
	"embed_height" integer DEFAULT 745,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "chatbots_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "training_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatbot_id" integer,
	"type" text NOT NULL,
	"title" text,
	"content" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "chatbot_id" integer;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "session_id" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "from_type" varchar DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "training_data" ADD CONSTRAINT "training_data_chatbot_id_chatbots_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbots"("id") ON DELETE no action ON UPDATE no action;