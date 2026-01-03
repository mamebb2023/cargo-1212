import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  User,
  Package,
  ChevronLeft,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";
import { useAuthContext } from "@/hooks/useAuth";
import { notificationsApi } from "@/lib/api";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const { user, logout } = useAuthContext();

  const initials =
    (user?.full_name ?? "")
      .split(" ")
      .filter(Boolean)
      .map((part: string) => part[0])
      .slice(0, 2)
      .join("") || "CB";

  const isCarrier = user?.role === "carrier";
  const isAdmin = user?.role === "admin";

  const fetchUnread = useCallback(async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      const count =
        res &&
        res.data &&
        typeof (res.data as { unread_count: number }).unread_count === "number"
          ? (res.data as { unread_count: number }).unread_count
          : 0;
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    // Fetch once after mount, but avoid setState directly in effect body
    fetchUnread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  useEffect(() => {
    const handleUpdated = () => void fetchUnread();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void fetchUnread();
      }
    };

    window.addEventListener("notifications:updated", handleUpdated);
    document.addEventListener("visibilitychange", handleVisibility);

    const intervalId = window.setInterval(() => {
      void fetchUnread();
    }, 15000);

    return () => {
      window.removeEventListener("notifications:updated", handleUpdated);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.clearInterval(intervalId);
    };
  }, [fetchUnread]);

  // When user views notifications page, optimistically clear
  // Clear unread notifications count when user navigates to notifications page
  useEffect(() => {
    if (location.pathname.startsWith("/dashboard/notifications")) {
      setTimeout(() => setUnreadCount(0), 0);
    }
  }, [location.pathname]);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: isAdmin ? "Stats" : "Dashboard",
      path: "/dashboard/stats",
    },
    user?.role !== "shipper" && {
      icon: Package,
      label: "Bids",
      path: "/dashboard/bids",
    },
    user?.role !== "shipper" && {
      icon: FileText,
      label: "Offers",
      path: "/dashboard/offers",
    },
    (!isCarrier || isAdmin) && {
      icon: FileText,
      label: "My Bids",
      path: "/dashboard/my-bids",
    },
    {
      icon: Bell,
      label: "Notifications",
      path: "/dashboard/notifications",
      showDot: unreadCount > 0,
    },
    isAdmin && {
      icon: FileText,
      label: "To Review",
      path: "/dashboard/to-review",
    },
  ].filter(Boolean) as {
    icon: typeof LayoutDashboard;
    label: string;
    path: string;
    showDot?: boolean;
  }[];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 flex-1">
            {sidebarOpen ? (
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-blue-500" />
                <span className="font-semibold text-lg">CargoBid</span>
              </Link>
            ) : (
              <Link to="/dashboard" className="mx-auto">
                <div className="h-8 w-8 rounded-md bg-blue-500" />
              </Link>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-all ml-1"
          >
            <ChevronLeft
              className={`size-4 text-gray-600 transition-transform duration-300 ${
                sidebarOpen ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 md:p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center ${
                  sidebarOpen ? "justify-start" : "justify-center"
                } gap-3 px-2 py-2 rounded-lg transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.showDot && (
                    <span className="absolute -top-1.5 -right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500" />
                  )}
                </div>
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile Dropdown */}
        <div className="p-2 border-t border-gray-200 shrink-0">
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full ${
                !sidebarOpen && "justify-center"
              }`}
              title={!sidebarOpen ? "Profile" : undefined}
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {initials}
              </div>
              {sidebarOpen && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {user?.full_name || "User"}{" "}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 border ${
                        user?.role === "carrier"
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : user?.role === "shipper"
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-red-100 text-red-700 border-red-500"
                      }`}
                    >
                      {user?.role === "carrier"
                        ? "Carrier"
                        : user?.role === "shipper"
                        ? "Shipper"
                        : "Admin"}
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.email || ""}
                  </span>
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div
                className={`absolute bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 ${
                  sidebarOpen ? "left-0 w-full" : "left-10 ml-2 w-48"
                }`}
              >
                <Link
                  to="/dashboard/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
