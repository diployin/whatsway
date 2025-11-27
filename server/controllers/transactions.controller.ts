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
import { eq, and, desc, gte, lte, or, like, sql, ne } from "drizzle-orm";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";
import ExcelJS from "exceljs";


// Initialize Stripe with test or production keys
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || process.env.TESTING_STRIPE_SECRET_KEY || "",
  {
    apiVersion: "2025-10-29.clover",
  }
);

// Get all transactions
// export const getAllTransactions = async (req: Request, res: Response) => {
//   try {
//     const {
//       search,
//       status,
//       paymentMethod,
//       billingCycle,
//       providerId,
//       startDate,
//       endDate,
//       minAmount,
//       maxAmount,
//       page = "1",
//       limit = "20",
//     } = req.query;

//     // Build filter conditions
//     const conditions = [];

//     // Search by user email, provider transaction ID, or order ID
//     if (search && typeof search === "string") {
//       conditions.push(
//         or(
//           like(users.email, `%${search}%`),
//           like(transactions.providerTransactionId, `%${search}%`),
//           like(transactions.providerOrderId, `%${search}%`)
//         )
//       );
//     }

//     // Filter by status
//     if (status && typeof status === "string") {
//       conditions.push(eq(transactions.status, status));
//     }

//     // Filter by payment method
//     if (paymentMethod && typeof paymentMethod === "string") {
//       conditions.push(eq(transactions.paymentMethod, paymentMethod));
//     }

//     // Filter by billing cycle
//     if (billingCycle && typeof billingCycle === "string") {
//       conditions.push(eq(transactions.billingCycle, billingCycle));
//     }

//     // Filter by payment provider
//     if (providerId && typeof providerId === "string") {
//       conditions.push(eq(transactions.paymentProviderId, providerId));
//     }

//     // Filter by date range
//     if (startDate && typeof startDate === "string") {
//       conditions.push(gte(transactions.createdAt, new Date(startDate)));
//     }
//     if (endDate && typeof endDate === "string") {
//       conditions.push(lte(transactions.createdAt, new Date(endDate)));
//     }

//     // Filter by amount range
//     if (minAmount && typeof minAmount === "string") {
//       conditions.push(gte(transactions.amount, minAmount));
//     }
//     if (maxAmount && typeof maxAmount === "string") {
//       conditions.push(lte(transactions.amount, maxAmount));
//     }

//     // Calculate pagination
//     const pageNum = parseInt(page as string);
//     const limitNum = parseInt(limit as string);
//     const offset = (pageNum - 1) * limitNum;

//     // Build query with conditions
//     const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

//     // Get transactions with pagination
//     const allTransactions = await db
//     .select({
//       transaction: transactions, // full transaction details
//       user: {
//         id: users.id,
//         firstName: users.firstName,
//         lastName: users.lastName,
//         email: users.email,
//       },
//       plan: {
//         id: plans.id,
//         name: plans.name,
//         price: plans.annualPrice,
//         monthlyPrice: plans.monthlyPrice,
//         permissions: plans.permissions,
//         features: plans.features
//       },
//       provider: {
//         id: paymentProviders.id,
//         name: paymentProviders.name,
//         providerKey: paymentProviders.providerKey,
//       },
//     })
//       .from(transactions)
//       .leftJoin(users, eq(transactions.userId, users.id))
//       .leftJoin(plans, eq(transactions.planId, plans.id))
//       .leftJoin(
//         paymentProviders,
//         eq(transactions.paymentProviderId, paymentProviders.id)
//       )
//       .where(whereClause)
//       .orderBy(desc(transactions.createdAt))
//       .limit(limitNum)
//       .offset(offset);

//     // Get total count for pagination
//     const totalCountResult = await db
//       .select({ count: sql<number>`count(*)` })
//       .from(transactions)
//       .leftJoin(users, eq(transactions.userId, users.id))
//       .where(whereClause);

//     const totalCount = Number(totalCountResult[0]?.count || 0);
//     const totalPages = Math.ceil(totalCount / limitNum);

//     res.status(200).json({
//       success: true,
//       data: allTransactions,
//       pagination: {
//         page: pageNum,
//         limit: limitNum,
//         totalCount,
//         totalPages,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching transactions:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching transactions",
//       error,
//     });
//   }
// };


