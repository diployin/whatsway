import { useState, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  email: string;
  onVerified: () => void;
}

export default function VerifyOtp({ email, onVerified }: Props) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]); // 6-digit OTP
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only numbers
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move focus to next box
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = inputRefs.current[index - 1];
      prev?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    setError(null);
    if (otpCode.length < 6) return setError("Please enter the 6-digit OTP");

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/verify-otp", { email, otpCode });
      toast({ title: "OTP verified!", description: "You can now reset your password." });
      onVerified();
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Verify OTP</CardTitle>
        <CardDescription>Enter the 6-digit code sent to your email</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={(el) => (inputRefs.current[index] = el!)}
              className="w-12 h-12 text-center text-lg border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </Button>
      </CardContent>
    </Card>
  );
}
