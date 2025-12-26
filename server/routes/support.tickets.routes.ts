import { requireAuth, requireRole } from "server/middlewares/auth.middleware";
import type { Express, Request, Response } from "express";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "server/db";
import { supportTickets, ticketMessages } from "@shared/schema";

export function registerTicketsRoutes(app: Express) {
  //===============
  // tickets
  //===============

  // Get all tickets (with filters)
  app.get("/api/tickets", requireAuth, async (req: Request, res: Response) => {
    try {
      const { status, priority, search, page = "1", limit = "25" } = req.query;
      const userId = (req as any).user.id;
      const userType = (req as any).user.role; // 'user', 'listener', or 'admin'

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let conditions: any[] = [];
      console.log(
        userId , userType 
      )

      // Non-admins can only see their own tickets
      if (userType !== "superadmin") {
        console.log("check", userType);
        conditions.push(
          and(
            eq(supportTickets.creatorId, userId),
            eq(supportTickets.creatorType, userType as any)
          )
        );
      }

      if (status) {
        conditions.push(eq(supportTickets.status, status as any));
      }

      if (priority) {
        conditions.push(eq(supportTickets.priority, priority as any));
      }

      if (search) {
        conditions.push(
          or(
            ilike(supportTickets.title, `%${search}%`),
            ilike(supportTickets.description, `%${search}%`),
            ilike(supportTickets.creatorName, `%${search}%`)
          )
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [ticketList, countResult] = await Promise.all([
        db
          .select()
          .from(supportTickets)
          .where(whereClause)
          .orderBy(desc(supportTickets.createdAt))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(supportTickets)
          .where(whereClause),
      ]);

      res.json({
        tickets: ticketList,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: Number(countResult[0]?.count || 0),
        },
      });
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  // Get single ticket with messages
  app.get(
    "/api/tickets/:id",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const userType = (req as any).user.role;

        const ticket = await db.query.supportTickets.findFirst({
          where: eq(supportTickets.id, id),
        });

        if (!ticket) {
          return res.status(404).json({ error: "Ticket not found" });
        }

        // Check permissions - users/listeners can only view their own tickets
        // if (userType !== 'admin' && userType !== 'superadmin'  && (ticket.creatorId !== userId || ticket.creatorType !== userType)) {
        //   return res.status(403).json({ error: 'Access denied' });
        // }

        // Get messages
        const messages = await db.query.ticketMessages.findMany({
          where: eq(ticketMessages.ticketId, id),
          orderBy: [asc(ticketMessages.createdAt)],
        });

        // Filter internal messages for non-admin users
        const filteredMessages =
          userType === "admin"
            ? messages
            : messages.filter((msg) => !msg.isInternal);

        res.json({
          ticket,
          messages: filteredMessages,
        });
      } catch (error) {
        console.error("Error fetching ticket:", error);
        res.status(500).json({ error: "Failed to fetch ticket" });
      }
    }
  );

  // Create ticket (users and listeners)
  app.post("/api/tickets", requireAuth, async (req: Request, res: Response) => {
    try {
      const { title, description, priority = "medium" } = req.body;
      const user = (req as any).user;

      if (!title || !description) {
        return res
          .status(400)
          .json({ error: "Title and description are required" });
      }

      //   console.log('user creating ticket:', user , title, description, priority);

      const [newTicket] = await db
        .insert(supportTickets)
        .values({
          title,
          description,
          priority,
          creatorId: user.id,
          creatorType: user.role,
          creatorName: user.name || user.username,
          creatorEmail: user.email,
        })
        .returning();

      res.status(201).json(newTicket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  // Update ticket (admin only)
  app.put(
    "/api/tickets/:id",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { status, priority, assignedToId, assignedToName } = req.body;

        const updateData: any = { updatedAt: new Date() };

        if (status) {
          updateData.status = status;
          if (status === "resolved") {
            updateData.resolvedAt = new Date();
          } else if (status === "closed") {
            updateData.closedAt = new Date();
          }
        }

        if (priority) updateData.priority = priority;

        if (assignedToId !== undefined) {
          updateData.assignedToId = assignedToId || null;
          updateData.assignedToName = assignedToName || null;
        }

        const [updatedTicket] = await db
          .update(supportTickets)
          .set(updateData)
          .where(eq(supportTickets.id, id))
          .returning();

        if (!updatedTicket) {
          return res.status(404).json({ error: "Ticket not found" });
        }

        res.json(updatedTicket);
      } catch (error) {
        console.error("Error updating ticket:", error);
        res.status(500).json({ error: "Failed to update ticket" });
      }
    }
  );

  // Add message to ticket
  app.post(
    "/api/tickets/:id/messages",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { message, isInternal = false } = req.body;
        const user = (req as any).user;

        if (!message || message.trim().length === 0) {
          return res.status(400).json({ error: "Message is required" });
        }

        // Check if ticket exists and user has access
        const ticket = await db.query.supportTickets.findFirst({
          where: eq(supportTickets.id, id),
        });

        if (!ticket) {
          return res.status(404).json({ error: "Ticket not found" });
        }

        console.log(user.role ,ticket.creatorId , user.id , ticket.creatorType )

        // Check permissions
        // if (
        //   user.role !== "admin" &&
        //   (ticket.creatorId !== user.id || ticket.creatorType !== user.role)
        // ) {
        //   return res.status(403).json({ error: "Access denied" });
        // }

        // Only admins can create internal messages
        const messageIsInternal = user.role === "admin" && isInternal;

        const [newMessage] = await db
          .insert(ticketMessages)
          .values({
            ticketId: id,
            senderId: user.id,
            senderType: user.role,
            senderName: user.name || user.username,
            message: message.trim(),
            isInternal: messageIsInternal,
          })
          .returning();

        // Update ticket's updatedAt
        await db
          .update(supportTickets)
          .set({ updatedAt: new Date() })
          .where(eq(supportTickets.id, id));

        res.status(201).json(newMessage);
      } catch (error) {
        console.error("Error adding message:", error);
        res.status(500).json({ error: "Failed to add message" });
      }
    }
  );

  // Delete ticket (admin only)
  app.delete(
    "/api/tickets/:id",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        const deleted = await db
          .delete(supportTickets)
          .where(eq(supportTickets.id, id))
          .returning();

        if (deleted.length === 0) {
          return res.status(404).json({ error: "Ticket not found" });
        }

        res.json({ message: "Ticket deleted successfully" });
      } catch (error) {
        console.error("Error deleting ticket:", error);
        res.status(500).json({ error: "Failed to delete ticket" });
      }
    }
  );

  // Get ticket statistics (admin only)
  app.get(
    "/api/tickets/admin/stats",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const statusStats = await db
          .select({
            status: supportTickets.status,
            count: sql<number>`count(*)`,
          })
          .from(supportTickets)
          .groupBy(supportTickets.status);

        const priorityStats = await db
          .select({
            priority: supportTickets.priority,
            count: sql<number>`count(*)`,
          })
          .from(supportTickets)
          .groupBy(supportTickets.priority);

        const typeStats = await db
          .select({
            creatorType: supportTickets.creatorType,
            count: sql<number>`count(*)`,
          })
          .from(supportTickets)
          .groupBy(supportTickets.creatorType);

        res.json({
          byStatus: statusStats,
          byPriority: priorityStats,
          byCreatorType: typeStats,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ error: "Failed to fetch statistics" });
      }
    }
  );
}
