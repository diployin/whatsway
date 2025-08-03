import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import { 
  users, 
  type User, 
  type InsertUser 
} from "@shared/schema";

export class UserRepository {
  async getById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async create(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAll(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
}