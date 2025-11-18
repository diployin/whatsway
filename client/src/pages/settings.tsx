import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Smartphone,
  Webhook,
  Key,
  User,
  SettingsIcon,
  Database,
  BotIcon,
} from "lucide-react";
import { ChannelSettings } from "@/components/settings/ChannelSettings";
import { WebhookSettings } from "@/components/settings/WebhookSettings";
// import { AccountSettings } from "@/components/settings/AccountSettings";
import { ApiKeySettings } from "@/components/settings/ApiKeySettings";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import StorageSettings from "@/components/settings/StorageSettings";
import AISettings from "@/components/settings/AISettings";
import { useAuth } from "@/contexts/auth-context";
import FirebaseSettings from "@/components/settings/FirebaseSettings";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general_setting");
  const { user } = useAuth();
  const isAdmin = user?.role === "superadmin";


  useEffect(() => {
  if (user?.role !== "superadmin") {
    setActiveTab("whatsapp");
  }
}, [user]);


  return (
    <div className="flex-1 dots-bg min-h-screen">
  <Header
    title="Settings"
    subtitle="Manage your WhatsApp business configuration"
  />

  <main className="p-6">
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="space-y-7"
    >
      <TabsList className="grid w-full grid-cols-6">

        {/* SUPERADMIN ONLY */}
        {user?.role === "superadmin" && (
          <>
            <TabsTrigger
              value="general_setting"
              className="flex items-center space-x-2"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>General Setting</span>
            </TabsTrigger>

            <TabsTrigger
              value="firebase_setting"
              className="flex items-center space-x-2"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Firebase Setting</span>
            </TabsTrigger>

            <TabsTrigger
              value="storage_setting"
              className="flex items-center space-x-2"
            >
              <Database className="w-4 h-4" />
              <span>Storage Setting</span>
            </TabsTrigger>
          </>
        )}

        {/* NON-SUPERADMIN ONLY */}
        {user?.role !== "superadmin" && (
          <>
            <TabsTrigger
              value="whatsapp"
              className="flex items-center space-x-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>WhatsApp</span>
            </TabsTrigger>

             <TabsTrigger
              value="ai_setting"
              className="flex items-center space-x-2"
            >
              <BotIcon className="w-4 h-4" />
              <span>AI Settings</span>
            </TabsTrigger>

            <TabsTrigger
              value="webhooks"
              className="flex items-center space-x-2"
            >
              <Webhook className="w-4 h-4" />
              <span>Webhooks</span>
            </TabsTrigger>
          </>
        )}
      </TabsList>

      {/* SUPERADMIN TAB CONTENT */}
      {user?.role === "superadmin" && (
        <>
          <TabsContent value="general_setting">
            <GeneralSettings />
          </TabsContent>

          <TabsContent value="firebase_setting">
            <FirebaseSettings />
          </TabsContent>

          <TabsContent value="storage_setting">
            <StorageSettings />
          </TabsContent>
        </>
      )}

      {/* NON-SUPERADMIN TAB CONTENT */}
      {user?.role !== "superadmin" && (
        <>
          <TabsContent value="ai_setting">
            <AISettings />
          </TabsContent>

          <TabsContent value="whatsapp">
            <ChannelSettings />
          </TabsContent>

          <TabsContent value="webhooks">
            <WebhookSettings />
          </TabsContent>
        </>
      )}

      {/* API Keys Tab (if needed for everyone) */}
      <TabsContent value="api">
        <ApiKeySettings />
      </TabsContent>
    </Tabs>
  </main>
</div>

  );
}
