import { useState } from "react";
import Header from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Webhook, Key, Users, User } from "lucide-react";
import { ChannelSettings } from "@/components/settings/ChannelSettings";
import { WebhookSettings } from "@/components/settings/WebhookSettings";
import { TeamSettings } from "@/components/settings/TeamSettings";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { ApiKeySettings } from "@/components/settings/ApiKeySettings";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("whatsapp");

  return (
    <div className="flex-1 dots-bg min-h-screen">
      <Header 
        title="Settings" 
        subtitle="Manage your WhatsApp business configuration"
      />

      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="whatsapp" className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center space-x-2">
              <Webhook className="w-4 h-4" />
              <span>Webhooks</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Team</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Account</span>
            </TabsTrigger>
          </TabsList>

          {/* WhatsApp Numbers Tab */}
          <TabsContent value="whatsapp">
            <ChannelSettings />
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            <WebhookSettings />
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api">
            <ApiKeySettings />
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <TeamSettings />
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}