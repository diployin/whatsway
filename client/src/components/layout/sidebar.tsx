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
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChannelSwitcher } from "@/components/channel-switcher";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string | number;
  color?: string;
}

const navItems: NavItem[] = [
  {
    href: "/",
    icon: LayoutDashboard,
    label: "Dashboard",
    color: "text-green-600"
  },
  {
    href: "/contacts",
    icon: Users,
    label: "Contacts",
    color: "text-blue-600"
  },
  {
    href: "/campaigns",
    icon: Megaphone,
    label: "Campaigns",
    color: "text-orange-600"
  },
  {
    href: "/templates",
    icon: FileText,
    label: "Templates",
    color: "text-purple-600"
  },
  {
    href: "/inbox",
    icon: MessageSquare,
    label: "Team Inbox",
    color: "text-red-600"
  },
  {
    href: "/automation",
    icon: Zap,
    label: "Automation",
    color: "text-indigo-600"
  },
  {
    href: "/analytics",
    icon: BarChart3,
    label: "Analytics",
    color: "text-pink-600"
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
    color: "text-gray-600"
  }
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-100">
      <div className="flex flex-col h-full">
        {/* Logo Header */}
        <div className="flex items-center px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.891 3.426"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">WhatsWay</h1>
              <p className="text-xs text-gray-500">Business Platform</p>
            </div>
          </div>
        </div>

        {/* Channel Switcher */}
        <div className="px-6 py-3 border-b border-gray-100">
          <ChannelSwitcher />
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover-lift group",
                    isActive
                      ? "bg-green-50 text-green-700 border-l-4 border-green-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon 
                    className={cn(
                      "w-5 h-5 mr-3 transition-colors",
                      isActive ? "text-green-600" : item.color
                    )} 
                  />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* AI Bot Status */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">AI Assistant</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full pulse-gentle"></div>
                <span className="text-xs text-gray-600">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
