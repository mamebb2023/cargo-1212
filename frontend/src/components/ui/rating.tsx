import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  count?: number;
}

export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  showCount = false,
  count = 0,
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange?.(star)}
            onMouseEnter={() => !readonly && setHoveredRating(star)}
            onMouseLeave={() => !readonly && setHoveredRating(null)}
            disabled={readonly}
            className={`${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            } transition-transform`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      {showCount && (
        <span className="text-sm text-muted-foreground ml-1">
          ({count} {count === 1 ? "rating" : "ratings"})
        </span>
      )}
    </div>
  );
}

interface RatingDisplayProps {
  rating: number | null;
  totalRatings?: number;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RatingDisplay({
  rating,
  totalRatings = 0,
  showText = true,
  size = "md",
}: RatingDisplayProps) {
  if (rating === null || rating === undefined) {
    return (
      <div className="flex items-center gap-2">
        <StarRating rating={0} readonly size={size} />
        {showText && (
          <span className="text-sm text-muted-foreground">No ratings yet</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <StarRating rating={rating} readonly size={size} />
      {showText && (
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-foreground">
            {rating.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">
            ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})
          </span>
        </div>
      )}
    </div>
  );
}

interface RatingBarProps {
  stars: number;
  count: number;
  total: number;
}

export function RatingBar({ stars, count, total }: RatingBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium w-6">{stars}</span>
      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-muted-foreground w-8 text-right">
        {count}
      </span>
    </div>
  );
}
