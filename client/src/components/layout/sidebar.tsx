import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { MdOutlinePayment } from "react-icons/md";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  FileText,
  MessageSquare,
  Bot,
  BarChart3,
  Settings,
  Zap,
  ScrollText,
  UsersRound,
  Menu,
  LogOut,
  X,
  Bell,
  CheckCircle,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChannelSwitcher } from "@/components/channel-switcher";
import { useTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { useAuth } from "@/contexts/auth-context";
import logo from "../../images/logo1924.jpg";
import { GiUpgrade } from "react-icons/gi";
import { TbInvoice } from "react-icons/tb";
import { RiSecurePaymentFill } from "react-icons/ri";
import { AiOutlineTransaction } from "react-icons/ai";
import { MdOutlineSupportAgent, MdGroups } from "react-icons/md";
import { useSidebar } from "@/contexts/sidebar-context";

import { AdminCreditBox } from "../AdminCreditBox";

type Role = "superadmin" | "admin" | "user";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  badge?: string | number;
  color?: string;
  alwaysVisible?: boolean;
  requiredPrefix?: string;
  allowedRoles?: Role[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    labelKey: "navigation.dashboard",
    color: "text-green-600",
    alwaysVisible: true,
    allowedRoles: ["superadmin", "admin", "user"],
  },
  {
    href: "/contacts",
    icon: Users,
    labelKey: "navigation.contacts",
    color: "text-blue-600",
    requiredPrefix: "contacts.",
    allowedRoles: ["superadmin", "admin"],
  },

  {
    href: "/campaigns",
    icon: Megaphone,
    labelKey: "navigation.campaigns",
    color: "text-orange-600",
    requiredPrefix: "campaigns.",
    allowedRoles: ["superadmin", "admin"],
  },
  {
    href: "/templates",
    icon: FileText,
    labelKey: "navigation.templates",
    color: "text-purple-600",
    requiredPrefix: "templates.",
    allowedRoles: ["superadmin", "admin"],
  },
  {
    href: "/chat-hub",
    icon: MessageSquare,
    labelKey: "navigation.chatHub",
    color: "text-red-600",
    requiredPrefix: "chathub.",
    allowedRoles: ["superadmin", "admin", "user"],
  },
  {
    href: "/automation",
    icon: Zap,
    labelKey: "navigation.automations",
    color: "text-indigo-600",
    requiredPrefix: "automations.",
    allowedRoles: ["superadmin", "admin"],
  },
  {
    href: "/analytics",
    icon: BarChart3,
    labelKey: "navigation.analytics",
    color: "text-pink-600",
    allowedRoles: ["superadmin", "admin"],
  },
  {
    href: "/widget-builder",
    icon: Bot,
    labelKey: "navigation.widgetBuilder",
    color: "text-teal-600",
    alwaysVisible: true,
    allowedRoles: ["superadmin", "admin", "user"],
  },
  {
    href: "/message-logs",
    icon: ScrollText,
    labelKey: "navigation.messageLogs",
    color: "text-yellow-600",
    alwaysVisible: true,
    allowedRoles: ["superadmin", "admin"],
  },
  {
    href: "/team",
    icon: UsersRound,
    labelKey: "Team",
    color: "text-teal-600",
    requiredPrefix: "team.",
    allowedRoles: ["superadmin", "admin"],
  },
  {
    href: "/settings",
    icon: Settings,
    labelKey: "navigation.settings",
    color: "text-gray-600",
    alwaysVisible: true,
    allowedRoles: ["superadmin", "admin"],
  },
  {
    href: "/notifications",
    icon: Bell,
    labelKey: "navigation.notifications",
    color: "text-indigo-400",
    requiredPrefix: "notifications.",
    allowedRoles: ["superadmin", "admin"],
  },
  {
    href: "/plans",
    icon: Bell,
    labelKey: "navigation.plans",
    color: "text-blue-400",
    // requiredPrefix: "notifications.",
    allowedRoles: ["superadmin"],
  },
  {
    href: "/gateway",
    icon: Bell,
    labelKey: "navigation.plans",
    color: "text-blue-400",
    // requiredPrefix: "notifications.",
    allowedRoles: ["superadmin"],
  },
  {
    href: "/support-tickets",
    icon: Bell,
    labelKey: "tickets-support",
    color: "text-blue-400",
    allowedRoles: ["superadmin"],
  },
  {
    href: "/user-support-tickets",
    icon: MdOutlineSupportAgent,
    labelKey: "Tickets Support",
    color: "text-blue-400",
    allowedRoles: ["admin"],
  },
  {
    href: "/plan-upgrade",
    icon: GiUpgrade,
    labelKey: "Upgrade Plan",
    color: "text-blue-400",
    allowedRoles: ["admin"],
  },
  {
    href: "/billing",
    icon: TbInvoice,
    labelKey: "Billing & Credits",
    color: "text-blue-400",
    allowedRoles: ["admin"],
  },
  {
    href: "/groups",
    icon: MdGroups,
    labelKey: "Groups",
    color: "text-blue-400",
    allowedRoles: ["admin"],
  },
  {
    href: "/stats",
    icon: Star,
    labelKey: "Stats",
    color: "text-yellow-600",
    allowedRoles: ["admin"],
  },
];

