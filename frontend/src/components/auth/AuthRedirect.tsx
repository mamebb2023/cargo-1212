import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuth";

export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuthContext();
  const location = useLocation();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

