import { useState } from "react";
import { Lock, Bell, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const { logout } = useAuthContext();
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleChange = (
    field: "current" | "new" | "confirm",
    value: string
  ) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.error("Password change not implemented yet.");
  };

  return (
    <div className="max-w-3xl space-y-6 mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage account preferences and sign out
        </p>
      </div>

      <form
        onSubmit={handlePasswordSubmit}
        className="bg-white rounded-lg border border-gray-200 p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Change Password
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <Input
              id="current_password"
              type="password"
              value={passwords.current}
              onChange={(e) => handleChange("current", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              type="password"
              value={passwords.new}
              onChange={(e) => handleChange("new", e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              id="confirm_password"
              type="password"
              value={passwords.confirm}
              onChange={(e) => handleChange("confirm", e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" variant="secondary" className="mt-2">
          Update Password
        </Button>
      </form>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Notification Preferences
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          Notification preferences are not configurable yet.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Delete Account
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          Account deletion is not available yet. Contact support if needed.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Logout</h3>
            <p className="text-sm text-gray-600 mt-1">
              Sign out of your account
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => logout()}
            className="lg:w-auto w-full justify-center text-blue-600 hover:text-blue-700 border-blue-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
