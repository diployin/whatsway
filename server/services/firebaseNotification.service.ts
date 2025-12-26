import admin from "firebase-admin";
import { eq, inArray } from "drizzle-orm";
import { notifications, sentNotifications, users } from "@shared/schema";
import { db } from "server/db";

export interface CreateNotificationPayload {
  title: string;
  message: string;
  type?: string;
  targetType: "all" | "specific" | "single";
  targetIds?: string[];
  createdBy: string;
}

/* --------------------------------------------
   Create Notification (Draft)
-------------------------------------------- */
export const createNotification = async (payload: CreateNotificationPayload) => {
  const [notif] = await db
    .insert(notifications)
    .values({
      title: payload.title,
      message: payload.message,
      type: payload.type ?? "general",
      targetType: payload.targetType,
      targetIds: payload.targetIds ?? [],
      createdBy: payload.createdBy,
      status: "draft",
    })
    .returning();

  return notif;
};

/* --------------------------------------------
   Send Notification → DB + FCM
-------------------------------------------- */
export const sendNotificationToUsers = async (notificationId: string) => {
  const [notif] = await db
    .select()
    .from(notifications)
    .where(eq(notifications.id, notificationId));

  if (!notif) throw new Error("Notification not found");

  let targetUsers: { id: string; username: string; password: string; email: string; firstName: string | null; lastName: string | null; role: string; avatar: string | null; status: string; permissions: string[]; channelId: string | null; lastLogin: Date | null; createdAt: Date | null; updatedAt: Date | null; createdBy: string | null; fcmToken: string | null; }[] = [];

  if (notif.targetType === "all") {
    targetUsers = await db.select().from(users);
  } else if (notif.targetType === "specific") {
    targetUsers = await db
      .select()
      .from(users)
      .where(inArray(users.id, notif.targetIds));
  } else if (notif.targetType === "single") {
    targetUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, notif.targetIds[0]));
  }

  for (const u of targetUsers) {
    await db.insert(sentNotifications).values({
      notificationId: notif.id,
      userId: u.id,
    });

    if (u.fcmToken) {
      await sendFCMNotification(u.fcmToken, notif);
    }
  }

  await db
    .update(notifications)
    .set({ status: "sent", sentAt: new Date() })
    .where(eq(notifications.id, notif.id));

  return { success: true };
};

/* --------------------------------------------
   FCM PUSH FOR WEB
-------------------------------------------- */
export const sendFCMNotification = async (fcmToken: string, notif: any) => {
  try {
    const message = {
      token: fcmToken,
      notification: {
        title: notif.title,
        body: notif.message,
      },
      data: {
        type: String(notif.type),
        notificationId: String(notif.id),
      },
      android: {
        priority: "high",
        notification: { sound: "default", channelId: "general" },
      },
      apns: { payload: { aps: { sound: "default" } } },
    };

    await admin.messaging().send(message);
  } catch (err) {
    console.error("FCM error:", err);
  }
};
