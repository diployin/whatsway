import React, { useState } from "react";
import { Link, useLocation } from "wouter";
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
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChannelSwitcher } from "@/components/channel-switcher";
import { useTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    href: "/",
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
    href: "/inbox",
    icon: MessageSquare,
    labelKey: "navigation.inbox",
    color: "text-red-600",
    requiredPrefix: "inbox.",
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
    href: "/logs",
    icon: ScrollText,
    labelKey: "navigation.messageLogs",
    color: "text-yellow-600",
    alwaysVisible: true,
    allowedRoles: ["superadmin", "admin"],
  },
  {
    href: "/team",
    icon: UsersRound,
    labelKey: "navigation.team",
    color: "text-teal-600",
    requiredPrefix: "team.",
    allowedRoles: ["superadmin", 'admin'],
  },
  {
    href: "/settings",
    icon: Settings,
    labelKey: "navigation.settings",
    color: "text-gray-600",
    alwaysVisible: true,
    allowedRoles: ["superadmin", "admin"],
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAIActive, setIsAIActive] = useState<boolean>(true);

  function canView(item: NavItem): boolean {
    // Role‑based access first
    if (item.allowedRoles) {
      if (!user) return false;
      if (!item.allowedRoles.includes(user.role as Role)) {
        return false;
      }
    }

    // Always visible items
    if (item.alwaysVisible) {
      return true;
    }

    // Permission‑based fallback
    if (!item.requiredPrefix) {
      return true;
    }
    if (!user?.permissions) {
      return false;
    }
    const perms = Array.isArray(user.permissions)
      ? user.permissions
      : Object.keys(user.permissions);
    const normalize = (str: string) => str.replace(".", ":");

    return perms.some(
      (perm) =>
        perm.startsWith(normalize(item.requiredPrefix!)) &&
        (Array.isArray(user.permissions)
          ? true
          : (user.permissions as any)[perm])
    );
  }

  const handleToggleAI = (): void => {
    setIsAIActive(!isAIActive);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-100 transform transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <img
                src="/logo192.png"
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-xl font-bold text-gray-900">YourApp</h1>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Channel Switcher */}
          <div className="px-6 py-3 border-b border-gray-100">
            <ChannelSwitcher />
          </div>

          {/* Navigation menu */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navItems.filter(canView).map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-green-50 text-green-700 border-l-4 border-green-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 mr-3 transition-colors",
                      isActive ? "text-green-600" : item.color
                    )}
                  />
                  {t(item.labelKey)}
                  {item.badge && (
                    <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Language selector */}
          <div className="px-6 py-3 border-t border-gray-100">
            <LanguageSelector />
          </div>

          {/* Smaller Toggle Button with Green Color */}
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

          {/* user profile && logout  */}
          <div className="p-4 border-t border-gray-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user
                        ? (
                            user.firstName?.[0] || user.username[0]
                          ).toUpperCase()
                        : "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user
                        ? user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.username
                        : "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate capitalize">
                      {user?.role || "User"}
                    </p>
                  </div>
                  <Settings className="w-4 h-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t("common.myAccount")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t("navigation.settings")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>{t("navigation.account")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("common.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
}

