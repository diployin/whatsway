"use strict";

import { firebaseConfig } from "@shared/schema";
import admin from "firebase-admin";
import { db } from "server/db";
import { storage } from "server/storage";

class FirebaseService {
  private initialized = false;
  private db: admin.firestore.Firestore | null = null;

  async initialize() {
    if (this.initialized) {
      console.log("[Firebase] Already initialized");
      return;
    }

    try {
      console.log("[Firebase] Loading Firebase credentials from database...");

      // Get credentials from DB
      const [firebaseData] = await db.select().from(firebaseConfig)
      console.log(firebaseData)

      const projectId = firebaseData.projectId;
      const privateKey =  firebaseData.privateKey ;
      const clientEmail =  firebaseData.clientEmail ;

      console.log(projectId ,privateKey ,clientEmail)

      if (!projectId || !privateKey || !clientEmail) {
        throw new Error("Firebase credentials missing in database settings");
      }

      // Fix \n in privateKey
      const formattedPrivateKey = privateKey?.replace(/\\n/g, "\n");

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
      });

      this.db = admin.firestore();
      this.initialized = true;

      console.log("[Firebase] Successfully initialized using DB credentials");
    } catch (error) {
      console.error("[Firebase] Initialization failed:", error);
    }
  }

  isConfigured(): boolean {
    return this.initialized;
  }

  async sendNotification(token: string, title: string, body: string) {
    if (!this.initialized) throw new Error("Firebase not configured");

    try {
      await admin.messaging().send({
        token,
        notification: { title, body },
      });

      console.log(`[Firebase] Notification sent to: ${token}`);
    } catch (error) {
      console.error("[Firebase] Notification error:", error);
    }
  }

  getDB() {
    return this.db;
  }
}

export const firebaseService = new FirebaseService();
firebaseService.initialize();
