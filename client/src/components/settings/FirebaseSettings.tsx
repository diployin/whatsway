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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Settings, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";

export default function FirebaseSettings() {
  const { t } = useTranslation(); // Add translation hook
  const { toast } = useToast();
  const [firebaseData, setFirebaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);

  // Fetch Firebase Config
  const fetchFirebase = async () => {
    try {
      const res1 = await apiRequest("GET", "/api/firebase");
      const res = res1.json();
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
          await apiRequest("PUT",`/api/firebase/${firebaseData.id}`, data);
      } else {
        // Create
         await apiRequest("POST","/api/firebase", data);
      }

      toast({ title: t("settings.firebase.toast.success") });
      setOpenModal(false);
      fetchFirebase();
    } catch (err: any) {
      toast({
        title: t("settings.firebase.toast.error"),
        description:
          err?.response?.data?.message ||
          t("settings.firebase.toast.errorDescription"),
        variant: "destructive",
      });
    }
  };

  if (loading)
    return <p className="p-10 text-center">{t("settings.firebase.loading")}</p>;

  return (
    <div className="p-6">
      {/* CARD */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Settings className="w-5 h-5 mr-2" />
              {t("settings.firebase.title")}
            </CardTitle>

            <Button
              onClick={() => setOpenModal(true)}
              className="flex items-center text-xs h-7 rounded-sm px-2 sm:h-9 sm:rounded-md sm:px-3"
              size="sm"
            >
              <Edit className="w-4 h-4" />
              {t("settings.firebase.editButton")}
            </Button>
          </div>

          <CardDescription className="mt-2 text-sm sm:text-base">
            {t("settings.firebase.description")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="border border-gray-200 rounded-lg p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: t("settings.firebase.fields.apiKey"), key: "apiKey" },
                {
                  label: t("settings.firebase.fields.authDomain"),
                  key: "authDomain",
                },
                {
                  label: t("settings.firebase.fields.projectId"),
                  key: "projectId",
                },
                {
                  label: t("settings.firebase.fields.storageBucket"),
                  key: "storageBucket",
                },
                {
                  label: t("settings.firebase.fields.messagingSenderId"),
                  key: "messagingSenderId",
                },
                { label: t("settings.firebase.fields.appId"), key: "appId" },
                {
                  label: t("settings.firebase.fields.measurementId"),
                  key: "measurementId",
                },
                {
                  label: t("settings.firebase.fields.privateKey"),
                  key: "privateKey",
                },
                {
                  label: t("settings.firebase.fields.clientEmail"),
                  key: "clientEmail",
                },
                {
                  label: t("settings.firebase.fields.vapidKey"),
                  key: "vapidKey",
                },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <Label className="font-medium">{item.label}</Label>
                  <div className="p-3 bg-gray-50 border rounded text-sm break-all">
                    {firebaseData?.[item.key] ||
                      t("settings.firebase.notConfigured")}
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
                {firebaseData
                  ? t("settings.firebase.status.active")
                  : t("settings.firebase.status.notFound")}
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
  const { t } = useTranslation(); // Add translation hook
  const [formData, setFormData] = useState({
    apiKey: firebase?.apiKey || "",
    authDomain: firebase?.authDomain || "",
    projectId: firebase?.projectId || "",
    storageBucket: firebase?.storageBucket || "",
    messagingSenderId: firebase?.messagingSenderId || "",
    appId: firebase?.appId || "",
    measurementId: firebase?.measurementId || "",
    privateKey: firebase?.privateKey || "",
    clientEmail: firebase?.clientEmail || "",
    vapidKey: firebase?.vapidKey || "",
  });

  const handleChange = (name: string, value: string) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("settings.firebase.modal.title")}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 max-h-[70vh] overflow-y-auto p-1">
          {[
            { key: "apiKey", label: t("settings.firebase.fields.apiKey") },
            {
              key: "authDomain",
              label: t("settings.firebase.fields.authDomain"),
            },
            {
              key: "projectId",
              label: t("settings.firebase.fields.projectId"),
            },
            {
              key: "storageBucket",
              label: t("settings.firebase.fields.storageBucket"),
            },
            {
              key: "messagingSenderId",
              label: t("settings.firebase.fields.messagingSenderId"),
            },
            { key: "appId", label: t("settings.firebase.fields.appId") },
            {
              key: "measurementId",
              label: t("settings.firebase.fields.measurementId"),
            },
            {
              key: "privateKey",
              label: t("settings.firebase.fields.privateKey"),
            },
            {
              key: "clientEmail",
              label: t("settings.firebase.fields.clientEmail"),
            },
            { key: "vapidKey", label: t("settings.firebase.fields.vapidKey") },
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
            {t("settings.firebase.modal.cancel")}
          </Button>
          <Button onClick={() => onSave(formData)}>
            {t("settings.firebase.modal.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
