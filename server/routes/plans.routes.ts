import { requireAuth } from "server/middlewares/auth.middleware";
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/plans.controller";
import type { Express } from "express";

export function registerPlansRoutes(app: Express) {
  // GET all plans
  app.get("/api/admin/plans", getAllPlans);

  // GET single plan by ID
  app.get("/api/admin/plans/:id", requireAuth, getPlanById);

  // POST create new plan
  app.post("/api/admin/plans", requireAuth, createPlan);

  // PUT update plan by ID
  app.put("/api/admin/plans/:id", requireAuth, updatePlan);

  // DELETE plan by ID
  app.delete("/api/admin/plans/:id", requireAuth, deletePlan);
}
