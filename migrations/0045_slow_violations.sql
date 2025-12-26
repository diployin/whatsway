ALTER TABLE "automation_edges" DROP CONSTRAINT "automation_edges_automation_id_source_node_id_automation_nodes_automation_id_node_id_fk";
--> statement-breakpoint
ALTER TABLE "automation_edges" DROP CONSTRAINT "automation_edges_automation_id_target_node_id_automation_nodes_automation_id_node_id_fk";
--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "chatbot_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "training_data" ALTER COLUMN "chatbot_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "automation_edges" ADD CONSTRAINT "automation_edges_source_node_id_automation_nodes_node_id_fk" FOREIGN KEY ("source_node_id") REFERENCES "public"."automation_nodes"("node_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_edges" ADD CONSTRAINT "automation_edges_target_node_id_automation_nodes_node_id_fk" FOREIGN KEY ("target_node_id") REFERENCES "public"."automation_nodes"("node_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_execution_logs" ADD CONSTRAINT "automation_execution_logs_execution_id_automation_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."automation_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_data" ADD CONSTRAINT "training_data_chatbot_id_chatbots_id_fk" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "automation_execution_logs_execution_idx" ON "automation_execution_logs" USING btree ("execution_id");