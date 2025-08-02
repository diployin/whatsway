import type { Express } from "express";
import { storage } from "../storage";
import { insertContactSchema } from "@shared/schema";

export function registerContactRoutes(app: Express) {
  // Get all contacts
  app.get("/api/contacts", async (req, res) => {
    try {
      const channelId = req.query.channelId as string | undefined;
      const group = req.query.group as string | undefined;
      const search = req.query.search as string | undefined;
      
      let contacts = channelId 
        ? await storage.getContactsByChannel(channelId)
        : await storage.getContacts();
        
      // Apply search filter
      if (search && search.trim()) {
        contacts = channelId
          ? await storage.searchContactsByChannel(search, channelId)
          : await storage.searchContacts(search);
      }
      
      // Apply group filter
      if (group && group !== "all") {
        contacts = contacts.filter(contact => 
          contact.groups?.includes(group)
        );
      }
      
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // Get single contact
  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error fetching contact:", error);
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  // Create contact
  app.post("/api/contacts", async (req, res) => {
    try {
      const channelId = req.query.channelId as string | undefined;
      
      // If no channelId in query, get active channel
      let finalChannelId = channelId;
      if (!finalChannelId) {
        const activeChannel = await storage.getActiveChannel();
        if (activeChannel) {
          finalChannelId = activeChannel.id;
        } else {
          return res.status(400).json({ 
            message: "No active channel found. Please configure a channel first." 
          });
        }
      }
      
      const contactData = {
        ...insertContactSchema.parse(req.body),
        channelId: finalChannelId
      };
      
      const contact = await storage.createContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  // Update contact
  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.updateContact(req.params.id, req.body);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  // Delete contact
  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteContact(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contact:", error);
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });
}