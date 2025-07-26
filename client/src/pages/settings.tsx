import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  Smartphone, 
  Webhook, 
  Key, 
  User, 
  Users, 
  Shield,
  Bell,
  Zap,
  CheckCircle,
  XCircle,
  TestTube,
  Eye,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [testingConnection, setTestingConnection] = useState(false);
  const { toast } = useToast();

  const handleTestConnection = async (apiType: string) => {
    setTestingConnection(true);
    // Simulate API test
    setTimeout(() => {
      setTestingConnection(false);
      toast({
        title: "Connection test successful",
        description: `${apiType} API is working correctly.`,
      });
    }, 2000);
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
  };

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
          <TabsContent value="whatsapp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2" />
                  WhatsApp Numbers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cloud API Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">WhatsApp Cloud API</h3>
                      <p className="text-sm text-gray-600">Official Meta WhatsApp Business API</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number ID
                      </label>
                      <Input placeholder="123456789012345" defaultValue="123456789012345" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Account ID
                      </label>
                      <Input placeholder="987654321098765" defaultValue="987654321098765" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Access Token
                      </label>
                      <Input type="password" placeholder="EAAxxxxxxx..." defaultValue="EAAxxxxxxx..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook Verify Token
                      </label>
                      <Input placeholder="your_verify_token" defaultValue="your_verify_token" />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => handleTestConnection("Cloud API")}
                      disabled={testingConnection}
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      {testingConnection ? "Testing..." : "Test Connection"}
                    </Button>
                    <Button onClick={handleSaveSettings}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>

                {/* MM Lite API Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">MM Lite API</h3>
                      <p className="text-sm text-gray-600">Optimized for marketing campaigns</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign ID
                      </label>
                      <Input placeholder="campaign_123456" defaultValue="campaign_123456" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Endpoint
                      </label>
                      <Input placeholder="https://api.mmlite.com/v1" defaultValue="https://api.mmlite.com/v1" />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => handleTestConnection("MM Lite API")}
                      disabled={testingConnection}
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      {testingConnection ? "Testing..." : "Test Connection"}
                    </Button>
                    <Button onClick={handleSaveSettings}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Webhook className="w-5 h-5 mr-2" />
                  Webhook Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Inbound Webhooks */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Inbound Webhooks</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook URL
                      </label>
                      <Input 
                        placeholder="https://your-domain.com/webhook/inbound" 
                        defaultValue="https://your-domain.com/webhook/inbound"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secret Token
                      </label>
                      <Input 
                        type="password" 
                        placeholder="your_secret_token"
                        defaultValue="your_secret_token"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="inbound-enabled" defaultChecked />
                      <label htmlFor="inbound-enabled" className="text-sm text-gray-700">
                        Enable inbound webhooks
                      </label>
                    </div>
                  </div>
                </div>

                {/* Outbound Webhooks */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Outbound Webhooks</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook URL
                      </label>
                      <Input 
                        placeholder="https://your-domain.com/webhook/outbound"
                        defaultValue="https://your-domain.com/webhook/outbound"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Events to Subscribe
                      </label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          "message.sent",
                          "message.delivered", 
                          "message.read",
                          "message.failed"
                        ].map((event) => (
                          <div key={event} className="flex items-center space-x-2">
                            <input type="checkbox" id={event} defaultChecked className="rounded" />
                            <label htmlFor={event} className="text-sm text-gray-700">
                              {event}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="outbound-enabled" defaultChecked />
                      <label htmlFor="outbound-enabled" className="text-sm text-gray-700">
                        Enable outbound webhooks
                      </label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Webhook Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  API Keys & Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* OpenAI Integration */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">OpenAI ChatGPT</h3>
                      <p className="text-sm text-gray-600">AI-powered chatbot responses</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <Input 
                        type="password" 
                        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        defaultValue="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent">
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Instructions
                      </label>
                      <Textarea 
                        rows={3}
                        placeholder="You are a helpful customer service assistant..."
                        defaultValue="You are a helpful customer service assistant for our business. Be friendly, professional, and concise in your responses."
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="ai-enabled" defaultChecked />
                      <label htmlFor="ai-enabled" className="text-sm text-gray-700">
                        Enable AI responses
                      </label>
                    </div>
                  </div>
                </div>

                {/* External API Keys */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">External Integrations</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CRM API Key
                      </label>
                      <Input type="password" placeholder="Enter your CRM API key" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Analytics Webhook URL
                      </label>
                      <Input placeholder="https://your-analytics-service.com/webhook" />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save API Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Team Management
                  </CardTitle>
                  <Button>
                    <User className="w-4 h-4 mr-2" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-white">JD</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">John Doe</div>
                              <div className="text-sm text-gray-500">john@company.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">2 minutes ago</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <SettingsIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input defaultValue="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input type="email" defaultValue="john@company.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <Input defaultValue="Acme Corp" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                  <Button onClick={handleSaveSettings} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">New Messages</h4>
                      <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Campaign Updates</h4>
                      <p className="text-sm text-gray-500">Notifications about campaign status changes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">System Alerts</h4>
                      <p className="text-sm text-gray-500">Important system notifications and alerts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Weekly Reports</h4>
                      <p className="text-sm text-gray-500">Receive weekly performance reports</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Marketing Updates</h4>
                      <p className="text-sm text-gray-500">Product updates and feature announcements</p>
                    </div>
                    <Switch />
                  </div>
                  <Button onClick={handleSaveSettings} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