export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const {
      search,
      status,
      paymentMethod,
      billingCycle,
      providerId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      page = "1",
      limit = "20",
    } = req.query;

    const conditions = [];

    // Search by email / provider IDs / order ID
    if (search && typeof search === "string") {
      conditions.push(
        or(
          like(users.email, `%${search}%`),
          like(transactions.providerTransactionId, `%${search}%`),
          like(transactions.providerOrderId, `%${search}%`)
        )
      );
    }

    // Status filter OR auto-exclude pending
    if (status && typeof status === "string") {
      conditions.push(eq(transactions.status, status));
    } else {
      conditions.push(ne(transactions.status, "pending"));
    }

    // Payment method
    if (paymentMethod && typeof paymentMethod === "string") {
      conditions.push(eq(transactions.paymentMethod, paymentMethod));
    }

    // Billing cycle
    if (billingCycle && typeof billingCycle === "string") {
      conditions.push(eq(transactions.billingCycle, billingCycle));
    }

    // Payment provider
    if (providerId && typeof providerId === "string") {
      conditions.push(eq(transactions.paymentProviderId, providerId));
    }

    // Date range
    if (startDate && typeof startDate === "string") {
      conditions.push(gte(transactions.createdAt, new Date(startDate)));
    }
    if (endDate && typeof endDate === "string") {
      conditions.push(lte(transactions.createdAt, new Date(endDate)));
    }

    // Amount range
    if (minAmount && typeof minAmount === "string") {
      conditions.push(gte(transactions.amount, minAmount));
    }
    if (maxAmount && typeof maxAmount === "string") {
      conditions.push(lte(transactions.amount, maxAmount));
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch transactions
    const allTransactions = await db
      .select({
        transaction: transactions,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        plan: {
          id: plans.id,
          name: plans.name,
          price: plans.annualPrice,
          monthlyPrice: plans.monthlyPrice,
          permissions: plans.permissions,
          features: plans.features
        },
        provider: {
          id: paymentProviders.id,
          name: paymentProviders.name,
          providerKey: paymentProviders.providerKey,
        },
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(plans, eq(transactions.planId, plans.id))
      .leftJoin(paymentProviders, eq(transactions.paymentProviderId, paymentProviders.id))
      .where(whereClause)
      .orderBy(desc(transactions.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Count total
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(whereClause);

    const totalCount = Number(totalCountResult[0]?.count || 0);

    res.status(200).json({
      success: true,
      data: allTransactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });

  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error,
    });
  }
};


// Get transaction statistics
export const getTransactionStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const conditions = [];
    if (startDate && typeof startDate === "string") {
      conditions.push(gte(transactions.createdAt, new Date(startDate)));
    }
    if (endDate && typeof endDate === "string") {
      conditions.push(lte(transactions.createdAt, new Date(endDate)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total revenue
    const revenueResult = await db
      .select({
        total: sql<number>`SUM(CAST(${transactions.amount} AS DECIMAL))`,
      })
      .from(transactions)
      .where(
        whereClause
          ? and(whereClause, eq(transactions.status, "completed"))
          : eq(transactions.status, "completed")
      );

    // Get transaction counts by status
    const statusCounts = await db
      .select({
        status: transactions.status,
        count: sql<number>`count(*)`,
      })
      .from(transactions)
      .where(whereClause)
      .groupBy(transactions.status);

    // Get revenue by billing cycle
    const billingCycleRevenue = await db
      .select({
        billingCycle: transactions.billingCycle,
        total: sql<number>`SUM(CAST(${transactions.amount} AS DECIMAL))`,
      })
      .from(transactions)
      .where(
        whereClause
          ? and(whereClause, eq(transactions.status, "completed"))
          : eq(transactions.status, "completed")
      )
      .groupBy(transactions.billingCycle);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: Number(revenueResult[0]?.total || 0),
        statusCounts: statusCounts.map((s) => ({
          status: s.status,
          count: Number(s.count),
        })),
        billingCycleRevenue: billingCycleRevenue.map((b) => ({
          billingCycle: b.billingCycle,
          total: Number(b.total),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transaction statistics",
      error,
    });
  }
};

// Get single transaction by ID
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
      .where(eq(transactions.id, id))
      .limit(1);

    if (!transaction || transaction.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction[0],
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transaction",
      error,
    });
  }
};


