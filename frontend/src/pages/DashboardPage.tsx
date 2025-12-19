import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  FileText,
  TrendingUp,
  CheckCircle,
  Activity,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/lib/api";
import type { DashboardOverview, DashboardStats } from "@/types";
import type { StatCard } from "@/types";

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const isCarrier = user?.role === "carrier";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBids, setRecentBids] = useState<
    DashboardOverview["recent_bids"]
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await usersApi.getDashboardOverview();
        if (response.success && response.data) {
          setStats(response.data.stats);
          setRecentBids(response.data.recent_bids || []);
        } else {
          toast.error(response.message || "Failed to load dashboard data");
        }
      } catch (error) {
        if (error && typeof error === "object" && "message" in error) {
          toast.error(
            (error as { message?: string }).message ||
              "Failed to load dashboard data"
          );
        } else {
          toast.error("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const statCards: StatCard[] = useMemo(() => {
    if (isCarrier) {
      return [
        {
          label: "Available Bids",
          value: stats?.available_bids ?? 0,
          icon: Package,
        },
        { label: "My Offers", value: stats?.my_offers ?? 0, icon: TrendingUp },
        {
          label: "Active Offers",
          value: stats?.active_offers ?? 0,
          icon: Activity,
        },
        {
          label: "Accepted Offers",
          value: stats?.accepted_offers ?? 0,
          icon: CheckCircle,
        },
      ];
    }

    return [
      { label: "My Bids", value: stats?.total_bids ?? 0, icon: Package },
      { label: "Active Bids", value: stats?.active_bids ?? 0, icon: FileText },
      {
        label: "Offers Received",
        value: stats?.offers_received ?? 0,
        icon: TrendingUp,
      },
      {
        label: "Accepted Offers",
        value: stats?.accepted_offers ?? 0,
        icon: CheckCircle,
      },
    ];
  }, [isCarrier, stats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back {user?.full_name ? `, ${user.full_name}` : ""}{" "}
            {user?.role ? `(${user.role})` : ""}
          </p>
        </div>
        <div className="mt-4 flex gap-3">
          {isCarrier ? (
            <Button
              variant="secondary"
              onClick={() => navigate("/dashboard/bids")}
              disabled={loading}
            >
              Browse Bids
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => navigate("/dashboard/bids/create")}
              disabled={loading}
            >
              Create a Bid
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const displayValue =
            typeof stat.value === "number"
              ? stat.value.toLocaleString()
              : stat.value ?? "—";
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? "…" : displayValue}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity / Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {!isCarrier ? (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/dashboard/bids/create")}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">
                    Create New Bid
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Post a new freight transport opportunity
                  </p>
                </button>
                <button
                  onClick={() => navigate("/dashboard/profile")}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">
                    Update Profile
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage your account information
                  </p>
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Need Help?
              </h2>
              <div className="space-y-3 text-sm text-gray-700">
                <p>• Review your verification documents in Settings.</p>
                <p>• Check notifications for approvals or requests.</p>
                <p>
                  • Contact support if you need assistance with posting a bid or
                  managing offers.
                </p>
                <button
                  onClick={() => navigate("/dashboard/notifications")}
                  className="mt-2 inline-flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-blue-700"
                >
                  View Notifications
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Bids
              </h2>
              <div className="space-y-3">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading recent bids…</p>
                ) : recentBids.length === 0 ? (
                  <p className="text-sm text-gray-500">No bids yet.</p>
                ) : (
                  recentBids.map((bid) => (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {bid.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(bid.created_at)} • {bid.origin} →{" "}
                          {bid.destination}
                        </p>
                        <p className="text-xs text-gray-500">
                          Budget: {bid.budget} | Offers: {bid.offers_count}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded capitalize">
                        {bid.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/dashboard/bids")}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">
                    Browse Available Bids
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Find new transport opportunities
                  </p>
                </button>
                <button
                  onClick={() => navigate("/dashboard/offers")}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">
                    My Offers
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    View and track your submitted offers
                  </p>
                </button>
                <button
                  onClick={() => navigate("/dashboard/profile")}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">
                    Update Profile
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage your account information
                  </p>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
