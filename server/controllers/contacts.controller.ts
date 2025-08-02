import type { Request, Response } from 'express';
import { storage } from '../storage';
import { insertContactSchema } from '@shared/schema';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import type { RequestWithChannel } from '../middlewares/channel.middleware';

export const getContacts = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  const { search, channelId } = req.query;
  
  let contacts;
  if (channelId && typeof channelId === 'string') {
    contacts = await storage.getContactsByChannel(channelId);
  } else {
    contacts = await storage.getContacts();
  }
  
  // Apply search filter if provided
  if (search && typeof search === 'string') {
    const searchLower = search.toLowerCase();
    contacts = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchLower) ||
      contact.phone.includes(search) ||
      contact.email?.toLowerCase().includes(searchLower)
    );
  }
  
  res.json(contacts);
});

export const getContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const contact = await storage.getContact(id);
  if (!contact) {
    throw new AppError(404, 'Contact not found');
  }
  res.json(contact);
});

export const createContact = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  const validatedContact = insertContactSchema.parse(req.body);
  
  // Use channelId from query or active channel
  let channelId = req.query.channelId as string | undefined;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (activeChannel) {
      channelId = activeChannel.id;
    }
  }
  
  const contact = await storage.createContact({
    ...validatedContact,
    channelId
  });
  
  res.json(contact);
});

export const updateContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const contact = await storage.updateContact(id, req.body);
  if (!contact) {
    throw new AppError(404, 'Contact not found');
  }
  res.json(contact);
});

export const deleteContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const success = await storage.deleteContact(id);
  if (!success) {
    throw new AppError(404, 'Contact not found');
  }
  res.status(204).send();
});

export const importContacts = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  const { contacts, channelId: bodyChannelId } = req.body;
  
  if (!Array.isArray(contacts)) {
    throw new AppError(400, 'Contacts must be an array');
  }
  
  // Use channelId from body, query or active channel
  let channelId = bodyChannelId || req.query.channelId as string | undefined;
  if (!channelId) {
    const activeChannel = await storage.getActiveChannel();
    if (activeChannel) {
      channelId = activeChannel.id;
    }
  }
  
  const createdContacts = [];
  const errors = [];
  
  for (const contact of contacts) {
    try {
      const validatedContact = insertContactSchema.parse({
        ...contact,
        channelId
      });
      const created = await storage.createContact(validatedContact);
      createdContacts.push(created);
    } catch (error) {
      errors.push({
        contact,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  res.json({
    created: createdContacts.length,
    failed: errors.length,
    errors: errors.slice(0, 10) // Limit errors to first 10
  });
});