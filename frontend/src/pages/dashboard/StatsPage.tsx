import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import DashboardPage from "@/pages/DashboardPage";
import { useAuth } from "@/hooks/useAuth";

export default function StatsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  if (isAdmin) {
    return <AdminDashboardPage />;
  }

  return <DashboardPage />;
}

