import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChannelProvider } from "@/contexts/channel-context";
import { UnreadCountProvider } from "@/contexts/UnreadCountContext";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Contacts from "@/pages/contacts";
import Campaigns from "@/pages/campaigns";
import Templates from "@/pages/templates";
import Inbox from "@/pages/inbox";
import Automations from "@/pages/automations";
import Analytics from "@/pages/analytics";
import CampaignAnalytics from "@/pages/campaign-analytics";
import Settings from "@/pages/settings";
import Logs from "@/pages/logs";
import Team from "@/pages/team";
import Sidebar from "@/components/layout/sidebar";
import Account from "./pages/account";
import { AppLayout } from "./components/layout/AppLayout";
import ChatbotBuilder from "./pages/chatbot-builder";
import AddChatbotBuilder from "./pages/add-chatbot-builder";
import WidgetBuilder from "./pages/widget-builder";
import Websites from "./pages/websites";
import Home from "./pages/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Signup from "./pages/Signup";
import LoadingAnimation from "./components/LoadingAnimation";
import SignupPopup from "./components/SignupPopup";
import Plans from "./pages/plans";
import GatewaySettings from "./pages/GatewaySettings";
import BotFlowBuilder from "./pages/BotFlowBuilder";
import Workflows from "./pages/Workflows";
import AIAssistant from "./pages/AIAssistant";
import AutoResponses from "./pages/AutoResponses";
import WABAConnection from "./pages/WABAConnection";
import MultiNumber from "./pages/MultiNumbert";
import Webhooks from "./pages/Webhooks";
import QRCodes from "./pages/QRCodes";
import CRMSystem from "./pages/CRMSystem";
import LeadManagement from "./pages/LeadManagement";
import BulkImport from "./pages/BulkImport";
import Segmentation from "./pages/Segmentation";
import MessageLogs from "./pages/MessageLogs";
import HealthMonitor from "./pages/HealthMonitor";
import Reports from "./pages/Reports";
import SupportTickets from "./pages/SupportTickets";
import Notifications from "./pages/Notifications";
import ChatHub from "./pages/ChatHub";
import { Component } from "lucide-react";
import User from "./pages/users";
import TransactionsPage from "./pages/transactions-page";
import ContactsManagements from "./pages/contacts-managements";
import SupportTicketsNew from "./pages/support-tickets";
// Define route permissions mapping
const ROUTE_PERMISSIONS: Record<string, string> = {
  "/contacts": "contacts.view",
  "/campaigns": "campaigns.view",
  "/templates": "templates.view",
  "/inbox": "inbox.view",
  "/team": "team.view",
  "/automation": "automations.view",
  "/analytics": "analytics.view",
  "/analytics/campaign/:campaignId": "analytics.view",
  "/logs": "logs.view",
  "/settings": "settings.view",
  "/account": "",
  "/bot-builder": "",
};

// function ScrollToTop() {
//   const [location] = useLocation();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [location]);

//   return null;
// }
// Unauthorized component
function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          You don't have permission to access this page.
        </p>
      </div>
    </div>
  );
}

// Permission wrapper component
function PermissionRoute({
  component: Component,
  requiredPermission,
}: Readonly<{
  component: React.ComponentType;
  requiredPermission?: string;
}>) {
  const { user } = useAuth();

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    if (!user?.permissions) return false;

    const perms = Array.isArray(user.permissions)
      ? user.permissions
      : Object.keys(user.permissions);

    const normalize = (str: string) => str.replace(".", ":");

    return perms.some(
      (perm) =>
        perm.startsWith(normalize(permission)) &&
        (Array.isArray(user.permissions) ? true : user.permissions[perm])
    );
  };

  if (!hasPermission(requiredPermission)) {
    return <UnauthorizedPage />;
  }

  return <Component />;
}

