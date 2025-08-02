<<<<<<< HEAD
import { Switch, Route, useLocation } from "wouter";
=======
import { Switch, Route } from "wouter";
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
<<<<<<< HEAD
import { ChannelProvider } from "@/contexts/channel-context";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
=======
import NotFound from "@/pages/not-found";
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
import Dashboard from "@/pages/dashboard";
import Contacts from "@/pages/contacts";
import Campaigns from "@/pages/campaigns";
import Templates from "@/pages/templates";
import Inbox from "@/pages/inbox";
<<<<<<< HEAD
import Automations from "@/pages/automations";
import Analytics from "@/pages/analytics";
import CampaignAnalytics from "@/pages/campaign-analytics";
import Settings from "@/pages/settings";
import Logs from "@/pages/logs";
import Team from "@/pages/team";
import Sidebar from "@/components/layout/sidebar";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will handle the redirect
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
=======
import Automation from "@/pages/automation";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 ml-64">
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/contacts" component={Contacts} />
          <Route path="/campaigns" component={Campaigns} />
          <Route path="/templates" component={Templates} />
          <Route path="/inbox" component={Inbox} />
<<<<<<< HEAD
          <Route path="/team" component={Team} />
          <Route path="/automation" component={Automations} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/analytics/campaign/:campaignId" component={CampaignAnalytics} />
          <Route path="/logs" component={Logs} />
=======
          <Route path="/automation" component={Automation} />
          <Route path="/analytics" component={Analytics} />
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

<<<<<<< HEAD
function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route component={ProtectedRoutes} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChannelProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ChannelProvider>
      </AuthProvider>
=======
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
    </QueryClientProvider>
  );
}

export default App;
