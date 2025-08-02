import type { Express } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { extractChannelId } from "../middlewares/channel.middleware";

export function registerAnalyticsRoutes(app: Express) {
  // Analytics routes are handled by the dashboard controller
  // This file is kept for backward compatibility
}