export const exportTransactions = async (req: Request, res: Response) => {
  try {
    const allTransactions = await db
      .select({
        transaction: transactions,
        user: users,
        plan: plans,
        provider: paymentProviders,
      })
      .from(transactions)
      .where(ne(transactions.status, "pending")) 
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(plans, eq(transactions.planId, plans.id))
      .leftJoin(
        paymentProviders,
        eq(transactions.paymentProviderId, paymentProviders.id)
      )
      .orderBy(desc(transactions.createdAt));

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transactions");

    // Define columns
    worksheet.columns = [
      { header: "Transaction ID", key: "id", width: 25 },
      { header: "User Email", key: "userEmail", width: 30 },
      { header: "Plan", key: "planName", width: 20 },
      { header: "Provider", key: "provider", width: 20 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Currency", key: "currency", width: 10 },
      { header: "Billing Cycle", key: "billingCycle", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Payment Method", key: "paymentMethod", width: 20 },
      { header: "Provider Txn ID", key: "providerTransactionId", width: 25 },
      { header: "Provider Order ID", key: "providerOrderId", width: 25 },
      { header: "Paid At", key: "paidAt", width: 25 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    // Add data rows
    allTransactions.forEach((t) => {
      worksheet.addRow({
        id: t.transaction.id,
        userEmail: t.user?.email || "",
        planName: t.plan?.name || "",
        provider: t.provider?.name || "",
        amount: t.transaction.amount,
        currency: t.transaction.currency,
        billingCycle: t.transaction.billingCycle,
        status: t.transaction.status,
        paymentMethod: t.transaction.paymentMethod || "",
        providerTransactionId: t.transaction.providerTransactionId || "",
        providerOrderId: t.transaction.providerOrderId || "",
        paidAt: t.transaction.paidAt
          ? new Date(t.transaction.paidAt).toLocaleString()
          : "",
        createdAt: t.transaction.createdAt
          ? new Date(t.transaction.createdAt).toLocaleString()
          : "",
      });
    });

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0078D4" }, // Blue header background
    };
    headerRow.alignment = { horizontal: "center" };
    headerRow.border = {
      bottom: { style: "thin", color: { argb: "FF000000" } },
    };

    // Add borders to all rows
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFCCCCCC" } },
          left: { style: "thin", color: { argb: "FFCCCCCC" } },
          bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
          right: { style: "thin", color: { argb: "FFCCCCCC" } },
        };
        cell.alignment = { vertical: "middle", wrapText: true };
      });
    });

    // Write workbook to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Send as downloadable Excel file
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=transactions_${new Date()
        .toISOString()
        .split("T")[0]}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error exporting transactions:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting transactions",
      error,
    });
  }
};


// Get transaction by ID
// export const getTransactionById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const transaction = await db
//       .select({
//         transaction: transactions,
//         user: users,
//         plan: plans,
//         provider: paymentProviders,
//       })
//       .from(transactions)
//       .leftJoin(users, eq(transactions.userId, users.id))
//       .leftJoin(plans, eq(transactions.planId, plans.id))
//       .leftJoin(
//         paymentProviders,
//         eq(transactions.paymentProviderId, paymentProviders.id)
//       )
//       .where(eq(transactions.id, id));

//     if (transaction.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Transaction not found" });
//     }

//     res.status(200).json({ success: true, data: transaction[0] });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Error fetching transaction", error });
//   }
// };

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


  console.log("Razorpay Order Created:", order);


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



// this url is working 
// export const initiateStripePayment = async (transaction: any, packageData: any, user: any) => {
//   const session = await stripe.checkout.sessions.create({
//     mode: "payment",
//     customer_email: user.email,
//     line_items: [
//       {
//         price_data: {
//           currency: transaction.currency.toLowerCase(),
//           product_data: { name: `Package ${packageData.name}` },
//           unit_amount: Math.round(parseFloat(transaction.amount) * 100),
//         },
//         quantity: 1
//       }
//     ],
//     success_url: `${process.env.FRONTEND_URL}/payment-success?tid=${transaction.id}`,
//     cancel_url: `${process.env.FRONTEND_URL}/payment-failed?tid=${transaction.id}`,
//     metadata: { transactionId: transaction.id }
//   });

//   return { sessionUrl: session.url };
// };

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
    publishableKey: provider.config.apiSecretTest,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  };
}

// ==================== VERIFY PAYMENT ====================

// Verify Razorpay payment
// export const verifyRazorpayPayment = async (req: Request, res: Response) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       transactionId,
//     } = req.body;

//     // Get provider details
//     const providerData = await db
//       .select()
//       .from(paymentProviders)
//       .where(eq(paymentProviders.providerKey, "razorpay"))
//       .limit(1);

//     if (providerData.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Razorpay provider not found" });
//     }

//     const provider = providerData[0];
//     const secret = provider.config.apiSecret || process.env.RAZORPAY_KEY_SECRET;

//     const generated_signature = crypto
//       .createHmac("sha256", secret)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest("hex");

