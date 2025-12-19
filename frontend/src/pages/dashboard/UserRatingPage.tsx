import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserRatingCard from "@/components/UserRatingCard";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "@/lib/api";

export default function UserRatingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userRating, setUserRating] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRating();
  }, [id]);

  const fetchUserRating = async () => {
    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(
        `${API_BASE_URL}/auth/users/${id}/rating/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user rating");
      }

      const data = await response.json();
      setUserRating(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load user rating");
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

  if (!userRating) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">User not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">User Rating</h1>
      </div>

      <UserRatingCard userRating={userRating} />
    </div>
  );
}

