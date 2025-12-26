import {
  Bell,
  Plus,
  LogOut,
  Settings,
  User,
  CheckCircle,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Firebase imports
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
import { useSidebar } from "@/contexts/sidebar-context";
import { LanguageSelector } from "../language-selector";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  userPhotoUrl?: string;
}

// GLOBAL firebase instance (single initialization only)
let firebaseApp: FirebaseApp | null = null;
let messaging: any = null;

export default function Header({
  title,
  subtitle,
  action,
  userPhotoUrl,
}: HeaderProps) {
  const [, setLocation] = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifModal, setNotifModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const username = (user?.firstName || "") + " " + (user?.lastName || "");

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch firebase config
  const { data: firebaseConfig } = useQuery({
    queryKey: ["/api/firebase"],
    queryFn: async () => {
      const res = await axios.get("/api/firebase");
      return res.data;
    },
    staleTime: 3600000,
  });

  const { data: notifData, refetch } = useQuery({
    queryKey: ["/api/notifications/users"],
    queryFn: async () => {
      const res = await axios.get("/api/notifications/users", {
        withCredentials: true,
      });
      return res.data;
    },
    staleTime: 20000,
  });

  // console.log(notifData);

  useEffect(() => {
    if (notifData) {
      setNotifications(
        notifData.map((n: any) => ({
          id: n.id,
          title: n.notification?.title,
          body: n.notification?.message,
          createdAt: n.notification?.createdAt || n.sentAt,
          read: n.isRead,
        }))
      );

      const unread = notifData.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    }
  }, [notifData]);

  // Close dropdown on outside click
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Mark single notification
  const markAsRead = async (id: any) => {
    await axios.post(`/api/notifications/${id}/read`);
    refetch();
  };
  const markAllAsRead = async () => {
    await axios.post("/api/notifications/mark-all");
    refetch();
  };
  const { isOpen, toggle } = useSidebar();

  // UI unchanged --------------------------------------
  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100  px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="lg:hidden   p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="  text-base sm:text-lg lg:text-2xl font-bold text-gray-900">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 hidden lg:block  ">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 ">
            <div className=" w-fit  ">
              {action && (
                <Button
                  onClick={action.onClick}
                  className="bg-green-600 text-white px-2 py-1 "
                >
                  <Plus className=" w-2 h-2 sm:w-4 sm:h-4 " />{" "}
                  <span className="hidden lg:block  ">{action.label}</span>
                </Button>
              )}
            </div>
            <div className=" w-fit hidden sm:block ">
              <LanguageSelector />
            </div>

            {user?.role != "superadmin" && (
              <div className="relative">
                <button
                  onClick={() => setNotifModal(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <Bell className=" w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                className="w-10 h-10 rounded-full overflow-hidden border-2"
                onClick={() => setDropdownOpen((x) => !x)}
              >
                <img
                  src={
                    userPhotoUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      username
                    )}`
                  }
                  className="w-full h-full object-cover"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                  <div className="px-4 py-2 border-b text-gray-800 font-semibold">
                    {username}
                  </div>

                  <button
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setLocation("/settings");
                      setDropdownOpen(false);
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </button>

                  <button
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setLocation("/account");
                      setDropdownOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" /> Account
                  </button>

                  <button
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications modal */}
      <Dialog open={notifModal} onOpenChange={setNotifModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>Your latest alerts</DialogDescription>
          </DialogHeader>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {notifications.length} notification
              {notifications.length !== 1 && "s"}
            </div>

            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto mt-3 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No notifications
              </div>
            ) : (
              notifications.map((n) => {
                const time = new Date(n.createdAt).toLocaleString();

                return (
                  <div
                    key={n.id}
                    className={`p-4 border rounded-lg ${
                      n.read ? "bg-white" : "bg-green-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{n.title}</h4>
                          {!n.read && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>

                        <p className="text-sm mt-1">{n.body}</p>

                        <p className="text-xs text-gray-400 mt-2">{time}</p>
                      </div>

                      {!n.read && (
                        <button
                          className="text-sm text-blue-600 hover:underline"
                          onClick={() => markAsRead(n.id)}
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
