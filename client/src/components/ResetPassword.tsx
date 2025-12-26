import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Props {
  email: string;
  otpCode: string;
  onReset: () => void;
}

export default function ResetPassword({ email, otpCode, onReset }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleReset = async () => {
    setError(null);
    if (!newPassword || !confirmPassword) return setError("All fields are required");
    if (newPassword !== confirmPassword) return setError("Passwords do not match");

    try {
      await apiRequest("POST", "/api/auth/reset-password", { email, otpCode, newPassword });
      toast({ title: "Password reset!", description: "You can now login." });
      onReset();
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-lg font-bold mb-4">Reset Password</h2>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleReset}
        className="w-full bg-green-600 text-white py-2 rounded mt-2"
      >
        Reset Password
      </button>
    </div>
  );
}
