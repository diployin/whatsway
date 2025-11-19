export interface PlanPermissions {
  channel: string;
  contacts: string;
  automation: string;
}
export interface Feature {
  name: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  icon: string;
  popular: boolean;
  badge: string;
  color: string;
  buttonColor: string;
  monthlyPrice: string;
  annualPrice: string;
  permissions: PlanPermissions;
  features: Feature[];
  createdAt: string;
  updatedAt: string;
}

export interface PlansDataTypes {
  success: boolean;
  data: Plan[];
}

// Payment

export interface PaymentConfig {
  apiKey: string;
  apiSecret: string;
  apiKeyTest: string;
  apiSecretTest: string;
  isLive: boolean;
}

export interface PaymentProvider {
  id: string;
  name: string;
  providerKey: string;
  description: string;
  logo: string;
  isActive: boolean;
  config: PaymentConfig;
  supportedCurrencies: string[];
  supportedMethods: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProvidersResponse {
  success: boolean;
  data: PaymentProvider[];
}

// payment  PaymentInitiationData

export interface PaymentInitiationData {
  transactionId: string;
  provider: string; // e.g. "stripe" or "razorpay"
  amount: number;
  currency: string;
  orderId: string | null;
  paymentIntentId: string;
  clientSecret: string;
  publishableKey: string;
}

export interface PaymentInitiationResponse {
  success: boolean;
  message: string;
  data: PaymentInitiationData;
}

// *******************************
export interface SubscriptionResponse {
  success: boolean;
  data: SubscriptionData[];
}

export interface SubscriptionData {
  subscription: Subscription;
  user: SubscriptionUser;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planData: PlanData;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: string; // ISO string
  endDate: string | null; // if free trials or cancelled
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "expired"
  | "cancelled";
export type BillingCycle = "monthly" | "yearly" | "annual";

export interface PlanData {
  name: string;
  features: PlanFeature[];
  annualPrice: string;
  description: string;
  permissions: PlanPermissions;
  monthlyPrice: string;
}

export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface PlanPermissions {
  channel: string;
  contacts: string;
  automation: string;
}

export interface SubscriptionUser {
  id: string;
  username: string;
}
