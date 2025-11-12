// controllers/transactionsController.ts
import { Request, Response } from "express";
import { db } from "../db";
import {
  transactions,
  subscriptions,
  plans,
  users,
  paymentProviders,
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Stripe with test or production keys
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || process.env.TESTING_STRIPE_SECRET_KEY || "",
  {
    apiVersion: "2025-10-29.clover",
  }
);

// Get all transactions
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const allTransactions = await db
      .select({
        transaction: transactions,
        user: users,
        plan: plans,
        provider: paymentProviders,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(plans, eq(transactions.planId, plans.id))
      .leftJoin(
        paymentProviders,
        eq(transactions.paymentProviderId, paymentProviders.id)
      )
      .orderBy(desc(transactions.createdAt));

    res.status(200).json({ success: true, data: allTransactions });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching transactions", error });
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
        provider: paymentProviders,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(plans, eq(transactions.planId, plans.id))
      .leftJoin(
        paymentProviders,
        eq(transactions.paymentProviderId, paymentProviders.id)
      )
      .where(eq(transactions.id, id));

    if (transaction.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({ success: true, data: transaction[0] });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching transaction", error });
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
        provider: paymentProviders,
      })
      .from(transactions)
      .leftJoin(plans, eq(transactions.planId, plans.id))
      .leftJoin(
        paymentProviders,
        eq(transactions.paymentProviderId, paymentProviders.id)
      )
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));

    res.status(200).json({ success: true, data: userTransactions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user transactions",
      error,
    });
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
      paymentMethod,
    } = req.body;

    // Fetch plan details
    const planData = await db.select().from(plans).where(eq(plans.id, planId));
    if (planData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    // Fetch payment provider
    const provider = await db
      .select()
      .from(paymentProviders)
      .where(eq(paymentProviders.id, paymentProviderId));

    if (provider.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Payment provider not found" });
    }

    if (!provider[0].isActive) {
      return res
        .status(400)
        .json({ success: false, message: "Payment provider is not active" });
    }

    const plan = planData[0];
    const amount =
      billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

    // Create transaction record
    const newTransaction = await db
      .insert(transactions)
      .values({
        userId,
        planId,
        paymentProviderId,
        amount,
        currency: "INR", // You can make this dynamic
        billingCycle,
        status: "pending",
        paymentMethod,
        metadata: {},
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: newTransaction[0],
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error creating transaction", error });
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
      metadata,
    } = req.body;

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (providerTransactionId)
      updateData.providerTransactionId = providerTransactionId;
    if (providerOrderId) updateData.providerOrderId = providerOrderId;
    if (providerPaymentId) updateData.providerPaymentId = providerPaymentId;
    if (metadata) updateData.metadata = metadata;

    // If payment is completed, set paidAt timestamp
    if (status === "completed") {
      updateData.paidAt = new Date();
    }

    // If payment is refunded, set refundedAt timestamp
    if (status === "refunded") {
      updateData.refundedAt = new Date();
    }

    const updatedTransaction = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();

    if (updatedTransaction.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: updatedTransaction[0],
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error updating transaction", error });
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
      metadata,
    } = req.body;

    // Get transaction details
    const transactionData = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));

    if (transactionData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    const transaction = transactionData[0];

    // Update transaction status
    const updatedTransaction = await db
      .update(transactions)
      .set({
        status: "completed",
        providerTransactionId,
        providerOrderId,
        providerPaymentId,
        metadata,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning();

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();

    if (transaction.billingCycle === "annual") {
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
        status: "active",
        billingCycle: transaction.billingCycle,
        startDate,
        endDate,
        autoRenew: true,
      })
      .returning();

    // Update transaction with subscription ID
    await db
      .update(transactions)
      .set({ subscriptionId: newSubscription[0].id })
      .where(eq(transactions.id, id));

    res.status(200).json({
      success: true,
      message: "Transaction completed and subscription created successfully",
      data: {
        transaction: updatedTransaction[0],
        subscription: newSubscription[0],
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error completing transaction", error });
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
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    const transaction = transactionData[0];

    if (transaction.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Only completed transactions can be refunded",
      });
    }

    // Update transaction status to refunded
    const updatedTransaction = await db
      .update(transactions)
      .set({
        status: "refunded",
        refundedAt: new Date(),
        metadata: { ...transaction.metadata, refundReason },
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning();

    // Cancel associated subscription if exists
    if (transaction.subscriptionId) {
      await db
        .update(subscriptions)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(subscriptions.id, transaction.subscriptionId));
    }

    res.status(200).json({
      success: true,
      message: "Transaction refunded successfully",
      data: updatedTransaction[0],
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error refunding transaction", error });
  }
};

// ==================== INITIATE PAYMENT ====================

// Initiate payment - Creates transaction and returns payment gateway details
export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      planId,
      currency,
      paymentProviderId,
      billingCycle, // "monthly" or "annual"
    } = req.body;

    // Fetch plan details
    const planData = await db.select().from(plans).where(eq(plans.id, planId));
    if (planData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    // Fetch payment provider
    const providerData = await db
      .select()
      .from(paymentProviders)
      .where(eq(paymentProviders.id, paymentProviderId));

    if (providerData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Payment provider not found" });
    }

    const provider = providerData[0];

    if (!provider.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "Payment provider is not active" });
    }

    const plan = planData[0];
    const amount =
      billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

    // Create transaction record
    const newTransaction = await db
      .insert(transactions)
      .values({
        userId,
        planId,
        paymentProviderId,
        amount,
        currency,
        billingCycle,
        status: "pending",
        metadata: {},
      })
      .returning();

    const transaction = newTransaction[0];

    // Initialize payment based on provider
    let paymentData;

    if (provider.providerKey === "razorpay") {
      paymentData = await initializeRazorpayPayment(
        transaction,
        provider,
        amount
      );
    } else if (provider.providerKey === "stripe") {
      paymentData = await initializeStripePayment(
        transaction,
        provider,
        amount
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported payment provider",
      });
    }

    // Update transaction with provider order ID
    await db
      .update(transactions)
      .set({
        providerOrderId: paymentData.orderId,
        providerTransactionId: paymentData.paymentIntentId,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transaction.id));

    res.status(201).json({
      success: true,
      message: "Payment initiated successfully",
      data: {
        transactionId: transaction.id,
        provider: provider.providerKey,
        amount: amount,
        currency: transaction.currency,
        ...paymentData,
      },
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Error initiating payment", error });
  }
};

// ==================== RAZORPAY INITIALIZATION ====================

async function initializeRazorpayPayment(
  transaction: any,
  provider: any,
  amount: string
) {
  const razorpay = new Razorpay({
    key_id: provider.config.apiKey || process.env.RAZORPAY_KEY_ID,
    key_secret: provider.config.apiSecret || process.env.RAZORPAY_KEY_SECRET,
  });

  // Create Razorpay order
  const order = await razorpay.orders.create({
    amount: Math.round(parseFloat(amount) * 100), // Amount in paise
    currency: transaction.currency,
    receipt: transaction.id,
    notes: {
      transactionId: transaction.id,
      userId: transaction.userId,
      planId: transaction.planId,
    },
  });

  return {
    orderId: order.id,
    paymentIntentId: null,
    keyId: provider.config.apiKey || process.env.RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: "Your Company Name",
    description: "Subscription Payment",
    prefill: {
      name: "",
      email: "",
      contact: "",
    },
  };
}

// ==================== STRIPE INITIALIZATION ====================

async function initializeStripePayment(
  transaction: any,
  provider: any,
  amount: string
) {
  // Create Stripe Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(parseFloat(amount) * 100), // Amount in cents
    currency: transaction.currency.toLowerCase(),
    description: `description: Payment for Pro plan (monthly plan) by user ${transaction.userId}`,
    metadata: {
      transactionId: transaction.id,
      userId: transaction.userId,
      planId: transaction.planId,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    orderId: null,
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    publishableKey:
      provider.config.publicKey || process.env.STRIPE_PUBLISHABLE_KEY,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  };
}

// ==================== VERIFY PAYMENT ====================

// Verify Razorpay payment
export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId,
    } = req.body;

    // Get provider details
    const providerData = await db
      .select()
      .from(paymentProviders)
      .where(eq(paymentProviders.providerKey, "razorpay"))
      .limit(1);

    if (providerData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Razorpay provider not found" });
    }

    const provider = providerData[0];
    const secret = provider.config.apiSecret || process.env.RAZORPAY_KEY_SECRET;

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      // Update transaction as failed
      await db
        .update(transactions)
        .set({
          status: "failed",
          metadata: { error: "Invalid signature" },
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, transactionId));

      return res.status(400).json({
        success: false,
        message: "Payment verification failed - Invalid signature",
      });
    }

    // Payment verified - Update transaction
    await db
      .update(transactions)
      .set({
        status: "completed",
        providerOrderId: razorpay_order_id,
        providerPaymentId: razorpay_payment_id,
        paidAt: new Date(),
        metadata: { verified: true },
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId));

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        transactionId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      },
    });

    // Note: Subscription creation will be handled by webhook
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Error verifying payment", error });
  }
};

