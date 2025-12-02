ALTER TABLE "sent_notifications" DROP CONSTRAINT "sent_notifications_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "sent_notifications" ALTER COLUMN "user_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "sent_notifications" ALTER COLUMN "user_id" DROP NOT NULL;