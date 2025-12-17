import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Truck,
  Calendar,
  Package,
  FileText,
} from "lucide-react";
import { offersApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface Offer {
  id: number;
  bid: {
    id: number;
    title: string;
    origin: string;
    destination: string;
    cargo_type: string;
    weight: string;
    budget: string;
  };
  user: {
    id: number;
    full_name: string;
    email: string;
  };
  price: string;
  delivery_time: string;
  vehicle_type: string;
  cpo_service_number: string;
  notes?: string;
  status: "pending" | "active" | "accepted" | "rejected";
  created_at: string;
}

export default function OffersPage() {
  const navigate = useNavigate();
  const { bidId } = useParams<{ bidId: string }>();
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<number | null>(null);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Format number with commas
  const formatCurrency = (amount: string) => {
    try {
      const num = parseFloat(amount);
      return num.toLocaleString("en-US");
    } catch {
      return amount;
    }
  };

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await offersApi.getOffers();

      let filteredOffers: Offer[] = [];

      if (bidId) {
        // Show offers for this specific bid (for shippers)
        filteredOffers =
          response.data?.filter((offer: { bid: unknown }) => {
            // bid can be an object or just an ID
            const offerBidId =
              typeof offer.bid === "object" && offer.bid && "id" in offer.bid
                ? (offer.bid as { id: number }).id
                : (offer.bid as number);
            return offerBidId === parseInt(bidId);
          }) || [];
      } else {
        // Show offers made by the current user (for carriers)
        filteredOffers =
          response.data?.filter((offer: { user: unknown }) => {
            // user can be an object or just an ID
            const offerUserId =
              typeof offer.user === "object" && offer.user && "id" in offer.user
                ? (offer.user as { id: number }).id
                : (offer.user as number);
            return offerUserId === user?.id;
          }) || [];
      }

      setOffers(filteredOffers);
    } catch {
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  }, [bidId, user?.id]);

  const handleAcceptOffer = async (offerId: number) => {
    try {
      setProcessingAction(offerId);
      await offersApi.acceptOffer(offerId);
      toast.success("Offer accepted successfully!");
      fetchOffers(); // Refresh the list
    } catch {
      toast.error("Failed to accept offer");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectOffer = async (offerId: number) => {
    try {
      setProcessingAction(offerId);
      await offersApi.rejectOffer(offerId);
      toast.success("Offer rejected successfully!");
      fetchOffers(); // Refresh the list
    } catch {
      toast.error("Failed to reject offer");
    } finally {
      setProcessingAction(null);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "active":
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "active":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading offers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {bidId ? "Offers for the bid" : "My Offers"}
          </h1>
          <p className="text-gray-600 mt-1">
            {bidId
              ? "View and manage offers received for this bid"
              : "View and track all offers you've submitted"}
          </p>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Offers Yet
          </h3>
          <p className="text-gray-600">
            {bidId
              ? "No offers have been received for this bid yet. Offers will appear here once carriers submit them."
              : "You haven't submitted any offers yet. Browse available bids to submit your first offer."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header with bid info and status */}
                  <div className="flex items-center gap-3 mb-4">
                    {getStatusIcon(offer.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {offer.bid.title || `Bid #${offer.bid.id}`}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(
                            offer.status
                          )}`}
                        >
                          {offer.status.charAt(0).toUpperCase() +
                            offer.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {offer.bid.origin} → {offer.bid.destination} •{" "}
                        {offer.bid.cargo_type}
                      </p>
                    </div>
                  </div>

                  {/* Offer details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Offer Amount</p>
                        <p className="font-semibold text-gray-900">
                          ETB {formatCurrency(offer.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Delivery Date</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(offer.delivery_time)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-500">Vehicle Type</p>
                        <p className="font-semibold text-gray-900">
                          {offer.vehicle_type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-500">CPO Number</p>
                        <p className="font-semibold text-gray-900">
                          {offer.cpo_service_number}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {offer.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Notes:
                      </p>
                      <p className="text-sm text-gray-600">{offer.notes}</p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-xs text-gray-500">
                    Submitted on {formatDate(offer.created_at)}
                  </div>
                </div>

                {/* Action buttons for shippers, status display for carriers */}
                {bidId ? (
                  <div className="flex gap-2 ml-6">
                    {offer.status === "active" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAcceptOffer(offer.id)}
                          disabled={processingAction === offer.id}
                        >
                          {processingAction === offer.id
                            ? "Processing..."
                            : "Accept"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectOffer(offer.id)}
                          disabled={processingAction === offer.id}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          {processingAction === offer.id
                            ? "Processing..."
                            : "Reject"}
                        </Button>
                      </>
                    )}
                    {offer.status === "accepted" && (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Accepted
                      </div>
                    )}
                    {offer.status === "rejected" && (
                      <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Rejected
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="ml-6">
                    {offer.status === "accepted" && (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Accepted
                      </div>
                    )}
                    {offer.status === "rejected" && (
                      <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Rejected
                      </div>
                    )}
                    {offer.status === "active" && (
                      <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        Pending Review
                      </div>
                    )}
                    {offer.status === "pending" && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        Pending
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
