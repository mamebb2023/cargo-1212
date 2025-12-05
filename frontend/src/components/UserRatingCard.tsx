import { RatingDisplay, RatingBar } from "./ui/rating";
import { User, Star, MessageSquare } from "lucide-react";

interface UserRating {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    company_name?: string;
  };
  average_rating: number | null;
  total_ratings: number;
  rating_distribution: {
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
  };
  recent_reviews: Array<{
    rating: number;
    comment: string;
    reviewer: string;
    bid_title: string;
    created_at: string;
  }>;
}

interface UserRatingCardProps {
  userRating: UserRating;
}

export default function UserRatingCard({ userRating }: UserRatingCardProps) {
  const { user, average_rating, total_ratings, rating_distribution, recent_reviews } = userRating;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* User Info */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
          {user.company_name && (
            <p className="text-sm text-gray-600">{user.company_name}</p>
          )}
          <p className="text-sm text-gray-500 capitalize">{user.role}</p>
        </div>
      </div>

      {/* Overall Rating */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Overall Rating
            </p>
            <RatingDisplay
              rating={average_rating}
              totalRatings={total_ratings}
              size="lg"
            />
          </div>
          {average_rating !== null && (
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">
                {average_rating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">out of 5</div>
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        {total_ratings > 0 && (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <RatingBar
                key={stars}
                stars={stars}
                count={rating_distribution[stars.toString() as keyof typeof rating_distribution]}
                total={total_ratings}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Reviews */}
      {recent_reviews.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent Reviews
          </h4>
          <div className="space-y-4">
            {recent_reviews.map((review, index) => (
              <div
                key={index}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">
                      {review.rating}.0
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                )}
                <div className="text-xs text-gray-500">
                  <span className="font-medium">{review.reviewer}</span>
                  {" • "}
                  <span>{review.bid_title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {total_ratings === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No ratings yet</p>
        </div>
      )}
    </div>
  );
}