// Verify Stripe payment
export const verifyStripePayment = async (req: Request, res: Response) => {
  try {
    const { payment_intent_id, transactionId } = req.body;

    console.log("payment_intent_id", payment_intent_id);
    console.log("transactionId", transactionId);

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      payment_intent_id
    );

    if (paymentIntent.status === "succeeded") {
      // Update transaction
      await db
        .update(transactions)
        .set({
          status: "completed",
          providerTransactionId: payment_intent_id,
          providerPaymentId: paymentIntent.charges.data[0]?.id,
          paidAt: new Date(),
          metadata: {
            paymentMethod: paymentIntent.payment_method,
            verified: true,
          },
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, transactionId));

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: {
          transactionId,
          paymentIntentId: payment_intent_id,
          status: paymentIntent.status,
        },
      });

      // Note: Subscription creation will be handled by webhook
    } else {
      // Payment not successful
      await db
        .update(transactions)
        .set({
          status: "failed",
          metadata: {
            status: paymentIntent.status,
            error: paymentIntent.last_payment_error?.message,
          },
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, transactionId));

      res.status(400).json({
        success: false,
        message: "Payment not completed",
        data: {
          status: paymentIntent.status,
        },
      });
    }
  } catch (error) {
    console.error("Error verifying Stripe payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Error verifying payment", error });
  }
};

// ==================== GET PAYMENT STATUS ====================

// Check payment/transaction status
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    const transactionData = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId));

    if (transactionData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    const transaction = transactionData[0];

    res.status(200).json({
      success: true,
      data: {
        transactionId: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        paidAt: transaction.paidAt,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment status",
      error,
    });
  }
};
