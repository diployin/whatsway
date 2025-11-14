import { requireAuth } from "server/middlewares/auth.middleware";
import type { Express } from "express";
import {
  getAllNotifications,
  getMyNotifications,
  sendNotification,
  markAsRead, 
  updateNotification,
} from "../controllers/notification.controller";

export function registerNotificationsRoutes(app: Express) {

// GET all notifications
app.get("/api/notifications", requireAuth, getAllNotifications);

// GET logged-in user's notifications
app.get("/api/notifications/my", requireAuth, getMyNotifications);

// CREATE + SEND notification
app.post("/api/notifications", requireAuth, sendNotification);

// MARK notification as read
app.post("/api/notifications/:id/read", requireAuth, markAsRead);

// UPDATE notification (draft)
app.patch("/api/notifications/:id", requireAuth, updateNotification);

}