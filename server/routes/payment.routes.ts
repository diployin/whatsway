import {
  getAllProviders,
  getActiveProviders,
  getProviderById,
  getProviderByKey,
  createProvider,
  updateProvider,
  toggleProviderStatus,
  deleteProvider,
} from "../controllers/payment.providers.controller";

// Transactions Controllers
import {
  getAllTransactions,
  getTransactionById,
  getTransactionsByUserId,
  createTransaction,
  updateTransactionStatus,
  completeTransaction,
  refundTransaction,
  initiatePayment,
  verifyRazorpayPayment,
  verifyStripePayment,
  getPaymentStatus,
  getTransactionStats,
  exportTransactions,
} from "../controllers/transactions.controller";

// Subscriptions Controllers
import {
  getAllSubscriptions,
  getSubscriptionById,
  getSubscriptionsByUserId,
  getActiveSubscriptionByUserId,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  toggleAutoRenew,
  checkExpiredSubscriptions,
} from "../controllers/subscriptions.controller";
import type { Express } from "express";

export function registerPaymentsRoutes(app: Express) {
  // ==================== PAYMENT PROVIDERS ROUTES ====================

  // GET all payment providers
  app.get("/api/payment-providers", getAllProviders);

  // GET active payment providers only
  app.get("/api/payment-providers/active", getActiveProviders);

  // GET single payment provider by ID
  app.get("/api/payment-providers/:id", getProviderById);

  // GET payment provider by key
  app.get("/api/payment-providers/key/:key", getProviderByKey);

  // POST create new payment provider
  app.post("/api/payment-providers", createProvider);

  // PUT update payment provider
  app.put("/api/payment-providers/:id", updateProvider);

  // PATCH toggle payment provider status
  app.patch("/api/payment-providers/:id/toggle-status", toggleProviderStatus);

  // DELETE payment provider
  app.delete("/api/payment-providers/:id", deleteProvider);

  // ==================== TRANSACTIONS ROUTES ====================

  // GET all transactions
  app.get("/api/transactions", getAllTransactions);

  app.get("/api/transactions/stats", getTransactionStats);

  app.get("/api/transactions/export", exportTransactions);

  // GET single transaction by ID
  app.get("/api/transactions/:id", getTransactionById);

  // GET transactions by user ID
  app.get("/api/transactions/user/:userId", getTransactionsByUserId);

  // POST create transaction (initiate payment)
  app.post("/api/transactions", createTransaction);

  // PATCH update transaction status
  app.patch("/api/transactions/:id/status", updateTransactionStatus);

  // POST complete transaction and create subscription
  app.post("/api/transactions/:id/complete", completeTransaction);

  // POST refund transaction
  app.post("/api/transactions/:id/refund", refundTransaction);

  app.post("/api/payment/initiate", initiatePayment);

  // POST - Verify Razorpay payment after user completes payment
  app.post("/api/payment/verify/razorpay", verifyRazorpayPayment);

  // POST - Verify Stripe payment after user completes payment
  app.post("/api/payment/verify/stripe", verifyStripePayment);

  // GET - Check payment/transaction status
  app.get("/api/payment/status/:transactionId", getPaymentStatus);

  // ==================== SUBSCRIPTIONS ROUTES ====================

  // GET all subscriptions
  app.get("/api/subscriptions", getAllSubscriptions);

  // GET single subscription by ID
  app.get("/api/subscriptions/:id", getSubscriptionById);

  // GET subscriptions by user ID
  app.get("/api/subscriptions/user/:userId", getSubscriptionsByUserId);

  // GET active subscription by user ID
  app.get(
    "/api/subscriptions/user/:userId/active",
    getActiveSubscriptionByUserId
  );

  // POST create subscription
  app.post("/api/subscriptions", createSubscription);

  // PUT update subscription
  app.put("/api/subscriptions/:id", updateSubscription);

  // PATCH cancel subscription
  app.patch("/api/subscriptions/:id/cancel", cancelSubscription);

  // POST renew subscription
  app.post("/api/subscriptions/:id/renew", renewSubscription);

  // PATCH toggle auto-renew
  app.patch("/api/subscriptions/:id/auto-renew", toggleAutoRenew);

  // POST check and update expired subscriptions (cron job endpoint)
  app.post("/api/subscriptions/check-expired", checkExpiredSubscriptions);
}
