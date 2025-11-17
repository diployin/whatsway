ALTER TABLE "sent_notifications" DROP CONSTRAINT "sent_notifications_notification_id_notifications_id_fk";
--> statement-breakpoint
ALTER TABLE "sent_notifications" DROP CONSTRAINT "sent_notifications_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "target_type" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "status" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "sent_notifications" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "sent_notifications" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sent_notifications" ALTER COLUMN "notification_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "sent_notifications" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "type" varchar DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "created_by" varchar DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE "sent_notifications" ADD CONSTRAINT "sent_notifications_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sent_notifications" ADD CONSTRAINT "sent_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;