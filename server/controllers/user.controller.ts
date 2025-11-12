import { Request, Response } from "express";
import { db } from "../db";
import {users} from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";


// Default permissions 
    const defaultPermissions = [
      // Contacts
      'contacts:view',
      'contacts:create',
      'contacts:edit',
      'contacts:delete',
      'contacts:export',

      // Campaigns
      'campaigns:view',
      'campaigns:create',
      'campaigns:edit',
      'campaigns:delete',

      // Templates
      'templates:view',
      'templates:create',
      'templates:edit',
      'templates:delete',

      // Analytics
      'analytics:view',

      // Team
      'team:view',
      'team:create',
      'team:edit',
      'team:delete',

      // Settings
      'settings:view',

      // Inbox
      'inbox:view',
      'inbox:send',
      'inbox:assign',

      // Automations
      'automations:view',
      'automations:create',
      'automations:edit',
      'automations:delete',
    ];


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    res.status(200).json({ success: true, data: allUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users", error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await db.select().from(users).where(eq(users.id, id));
    if (!user.length) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user", error });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, email, firstName, lastName, role, avatar, permissions } = req.body;

    // 🧱 Validate required fields
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "Username, password, and email are required.",
      });
    }

    // 🔍 Check if username already exists
    const existingUser = await db.select().from(users).where(eq(users.username, username));
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Username already exists. Please choose another one.",
      });
    }

    // 🔒 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📝 Insert new user
    const newUser = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        role: role || "admin",
        avatar,
        permissions: defaultPermissions,
      })
      .returning();

    return res.status(201).json({
      success: true,
      data: newUser[0],
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating user",
      error,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await db.update(users).set(updates).where(eq(users.id, id)).returning();

    res.status(200).json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating user", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(users).where(eq(users.id, id));
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting user", error });
  }
};