//     if (generated_signature !== razorpay_signature) {
//       // Update transaction as failed
//       await db
//         .update(transactions)
//         .set({
//           status: "failed",
//           metadata: { error: "Invalid signature" },
//           updatedAt: new Date(),
//         })
//         .where(eq(transactions.id, transactionId));

//       return res.status(400).json({
//         success: false,
//         message: "Payment verification failed - Invalid signature",
//       });
//     }

//     // Payment verified - Update transaction
//     await db
//       .update(transactions)
//       .set({
//         status: "completed",
//         providerOrderId: razorpay_order_id,
//         providerPaymentId: razorpay_payment_id,
//         paidAt: new Date(),
//         metadata: { verified: true },
//         updatedAt: new Date(),
//       })
//       .where(eq(transactions.id, transactionId));


//       // Create subscription
//     const newSubscription = await db
//       .insert(subscriptions)
//       .values({
//         userId: transaction.userId,
//         planId: transaction.planId,
//         status: "active",
//         billingCycle: transaction.billingCycle,
//         startDate,
//         endDate,
//         autoRenew: true,
//       })
//       .returning();

//     res.status(200).json({
//       success: true,
//       message: "Payment verified successfully",
//       data: {
//         transactionId,
//         orderId: razorpay_order_id,
//         paymentId: razorpay_payment_id,
//       },
//     });

//     // Note: Subscription creation will be handled by webhook
//   } catch (error) {
//     console.error("Error verifying Razorpay payment:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Error verifying payment", error });
//   }
// };


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

    
    const razorpay = new Razorpay({
      key_id: provider.config.apiKey || process.env.RAZORPAY_KEY_ID,
      key_secret: provider.config.apiSecret || process.env.RAZORPAY_KEY_SECRET,
    });


    const secret = provider.config.apiSecret || process.env.RAZORPAY_KEY_SECRET;



    // Fetch payment details
const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

