import { requireAuth } from "server/middlewares/auth.middleware";
import {
  getActiveSubscriptionByUserId,
  getAllSubscriptions,
  getSubscriptionById,
  getSubscriptionsByUserId,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  toggleAutoRenew,
  checkExpiredSubscriptions,
} from "../controllers/subscriptions.controller";
import type { Express } from "express";

export function registerSubscriptionsRoutes(app: Express) {
  // GET all subscriptions (Admin only)
  app.get("/api/subscriptions", requireAuth, getAllSubscriptions);

  // GET subscription by ID (Admin only)
  app.get("/api/admin/subscriptions/:id", requireAuth, getSubscriptionById);

  // GET subscriptions by user ID
  app.get("/api/subscriptions/user/:userId", requireAuth, getSubscriptionsByUserId);

  // GET active subscription by user ID
  app.get("/api/subscriptions/active/:userId", requireAuth, getActiveSubscriptionByUserId);

  // POST create a new subscription (triggered after payment verification)
  app.post("/api/subscriptions", requireAuth, createSubscription);

  // PUT update a subscription by ID (Admin only)
  app.put("/api/admin/subscriptions/:id", requireAuth, updateSubscription);

  // DELETE cancel subscription by ID
  app.delete("/api/subscriptions/:id", requireAuth, cancelSubscription);

  // PUT renew subscription by ID
  app.put("/api/subscriptions/renew/:id", requireAuth, renewSubscription);

  // PUT toggle auto-renew for a subscription by ID
  app.put("/api/subscriptions/toggle-autorenew/:id", requireAuth, toggleAutoRenew);

  // PUT check and update expired subscriptions (Admin only)
  app.put("/api/admin/subscriptions/expire", requireAuth, checkExpiredSubscriptions);
}
