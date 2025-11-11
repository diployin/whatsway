// import { Bell, Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useUnreadCount } from "@/contexts/UnreadCountContext";
// import { useLocation } from "wouter";

// interface HeaderProps {
//   title: string;
//   subtitle?: string;
//   action?: {
//     label: string;
//     onClick: () => void;
//   };
// }

// export default function Header({ title, subtitle, action }: HeaderProps) {
//   const unreadCount = useUnreadCount();
//   const [,setLocation] = useLocation();
//   return (
//     <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
//           {subtitle && (
//             <p className="text-sm text-gray-600">{subtitle}</p>
//           )}
//         </div>
//         <div className="flex items-center space-x-4">
//           {action && (
//             <Button 
//               onClick={action.onClick}
//               className="bg-green-600 hover:bg-green-700 text-white"
//             >
//               <Plus className="w-4 h-4 mr-2" />
//               {action.label}
//             </Button>
//           )}
          
//           {/* Notifications */}
//           <div className="relative">
//             <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={()=> setLocation('/inbox')}>
//               <Bell className="w-5 h-5" />
//               <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
//                {unreadCount}
//               </span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }



import { Bell, Plus, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnreadCount } from "@/contexts/UnreadCountContext";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";


interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  userPhotoUrl?: string;
}

export default function Header({ title, subtitle, action, userPhotoUrl}: HeaderProps) {
  const unreadCount = useUnreadCount();
  const [, setLocation] = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {user, logout} = useAuth()

  const username = user?.firstName +''+ user?.lastName || "User"
  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title & Subtitle */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>

        <div className="flex items-center space-x-4">
          {/* Action Button */}
          {action && (
            <Button
              onClick={action.onClick}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setLocation("/inbox")}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-400 transition-colors"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img
                src={
                  userPhotoUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0D8ABC&color=fff`
                }
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {/* User Name */}
                <div className="px-4 py-2 border-b border-gray-100 text-gray-800 font-semibold">
                  {username}
                </div>

                <button
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => { setLocation("/settings"); setDropdownOpen(false); }}
                >
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </button>
                <button
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => { setLocation("/account"); setDropdownOpen(false); }}
                >
                  <User className="w-4 h-4 mr-2" /> Accounts
                </button>
                <button
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={logout}
                >
                  <LogOut  className="w-4 h-4 mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
