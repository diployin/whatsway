import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import { 
  automations, 
  type Automation, 
  type InsertAutomation 
} from "@shared/schema";

export class AutomationRepository {
  async getAll(): Promise<Automation[]> {
    return await db.select().from(automations).orderBy(desc(automations.createdAt));
  }

  async getByChannel(channelId: string): Promise<Automation[]> {
    return await db
      .select()
      .from(automations)
      .where(eq(automations.channelId, channelId))
      .orderBy(desc(automations.createdAt));
  }

  async getById(id: string): Promise<Automation | undefined> {
    const [automation] = await db.select().from(automations).where(eq(automations.id, id));
    return automation || undefined;
  }

  async create(insertAutomation: InsertAutomation): Promise<Automation> {
    const [automation] = await db
      .insert(automations)
      .values(insertAutomation)
      .returning();
    return automation;
  }

  async update(id: string, automation: Partial<Automation>): Promise<Automation | undefined> {
    const [updated] = await db
      .update(automations)
      .set(automation)
      .where(eq(automations.id, id))
      .returning();
    return updated || undefined;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(automations).where(eq(automations.id, id)).returning();
    return result.length > 0;
  }
}