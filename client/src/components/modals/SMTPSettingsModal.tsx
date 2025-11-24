import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SMTPSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingData: any;
  onSuccess: () => void;
}

export default function SMTPSettingsModal({
  open,
  onOpenChange,
  existingData,
  onSuccess,
}: SMTPSettingsModalProps) {
  const { toast } = useToast();

  const [form, setForm] = useState({
    host: existingData.host || "",
    port: existingData.port || "",
    secure: existingData.secure === "true",
    user: existingData.user || "",
    password: "",
    fromName: existingData.fromName || "",
    fromEmail: existingData.fromEmail || "",
    logo: existingData.logo || "",
  });

  const [loading, setLoading] = useState(false);

  const updateField = (key: string, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async () => {
    if (!form.host || !form.port || !form.user) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/smtpConfig", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save SMTP config");

      toast({
        title: "Success",
        description: "SMTP configuration updated successfully!",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update SMTP config",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update SMTP Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Host */}
          <div>
            <Label>SMTP Host *</Label>
            <Input
              value={form.host}
              onChange={(e) => updateField("host", e.target.value)}
              placeholder="smtp.gmail.com"
            />
          </div>

          {/* Port */}
          <div>
            <Label>Port *</Label>
            <Input
              value={form.port}
              onChange={(e) => updateField("port", e.target.value)}
              placeholder="587"
              type="number"
            />
          </div>

          {/* Secure */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={form.secure}
              onChange={(e) => updateField("secure", e.target.checked)}
            />
            <Label>Use TLS (Secure)</Label>
          </div>

          {/* User */}
          <div>
            <Label>SMTP Username *</Label>
            <Input
              value={form.user}
              onChange={(e) => updateField("user", e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <Label>Password (leave blank to keep existing)</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* From Name */}
          <div>
            <Label>From Name *</Label>
            <Input
              value={form.fromName}
              onChange={(e) => updateField("fromName", e.target.value)}
              placeholder="Your Company"
            />
          </div>

          {/* From Email */}
          <div>
            <Label>From Email *</Label>
            <Input
              value={form.fromEmail}
              onChange={(e) => updateField("fromEmail", e.target.value)}
              placeholder="no-reply@company.com"
            />
          </div>

          {/* Logo */}
          <div>
            <Label>Logo URL</Label>
            <Input
              value={form.logo}
              onChange={(e) => updateField("logo", e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
