CREATE TABLE "knowledge_articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" varchar NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"order" integer DEFAULT 0,
	"published" boolean DEFAULT true,
	"views" integer DEFAULT 0,
	"helpful" integer DEFAULT 0,
	"not_helpful" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "knowledge_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" varchar NOT NULL,
	"parent_id" varchar,
	"name" varchar(255) NOT NULL,
	"icon" varchar(50),
	"description" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "tenant_id" varchar;--> statement-breakpoint
CREATE INDEX "articles_category_idx" ON "knowledge_articles" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "articles_published_idx" ON "knowledge_articles" USING btree ("published");--> statement-breakpoint
CREATE INDEX "categories_site_idx" ON "knowledge_categories" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "knowledge_categories" USING btree ("parent_id");