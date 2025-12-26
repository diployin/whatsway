ALTER TABLE "automation_nodes" DROP CONSTRAINT "automation_nodes_node_id_unique";--> statement-breakpoint
ALTER TABLE "automation_edges" DROP CONSTRAINT "automation_edges_source_node_id_automation_nodes_node_id_fk";
--> statement-breakpoint
ALTER TABLE "automation_edges" DROP CONSTRAINT "automation_edges_target_node_id_automation_nodes_node_id_fk";
--> statement-breakpoint
ALTER TABLE "automation_edges" ADD CONSTRAINT "automation_edges_automation_id_source_node_id_automation_nodes_automation_id_node_id_fk" FOREIGN KEY ("automation_id","source_node_id") REFERENCES "public"."automation_nodes"("automation_id","node_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_edges" ADD CONSTRAINT "automation_edges_automation_id_target_node_id_automation_nodes_automation_id_node_id_fk" FOREIGN KEY ("automation_id","target_node_id") REFERENCES "public"."automation_nodes"("automation_id","node_id") ON DELETE no action ON UPDATE no action;