import { db } from "../db";
import { eq, desc, sql } from "drizzle-orm";
import { 
  conversations, 
  contacts,
  type Conversation, 
  type InsertConversation 
} from "@shared/schema";

export class ConversationRepository {
  async getAll(): Promise<Conversation[]> {
    const result = await db
      .select({
        conversation: conversations,
        contact: contacts,
      })
      .from(conversations)
      .leftJoin(contacts, eq(conversations.contactId, contacts.id))
      .orderBy(desc(conversations.lastMessageAt));
    
    return result.map(row => ({
      ...row.conversation,
      contact: row.contact,
    }));
  }

  async getByChannel(channelId: string): Promise<Conversation[]> {
    const result = await db
      .select({
        conversation: conversations,
        contact: contacts,
      })
      .from(conversations)
      .leftJoin(contacts, eq(conversations.contactId, contacts.id))
      .where(eq(conversations.channelId, channelId))
      .orderBy(desc(conversations.lastMessageAt));
    
    return result.map(row => ({
      ...row.conversation,
      contact: row.contact,
    }));
  }

  async getById(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getByPhone(phone: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.contactPhone, phone));
    return conversation || undefined;
  }

  async create(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async update(id: string, conversation: Partial<Conversation>): Promise<Conversation | undefined> {
    const [updated] = await db
      .update(conversations)
      .set(conversation)
      .where(eq(conversations.id, id))
      .returning();
    return updated || undefined;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(conversations).where(eq(conversations.id, id)).returning();
    return result.length > 0;
  }

  async getUnreadCount(): Promise<number> {
    const result = await db
      .select({
        count: sql<number>`count(*)`
      })
      .from(conversations)
      .where(sql`${conversations.unreadCount} > 0`);
    
    return Number(result[0]?.count) || 0;
  }
}