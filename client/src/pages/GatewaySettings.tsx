import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiRazorpay } from "react-icons/si";
import { FaCcStripe } from "react-icons/fa";
import Header from "@/components/layout/header";
import { Loading } from "@/components/ui/loading";

interface PaymentProvider {
  id: string;
  name: string;
  providerKey: "razorpay" | "stripe";
  description: string;
  logo: string;
  isActive: boolean;
  config: {
    apiKey: string;
    apiSecret: string;
  };
  supportedCurrencies: string[];
  supportedMethods: string[];
}

interface PaymentFormData {
  provider: "razorpay" | "stripe";
  apiKey: string;
  apiSecret: string;
  isActive: boolean;
}

// Payment Gateway Schema
const paymentGatewaySchema = z.object({
  provider: z.enum(["razorpay", "stripe"], {
    required_error: "Payment provider is required",
  }),
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().min(1, "API Secret is required"),
  isActive: z.boolean().default(true),
});

type PaymentGatewayFormData = z.infer<typeof paymentGatewaySchema>;

export default function GatewaySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);

  // Fetch existing providers
  const { data: paymentProviders, isLoading: paymentLoading } = useQuery({
    queryKey: ["/api/payment-providers"],
    queryFn: async () => {
      const res = await fetch("/api/payment-providers");
      return res.json();
    },
  });

  // Payment Gateway Form
  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentGatewaySchema),
    defaultValues: {
      provider: "razorpay",
      apiKey: "",
      apiSecret: "",
      isActive: true,
    },
  });

  // Load selected provider data
  useEffect(() => {
    if (!paymentProviders?.data) return;

    const provider = paymentForm.getValues("provider");

    // Find provider record that matches selected provider
    const selectedProvider = paymentProviders.data.find(
      (p: PaymentProvider) => p.providerKey === provider
    );

    if (selectedProvider) {
      paymentForm.reset({
        provider: selectedProvider.providerKey,
        apiKey: selectedProvider.config.apiKey,
        apiSecret: selectedProvider.config.apiSecret,
        isActive: selectedProvider.isActive,
      });
    } else {
      // If no record exists for this provider, reset keys
      paymentForm.reset({
        provider,
        apiKey: "",
        apiSecret: "",
        isActive: false,
      });
    }
  }, [paymentForm.watch("provider"), paymentProviders]);

  // Upsert provider
  const upsertMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      // Transform data to API format
      const payload = {
        name: data.provider === "razorpay" ? "Razorpay" : "Stripe",
        providerKey: data.provider,
        description: "",
        logo: data.provider === "razorpay" ? "razorpay.png" : "stripe.png",
        isActive: data.isActive,
        config: {
          apiKey: data.apiKey,
          apiSecret: data.apiSecret,
        },
        supportedCurrencies: [],
        supportedMethods: [],
      };

      const res = await fetch("/api/payment-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save provider");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment gateway saved",
        description:
          data.message ||
          "Payment provider settings have been updated successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/payment-providers"],
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to save provider",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    upsertMutation.mutate(data);
  };

  if (paymentLoading) {
    return (
      <div className="flex-1 dots-bg min-h-screen">
        <Header
          title="Gateway Settings"
          subtitle="Configure payment gateway settings"
        />
        <main className="p-6">
          <Loading />
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 dots-bg min-h-screen">
      <Header
        title="Gateway Settings"
        subtitle="Configure payment gateway for your application"
      />

      <main className="p-6 space-y-6">
        {/* Stats Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Provider
                  </p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {paymentProviders?.data?.find(
                      (p: PaymentProvider) => p.isActive
                    )?.name || "None"}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Provider</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {paymentForm.watch("provider")}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  {paymentForm.watch("provider") === "razorpay" ? (
                    <SiRazorpay className="w-6 h-6 text-purple-600" />
                  ) : (
                    <FaCcStripe className="w-6 h-6 text-purple-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Providers
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {paymentProviders?.data?.length || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {paymentForm.watch("isActive") ? "Active" : "Inactive"}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    paymentForm.watch("isActive")
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full ${
                      paymentForm.watch("isActive")
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Gateway Configuration
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={paymentForm.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Provider Select */}
              <div className="space-y-2">
                <Label>Payment Provider *</Label>
                <Select
                  value={paymentForm.watch("provider")}
                  onValueChange={(value) =>
                    paymentForm.setValue("provider", value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="razorpay">
                      <div className="flex items-center gap-2">
                        <SiRazorpay className="w-4 h-4" />
                        <span>Razorpay</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="stripe">
                      <div className="flex items-center gap-2">
                        <FaCcStripe className="w-4 h-4" />
                        <span>Stripe</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {paymentForm.formState.errors.provider && (
                  <p className="text-red-500 text-sm">
                    {paymentForm.formState.errors.provider.message}
                  </p>
                )}
              </div>

              {/* API Keys */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* API Key */}
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key *</Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      {...paymentForm.register("apiKey")}
                      type={showApiKey ? "text" : "password"}
                      placeholder={
                        paymentForm.watch("provider") === "razorpay"
                          ? "rzp_test_xxx or rzp_live_xxx"
                          : "pk_test_xxx or pk_live_xxx"
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {paymentForm.formState.errors.apiKey && (
                    <p className="text-red-500 text-sm">
                      {paymentForm.formState.errors.apiKey.message}
                    </p>
                  )}
                </div>

                {/* API Secret */}
                <div className="space-y-2">
                  <Label htmlFor="apiSecret">API Secret *</Label>
                  <div className="relative">
                    <Input
                      id="apiSecret"
                      {...paymentForm.register("apiSecret")}
                      type={showApiSecret ? "text" : "password"}
                      placeholder={
                        paymentForm.watch("provider") === "razorpay"
                          ? "Enter Razorpay Secret Key"
                          : "Enter Stripe Secret Key"
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowApiSecret(!showApiSecret)}
                    >
                      {showApiSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {paymentForm.formState.errors.apiSecret && (
                    <p className="text-red-500 text-sm">
                      {paymentForm.formState.errors.apiSecret.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div>
                  <Label htmlFor="isActive" className="font-medium">
                    Enable Payment Gateway
                  </Label>
                  <p className="text-sm text-gray-600">
                    Activate payment processing for your application
                  </p>
                </div>
                <input
                  id="isActive"
                  type="checkbox"
                  {...paymentForm.register("isActive")}
                  checked={paymentForm.watch("isActive")}
                  onChange={(e) =>
                    paymentForm.setValue("isActive", e.target.checked)
                  }
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Provider Information */}
              {paymentForm.watch("provider") === "razorpay" && (
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900 flex items-center gap-2">
                      <SiRazorpay className="w-4 h-4" />
                      Razorpay Configuration
                    </h4>
                    <p className="text-sm text-blue-800">
                      Get your Razorpay credentials from the Razorpay Dashboard.
                      You'll need Key ID (starts with rzp_test_ or rzp_live_)
                      and Key Secret.
                    </p>
                    <a
                      href="https://dashboard.razorpay.com/app/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline inline-block"
                    >
                      Get Razorpay API Keys →
                    </a>
                  </div>
                </div>
              )}

              {paymentForm.watch("provider") === "stripe" && (
                <div className="p-4 border rounded-lg bg-purple-50">
                  <div className="space-y-2">
                    <h4 className="font-medium text-purple-900 flex items-center gap-2">
                      <FaCcStripe className="w-4 h-4" />
                      Stripe Configuration
                    </h4>
                    <p className="text-sm text-purple-800">
                      Get your Stripe credentials from the Stripe Dashboard.
                      You'll need Publishable Key (starts with pk_test_ or
                      pk_live_) and Secret Key.
                    </p>
                    <a
                      href="https://dashboard.stripe.com/apikeys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:underline inline-block"
                    >
                      Get Stripe API Keys →
                    </a>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  type="submit"
                  disabled={upsertMutation.isPending}
                  className="min-w-[200px]"
                >
                  {upsertMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
