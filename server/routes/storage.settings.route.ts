import express from "express";
import {
  getStorageSettings,
  getActiveStorage,
  updateStorageSetting,
  deleteStorageSetting,
} from "../controllers/storage.settings.controller";
import type { Express } from "express";

export function registerStorageSettingsRoutes(app: Express) {
  app.get("/api/storage-settings", getStorageSettings);
  app.get("/api/storage-settings/active", getActiveStorage);
  app.post("/api/storage-settings/update", updateStorageSetting);
  app.delete("/api/storage-settings/:id", deleteStorageSetting);
}
