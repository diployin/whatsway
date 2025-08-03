import { Router } from "express";
import { db } from "../db";
import { users, userActivityLogs, conversationAssignments, DEFAULT_PERMISSIONS, Permission } from "@shared/schema";
import { eq, desc, and, sql, ne } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { validateRequest } from "../middlewares/validateRequest.middleware";

const router = Router();

// Validation schemas
const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  role: z.enum(["admin", "manager", "agent"]),
  permissions: z.array(z.string()).optional(),
  avatar: z.string().optional(),
});

const updateUserSchema = createUserSchema.partial().omit({ password: true });

const updatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const updateStatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});

// Get all team members (users)
router.get("/members", async (req, res) => {
  try {
    const members = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        status: users.status,
        permissions: users.permissions,
        avatar: users.avatar,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    res.json(members);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
});

// Get single team member
router.get("/members/:id", async (req, res) => {
  try {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, req.params.id));

    if (!member) {
      return res.status(404).json({ error: "Team member not found" });
    }

    res.json(member);
  } catch (error) {
    console.error("Error fetching team member:", error);
    res.status(500).json({ error: "Failed to fetch team member" });
  }
});

// Create team member
router.post(
  "/members",
  validateRequest(createTeamMemberSchema),
  async (req, res) => {
    try {
      const { name, email, phone, role, department, permissions } = req.body;

      // Check if email already exists
      const [existingMember] = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.email, email));

      if (existingMember) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Create a user account for the team member
      const username = email.split("@")[0];
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const [newUser] = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
          email,
          firstName: name.split(" ")[0],
          lastName: name.split(" ").slice(1).join(" "),
          role,
        })
        .returning();

      // Create team member
      const [member] = await db
        .insert(teamMembers)
        .values({
          userId: newUser.id,
          name,
          email,
          phone,
          role,
          department,
          permissions: permissions || {},
          status: "active",
        })
        .returning();

      // Log activity
      await db.insert(teamActivityLogs).values({
        teamMemberId: member.id,
        action: "member_created",
        entityType: "team_member",
        entityId: member.id,
        details: { createdBy: "admin" },
      });

      res.json({
        ...member,
        tempPassword, // Send temporary password to admin
      });
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(500).json({ error: "Failed to create team member" });
    }
  }
);

// Update team member
router.put(
  "/members/:id",
  validateRequest(updateTeamMemberSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const [member] = await db
        .update(teamMembers)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(teamMembers.id, id))
        .returning();

      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }

      // Log activity
      await db.insert(teamActivityLogs).values({
        teamMemberId: id,
        action: "member_updated",
        entityType: "team_member",
        entityId: id,
        details: { updates },
      });

      res.json(member);
    } catch (error) {
      console.error("Error updating team member:", error);
      res.status(500).json({ error: "Failed to update team member" });
    }
  }
);

// Update team member status
router.patch(
  "/members/:id/status",
  validateRequest(updateStatusSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const [member] = await db
        .update(teamMembers)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(teamMembers.id, id))
        .returning();

      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }

      // Log activity
      await db.insert(teamActivityLogs).values({
        teamMemberId: id,
        action: "status_changed",
        entityType: "team_member",
        entityId: id,
        details: { newStatus: status },
      });

      res.json(member);
    } catch (error) {
      console.error("Error updating team member status:", error);
      res.status(500).json({ error: "Failed to update status" });
    }
  }
);

// Delete team member
router.delete("/members/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if member has active assignments
    const [hasAssignments] = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversationAssignments)
      .where(
        and(
          eq(conversationAssignments.teamMemberId, id),
          eq(conversationAssignments.status, "active")
        )
      );

    if (hasAssignments && hasAssignments.count > 0) {
      return res.status(400).json({
        error: "Cannot delete member with active conversation assignments",
      });
    }

    const [deletedMember] = await db
      .delete(teamMembers)
      .where(eq(teamMembers.id, id))
      .returning();

    if (!deletedMember) {
      return res.status(404).json({ error: "Team member not found" });
    }

    res.json({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error("Error deleting team member:", error);
    res.status(500).json({ error: "Failed to delete team member" });
  }
});

// Get team activity logs
router.get("/activity-logs", async (req, res) => {
  try {
    const logs = await db
      .select({
        id: teamActivityLogs.id,
        teamMemberId: teamActivityLogs.teamMemberId,
        memberName: teamMembers.name,
        memberEmail: teamMembers.email,
        action: teamActivityLogs.action,
        entityType: teamActivityLogs.entityType,
        entityId: teamActivityLogs.entityId,
        details: teamActivityLogs.details,
        ipAddress: teamActivityLogs.ipAddress,
        userAgent: teamActivityLogs.userAgent,
        createdAt: teamActivityLogs.createdAt,
      })
      .from(teamActivityLogs)
      .leftJoin(teamMembers, eq(teamActivityLogs.teamMemberId, teamMembers.id))
      .orderBy(desc(teamActivityLogs.createdAt))
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

// Update member online status
router.patch("/members/:id/online-status", async (req, res) => {
  try {
    const { id } = req.params;
    const { onlineStatus } = req.body;

    const [member] = await db
      .update(teamMembers)
      .set({
        onlineStatus,
        lastActive: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(teamMembers.id, id))
      .returning();

    if (!member) {
      return res.status(404).json({ error: "Team member not found" });
    }

    res.json(member);
  } catch (error) {
    console.error("Error updating online status:", error);
    res.status(500).json({ error: "Failed to update online status" });
  }
});

export default router;