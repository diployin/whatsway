DROP TABLE "tenants" CASCADE;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "channel_id" varchar;--> statement-breakpoint
ALTER TABLE "sites" DROP COLUMN "tenant_id";