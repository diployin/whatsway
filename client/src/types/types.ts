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
