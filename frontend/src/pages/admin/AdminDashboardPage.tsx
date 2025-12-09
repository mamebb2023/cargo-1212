import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, FileText, Package, TrendingUp } from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import type { User, QueryParams, AdminStats, AdminBid } from "@/types";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);
  const [stats, setStats] = useState<AdminStats>({});
  const [users, setUsers] = useState<User[]>([]);
  const [bids, setBids] = useState<AdminBid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes, bidsRes] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getUsers({ page_size: 10 } as QueryParams),
          adminApi.getBids({ page_size: 5 } as QueryParams),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data as AdminStats);
        } else {
          toast.error(statsRes.message || "Failed to load stats");
        }

        if (usersRes.success && Array.isArray(usersRes.data)) {
          setUsers(usersRes.data as User[]);
        } else {
          toast.error(usersRes.message || "Failed to load users");
        }

        if (bidsRes.success && Array.isArray(bidsRes.data)) {
          setBids(bidsRes.data as AdminBid[]);
        } else {
          toast.error(bidsRes.message || "Failed to load bids");
        }
      } catch (error) {
        if (error && typeof error === "object" && "message" in error) {
          toast.error(
            (error as { message?: string }).message ||
              "Failed to load admin data"
          );
        } else {
          toast.error("Failed to load admin data");
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const displayedUsers = showMore ? users : users.slice(0, 5);
  const remainingCount = Math.max(users.length - 5, 0);

  const statCards = useMemo(
    () => [
      {
        icon: Users,
        label: "Total Users",
        value: stats.total_users ?? 0,
        color: "bg-blue-500",
      },
      {
        icon: Package,
        label: "Active Bids",
        value: stats.active_bids ?? 0,
        color: "bg-green-500",
      },
      {
        icon: FileText,
        label: "Pending Reviews",
        value: stats.pending_documents ?? 0,
        color: "bg-yellow-500",
      },
      {
        icon: TrendingUp,
        label: "Total Offers",
        value: stats.total_offers ?? 0,
        color: "bg-purple-500",
      },
    ],
    [stats]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of platform statistics and user management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? "…" : stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users List and Bids - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Users
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {displayedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.full_name}
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      {user.role}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded ${
                        user.is_verified
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.is_verified ? "Verified" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {!showMore && remainingCount > 0 && (
              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => setShowMore(true)}
              >
                +{remainingCount} more
              </Button>
            )}

            {showMore && (
              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => setShowMore(false)}
              >
                Show less
              </Button>
            )}
          </div>
        </div>

        {/* Bids Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Bids</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {bids.map((bid) => (
                <div
                  key={bid.id}
                  onClick={() => navigate(`/dashboard/bids/${bid.id}`)}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                    {bid.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {bid.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Package className="w-4 h-4" />
                    <span>
                      <strong>{bid.offers_count ?? 0}</strong>{" "}
                      {(bid.offers_count ?? 0) === 1 ? "offer" : "offers"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
