import { Router } from 'express';
import * as chatbotController from '../controllers/chatbot.controller';
import type { Express } from "express";

export function registerChatbotRoutes(app: Express) {

// Chatbot routes
app.post('/api/chatbots', chatbotController.createChatbot);
app.get('/api/chatbots', chatbotController.getAllChatbots);
app.get('/api/chatbots/:id', chatbotController.getChatbot);
app.get('/api/chatbots/uuid/:uuid', chatbotController.getChatbotByUuid);
app.put('/api/chatbots/:id', chatbotController.updateChatbot);
app.delete('/api/chatbots/:id', chatbotController.deleteChatbot);
app.post('/api/training-data', chatbotController.addTrainingData);
app.get('/api/training-data/:chatbotId', chatbotController.getTrainingData);
app.delete('/api/training-data/:id', chatbotController.deleteTrainingData);

// Conversation routes
app.post('/api/conversations', chatbotController.createConversation);
app.post('/api/messages', chatbotController.sendMessage);
app.get('/api/conversations/:conversationId/messages', chatbotController.getConversationMessages);

}