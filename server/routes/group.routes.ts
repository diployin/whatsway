import { Express } from "express";
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
} from "../controllers/group.controller";

export function registerGroupRoutes(app: Express) {
  app.post("/api/groups", createGroup);
  app.get("/api/groups", getGroups);
  app.get("/api/groups/:id", getGroupById);
  app.put("/api/groups/:id", updateGroup);
  app.delete("/api/groups/:id", deleteGroup);
}
