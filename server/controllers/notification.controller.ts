// controllers/notification.controller.ts
import { notifications, sentNotifications, users } from "@shared/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { Request, Response } from "express";
import { firebaseService } from "server/config/firebase";
import { db } from "server/db";
import { AppError } from "server/middlewares/error.middleware";

// ===========================
// GET ALL NOTIFICATIONS
// ===========================
export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const data = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));

    res.json(data);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    throw new AppError(
      500,
      error instanceof Error ? error.message : "Failed to fetch notifications"
    );
  }
};

// ===========================
// GET LOGGED IN USER'S NOTIFICATIONS
// ===========================
export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const userNotifications = await db
      .select({
        id: sentNotifications.id,
        title: notifications.title,
        message: notifications.message,
        isRead: sentNotifications.isRead,
        sentAt: sentNotifications.sentAt,
        readAt: sentNotifications.readAt,
      })
      .from(sentNotifications)
      .innerJoin(
        notifications,
        eq(sentNotifications.notificationId, notifications.id)
      )
      .where(eq(sentNotifications.userId, userId))
      .orderBy(desc(sentNotifications.sentAt));

    res.json(userNotifications);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    throw new AppError(
      500,
      error instanceof Error ? error.message : "Failed to fetch notifications"
    );
  }
};

// ===========================
// SEND NOTIFICATION
// ===========================
export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { title, message, targetType, targetIds } = req.body;

    // Create parent notification
    const [notification] = await db
      .insert(notifications)
      .values({
        title,
        message,
        targetType,
        targetIds,
        status: "sent",
        sentAt: new Date(),
      })
      .returning();

    let recipients = [];

    // Determine recipients
    if (targetType === "all") {
      recipients = await db.select().from(users);
    }
    if (targetType === "users") {
      recipients = await db.select().from(users).where(eq(users.role, "user"));
    }
    if (targetType === "admins") {
      recipients = await db.select().from(users).where(eq(users.role, "admin"));
    }
    if (targetType === "team") {
      recipients = await db.select().from(users).where(eq(users.role, "team"));
    }
    if (targetType === "specific") {
      recipients = await db
        .select()
        .from(users)
        .where(inArray(users.id, targetIds));
    }

    const results = [];

    // Send notifications
    for (const recipient of recipients) {
      if (recipient.fcmToken) {
        await firebaseService.sendNotification(
          recipient.fcmToken,
          title,
          message
        );
      }

      const [sent] = await db
        .insert(sentNotifications)
        .values({
          notificationId: notification.id,
          userId: recipient.id,
          isRead: false,
        })
        .returning();

      results.push(sent);
    }

    res.json({
      success: true,
      message: "Notification sent successfully",
      notification,
      recipients: results.length,
    });
  } catch (error) {
    console.error("Failed to send notifications:", error);
    throw new AppError(
      500,
      error instanceof Error ? error.message : "Failed to send notifications"
    );
  }
};

// ===========================
// MARK NOTIFICATION AS READ
// ===========================
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(sentNotifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(sentNotifications.id, id))
      .returning();

    res.json({
      success: true,
      message: "Notification marked as read",
      updated,
    });
  } catch (error) {
    console.error("Failed to update notifications:", error);
    throw new AppError(
      500,
      error instanceof Error ? error.message : "Failed to update notifications"
    );
  }
};

// ===========================
// UPDATE NOTIFICATION (DRAFT)
// ===========================
export const updateNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(notifications)
      .set(req.body)
      .where(eq(notifications.id, id))
      .returning();

    if (!updated) {
      throw new AppError(404, "Notification not found");
    }

    res.json(updated);
  } catch (error) {
    console.error("Failed to update notifications:", error);
    throw new AppError(
      500,
      error instanceof Error ? error.message : "Failed to update notifications"
    );
  }
};
