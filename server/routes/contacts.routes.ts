import type { Express } from "express";
import * as contactsController from "../controllers/contacts.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import { insertContactSchema } from "@shared/schema";
import { extractChannelId } from "../middlewares/channel.middleware";

export function registerContactRoutes(app: Express) {
  // Get all contacts
  app.get("/api/contacts", 
    extractChannelId,
    contactsController.getContacts
  );

  // Get single contact
  app.get("/api/contacts/:id", contactsController.getContact);

  // Create contact
  app.post("/api/contacts",
    extractChannelId,
    validateRequest(insertContactSchema),
    contactsController.createContact
  );

  // Update contact
  app.put("/api/contacts/:id", contactsController.updateContact);

  // Delete contact
  app.delete("/api/contacts/:id", contactsController.deleteContact);

  // Import contacts
  app.post("/api/contacts/import",
    extractChannelId,
    contactsController.importContacts
  );
}