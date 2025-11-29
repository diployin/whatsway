import { Request, Response } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { aiSettings } from "@shared/schema";

// ✅ Fetch all AI settings
export const getAISettings = async (req: Request, res: Response) => {
  try {
    const settings = await db.select().from(aiSettings);
    res.json(settings);
  } catch (error) {
    console.error("❌ Error fetching AI settings:", error);
    res.status(500).json({ error: "Failed to fetch AI settings" });
  }
};

// ✅ Create new AI settings
export const createAISettings = async (req: Request, res: Response) => {
  try {
    const { provider, apiKey, model, endpoint, temperature, maxTokens, isActive, words } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: "API key is required" });
    }

    // Normalize words input
    let wordsArray: string[] = [];
    if (typeof words === "string") {
      // Allow comma-separated string or JSON string
      try {
        wordsArray = JSON.parse(words);
      } catch {
        wordsArray = words.split(",").map((w: string) => w.trim()).filter(Boolean);
      }
    } else if (Array.isArray(words)) {
      wordsArray = words.map((w) => w.trim()).filter(Boolean);
    }

    // If activating this setting, deactivate others
    if (isActive) {
      await db.update(aiSettings).set({ isActive: false }).where(eq(aiSettings.isActive, true));
    }

    const [inserted] = await db
      .insert(aiSettings)
      .values({
        provider: provider || "openai",
        apiKey,
        model: model || "gpt-4o-mini",
        endpoint: endpoint || "https://api.openai.com/v1",
        temperature: temperature?.toString() || "0.7",
        maxTokens: maxTokens?.toString() || "2048",
        isActive: !!isActive,
        words: wordsArray,
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    console.error("❌ Error creating AI setting:", error);
    res.status(500).json({ error: "Failed to create AI setting" });
  }
};

// ✅ Update existing AI settings
export const updateAISettings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { apiKey, provider, model, endpoint, temperature, maxTokens, isActive, words } = req.body;

    const existing = await db.query.aiSettings.findFirst({
      where: (table, { eq }) => eq(table.id, id),
    });

    if (!existing) {
      return res.status(404).json({ error: "Setting not found" });
    }

    // Normalize words input
    let wordsArray: string[] | undefined;
    if (typeof words === "string") {
      try {
        wordsArray = JSON.parse(words);
      } catch {
        wordsArray = words.split(",").map((w: string) => w.trim()).filter(Boolean);
      }
    } else if (Array.isArray(words)) {
      wordsArray = words.map((w) => w.trim()).filter(Boolean);
    }

    // If activating this setting, deactivate others
    if (isActive) {
      await db.update(aiSettings).set({ isActive: false }).where(eq(aiSettings.isActive, true));
    }

    const [updated] = await db
      .update(aiSettings)
      .set({
        provider: provider ?? existing.provider,
        apiKey: apiKey ?? existing.apiKey,
        model: model ?? existing.model,
        endpoint: endpoint ?? existing.endpoint,
        temperature: temperature?.toString() ?? existing.temperature,
        maxTokens: maxTokens?.toString() ?? existing.maxTokens,
        isActive: isActive ?? existing.isActive,
        words: wordsArray ?? existing.words,
        updatedAt: new Date(),
      })
      .where(eq(aiSettings.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("❌ Error updating AI setting:", error);
    res.status(500).json({ error: "Failed to update AI setting" });
  }
};

// ✅ Delete AI settings
export const deleteAISettings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(aiSettings).where(eq(aiSettings.id, id));
    res.json({ message: "AI setting deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting AI setting:", error);
    res.status(500).json({ error: "Failed to delete AI setting" });
  }
};
