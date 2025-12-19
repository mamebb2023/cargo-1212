import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthContext } from "@/hooks/useAuth";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setSession } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      if (!response.data?.user) {
        toast.error(response.message || "Login failed");
        return;
      }
      if (response.data.user.role !== "admin") {
        toast.error("Admin role required");
        return;
      }
      setSession({
        user: response.data.user,
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
      });
      toast.success("Admin login successful!");
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error(error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">Admin Login</h1>
              <p className="text-sm text-gray-600">
                Enter your admin credentials to access the dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@admin.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" variant="secondary" disabled={loading}>
                {loading ? "Logging in..." : "Login as Admin"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