const sidebarItemsCategories = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    color: "text-green-600",
  },
  { name: "Users", icon: Users, path: "/users", color: "text-green-600" },
  {
    name: "Master Campaigns",
    icon: Megaphone,
    path: "/campaigns",
    badge: "",
    color: "text-blue-600",
  },
  {
    name: "Master Templates",
    icon: FileText,
    path: "/templates",
    badge: "",
    color: "text-purple-600",
  },
  {
    name: "Master Contacts",
    icon: Users,
    path: "/contacts-management",
    badge: "",
    color: "text-yellow-600",
  },
  {
    name: "Analytics",
    icon: BarChart3,
    path: "/analytics",
    color: "text-teal-500",
  },
  {
    name: "Notifications",
    icon: Bell,
    path: "/notifications",
    color: "text-pink-400",
  },
  {
    name: "Subscription Plans",
    icon: MdOutlinePayment,
    path: "/plans",
    color: "text-blue-400",
  },
  {
    name: "Transactions logs",
    icon: AiOutlineTransaction,
    path: "/transactions-logs",
    color: "text-[#00a63e]",
  },
  {
    name: "Payment Gateway",
    icon: RiSecurePaymentFill,
    path: "/gateway",
    color: "text-[#ffb900]",
  },
  {
    name: "Support Tickets",
    icon: MdOutlineSupportAgent,
    path: "/support-tickets",
    color: "text-black-400",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
    color: "text-purple-400",
  },
  {
    name: "Master Subscriptions",
    icon: CheckCircle,
    path: "/master-subscriptions",
    badge: "",
    color: "text-green-600",
  },
];

// Category-based structure for superadmin

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAIActive, setIsAIActive] = useState(false);
  const isSuper = user?.role === "superadmin";
  const isAdmin = user?.role === "admin";

  const {
    isOpen,
    toggle,
    close,
    open,
    isCollapsed,
    selectedMenu,
    setCollapsed,
    setSelectedMenu,
  } = useSidebar();

  console.log("isOpen", isOpen);

  const handleToggleAI = (): void => {
    setIsAIActive(!isAIActive);
  };

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        open();
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open, close]);
  const canView = (item: NavItem): boolean => {
    if (!user) return false;
    if (item.allowedRoles && !item.allowedRoles.includes(user.role as Role)) {
      return false;
    }
    if (user.role === "superadmin") {
      return true;
    }
    if (item.alwaysVisible) {
      return true;
    }
    if (!item.requiredPrefix) {
      return true;
    }
    if (!user.permissions) {
      return false;
    }
    const perms = Array.isArray(user.permissions)
      ? user.permissions
      : Object.keys(user.permissions);
    const normalize = (str: string) => str.replace(".", ":");
    return perms.some((perm) =>
      perm.startsWith(normalize(item.requiredPrefix!))
    );
  };

  const renderLink = (
    name: string,
    Icon: React.ComponentType<{ className?: string }>,
    path: string,
    badge?: string | number,
    colorClass?: string
  ) => {
    const isActive = location === path;
    return (
      <Link
        key={path}
        href={path}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
          isActive
            ? "bg-green-50 text-green-700 border-l-4 border-green-600"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        )}
        onClick={toggle}
      >
        <Icon
          className={cn(
            "w-5 h-5 mr-3",
            isActive ? "text-green-600" : colorClass
          )}
        />

        {name}
        {badge && (
          <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggle}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-100 transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div
              onClick={() => setLocation("/")}
              className="flex items-center space-x-3"
            >
              <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
              <h1 className="text-xl font-bold text-gray-900">Whatsway</h1>
            </div>
            <button
              onClick={toggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* <div className="px-6 py-3 border-b border-gray-100">
            <ChannelSwitcher />
          </div> */}

          {isAdmin ? (
            <div className="px-6 py-3 border-b border-gray-100">
              <ChannelSwitcher />
            </div>
          ) : (
            ""
          )}

          <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
            {isSuper
              ? sidebarItemsCategories.map((item) =>
                  renderLink(
                    item.name,
                    item.icon,
                    item.path,
                    item.badge,
                    item.color
                  )
                )
              : navItems
                  .filter(canView)
                  .map((item) =>
                    renderLink(
                      t(item.labelKey),
                      item.icon,
                      item.href,
                      item.badge,
                      item.color
                    )
                  )}
          </nav>

          {isAdmin ? (
            <div className="w-[180px] px-6 py-3 border-t border-gray-100">
              <LanguageSelector />
            </div>
          ) : (
            ""
          )}

          {isAdmin && (
            <div className="px-6 py-3">
              <AdminCreditBox credits={595} />
            </div>
          )}

          {/* Smaller Toggle Button with Green Color */}
          {isAdmin ? (
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {t("common.aiAssistant")}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full transition-colors ${
                        isAIActive ? "bg-green-500 pulse-gentle" : "bg-gray-400"
                      }`}
                    ></div>
                    <span className="text-xs text-gray-600">
                      {/* {isAIActive ? t("common.active") : t("Inactive")} */}
                      {t("campaigns.comingSoon")}
                    </span>
                  </div>
                </div>
                {/* Smaller Toggle Button with Green Color */}
                <button
                  onClick={handleToggleAI}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    isAIActive ? "bg-green-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                      isAIActive ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
}
