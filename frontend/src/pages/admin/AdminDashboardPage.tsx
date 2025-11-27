import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, FileText, Package, TrendingUp } from "lucide-react";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const isAdmin = sessionStorage.getItem("isAdmin");
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Dummy user data
  const allUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Shipper",
      verified: true,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Carrier",
      verified: true,
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "Shipper",
      verified: false,
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah@example.com",
      role: "Carrier",
      verified: true,
    },
    {
      id: 5,
      name: "David Brown",
      email: "david@example.com",
      role: "Shipper",
      verified: true,
    },
    {
      id: 6,
      name: "Emily Davis",
      email: "emily@example.com",
      role: "Carrier",
      verified: false,
    },
    {
      id: 7,
      name: "Robert Wilson",
      email: "robert@example.com",
      role: "Shipper",
      verified: true,
    },
    {
      id: 8,
      name: "Lisa Anderson",
      email: "lisa@example.com",
      role: "Carrier",
      verified: true,
    },
    {
      id: 9,
      name: "James Taylor",
      email: "james@example.com",
      role: "Shipper",
      verified: true,
    },
    {
      id: 10,
      name: "Maria Martinez",
      email: "maria@example.com",
      role: "Carrier",
      verified: false,
    },
    {
      id: 11,
      name: "William Garcia",
      email: "william@example.com",
      role: "Shipper",
      verified: true,
    },
    {
      id: 12,
      name: "Patricia Rodriguez",
      email: "patricia@example.com",
      role: "Carrier",
      verified: true,
    },
    {
      id: 13,
      name: "Michael Lee",
      email: "michael@example.com",
      role: "Shipper",
      verified: true,
    },
    {
      id: 14,
      name: "Linda White",
      email: "linda@example.com",
      role: "Carrier",
      verified: false,
    },
    {
      id: 15,
      name: "Thomas Harris",
      email: "thomas@example.com",
      role: "Shipper",
      verified: true,
    },
  ];

  const displayedUsers = showMore ? allUsers : allUsers.slice(0, 5);
  const remainingCount = allUsers.length - 5;

  const stats = [
    {
      icon: Users,
      label: "Total Users",
      value: "156",
      change: "+12%",
      color: "bg-blue-500",
    },
    {
      icon: Package,
      label: "Active Bids",
      value: "42",
      change: "+8%",
      color: "bg-green-500",
    },
    {
      icon: FileText,
      label: "Pending Reviews",
      value: "8",
      change: "-3%",
      color: "bg-yellow-500",
    },
    {
      icon: TrendingUp,
      label: "Revenue (ETB)",
      value: "125,000",
      change: "+15%",
      color: "bg-purple-500",
    },
  ];

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
        {stats.map((stat) => {
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
                    {stat.value}
                  </p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
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
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      {user.role}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded ${
                        user.verified
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.verified ? "Verified" : "Pending"}
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
              {[
                {
                  id: 1,
                  title: "Freight Transport from Addis Ababa to Dire Dawa",
                  description:
                    "Transport 50 tons of construction materials. Delivery required within 3 days.",
                  offers: 5,
                },
                {
                  id: 2,
                  title: "Cargo Delivery to Mekelle",
                  description:
                    "Urgent delivery of medical supplies. Requires refrigerated transport.",
                  offers: 8,
                },
                {
                  id: 3,
                  title: "Bulk Goods Transport to Bahir Dar",
                  description:
                    "Regular transport service for monthly delivery. Long-term contract available.",
                  offers: 3,
                },
                {
                  id: 4,
                  title: "Express Delivery to Hawassa",
                  description:
                    "Small cargo delivery. Same-day service preferred.",
                  offers: 12,
                },
                {
                  id: 5,
                  title: "Agricultural Products Delivery to Gondar",
                  description:
                    "Transport fresh agricultural products. Temperature-controlled transport required.",
                  offers: 2,
                },
              ].map((bid) => (
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
                      <strong>{bid.offers}</strong>{" "}
                      {bid.offers === 1 ? "offer" : "offers"}
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
