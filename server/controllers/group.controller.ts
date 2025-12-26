import { groups } from "@shared/schema";
import { eq } from "drizzle-orm";
import { Request } from "express";
import { db } from "server/db";
import { Response } from "express";

export const createGroup = async (req:Request, res:Response) => {
  try {
    const user = (req as any).session?.user;
    const { name, description, channelId } = req.body;

    const [group] = await db
      .insert(groups)
      .values({ name, description, createdBy:user?.id ,channelId  })
      .returning();

    res.json({ success: true, group });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : "Something went wrong";
    res.status(500).json({ error: errorMsg });
  }
};

export const getGroups = async (req: Request, res: Response) => {
    try {
      const { channelId } = req.query;
      console.log("getGroups" ,channelId )
  
      // If channelId exists → filter by channelId
      if (channelId) {
        const data = await db
          .select()
          .from(groups)
          .where(eq(groups.channelId, String(channelId)));
  
        return res.json({ success: true, groups: data });
      }
  
      // If no channelId → return all groups
      const allData = await db.select().from(groups);
      res.json({ success: true, groups: allData });
  
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  };  

export const getGroupById = async (req:Request, res:Response)  => {
  try {
    const { id } = req.params;

    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, id));

    if (!group) return res.status(404).json({ error: "Group not found" });

    res.json({ success: true, group });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : "Something went wrong";
    res.status(500).json({ error: errorMsg });
  }
};

export const updateGroup = async (req:Request, res:Response)  => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const [updated] = await db
      .update(groups)
      .set({ name, description })
      .where(eq(groups.id, id))
      .returning();

    res.json({ success: true, updated });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : "Something went wrong";
    res.status(500).json({ error: errorMsg });
  }
};

export const deleteGroup = async (req:Request, res:Response)  => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(groups)
      .where(eq(groups.id, id))
      .returning();

    res.json({ success: true, deleted });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : "Something went wrong";
    res.status(500).json({ error: errorMsg });
  }
};
