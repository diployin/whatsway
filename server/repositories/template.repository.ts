import { db } from "../db";
import { eq, desc, sql } from "drizzle-orm";
import { 
  templates, 
  type Template, 
  type InsertTemplate 
} from "@shared/schema";

export class TemplateRepository {
  async getAll(): Promise<Template[]> {
    return await db.select().from(templates).orderBy(desc(templates.createdAt));
  }

  async getTemplateByUserID(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ data: Template[]; total: number; page: number; limit: number }> {
  const offset = (page - 1) * limit;

  // Templates fetch with pagination
  const templatesData = await db
    .select()
    .from(templates)
    .where(eq(templates.createdBy, userId))
    .orderBy(desc(templates.createdAt))
    .limit(limit)
    .offset(offset);

  // Total count for pagination
  const totalResult = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(templates)
    .where(eq(templates.createdBy, userId));

  const total = totalResult[0]?.total ?? 0;

  return {
    data: templatesData,
    total,
    page,
    limit,
  };
}


  async getByChannel(channelId: string): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.channelId, channelId))
      .orderBy(desc(templates.createdAt));
  }

  async getById(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async getByName(name: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.name, name));
    return template || undefined;
  }

  async create(insertTemplate: InsertTemplate  & { createdBy: string }): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async update(id: string, template: Partial<Template>): Promise<Template | undefined> {
    const [updated] = await db
      .update(templates)
      .set(template)
      .where(eq(templates.id, id))
      .returning();
    return updated || undefined;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(templates).where(eq(templates.id, id)).returning();
    return result.length > 0;
  }
}


