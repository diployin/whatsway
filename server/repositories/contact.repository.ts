import { db } from "../db";
import { eq, desc, sql } from "drizzle-orm";
import { 
  contacts, 
  type Contact, 
  type InsertContact 
} from "@shared/schema";

export class ContactRepository {
  async getAll(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getByChannel(channelId: string): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .where(eq(contacts.channelId, channelId))
      .orderBy(desc(contacts.createdAt));
  }

  async getById(id: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || undefined;
  }

  async getByPhone(phone: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.phone, phone));
    return contact || undefined;
  }

  async create(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async update(id: string, contact: Partial<Contact>): Promise<Contact | undefined> {
    const [updated] = await db
      .update(contacts)
      .set(contact)
      .where(eq(contacts.id, id))
      .returning();
    return updated || undefined;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id)).returning();
    return result.length > 0;
  }

  async search(query: string): Promise<Contact[]> {
    const searchPattern = `%${query}%`;
    return await db
      .select()
      .from(contacts)
      .where(
        sql`${contacts.name} ILIKE ${searchPattern} OR ${contacts.phone} ILIKE ${searchPattern} OR ${contacts.email} ILIKE ${searchPattern}`
      );
  }

  async createBulk(insertContacts: InsertContact[]): Promise<Contact[]> {
    if (insertContacts.length === 0) return [];
    return await db
      .insert(contacts)
      .values(insertContacts)
      .returning();
  }

  async checkExistingPhones(phones: string[], channelId: string): Promise<string[]> {
    const existingContacts = await db
      .select({ phone: contacts.phone })
      .from(contacts)
      .where(
        sql`${contacts.phone} = ANY(${phones}) AND ${contacts.channelId} = ${channelId}`
      );
    return existingContacts.map(c => c.phone);
  }
}