import type { Request, Response } from 'express';
import { storage } from '../storage';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { eq, desc, and, or, like, gte, sql } from 'drizzle-orm';
import { messages, conversations, contacts } from '@shared/schema';
import { db } from '../db';

export const getMessageLogs = asyncHandler(async (req: Request, res: Response) => {
  const { channelId, status, dateRange, search } = req.query;

  let conditions = [];

  // Channel filter
  if (channelId) {
    conditions.push(eq(conversations.channelId, channelId as string));
  }

  // Date range filter
  if (dateRange && dateRange !== 'all') {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    conditions.push(gte(messages.createdAt, startDate));
  }

  // Status filter
  if (status && status !== 'all') {
    conditions.push(eq(messages.status, status as any));
  }

  // Build the query
  const query = db
    .select({
      id: messages.id,
      channelId: conversations.channelId,
      phoneNumber: conversations.contactPhone,
      contactName: conversations.contactName,
      messageType: sql<string>`CASE WHEN ${messages.templateName} IS NOT NULL THEN 'template' ELSE 'text' END`,
      content: messages.content,
      templateName: messages.templateName,
      status: messages.status,
      errorCode: messages.errorCode,
      errorMessage: messages.errorMessage,
      whatsappMessageId: messages.whatsappMessageId,
      createdAt: messages.createdAt,
      updatedAt: messages.updatedAt,
    })
    .from(messages)
    .innerJoin(conversations, eq(messages.conversationId, conversations.id))
    .where(
      and(
        ...conditions,
        eq(messages.sender, 'agent'), // Only show outgoing messages
        search ? or(
          like(conversations.contactPhone, `%${search}%`),
          like(messages.content, `%${search}%`)
        ) : undefined
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(100); // Limit to last 100 messages

  const logs = await query;
  
  res.json(logs);
});

export const updateMessageStatus = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { status, errorCode, errorMessage } = req.body;

  const message = await storage.updateMessage(messageId, {
    status,
    errorCode,
    errorMessage,
  });

  if (!message) {
    throw new AppError(404, 'Message not found');
  }

  res.json(message);
});