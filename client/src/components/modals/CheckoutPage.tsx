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
} from "lucide-react";
import { Plan } from "@/types/types";
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
import { useAuth } from "@/contexts/auth-context";

interface CheckoutModalProps {
  plan: Plan;
  isAnnual: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  plan,
  isAnnual,
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<
    "razorpay" | "stripe" | null
  >(null);
  const [loading, setLoading] = useState(false);

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Zap,
    Crown,
    Rocket,
    Star,
    Building,
  };

  const IconComponent = iconMap[plan.icon] || Zap;

  const { isAuthenticated, isLoading, user } = useAuth();

  console.log("isAuthenticated user", user);

  const price = isAnnual
    ? Number.parseFloat(plan.annualPrice)
    : Number.parseFloat(plan.monthlyPrice);
  const tax = price * 0.18; // 18% GST
  const total = price + tax;

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate payment API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Payment Successful!",
        description: `Welcome to ${plan.name} plan. Your subscription is now active.`,
      });

      onOpenChange(false);
      // Redirect or handle success
    } catch (error) {
      console.error(error);
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        {/* Order Summary Section */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Order Summary
          </h2>

          {/* Plan Card - Compact */}
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

          {/* Included Features - Compact */}
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

          {/* Price Breakdown - Compact */}
          <div className="space-y-2 sm:space-y-2.5 pt-3 sm:pt-4">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">
                ${price.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Tax (18% GST)</span>
              <span className="font-medium text-gray-900">
                ${tax.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-base sm:text-lg font-bold pt-2 sm:pt-3 border-t">
              <span className="text-gray-900">Total</span>
              <span className="text-blue-600">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selection - Compact */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">
              Select Payment Method:
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* Razorpay Option - Smaller */}
              <button
                onClick={() => setPaymentMethod("razorpay")}
                className={`p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl transition-all ${
                  paymentMethod === "razorpay"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <SiRazorpay className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                  <span className="text-[10px] sm:text-xs font-medium text-gray-900">
                    Razorpay
                  </span>
                  {paymentMethod === "razorpay" && (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  )}
                </div>
              </button>

              {/* Stripe Option - Smaller */}
              <button
                onClick={() => setPaymentMethod("stripe")}
                className={`p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl transition-all ${
                  paymentMethod === "stripe"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <FaCcStripe className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
                  <span className="text-[10px] sm:text-xs font-medium text-gray-900">
                    Stripe
                  </span>
                  {paymentMethod === "stripe" && (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Pay Button - Compact */}
          <Button
            onClick={handlePayment}
            disabled={loading || !paymentMethod}
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
                Pay ${total.toFixed(2)}
              </>
            )}
          </Button>

          {/* Security Badge - Compact */}
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
