import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { StarRating } from "./ui/rating";
import { toast } from "react-hot-toast";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bidId: number;
  bidTitle: string;
  rateeId: number;
  rateeName: string;
  rateeRole: "shipper" | "carrier";
  onSuccess?: () => void;
}

export default function RatingModal({
  isOpen,
  onClose,
  bidId,
  bidTitle,
  rateeId,
  rateeName,
  rateeRole,
  onSuccess,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://localhost:8000/api/ratings/reviews/create/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bid: bidId,
            ratee: rateeId,
            rating: rating,
            comment: comment,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit rating");
      }

      toast.success("Rating submitted successfully!");
      onSuccess?.();
      onClose();
      setRating(0);
      setComment("");
    } catch (error) {
      let message = "Failed to submit rating";
      if (error instanceof Error) {
        message = error.message || message;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Rate {rateeRole === "carrier" ? "Carrier" : "Shipper"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Bid:</p>
            <p className="font-medium text-gray-900">{bidTitle}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">
              {rateeRole === "carrier" ? "Carrier" : "Shipper"}:
            </p>
            <p className="font-medium text-gray-900">{rateeName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 text-center">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="lg"
              />
              {rating > 0 && (
                <p className="text-center mt-2 text-sm text-gray-600">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Comment (Optional)
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              className="flex-1"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
