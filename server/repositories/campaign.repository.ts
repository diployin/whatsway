import { db } from "../db";
import { eq, desc, sql } from "drizzle-orm";
import { 
  campaigns, 
  type Campaign, 
  type InsertCampaign 
} from "@shared/schema";

export class CampaignRepository {
  async getAll(): Promise<Campaign[]> {
    return await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }

  async getByChannel(channelId: string): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.channelId, channelId))
      .orderBy(desc(campaigns.createdAt));
  }

  async getById(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }


  // async getCampaignByUserId(userId: string): Promise<Campaign | undefined>{
  //   const [campaign] = await db.select().from(campaigns).where(eq(campaigns.createdBy, userId));
  //   return campaign || []
  // }

 async getCampaignByUserId(
  userId: string,
  page: number = 1,
  limit: number = 10
) {
  const offset = (page - 1) * limit;

  const campaignsList = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.createdBy, userId))
    .limit(Number(limit))
    .offset(Number(offset));

  const totalResult = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(campaigns)
    .where(eq(campaigns.createdBy, userId));

  return {
    data: campaignsList,
    total: totalResult[0]?.total ?? 0,
    page,
    limit
  };
}



  async create(insertCampaign: InsertCampaign & { createdBy: string }): Promise<Campaign> {
    const [campaign] = await db
      .insert(campaigns)
      .values({
        ...insertCampaign,
        contactGroups: (insertCampaign.contactGroups || []) as string[],
      })
      .returning();
    return campaign;
  }
  

  async update(id: string, campaign: Partial<Campaign>): Promise<Campaign | undefined> {
    const [updated] = await db
      .update(campaigns)
      .set(campaign)
      .where(eq(campaigns.id, id))
      .returning();
    return updated || undefined;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id)).returning();
    return result.length > 0;
  }
}