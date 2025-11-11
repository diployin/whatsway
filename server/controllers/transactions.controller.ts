// controllers/transactionsController.ts
import { Request, Response } from 'express';
import { db } from '../db';
import { transactions, subscriptions, plans, users, paymentProviders } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

// Get all transactions
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const allTransactions = await db
      .select({
        transaction: transactions,
        user: users,
        plan: plans,
        provider: paymentProviders
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(plans, eq(transactions.planId, plans.id))
      .leftJoin(paymentProviders, eq(transactions.paymentProviderId, paymentProviders.id))
      .orderBy(desc(transactions.createdAt));

    res.status(200).json({ success: true, data: allTransactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching transactions', error });
  }
};

// Get transaction by ID
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await db
      .select({
        transaction: transactions,
        user: users,
        plan: plans,
        provider: paymentProviders
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(plans, eq(transactions.planId, plans.id))
      .leftJoin(paymentProviders, eq(transactions.paymentProviderId, paymentProviders.id))
      .where(eq(transactions.id, id));

    if (transaction.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ success: true, data: transaction[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching transaction', error });
  }
};

// Get transactions by user ID
export const getTransactionsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userTransactions = await db
      .select({
        transaction: transactions,
        plan: plans,
        provider: paymentProviders
      })
      .from(transactions)
      .leftJoin(plans, eq(transactions.planId, plans.id))
      .leftJoin(paymentProviders, eq(transactions.paymentProviderId, paymentProviders.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));

    res.status(200).json({ success: true, data: userTransactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user transactions', error });
  }
};

// Create transaction (initiate payment)
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      planId,
      paymentProviderId,
      billingCycle, // "monthly" or "annual"
      paymentMethod
    } = req.body;

    // Fetch plan details
    const planData = await db.select().from(plans).where(eq(plans.id, planId));
    if (planData.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Fetch payment provider
    const provider = await db
      .select()
      .from(paymentProviders)
      .where(eq(paymentProviders.id, paymentProviderId));

    if (provider.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment provider not found' });
    }

    if (!provider[0].isActive) {
      return res.status(400).json({ success: false, message: 'Payment provider is not active' });
    }

    const plan = planData[0];
    const amount = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

    // Create transaction record
    const newTransaction = await db
      .insert(transactions)
      .values({
        userId,
        planId,
        paymentProviderId,
        amount,
        currency: 'INR', // You can make this dynamic
        billingCycle,
        status: 'pending',
        paymentMethod,
        metadata: {}
      })
      .returning();

    res.status(201).json({ 
      success: true, 
      message: 'Transaction created successfully',
      data: newTransaction[0] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating transaction', error });
  }
};

// Update transaction status (after payment)
export const updateTransactionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      status,
      providerTransactionId,
      providerOrderId,
      providerPaymentId,
      metadata
    } = req.body;

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (providerTransactionId) updateData.providerTransactionId = providerTransactionId;
    if (providerOrderId) updateData.providerOrderId = providerOrderId;
    if (providerPaymentId) updateData.providerPaymentId = providerPaymentId;
    if (metadata) updateData.metadata = metadata;

    // If payment is completed, set paidAt timestamp
    if (status === 'completed') {
      updateData.paidAt = new Date();
    }

    // If payment is refunded, set refundedAt timestamp
    if (status === 'refunded') {
      updateData.refundedAt = new Date();
    }

    const updatedTransaction = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();

    if (updatedTransaction.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Transaction updated successfully',
      data: updatedTransaction[0] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating transaction', error });
  }
};

// Complete transaction and create subscription
export const completeTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      providerTransactionId,
      providerOrderId,
      providerPaymentId,
      metadata
    } = req.body;

    // Get transaction details
    const transactionData = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));

    if (transactionData.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const transaction = transactionData[0];

    // Update transaction status
    const updatedTransaction = await db
      .update(transactions)
      .set({
        status: 'completed',
        providerTransactionId,
        providerOrderId,
        providerPaymentId,
        metadata,
        paidAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(transactions.id, id))
      .returning();

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    
    if (transaction.billingCycle === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create subscription
    const newSubscription = await db
      .insert(subscriptions)
      .values({
        userId: transaction.userId,
        planId: transaction.planId,
        status: 'active',
        billingCycle: transaction.billingCycle,
        startDate,
        endDate,
        autoRenew: true
      })
      .returning();

    // Update transaction with subscription ID
    await db
      .update(transactions)
      .set({ subscriptionId: newSubscription[0].id })
      .where(eq(transactions.id, id));

    res.status(200).json({ 
      success: true, 
      message: 'Transaction completed and subscription created successfully',
      data: {
        transaction: updatedTransaction[0],
        subscription: newSubscription[0]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error completing transaction', error });
  }
};

// Refund transaction
export const refundTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { refundReason } = req.body;

    // Get transaction
    const transactionData = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));

    if (transactionData.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const transaction = transactionData[0];

    if (transaction.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only completed transactions can be refunded' 
      });
    }

    // Update transaction status to refunded
    const updatedTransaction = await db
      .update(transactions)
      .set({
        status: 'refunded',
        refundedAt: new Date(),
        metadata: { ...transaction.metadata, refundReason },
        updatedAt: new Date()
      })
      .where(eq(transactions.id, id))
      .returning();

    // Cancel associated subscription if exists
    if (transaction.subscriptionId) {
      await db
        .update(subscriptions)
        .set({ status: 'cancelled', updatedAt: new Date() })
        .where(eq(subscriptions.id, transaction.subscriptionId));
    }

    res.status(200).json({ 
      success: true, 
      message: 'Transaction refunded successfully',
      data: updatedTransaction[0] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error refunding transaction', error });
  }
};