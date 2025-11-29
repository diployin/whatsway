import React, { useState } from "react";
import {
  Check,
  Lock,
  Shield,
  Zap,
  Crown,
  Rocket,
  Star,
  Building,
  AlertCircle,
} from "lucide-react";
import { PaymentProvider, Plan } from "@/types/types";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SiRazorpay } from "react-icons/si";
import { FaCcStripe } from "react-icons/fa";
import { apiRequest } from "@/lib/queryClient";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";

interface CheckoutModalProps {
  plan: Plan;
  isAnnual: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | undefined;
  paymentProviders: PaymentProvider[] | undefined;
  isLoadingProviders: boolean;
}

interface PaymentInitiationData {
  transactionId: string;
  provider: string;
  amount: number;
  currency: string;
  orderId: string | null;
  paymentIntentId: string;
  clientSecret: string;
  publishableKey: string;
  keyId: string;
}

interface PaymentInitiationResponse {
  success: boolean;
  message: string;
  data: PaymentInitiationData;
}

// Razorpay declaration
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Stripe Payment Form Component
const StripePaymentForm: React.FC<{
  transactionId: string;
  amount: number;
  planName: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}> = ({ transactionId, amount, planName, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      // Confirm payment WITHOUT redirect
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        onError(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment successful - verify on backend
        const verifyResponse = await apiRequest(
          "POST",
          "/api/payment/verify/stripe",
          {
            transactionId,
            payment_intent_id: paymentIntent.id,
          }
        );

        const verifyData = await verifyResponse.json();

        if (verifyData.success) {
          onSuccess();
        } else {
          onError("Payment verification failed");
        }
      }
    } catch (error: any) {
      onError(error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 mb-2">
          You are paying <strong>${(amount / 100).toFixed(2)}</strong> for{" "}
          <strong>{planName}</strong>
        </p>
      </div>

      <PaymentElement />

      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </div>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Pay ${(amount / 100).toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  plan,
  isAnnual,
  open,
  onOpenChange,
  userId,
  paymentProviders,
  isLoadingProviders,
}) => {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] =
    useState<PaymentProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"select" | "pay">("select");
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");

  const { currencySymbol, currency } = useAuth();
  const [, setLocation] = useLocation();

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Zap,
    Crown,
    Rocket,
    Star,
    Building,
  };

  const IconComponent = iconMap[plan.icon] || Zap;

  const price = isAnnual
    ? parseFloat(plan.annualPrice)
    : parseFloat(plan.monthlyPrice);

  const total = price;

  const activeProviders = paymentProviders?.filter((p) => p.isActive) || [];

  const getProviderIcon = (providerKey: string) => {
    const key = providerKey.toLowerCase();
    switch (key) {
      case "razorpay":
        return <SiRazorpay className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />;
      case "stripe":
        return <FaCcStripe className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />;
      default:
        return <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600" />;
    }
  };

  const getProviderColor = (providerKey: string) => {
    const key = providerKey.toLowerCase();
    switch (key) {
      case "razorpay":
        return {
          border: "border-blue-500",
          bg: "bg-blue-50",
          check: "text-blue-600",
        };
      case "stripe":
        return {
          border: "border-purple-500",
          bg: "bg-purple-50",
          check: "text-purple-600",
        };
      default:
        return {
          border: "border-gray-500",
          bg: "bg-gray-50",
          check: "text-gray-600",
        };
    }
  };

  // Initialize Razorpay Payment
  const initiateRazorpayPayment = async (
    paymentData: PaymentInitiationData
  ) => {
    try {
      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });

      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "Your Company Name",
        description: `${plan.name} Plan - ${isAnnual ? "Annual" : "Monthly"}`,
        order_id: paymentData.orderId,
        handler: async function (response: any) {
          try {
            console.log("Razorpay payment success:", response);

            // ✅ Verify payment on backend
            const verifyResponse = await apiRequest(
              "POST",
              "/api/payment/verify/razorpay",
              {
                transactionId: paymentData.transactionId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            const verifyData = await verifyResponse.json();

            console.log("Verification response:", verifyData);

            if (verifyData.success) {
              // ✅ Show success toast
              toast({
                title: "Payment Successful!",
                description: `Welcome to ${plan.name} plan. Your subscription is now active.`,
              });

              // ✅ Close modal first
              onOpenChange(false);

              setTimeout(() => {
                window.location.reload();
              }, 100);

              // ✅ Use setTimeout to ensure modal closes before navigation
              setTimeout(() => {
                setLocation("/plan-upgrade");
              }, 100);
            } else {
              throw new Error(
                verifyData.message || "Payment verification failed"
              );
            }
          } catch (error: any) {
            console.error("Payment verification error:", error);
            toast({
              title: "Payment Verification Failed",
              description: error.message || "Please contact support",
              variant: "destructive",
            });

            // ✅ Redirect to plans page even on error to show status
            setTimeout(() => {
              onOpenChange(false);
              setLocation("/plans");
            }, 100);
          }
        },
        prefill: {
          email: userId,
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal dismissed");
            setLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process",
              variant: "destructive",
            });
          },
          // ✅ Prevent backdrop click to close
          escape: true,
          backdropclose: false,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error("Razorpay initialization error:", error);
      setLoading(false);
      toast({
        title: "Payment Failed",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    if (!selectedProvider) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    onOpenChange(false);

    try {
      const paymentData = {
        userId: userId,
        planId: plan.id,
        paymentProviderId: selectedProvider.id,
        currency: currency,
        billingCycle: isAnnual ? "annual" : "monthly",
      };

      const response = await apiRequest(
        "POST",
        "/api/payment/initiate",
        paymentData
      );
      const data: PaymentInitiationResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Payment initiation failed");
      }

      const provider = data.data.provider.toLowerCase();

      if (provider === "stripe") {
        // Load Stripe and show payment form
        const stripe = await loadStripe(data.data.publishableKey);
        setStripePromise(Promise.resolve(stripe));
        setClientSecret(data.data.clientSecret);
        setTransactionId(data.data.transactionId);
        setPaymentStep("pay");
        setLoading(false);
      } else if (provider === "razorpay") {
        await initiateRazorpayPayment(data.data);
        setLoading(false);
      } else {
        throw new Error(`Unsupported payment provider: ${provider}`);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setLoading(false);
      toast({
        title: "Payment Failed",
        description: error.message || "Please try again or contact support",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setPaymentStep("select");
    setStripePromise(null);
    setClientSecret("");
    setTransactionId("");
  };

  const handleStripeSuccess = () => {
    toast({
      title: "Payment Successful!",
      description: `Welcome to ${plan.name} plan. Your subscription is now active.`,
    });

    // ✅ Close modal first
    onOpenChange(false);

    // ✅ Navigate after modal closes
    setTimeout(() => {
      setLocation("/billing");
    }, 100);
  };

  const handleStripeError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
    setLoading(false);
  };

  // Render Stripe Payment Form
  if (paymentStep === "pay" && stripePromise && clientSecret) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-md p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Complete Payment
              </h2>
              <Button variant="ghost" size="sm" onClick={handleBack}>
                ← Back
              </Button>
            </div>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#3b82f6",
                  },
                },
              }}
            >
              <StripePaymentForm
                transactionId={transactionId}
                amount={Math.round(total * 100)}
                planName={plan.name}
                onSuccess={handleStripeSuccess}
                onError={handleStripeError}
              />
            </Elements>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Order Summary
          </h2>

          {/* Plan Card */}
          <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-white rounded-lg flex-shrink-0">
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                  {plan.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {plan.description}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm pt-2 sm:pt-3 border-t border-blue-200">
              <span className="text-gray-600">Billing Period:</span>
              <span className="font-semibold text-gray-900">
                {isAnnual ? "Annual" : "Monthly"}
              </span>
            </div>
          </div>

          {/* Included Features */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">
              Included Features:
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {plan.permissions && (
                <>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                    <span className="truncate">
                      {plan.permissions.contacts} contacts
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                    <span className="truncate">
                      {plan.permissions.channel} WhatsApp channels
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                    <span className="truncate">
                      {plan.permissions.automation} automation
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 sm:space-y-2.5 pt-3 sm:pt-4">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">
                {currencySymbol}
                {price.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-base sm:text-lg font-bold pt-2 sm:pt-3 border-t">
              <span className="text-gray-900">Total</span>
              <span className="text-blue-600">
                {currencySymbol}
                {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">
              Select Payment Method:
            </h3>

            {(() => {
              if (isLoadingProviders) {
                return (
                  <div className="flex items-center justify-center p-8">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                );
              }
              if (activeProviders.length === 0) {
                return (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          No payment methods available
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Please contact support to enable payment gateways.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  className={`grid gap-2 sm:gap-3 ${
                    activeProviders.length === 1 ? "grid-cols-1" : "grid-cols-2"
                  }`}
                >
                  {activeProviders.map((provider) => {
                    const colors = getProviderColor(provider.providerKey);
                    const isSelected = selectedProvider?.id === provider.id;

                    return (
                      <button
                        key={provider.id}
                        onClick={() => setSelectedProvider(provider)}
                        className={`p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl transition-all ${
                          isSelected
                            ? `${colors.border} ${colors.bg}`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                          {getProviderIcon(provider.providerKey)}
                          <div className="text-center">
                            <span className="text-[10px] sm:text-xs font-medium text-gray-900 block">
                              {provider.name}
                            </span>
                            <div className="flex items-center gap-1 justify-center mt-0.5">
                              {provider.config.isLive ? (
                                <span className="text-[8px] sm:text-[10px] text-green-600 font-medium">
                                  Live Mode
                                </span>
                              ) : (
                                <span className="text-[8px] sm:text-[10px] text-orange-600 font-medium">
                                  Test Mode
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <Check
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${colors.check}`}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Pay Button */}
          <Button
            onClick={handlePayment}
            disabled={
              loading || !selectedProvider || activeProviders.length === 0
            }
            className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs sm:text-sm">Processing...</span>
              </div>
            ) : (
              <>
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Pay {currencySymbol}
                {total.toFixed(2)}
              </>
            )}
          </Button>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
            <span>30-day money-back guarantee</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
