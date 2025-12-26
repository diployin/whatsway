import { Express } from "express";
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
} from "../controllers/group.controller";
import { requireAuth } from "server/middlewares/auth.middleware";

export function registerGroupRoutes(app: Express) {
  app.post("/api/groups", requireAuth,  createGroup);
  app.get("/api/groups", getGroups);
  app.get("/api/groups/:id", getGroupById);
  app.put("/api/groups/:id", requireAuth,  updateGroup);
  app.delete("/api/groups/:id", requireAuth,  deleteGroup);
}
