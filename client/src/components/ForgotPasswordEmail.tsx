import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onEmailSent: (email: string) => void;
}

export default function ForgotPasswordEmail({ onEmailSent }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setError(null);
    if (!email) return setError("Email is required");

    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
      toast({ title: "OTP sent!", description: "Check your email for the code." });
      onEmailSent(email);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-lg font-bold mb-4">Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white py-2 rounded mt-2"
      >
        Send OTP
      </button>
    </div>
  );
}
