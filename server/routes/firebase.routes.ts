// routes/firebase.routes.ts
import type { Express, Request, Response } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.middleware";
import z from "zod";
import { firebaseConfig } from "@shared/schema";

export const firebaseSchema = z.object({
    apiKey: z.string().optional(),
    authDomain: z.string().optional(),
    projectId: z.string().optional(),
    storageBucket: z.string().optional(),
    messagingSenderId: z.string().optional(),
    appId: z.string().optional(),
    measurementId: z.string().optional(),
    privateKey: z.string().optional(),
    clientEmail: z.string().optional(),
    vapidKey: z.string().optional(),
  });
  
  export type FirebasePayload = z.infer<typeof firebaseSchema>;

export function registerFirebaseRoutes(app: Express) {
  
  // Get firebase settings
  app.get("/api/firebase", async (req: Request, res: Response) => {
    const config = await db.select().from(firebaseConfig).limit(1);
    res.json(config[0] || {});
  });

  // Create (only if not exists)
  app.post("/api/firebase", requireAuth, async (req: Request, res: Response) => {
    const parsed = firebaseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const existing = await db.select().from(firebaseConfig).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Firebase config already exists" });
    }

    const data = await db
      .insert(firebaseConfig)
      .values(parsed.data)
      .returning();

    res.json({ message: "Firebase config created", data });
  });

  // Update firebase settings
  app.put("/api/firebase/:id", requireAuth, async (req: Request, res: Response) => {
    const { id } = req.params;

    const parsed = firebaseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const updated = await db
      .update(firebaseConfig)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(firebaseConfig.id, id))
      .returning();

    res.json({ message: "Firebase config updated", data: updated });
  });
}
