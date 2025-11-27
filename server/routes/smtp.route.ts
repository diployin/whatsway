import { requireAuth } from "server/middlewares/auth.middleware";
import {
  getSMTPConfigHandler,
  upsertSMTPConfig,
  sendMailRoute
} from "../controllers/smtp.controller";
import type { Express } from "express";

export function registerSMTPRoutes(app: Express) {
  // POST create or update SMTP Config
  app.post("/api/admin/smtpConfig", requireAuth, upsertSMTPConfig);

  // Get SMTP Config
  app.get("/api/admin/getSmtpConfig", requireAuth, getSMTPConfigHandler);  
  
  app.post("/api/contact/sendmail", sendMailRoute);
}
