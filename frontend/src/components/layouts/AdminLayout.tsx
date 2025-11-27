import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  ChevronLeft,
  Shield,
} from "lucide-react";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: FileText,
      label: "To Review",
      path: "/admin/to-review",
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 flex-1">
            {sidebarOpen ? (
              <Link to="/admin/dashboard" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-red-500 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">Admin Panel</span>
              </Link>
            ) : (
              <Link to="/admin/dashboard" className="mx-auto">
                <div className="h-8 w-8 rounded-md bg-red-500 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </Link>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-all ml-4"
          >
            <ChevronLeft
              className={`size-4 text-gray-600 transition-transform duration-300 ${
                sidebarOpen ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? "bg-red-50 text-red-600"
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

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 shrink-0">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full ${
              !sidebarOpen && "justify-center"
            }`}
            title={!sidebarOpen ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
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

