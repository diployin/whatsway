import { conversations, messages, users , contacts  } from "@shared/schema";
import { eq,desc,and, sql } from "drizzle-orm";
import { db } from "../db";


export async function getConversationsFromDB(channelId: string) {
  const latestMessages = db
    .select({
      conversationId: messages.conversationId,
      lastMessageAt: sql`MAX(${messages.createdAt})`.as("lastMessageAt"),
    })
    .from(messages)
    .groupBy(messages.conversationId)
    .as("latestMessages");

  const rows = await db
    .select({
      conversation: conversations,
      contact: contacts,
      assignedToName:
        sql`${users.firstName} || ' ' || ${users.lastName}`.as("assignedBy"),
      lastMessageAt: latestMessages.lastMessageAt,
      lastMessageText: messages.content,
    })
    .from(conversations)
    .leftJoin(contacts, eq(conversations.contactId, contacts.id))
    .leftJoin(users, eq(conversations.assignedTo, users.id))
    .leftJoin(latestMessages, eq(latestMessages.conversationId, conversations.id))
    .leftJoin(
      messages,
      and(
        eq(messages.conversationId, latestMessages.conversationId),
        eq(messages.createdAt, latestMessages.lastMessageAt)
      )
    )
    .where(eq(conversations.channelId, channelId))
    .orderBy(desc(latestMessages.lastMessageAt));

  return rows.map(row => ({
    ...row.conversation,
    lastMessageAt: row.lastMessageAt || null,
    lastMessageText: row.lastMessageText || null,
    assignedToName: row.assignedToName || null,
    contact: row.contact || null,
  }));
}
