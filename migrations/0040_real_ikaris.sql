ALTER TABLE "training_data" DROP CONSTRAINT "training_data_chatbot_id_chatbots_id_fk";
--> statement-breakpoint
ALTER TABLE "training_data" ALTER COLUMN "chatbot_id" SET DATA TYPE varchar;