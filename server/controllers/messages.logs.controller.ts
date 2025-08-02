import type { Request, Response } from 'express';
import { storage } from '../storage';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { eq, desc, and, or, like, gte, sql } from 'drizzle-orm';
import { messageQueue, whatsappChannels } from '@shared/schema';
import { db } from '../db';


export const getMessageLogs = asyncHandler(async (req: Request, res: Response) => {
  const { channelId, status, dateRange, search } = req.query;

  let conditions = [];

  // Channel filter
  if (channelId) {
    conditions.push(eq(messageQueue.channelId, channelId as string));
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

    conditions.push(gte(messageQueue.createdAt, startDate));
  }

  // Status filter
  if (status && status !== 'all') {
    conditions.push(eq(messageQueue.status, status as any));
  }

  // Add search condition if provided
  if (search) {
    conditions.push(
      or(
        like(messageQueue.recipientPhone, `%${search}%`),
        like(messageQueue.templateName, `%${search}%`)
      )!
    );
  }

  // Build the query
  let baseQuery = db
    .select({
      id: messageQueue.id,
      channelId: messageQueue.channelId,
      phoneNumber: messageQueue.recipientPhone,
      channelName: whatsappChannels.name,
      messageType: messageQueue.messageType,
      templateName: messageQueue.templateName,
      templateParams: messageQueue.templateParams,
      status: messageQueue.status,
      errorCode: messageQueue.errorCode,
      errorMessage: messageQueue.errorMessage,
      whatsappMessageId: messageQueue.whatsappMessageId,
      cost: messageQueue.cost,
      sentVia: messageQueue.sentVia,
      processedAt: messageQueue.processedAt,
      deliveredAt: messageQueue.deliveredAt,
      readAt: messageQueue.readAt,
      createdAt: messageQueue.createdAt,
    })
    .from(messageQueue)
    .leftJoin(whatsappChannels, eq(messageQueue.channelId, whatsappChannels.id));

  // Apply conditions only if we have any
  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions));
  }

  const messageLogs = await baseQuery
    .orderBy(desc(messageQueue.createdAt))
    .limit(100); // Limit to last 100 messages
  
  // Transform to match expected format
  const formattedLogs = messageLogs.map(log => ({
    id: log.id,
    channelId: log.channelId,
    phoneNumber: log.phoneNumber,
    contactName: log.channelName || '',
    messageType: log.messageType,
    content: log.templateName ? `Template: ${log.templateName}` : 'Text message',
    templateName: log.templateName,
    status: log.status,
    errorCode: log.errorCode,
    errorMessage: log.errorMessage,
    whatsappMessageId: log.whatsappMessageId,
    createdAt: log.createdAt,
    updatedAt: log.createdAt,
  }));
  
  res.json(formattedLogs);
});

export const updateMessageStatus = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { status, errorCode, errorMessage } = req.body;

  // Update message queue status
  const [updatedMessage] = await db
    .update(messageQueue)
    .set({
      status,
      errorCode,
      errorMessage,
      processedAt: status === 'sent' ? new Date() : undefined,
      deliveredAt: status === 'delivered' ? new Date() : undefined,
      readAt: status === 'read' ? new Date() : undefined,
    })
    .where(eq(messageQueue.id, messageId))
    .returning();

  if (!updatedMessage) {
    throw new AppError(404, 'Message not found');
  }

  res.json(updatedMessage);
});