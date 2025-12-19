import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import DashboardPage from "@/pages/DashboardPage";
import { useAuthContext } from "@/hooks/useAuth";

export default function StatsPage() {
  const { user } = useAuthContext();
  const isAdmin = user?.role === "admin";

  if (isAdmin) {
    return <AdminDashboardPage />;
  }

  return <DashboardPage />;
}