function ProtectedRoutes() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, setLocation] = useLocation();
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  // Check if user has access to current route
  useEffect(() => {
    if (isAuthenticated && user && location !== "/") {
      const requiredPermission = ROUTE_PERMISSIONS[location];
      // console.log(
      //   "Checking permissions for route:",
      //   location,
      //   requiredPermission,
      //   hasRoutePermission(requiredPermission, user)
      // );
      if (requiredPermission && !hasRoutePermission(requiredPermission, user)) {
        // Redirect to dashboard if user doesn't have permission for current route
        setLocation("/");
      }
    }
  }, [location, isAuthenticated, user, setLocation]);

  useEffect(() => {
    const popupShown = sessionStorage.getItem("signupPopupShown");

    // only skip if value is explicitly "true"
    if (popupShown === "true") return;

    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        setShowSignupPopup(true);
        sessionStorage.setItem("signupPopupShown", "true");
      }
    }, 30000);

    const handleScroll = () => {
      const alreadyShown = sessionStorage.getItem("signupPopupShown");
      if (
        window.scrollY > window.innerHeight * 0.5 &&
        alreadyShown !== "true"
      ) {
        if (!isAuthenticated) {
          setShowSignupPopup(true);
          sessionStorage.setItem("signupPopupShown", "true");
        }
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isAuthenticated]);

  const handleClosePopup = () => {
    setShowSignupPopup(false);
  };

  if (showLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingAnimation onComplete={() => setShowLoading(false)} />;
      </div>
    );
  }

  if (!isAuthenticated ) {
    return (
      <>
        <Header />
        <Switch>
          <Route path="/" component={Home} />
          <Route component={Home} />
        </Switch>
        <Footer />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Switch>
          {/* <ScrollToTop /> */}
          <Route path="/dashboard">
            <Dashboard />
          </Route>

          
          
          <Route path="/contacts">
            <PermissionRoute
              component={Contacts}
              requiredPermission="contacts:view"
            />
          </Route>

          <Route path="/users">
            <PermissionRoute
              component={User}
            />
          </Route>
          <Route path="/campaigns">
            <PermissionRoute
              component={Campaigns}
              requiredPermission="campaigns:view"
            />
          </Route>
          <Route path="/templates">
            <PermissionRoute
              component={Templates}
              requiredPermission="templates:view"
            />
          </Route>
          <Route path="/inbox">
            <PermissionRoute
              component={Inbox}
              requiredPermission="inbox:view"
            />
          </Route>
          <Route path="/plans">
            <PermissionRoute
              component={Plans}
              // requiredPermission="plans:view"
            />
          </Route>
          <Route path="/gateway">
            <PermissionRoute
              component={GatewaySettings}
              // requiredPermission="plans:view"
            />
          </Route>
          <Route path="/team">
            <PermissionRoute component={Team} requiredPermission="team:view" />
          </Route>
          <Route path="/automation">
            <PermissionRoute
              component={Automations}
              requiredPermission="automations:view"
            />
          </Route>
          <Route path="/analytics">
            <PermissionRoute component={Analytics} />
          </Route>
          <Route path="/websites">
            <PermissionRoute component={Websites} />
          </Route>
          <Route path="/add/chatbot-builder">
            <PermissionRoute component={AddChatbotBuilder} />
          </Route>
          <Route path="/widget-builder">
            <PermissionRoute component={WidgetBuilder} />
          </Route>
          <Route path="/chatbot-builder">
            <PermissionRoute component={ChatbotBuilder} />
          </Route>
          {/* <Route path="/analytics/campaign/:campaignId">
            <PermissionRoute
              component={CampaignAnalytics}
              requiredPermission="analytics:view"
            />
          </Route> */}
          <Route path="/logs">
            <PermissionRoute component={Logs} requiredPermission="logs:view" />
          </Route>
          <Route path="/settings">
            <PermissionRoute
              component={Settings}
              requiredPermission="settings:view"
            />
          </Route>
          <Route path="/account">
            <PermissionRoute component={Account} />
          </Route>

          <Route path="/bot-builder">
            <PermissionRoute component={BotFlowBuilder} />
          </Route>

          <Route path="/workflows">
            <PermissionRoute component={Workflows} />
          </Route>

          <Route path="/ai-assistant">
            <PermissionRoute component={AIAssistant} />
          </Route>

          <Route path="/auto-responses">
            <PermissionRoute component={AutoResponses} />
          </Route>

          <Route path="/waba-connection">
            <PermissionRoute component={WABAConnection} />
          </Route>

          <Route path="/multi-number">
            <PermissionRoute component={MultiNumber} />
          </Route>

          <Route path="/webhooks">
            <PermissionRoute component={Webhooks} />
          </Route>

          <Route path="/qr-codes">
            <PermissionRoute component={QRCodes} />
          </Route>

          <Route path="/crm-systems">
            <PermissionRoute component={CRMSystem} />
          </Route>

          <Route path="/leads">
            <PermissionRoute component={LeadManagement} />
          </Route>

          <Route path="/bulk-import">
            <PermissionRoute component={BulkImport} />
          </Route>

          <Route path="/segmentation">
            <PermissionRoute component={Segmentation} />
          </Route>

          <Route path="/message-logs">
            <PermissionRoute component={MessageLogs} />
          </Route>

          <Route path="/health-monitor">
            <PermissionRoute component={HealthMonitor} />
          </Route>

          <Route path="/reports">
            <PermissionRoute component={Reports} />
          </Route>

          <Route path="/transactions-logs">
            <PermissionRoute component={TransactionsPage} />
          </Route>

          <Route path="/contacts-management">
            <PermissionRoute component={ContactsManagements} />
          </Route>

          <Route path="/support-tickets">
            <PermissionRoute component={SupportTicketsNew} />
          </Route>

          <Route path="/notifications">
            <PermissionRoute component={Notifications} />
          </Route>

          <Route path="/chat-hub">
            <PermissionRoute component={ChatHub} />
          </Route>
          <Route component={NotFound} />
        </Switch>

        {/* {showSignupPopup && !isAuthenticated && (
          <SignupPopup onClose={handleClosePopup} />
        )} */}
      </div>
    </div>
  );
}

