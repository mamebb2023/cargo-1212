import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  User,
  Package,
  ChevronLeft,
  Settings,
} from "lucide-react";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: Package,
      label: "Bids",
      path: "/dashboard/bids",
    },
    {
      icon: FileText,
      label: "My Bids",
      path: "/dashboard/my-bids",
    },
  ];

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
            className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-all ml-2"
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
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile Dropdown */}
        <div className="p-4 border-t border-gray-200 shrink-0">
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full ${
                !sidebarOpen && "justify-center"
              }`}
              title={!sidebarOpen ? "Profile" : undefined}
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                JD
              </div>
              {sidebarOpen && (
                <span className="text-sm font-medium">John Doe</span>
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