// console.log("Payment Details:", paymentDetails);

    // Generate signature
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    // Fetch transaction details
    const transactionData = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    if (transactionData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const transaction = transactionData[0];

    console.log(
      {
        status: "failed",
        metadata: { error: "Invalid signature" },
        paymentMethod: paymentDetails.method || null,
        updatedAt: new Date(),
      }
    )

    // Signature mismatch -> fail transaction
    if (generated_signature !== razorpay_signature) {
      await db
        .update(transactions)
        .set({
          status: "failed",
          metadata: { error: "Invalid signature" },
          paymentMethod: paymentDetails.method || null,
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, transactionId));

      return res.status(400).json({
        success: false,
        message: "Payment verification failed - Invalid signature",
      });
    }

    // Payment verified -> update transaction
    await db
      .update(transactions)
      .set({
        status: "completed",
        providerOrderId: razorpay_order_id,
        providerPaymentId: razorpay_payment_id,
        paymentMethod: paymentDetails.method || null,
        paidAt: new Date(),
        metadata: { verified: true },
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId));

    // Fetch full plan details using planId
    const planData = await db
      .select()
      .from(plans)
      .where(eq(plans.id, transaction.planId))
      .limit(1);

    if (planData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    const plan = planData[0];

    // Log the plan data for debugging
    // console.log("Fetched plan data:", plan);

    // Ensure valid plan data, falling back to defaults if necessary
    const planDataObject = {
      name: plan.name || "Unknown Plan",
      description: plan.description || "No description available",
      icon: plan.icon || "default-icon",
      monthlyPrice: plan.monthlyPrice || 0,
      annualPrice: plan.annualPrice || 0,
      permissions: plan.permissions || {},
      features: plan.features || [],
    };

    // Log plan data object to check before insertion
    // console.log("Plan data object for subscription:", planDataObject);

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();

    if (transaction.billingCycle === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (transaction.billingCycle === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Create subscription with full plan details in the plan_data JSON field
    const newSubscription = await db
  .insert(subscriptions)
  .values({
    userId: transaction.userId,
    planId: transaction.planId,
    planData: {  // Change `plan_data` to `planData`
      name: plan.name,          // Store plan name
      description: plan.description, // Store plan description
      monthlyPrice: plan.monthlyPrice, // Store monthly price
      annualPrice: plan.annualPrice,   // Store annual price
      permissions: plan.permissions, // Store plan permissions
      features: plan.features,   // Store plan features
    },
    status: "active",
    billingCycle: transaction.billingCycle,
    startDate,
    endDate,
    autoRenew: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  .returning();


    res.status(200).json({
      success: true,
      message: "Payment verified & subscription created successfully",
      data: {
        transactionId,
        subscription: newSubscription[0],
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      },
    });

  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Error verifying payment", error });
  }
};

// Verify Stripe payment
// export const verifyStripePayment = async (req: Request, res: Response) => {
//   try {
//     const { payment_intent_id, transactionId } = req.body;

//     console.log("payment_intent_id", payment_intent_id);
//     console.log("transactionId", transactionId);

//     // Retrieve payment intent from Stripe
//     const paymentIntent = await stripe.paymentIntents.retrieve(
//       payment_intent_id
//     );

//     if (paymentIntent.status === "succeeded") {
//       // Update transaction
//       await db
//         .update(transactions)
//         .set({
//           status: "completed",
//           providerTransactionId: payment_intent_id,
//           providerPaymentId: paymentIntent.charges.data[0]?.id,
//           paidAt: new Date(),
//           metadata: {
//             paymentMethod: paymentIntent.payment_method,
//             verified: true,
//           },
//           updatedAt: new Date(),
//         })
//         .where(eq(transactions.id, transactionId));

//       res.status(200).json({
//         success: true,
//         message: "Payment verified successfully",
//         data: {
//           transactionId,
//           paymentIntentId: payment_intent_id,
//           status: paymentIntent.status,
//         },
//       });

//       // Note: Subscription creation will be handled by webhook
//     } else {
//       // Payment not successful
//       await db
//         .update(transactions)
//         .set({
//           status: "failed",
//           metadata: {
//             status: paymentIntent.status,
//             error: paymentIntent.last_payment_error?.message,
//           },
//           updatedAt: new Date(),
//         })
//         .where(eq(transactions.id, transactionId));

//       res.status(400).json({
//         success: false,
//         message: "Payment not completed",
//         data: {
//           status: paymentIntent.status,
//         },
//       });
//     }
//   } catch (error) {
//     console.error("Error verifying Stripe payment:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Error verifying payment", error });
//   }
// };


export const verifyStripePayment = async (req: Request, res: Response) => {
  try {
    const { payment_intent_id, transactionId } = req.body;

    if (!payment_intent_id || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    // Retrieve PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id, {
      expand: ["payment_method"], // optional if you need payment method details
    });

    // Safely get the first charge
    const charge = paymentIntent.charges?.data?.[0] || null;

    // Fetch transaction
    const transactionData = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    if (!transactionData.length) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    const transaction = transactionData[0];

    if (paymentIntent.status === "succeeded") {
      // Update transaction
      await db.update(transactions)
        .set({
          status: "completed",
          providerTransactionId: payment_intent_id,
          providerPaymentId: charge?.id || null,
          paidAt: new Date(),
          metadata: {
            paymentMethod: paymentIntent.payment_method || null,
            verified: true,
          },
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, transactionId));

      // Fetch plan
      const planData = await db
        .select()
        .from(plans)
        .where(eq(plans.id, transaction.planId))
        .limit(1);

      if (!planData.length) {
        return res.status(404).json({ success: false, message: "Plan not found" });
      }

      const plan = planData[0];

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      if (transaction.billingCycle === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (transaction.billingCycle === "annual") {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Create subscription
      const newSubscription = await db.insert(subscriptions)
        .values({
          userId: transaction.userId,
          planId: transaction.planId,
          planData: {
            name: plan.name || "Unknown Plan",
            description: plan.description || "",
            icon: plan.icon || "",
            monthlyPrice: plan.monthlyPrice || 0,
            annualPrice: plan.annualPrice || 0,
            permissions: plan.permissions || {},
            features: plan.features || [],
          },
          status: "active",
          billingCycle: transaction.billingCycle,
          startDate,
          endDate,
          autoRenew: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return res.status(200).json({
        success: true,
        message: "Payment verified & subscription created successfully",
        data: {
          transactionId,
          paymentIntentId: payment_intent_id,
          chargeId: charge?.id || null,
          status: paymentIntent.status,
          subscription: newSubscription[0],
        },
      });
    } else {
      // Payment failed
      await db.update(transactions)
        .set({
          status: "failed",
          metadata: {
            status: paymentIntent.status,
            error: paymentIntent.last_payment_error?.message || "Unknown error",
          },
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, transactionId));

      return res.status(400).json({
        success: false,
        message: "Payment not completed",
        data: {
          status: paymentIntent.status,
        },
      });
    }
  } catch (error: any) {
    console.error("Error verifying Stripe payment:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message || error,
    });
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
