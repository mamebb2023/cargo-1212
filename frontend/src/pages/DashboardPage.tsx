import { Package, FileText, TrendingUp, Users } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      label: "Total Bids",
      value: "24",
      icon: Package,
      change: "+12%",
      positive: true,
    },
    {
      label: "Active Bids",
      value: "8",
      icon: FileText,
      change: "+5%",
      positive: true,
    },
    {
      label: "My Offers",
      value: "15",
      icon: TrendingUp,
      change: "+8%",
      positive: true,
    },
    {
      label: "Connected Users",
      value: "142",
      icon: Users,
      change: "+3%",
      positive: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to your logistics transport bidding dashboard
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
                  <p
                    className={`text-xs mt-1 ${
                      stat.positive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change} from last month
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Bids
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Freight Transport Bid #{item}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Posted 2 hours ago
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-gray-900">
                Create New Bid
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Post a new freight transport opportunity
              </p>
            </button>
            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-gray-900">View All Bids</p>
              <p className="text-xs text-gray-500 mt-1">
                Browse available transport bids
              </p>
            </button>
            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-gray-900">
                Update Profile
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Manage your account information
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
