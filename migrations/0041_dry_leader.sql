ALTER TABLE "automation_execution_logs" DROP CONSTRAINT "automation_execution_logs_execution_id_automation_executions_id_fk";
--> statement-breakpoint
DROP INDEX "automation_execution_logs_execution_idx";--> statement-breakpoint
ALTER TABLE "training_data" ALTER COLUMN "chatbot_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "training_data" ADD CONSTRAINT "training_data_chatbot_id_chatbots_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbots"("id") ON DELETE no action ON UPDATE no action;