// controllers/plansController.ts
import { Request, Response } from 'express';
import { db } from '../db'; // your drizzle db instance
import { eq } from 'drizzle-orm';
import { plans } from '@shared/schema';

export const getAllPlans = async (req: Request, res: Response) => {
  try {
    const allPlans = await db.select().from(plans);
    res.status(200).json({ success: true, data: allPlans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching plans', error });
  }
};

export const getPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plan = await db.select().from(plans).where(eq(plans.id, id));
    
    if (plan.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    res.status(200).json({ success: true, data: plan[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching plan', error });
  }
};

export const createPlan = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      icon,
      popular,
      badge,
      color,
      buttonColor,
      monthlyPrice,
      annualPrice,
      permissions,
      features
    } = req.body;

    const newPlan = await db.insert(plans).values({
      name,
      description,
      icon,
      popular: popular || false,
      badge,
      color,
      buttonColor,
      monthlyPrice,
      annualPrice,
      permissions,
      features
    }).returning();

    res.status(201).json({ success: true, data: newPlan[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating plan', error });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPlan = await db
      .update(plans)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(plans.id, id))
      .returning();

    if (updatedPlan.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    res.status(200).json({ success: true, data: updatedPlan[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating plan', error });
  }
};

export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedPlan = await db
      .delete(plans)
      .where(eq(plans.id, id))
      .returning();

    if (deletedPlan.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting plan', error });
  }
};