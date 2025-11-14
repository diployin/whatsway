"use strict";

import admin from "firebase-admin";
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
      // const projectId = await storage.getSetting("firebase_project_id");
      // const privateKey = await storage.getSetting("firebase_private_key");
      // const clientEmail = await storage.getSetting("firebase_client_email");
      const projectId = '';
      const privateKey = "";
      const clientEmail = '';

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
