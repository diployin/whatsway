import type { Request, Response } from 'express';
import { storage } from '../storage';
import { insertConversationSchema } from '@shared/schema';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import type { RequestWithChannel } from '../middlewares/channel.middleware';
import { conversations, messages , contacts } from "@shared/schema";
import { eq,desc, sql } from "drizzle-orm";
import { db } from "../db";

// export const getConversations = asyncHandler(async (req: RequestWithChannel, res: Response) => {
//   const channelId = req.query.channelId as string | undefined;
//   const conversations = channelId 
//     ? await storage.getConversationsByChannelNew(channelId)
//     : await storage.getConversationsNew();
//   res.json(conversations);
// });

export async function getConversations(req, res) {
  try {
    // Get conversations with latest message per conversation
    const rows = await db
      .select({
        conversation: conversations,
        contact: contacts,
        message: {
          createdAt: messages.createdAt,
          content: messages.content,
        },
      })
      .from(conversations)
      .leftJoin(contacts, eq(conversations.contactId, contacts.id))
      .leftJoin(messages, eq(conversations.id, messages.conversationId))
      .orderBy(desc(messages.createdAt)); // latest messages first

    // Group to only latest message per conversation
    const seen = new Set();
    const formatted = rows
      .filter(row => {
        if (seen.has(row.conversation.id)) return false;
        seen.add(row.conversation.id);
        return true;
      })
      .map(row => ({
        ...row.conversation,
        lastMessageAt: row.message?.createdAt || null,
        lastMessageText: row.message?.content || null,
        contact: row.contact || null,
      }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: "Unexpected error" });
  }
}


export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const conversation = await storage.getConversation(id);
  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }

  res.json(conversation);
});

export const createConversation = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  const validatedConversation = insertConversationSchema.parse(req.body);
  
  // Get active channel if channelId not provided
  let channelId = validatedConversation.channelId;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (activeChannel) {
      channelId = activeChannel.id;
    }
  }
  
  const conversation = await storage.createConversation({
    ...validatedConversation,
    channelId
  });
  
  res.json(conversation);
});

export const updateConversation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const conversation = await storage.updateConversation(id, req.body);
  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }
  res.json(conversation);
});

export const deleteConversation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const success = await storage.deleteConversation(id);
  if (!success) {
    throw new AppError(404, 'Conversation not found');
  }
  res.status(204).send();
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const conversation = await storage.updateConversation(id, {
    unreadCount: 0
  });
  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }
  res.json(conversation);
});