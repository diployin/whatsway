import { Request, Response } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { storageSettings } from "@shared/schema";

// ✅ Get all storage configs
export const getStorageSettings = async (req: Request, res: Response) => {
  try {
    const [settings] = await db.select().from(storageSettings);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch storage settings" });
  }
};

// ✅ Get active storage config
export const getActiveStorage = async (req: Request, res: Response) => {
  try {
    const active = await db
      .select()
      .from(storageSettings)
      .where(eq(storageSettings.isActive, true))
      .limit(1);
    res.json(active[0] || null);
  } catch {
    res.status(500).json({ error: "Failed to fetch active storage" });
  }
};

// ✅ Update or create storage
export const updateStorageSetting = async (req: Request, res: Response) => {
  try {
    const {
      id,
      spaceName,
      endpoint,
      region,
      accessKey,
      secretKey,
      isActive,
    } = req.body;

    if (!spaceName || !endpoint || !region || !accessKey || !secretKey) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (isActive) {
      // deactivate all others
      await db.update(storageSettings).set({ isActive: false });
    }

    if (id) {
      // update existing
      await db
        .update(storageSettings)
        .set({
          spaceName,
          endpoint,
          region,
          accessKey,
          secretKey,
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(storageSettings.id, id));
    } else {
      // insert new
      await db.insert(storageSettings).values({
        spaceName,
        endpoint,
        region,
        accessKey,
        secretKey,
        isActive,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Storage update error:", error);
    res.status(500).json({ error: "Failed to update storage" });
  }
};

// ✅ Delete
export const deleteStorageSetting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(storageSettings).where(eq(storageSettings.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete storage" });
  }
};
