import { groups } from "@shared/schema";
import { eq } from "drizzle-orm";
import { Request } from "express";
import { db } from "server/db";
import { Response } from "express";

export const createGroup = async (req:Request, res:Response) => {
  try {
    const { name, description, created_by } = req.body;

    const [group] = await db
      .insert(groups)
      .values({ name, description, created_by })
      .returning();

    res.json({ success: true, group });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getGroups = async (req:Request, res:Response) => {
  try {
    const data = await db.select().from(groups);
    res.json({ success: true, groups: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
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
  } catch (e) {
    res.status(500).json({ error: e.message });
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
  } catch (e) {
    res.status(500).json({ error: e.message });
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
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
