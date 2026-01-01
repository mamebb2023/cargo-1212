import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { RatingDisplay } from "./ui/rating";
import { usersApi } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Rating {
  id: number;
  score: number;
  comment: string;
  created_at: string;
  rater?: {
    id: number;
    full_name: string;
    company_name?: string;
  };
  bid?: {
    id: number;
    title: string;
  };
}

interface RatingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

export default function RatingDetailsModal({
  isOpen,
  onClose,
  userId,
  userName,
}: RatingDetailsModalProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<{
    average_rating: number;
    total_ratings: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchRatings();
    }
  }, [isOpen, userId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getUserRating(userId);
      type RatingResponse = {
        average_rating?: number;
        total_ratings?: number;
        ratings?: Array<{
          id: number;
          score: number;
          comment?: string;
          created_at: string;
          rater?: { id: number; full_name: string; company_name?: string };
          shipper?: { id: number; full_name: string; company_name?: string };
          user?: { id: number; full_name: string; company_name?: string };
          bid?: { id: number; title: string };
        }>;
      };
      const data = response.data as RatingResponse;
      
      setUserRating({
        average_rating: data?.average_rating || 0,
        total_ratings: data?.total_ratings || 0,
      });
      
      // Map the ratings data to match our interface
      const ratingsData = (data?.ratings || []).map((rating) => {
        // Handle both rater and shipper fields (for backward compatibility)
        const raterData = rating.rater || rating.shipper || rating.user;
        return {
          id: rating.id,
          score: rating.score,
          comment: rating.comment || "",
          created_at: rating.created_at,
          rater: {
            id: raterData?.id || 0,
            full_name: raterData?.full_name || "Unknown",
            company_name: raterData?.company_name,
          },
          bid: rating.bid || { id: 0, title: "Unknown Bid" },
        };
      });
      
      setRatings(ratingsData);
    } catch (error) {
      console.error("Failed to fetch ratings:", error);
      toast.error("Failed to load rating details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Rating Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">{userName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Summary */}
              {userRating && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Average Rating</p>
                      <div className="flex items-center gap-2 mt-1">
                        <RatingDisplay
                          rating={userRating.average_rating}
                          showText={false}
                          size="md"
                        />
                        <span className="text-2xl font-bold text-gray-900">
                          {userRating.average_rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Ratings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userRating.total_ratings}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Individual Ratings */}
              {ratings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No ratings yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Individual Ratings
                  </h3>
                  {ratings.map((rating) => (
                    <div
                      key={rating.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <RatingDisplay
                            rating={rating.score}
                            showText={false}
                            size="sm"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {rating.score}.0
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(rating.created_at)}
                        </span>
                      </div>

                      {rating.bid && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Bid:</span> {rating.bid.title}
                        </p>
                      )}

                      {rating.rater && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">From:</span>{" "}
                          {rating.rater.company_name || rating.rater.full_name}
                        </p>
                      )}

                      {rating.comment && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-700">{rating.comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <Button onClick={onClose} variant="secondary" className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

