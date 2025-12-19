import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, TrendingUp, Award } from "lucide-react";
import { RatingDisplay } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "@/lib/api";

interface TopRatedUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string;
  role: string;
  carrier_type?: string;
  average_rating: number | null;
  total_ratings: number;
}

export default function TopRatedCarriersPage() {
  const navigate = useNavigate();
  const [carriers, setCarriers] = useState<TopRatedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopRatedCarriers();
  }, []);

  const fetchTopRatedCarriers = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_BASE_URL}/auth/users/top-rated/?role=carrier`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch top-rated carriers");
      }

      const data = await response.json();
      setCarriers(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load top-rated carriers");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Award className="w-8 h-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Top Rated Carriers
          </h1>
          <p className="text-gray-600 mt-1">
            Discover the best-performing carriers on our platform
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Carriers</p>
              <p className="text-2xl font-bold text-gray-900">
                {carriers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {carriers.length > 0
                  ? (
                      carriers.reduce(
                        (sum, c) => sum + (c.average_rating || 0),
                        0
                      ) / carriers.length
                    ).toFixed(1)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {carriers.reduce((sum, c) => sum + c.total_ratings, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Carriers List */}
      {carriers.length > 0 ? (
        <div className="space-y-4">
          {carriers.map((carrier, index) => (
            <div
              key={carrier.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 transition cursor-pointer"
              onClick={() => navigate(`/dashboard/users/${carrier.id}/rating`)}
            >
              <div className="flex items-start gap-4">
                {/* Rank Badge */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-700"
                      : index === 1
                      ? "bg-gray-100 text-gray-700"
                      : index === 2
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  #{index + 1}
                </div>

                {/* Carrier Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {carrier.first_name} {carrier.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {carrier.company_name}
                      </p>
                      {carrier.carrier_type && (
                        <p className="text-xs text-gray-500 capitalize mt-1">
                          {carrier.carrier_type.replace("_", " ")}
                        </p>
                      )}
                    </div>
                    <RatingDisplay
                      rating={carrier.average_rating}
                      totalRatings={carrier.total_ratings}
                      size="md"
                    />
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/users/${carrier.id}/rating`);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      View Profile
                    </Button>
                    {index < 3 && (
                      <div className="flex items-center gap-1">
                        <Award
                          className={`w-4 h-4 ${
                            index === 0
                              ? "text-yellow-500"
                              : index === 1
                              ? "text-gray-400"
                              : "text-orange-500"
                          }`}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {index === 0
                            ? "Gold"
                            : index === 1
                            ? "Silver"
                            : "Bronze"}{" "}
                          Carrier
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Rated Carriers Yet
          </h3>
          <p className="text-gray-600">
            Carriers will appear here once they receive ratings
          </p>
        </div>
      )}
    </div>
  );
}
