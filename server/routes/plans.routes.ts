import { requireAuth } from 'server/middlewares/auth.middleware';
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
} from '../controllers/plans.controller';
import type { Express } from "express";

export function registerPlansRoutes(app: Express) {

// GET all plans
app.get('/plans',requireAuth, getAllPlans);

// GET single plan by ID
app.get('/plans/:id',requireAuth, getPlanById);

// POST create new plan
app.post('/plans',requireAuth, createPlan);

// PUT update plan by ID
app.put('/plans/:id',requireAuth, updatePlan);

// DELETE plan by ID
app.delete('/plans/:id',requireAuth, deletePlan);
}