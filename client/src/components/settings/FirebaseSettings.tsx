"use client";

import { useEffect, useState } from "react";
import axios from "axios";

// UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { Settings, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FirebaseSettings() {
  const { toast } = useToast();
  const [firebaseData, setFirebaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);

  // Fetch Firebase Config
  const fetchFirebase = async () => {
    try {
      const res = await axios.get("/api/firebase");
      setFirebaseData(res.data || null);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirebase();
  }, []);

  // Save / Update firebase settings
  const saveFirebase = async (data: any) => {
    try {
      if (firebaseData?.id) {
        // Update
        await axios.put(`/api/firebase/${firebaseData.id}`, data);
      } else {
        // Create
        await axios.post("/api/firebase", data);
      }

      toast({ title: "Firebase settings saved successfully!" });
      setOpenModal(false);
      fetchFirebase();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to save firebase settings",
        variant: "destructive",
      });
    }
  };

  if (loading) return <p className="p-10 text-center">Loading...</p>;

  return (
    <div className="p-6">

      {/* CARD */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Firebase Settings
            </CardTitle>

            <Button onClick={() => setOpenModal(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          <CardDescription>
            Manage Firebase configuration used for authentication & push notifications.
          </CardDescription>
        </CardHeader>

        <CardContent>

          <div className="border border-gray-200 rounded-lg p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {[
                { label: "API Key", key: "apiKey" },
                { label: "Auth Domain", key: "authDomain" },
                { label: "Project ID", key: "projectId" },
                { label: "Storage Bucket", key: "storageBucket" },
                { label: "Messaging Sender ID", key: "messagingSenderId" },
                { label: "App ID", key: "appId" },
                { label: "Measurement ID", key: "measurementId" },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <Label className="font-medium">{item.label}</Label>
                  <div className="p-3 bg-gray-50 border rounded text-sm break-all">
                    {firebaseData?.[item.key] || "Not configured"}
                  </div>
                </div>
              ))}

            </div>

            <div className="pt-4 border-t flex items-center space-x-2 text-sm text-gray-600">
              <div
                className={`w-2 h-2 rounded-full ${
                  firebaseData ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span>
                {firebaseData ? "Firebase Config Active" : "No Firebase Settings Found"}
              </span>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* EDIT MODAL */}
      <FirebaseModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={saveFirebase}
        firebase={firebaseData}
      />
    </div>
  );
}


// ============================================================
// 🔥 Modal Component
// ============================================================
const FirebaseModal = ({ open, onClose, onSave, firebase }: any) => {
  const [formData, setFormData] = useState({
    apiKey: firebase?.apiKey || "",
    authDomain: firebase?.authDomain || "",
    projectId: firebase?.projectId || "",
    storageBucket: firebase?.storageBucket || "",
    messagingSenderId: firebase?.messagingSenderId || "",
    appId: firebase?.appId || "",
    measurementId: firebase?.measurementId || "",
  });

  const handleChange = (name: string, value: string) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Firebase Settings</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 max-h-[70vh] overflow-y-auto p-1">

          {[
            { key: "apiKey", label: "API Key" },
            { key: "authDomain", label: "Auth Domain" },
            { key: "projectId", label: "Project ID" },
            { key: "storageBucket", label: "Storage Bucket" },
            { key: "messagingSenderId", label: "Messaging Sender ID" },
            { key: "appId", label: "App ID" },
            { key: "measurementId", label: "Measurement ID" },
          ].map((item, i) => (
            <div key={i} className="space-y-2">
              <Label>{item.label}</Label>
              <Input
                value={(formData as any)[item.key]}
                onChange={(e) => handleChange(item.key, e.target.value)}
                placeholder={item.label}
              />
            </div>
          ))}

        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