// Helper function to check route permissions
function hasRoutePermission(permission: string, user: any) {
  if (!user?.permissions) return false;

  const perms = Array.isArray(user.permissions)
    ? user.permissions
    : Object.keys(user.permissions);

  const normalize = (str: string) => str.replace(".", ":");

  return perms.some(
    (perm: string) =>
      perm.startsWith(normalize(permission)) &&
      (Array.isArray(user.permissions) ? true : user.permissions[perm])
  );
}

// Custom hook for permission checking
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: string) => {
    if (!user?.permissions) return false;

    const perms = Array.isArray(user.permissions)
      ? user.permissions
      : Object.keys(user.permissions);

    const normalize = (str: string) => str.replace(".", ":");
    const normalizedPermission = normalize(permission);

    return perms.some(
      (perm) =>
        perm.startsWith(normalizedPermission) &&
        (Array.isArray(user.permissions) ? true : user.permissions[perm])
    );
  };

  const canAccessRoute = (route: string) => {
    const requiredPermission = ROUTE_PERMISSIONS[route];
    return requiredPermission ? hasPermission(requiredPermission) : true;
  };

  return { hasPermission, canAccessRoute, user };
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={Signup} />
      <Route path="/" component={Home}/>
      <Route
        path="/analytics/campaign/:campaignId"
        component={CampaignAnalytics}
      />
      <Route component={ProtectedRoutes} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <AuthProvider>
          <ChannelProvider>
            <TooltipProvider>
              <UnreadCountProvider>
                <Toaster />
                <Router />
              </UnreadCountProvider>
            </TooltipProvider>
          </ChannelProvider>
        </AuthProvider>
      </AppLayout>
    </QueryClientProvider>
  );
}

export default App;
