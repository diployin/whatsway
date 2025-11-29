import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResetPassword from "@/components/ResetPassword";
import VerifyOtp from "@/components/VerifyOtp";
import ForgotPasswordEmail from "@/components/ForgotPasswordEmail";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getFcmToken, initFirebase } from "@/lib/firebase";
import { AppSettings } from "@/types/types";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  fcmToken: z.string().optional(),
});

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [step, setStep] = useState<"login" | "forgot" | "verify" | "reset">(
    "login"
  );
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const { data: brandSettings } = useQuery<AppSettings>({
    queryKey: ["/api/brand-settings"],
    queryFn: () => fetch("/api/brand-settings").then((res) => res.json()),
    staleTime: 5 * 60 * 1000,
  });

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      console.log(data);
      const response = await apiRequest("POST", "/api/auth/login", data);

      let json: any;
      try {
        json = await response.json();
      } catch {
        json = {};
      }

      if (!response.ok) {
        throw new Error(json?.error || "Login failed. Please try again.");
      }

      return json;
    },
    onSuccess: () => {
      try {
        sessionStorage.setItem("fromLogin", "true");
      } catch (e) {
        console.error("Failed to set sessionStorage:", e);
      }

      // Now redirect
      window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      console.log("error", error);
      let errorMessage = error?.message || "Login failed. Please try again.";

      if (error.message.includes("401")) {
        errorMessage = "Invalid username or password";
      } else if (error.message.includes("403")) {
        errorMessage = "Account is inactive. Please contact administrator.";
      }

      setError(errorMessage);
    },
  });
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setError(null);

    let fcmToken: string | null = null; // optional

    try {
      // Fetch firebase config
      const res = await fetch("/api/firebase");
      const firebaseConfig = await res.json();

      console.log(firebaseConfig);

      // Initialize Firebase one time
      initFirebase(firebaseConfig);

      // Try to get FCM token
      fcmToken = await getFcmToken(firebaseConfig.vapidKey);
      console.log("FCM Token received:", fcmToken);
    } catch (err) {
      console.warn("FCM token error (ignored):", err);
      // Do not break login — fcmToken stays null
    }

    const finalPayload = {
      ...data,
      fcmToken: fcmToken ?? undefined, // optional
    };

    console.log("Final payload:", finalPayload);

    // Continue login
    loginMutation.mutate(finalPayload);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6">
        <div className="max-w-md w-full space-y-8 mt-[50px]">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {brandSettings?.logo ? (
                <img
                  src={brandSettings?.logo}
                  alt="Logo"
                  className="h-16  object-contain"
                />
              ) : (
                <div className="bg-green-800 text-primary-foreground rounded-full p-3">
                  <MessageSquare className="h-8 w-8" />
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {"Welcome Back"}
            </h1>
            <p className="mt-2 text-gray-600">
              Sign in to your WhatsApp marketing dashboard
            </p>
          </div>

          <Card className="py-4">
            <CardContent>
              {step === "login" && (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter your username"
                              autoComplete="username"
                              autoFocus
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Enter your password"
                              autoComplete="current-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </Button>

                    <div className="mt-2 text-center">
                      <button
                        type="button"
                        className="text-green-600 hover:text-green-700 underline"
                        onClick={() => setStep("forgot")}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </form>
                </Form>
              )}

              {step === "forgot" && (
                <ForgotPasswordEmail
                  onEmailSent={(sentEmail) => {
                    setEmail(sentEmail);
                    setStep("verify");
                  }}
                />
              )}

              {step === "verify" && (
                <VerifyOtp
                  email={email}
                  onVerified={(otp) => {
                    setOtpCode(otp);
                    setStep("reset");
                  }}
                />
              )}

              {step === "reset" && (
                <ResetPassword
                  email={email}
                  otpCode={otpCode}
                  onReset={() => setStep("login")}
                />
              )}

              {step === "login" && (
                <>
                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      Don't have an account?{" "}
                      <Link
                        to="/signup"
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        Sign up for free
                      </Link>
                    </p>
                  </div>

                  <div className="mt-6 space-y-4">
                    {/* Admin Credentials */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                      <p className="text-sm font-semibold text-purple-900 text-center mb-2">
                        🔐 Admin Demo
                      </p>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700 text-center">
                          Username:{" "}
                          <code className="bg-white px-2 py-1 rounded border border-purple-200 font-mono">
                            demoadmin
                          </code>
                        </p>
                        <p className="text-sm text-gray-700 text-center">
                          Password:{" "}
                          <code className="bg-white px-2 py-1 rounded border border-purple-200 font-mono">
                            Admin@123
                          </code>
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      {/* User Credentials */}
                      <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-green-900 text-center mb-2">
                          👤 Demo User1
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-700 text-center">
                            Username:{" "}
                            <code className="bg-white px-2 py-1 rounded border border-green-200 font-mono">
                              demouser
                            </code>
                          </p>
                          <p className="text-sm text-gray-700 text-center">
                            Password:{" "}
                            <code className="bg-white px-2 py-1 rounded border border-green-200 font-mono">
                              Demo@12345
                            </code>
                          </p>
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-green-900 text-center mb-2">
                          👤 Demo User2
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-700 text-center">
                            Username:{" "}
                            <code className="bg-white px-2 py-1 rounded border border-green-200 font-mono">
                              raman
                            </code>
                          </p>
                          <p className="text-sm text-gray-700 text-center">
                            Password:{" "}
                            <code className="bg-white px-2 py-1 rounded border border-green-200 font-mono">
                              Raman@123
                            </code>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Optional: Info note */}
                    <p className="text-xs text-gray-500 text-center italic">
                      💡 Choose admin for full access or user for limited
                      permissions
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          {/* Trust Indicators */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure Login</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
