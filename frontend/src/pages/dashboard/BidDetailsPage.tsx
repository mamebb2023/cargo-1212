import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Lock,
  CreditCard,
  Package,
  MapPin,
  Calendar,
  Truck,
  ArrowRight,
} from "lucide-react";
import { bidsApi, paymentsApi } from "@/lib/api";
import PaymentModal from "@/components/payments/PaymentModal";
import { useAuthContext } from "@/context/AuthContext";
import RatingModal from "@/components/RatingModal";
import type { BidDetail, BackendBidDetail, LimitedBidDetail } from "@/types";

export default function BidDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [requiresPayment, setRequiresPayment] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [bid, setBid] = useState<BidDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<{
    id: number;
    name: string;
    role: "shipper" | "carrier";
  } | null>(null);

  // Check if current user is the bid owner
  const isBidOwner = user && bid && user.email === bid.shipperEmail;

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

  // Fetch bid details on component mount
  useEffect(() => {
    if (id) {
      fetchBidDetails(parseInt(id));
    }
  }, [id]);

  const fetchBidDetails = async (bidId: number) => {
    try {
      setLoading(true);
      const response = await bidsApi.getBidDetails(bidId);
      const data = response.data;

      // Check if this is limited data (requires payment)
      if ("requires_payment" in data && data.requires_payment) {
        // Limited data response
        const limitedData = data as LimitedBidDetail;
        const mapped: BidDetail = {
          id: limitedData.id,
          title: limitedData.title,
          description: limitedData.description,
          origin: limitedData.origin,
          destination: limitedData.destination,
          cargoType: limitedData.cargo_type || "",
          weight: limitedData.weight,
          deadline: limitedData.deadline,
          budget: limitedData.budget,
          postedDate: "",
          offers: limitedData.offers_count,
          lowestOffer: limitedData.lowest_offer,
        };
        setBid(mapped);
        setRequiresPayment(true);
      } else {
        // Full data response
        const fullData = data as BackendBidDetail;
        const mapped: BidDetail = {
          id: fullData.id,
          title: fullData.title,
          description: fullData.description,
          origin: fullData.origin,
          destination: fullData.destination,
          cargoType: fullData.cargo_type || fullData.cargoType || "",
          weight: fullData.weight,
          deadline: fullData.deadline,
          budget: fullData.budget,
          postedDate: fullData.created_at,
          offers: fullData.offers_count,
          lowestOffer: fullData.lowest_offer,
          originAddress: fullData.origin_address,
          destinationAddress: fullData.destination_address,
          specialRequirements: fullData.special_requirements,
          shipperName:
            fullData.user?.company_name ||
            fullData.user?.full_name ||
            fullData.user?.email,
          shipperPhone: fullData.user?.phone,
          shipperEmail: fullData.user?.email,
          bidFilesUrl: fullData.bid_files_url,
        };
        setBid(mapped);
        setRequiresPayment(false);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to load bid details");
        setBid(null);
      } else {
        toast.error("Failed to load bid details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async ({
    paymentMethod,
    file,
  }: {
    paymentMethod: string;
    file: File;
  }) => {
    if (!bid) {
      toast.error("Bid not loaded yet.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("amount", "200.00"); // ETB 200
      formData.append("payment_method", paymentMethod);
      formData.append("reference_number", `REF-${Date.now()}`);
      formData.append("payment_proof", file);
      formData.append("bid", bid.id.toString());

      await paymentsApi.createPayment(formData);

      toast.success(
        "Payment submitted successfully and is under review. You will be notified once approved."
      );
      // Refresh the bid details to show full information if payment is approved
      fetchBidDetails(bid.id);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Payment submission failed");
      } else {
        toast.error("Payment submission failed");
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bid details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!bid) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Bid not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/bids")}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bid Details</h1>
          <p className="text-gray-600 mt-1">
            {requiresPayment
              ? "Basic information only - pay ETB 200 to unlock full details and submit offers"
              : "Complete bid information and submission options"}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {bid.title}
          </h2>
          <p className="text-gray-600 line-clamp-3">{bid.description}</p>
        </div>

        {/* Show additional details only if payment not required */}
        {!requiresPayment && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Route</p>
                    <p className="text-gray-900">
                      {bid.origin} → {bid.destination}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cargo</p>
                    <p className="text-gray-900">
                      {bid.cargoType} ({bid.weight})
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Deadline
                    </p>
                    <p className="text-gray-900">{bid.deadline}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Budget</p>
                    <p className="text-gray-900 text-lg font-semibold">
                      ETB {formatCurrency(bid.budget)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="flex flex-col md:flex-row text-gray-600">
                  <strong>Posted:</strong> {formatDate(bid.postedDate)}
                </span>
                <span className="flex flex-col md:flex-row text-gray-600">
                  <strong>Offers Received:</strong> {bid.offers}
                </span>
                {bid.lowestOffer && (
                  <span className="flex flex-col md:flex-row text-green-600 font-semibold">
                    <strong>Lowest Offer:</strong> {bid.lowestOffer}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment Gate or Full Details */}
      {requiresPayment ? (
        <>
          {/* Unlock Full Details Box - Always visible until payment */}
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Unlock Complete Bid Details & Offer Submission
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Pay ETB 200 to unlock complete bid details including route,
                  cargo specifications, budget, shipper contact information,
                  exact addresses, and special requirements. Also enables offer
                  submission.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 max-w-sm mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600">Access Fee</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ETB 200
                  </span>
                </div>
                <ul className="text-sm text-left text-gray-600 space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Shipper contact information
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Detailed pickup and delivery addresses
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Special requirements and instructions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Ability to submit your offer
                  </li>
                </ul>
                <Button
                  onClick={handlePayment}
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Pay ETB 200 and View Full Details
                </Button>
              </div>
            </div>
          </div>

          <PaymentModal
            open={showPaymentForm}
            onClose={() => setShowPaymentForm(false)}
            onSubmit={handlePaymentSubmit}
            onSuccess={() => {
              setShowPaymentForm(false);
            }}
            amountLabel="ETB 200"
            title="Unlock Complete Bid Details & Offer Submission"
          />
        </>
      ) : (
        <>
          {/* Full Details (Visible when payment not required) */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Shipper Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Company Name
                  </p>
                  <p className="text-gray-900">{bid.shipperName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-gray-900">{bid.shipperPhone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{bid.shipperEmail}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detailed Location Information
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Pickup Location
                  </p>
                  <p className="text-gray-900 font-medium">{bid.origin}</p>
                  <p className="text-sm text-gray-600">{bid.originAddress}</p>
                </div>
                <ArrowRight className="w-6 h-6 text-blue-600 shrink-0 mt-6" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Delivery Location
                  </p>
                  <p className="text-gray-900 font-medium">{bid.destination}</p>
                  <p className="text-sm text-gray-600">
                    {bid.destinationAddress}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Special Requirements
              </h3>
              <p className="text-gray-600">{bid.specialRequirements}</p>
            </div>
          </div>

          {/* Rating Section - Show for completed bids where user can rate the other party */}
          {bid && bid.status === "completed" && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Rate Your Experience
              </h3>
              <p className="text-gray-600 mb-4">
                Share your feedback about the other party involved in this
                transaction.
              </p>
              <div className="flex gap-3">
                {isBidOwner && bid.selected_offer?.carrier && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      // For shipper rating carrier
                      setRatingTarget({
                        id: bid.selected_offer.carrier.id,
                        name:
                          bid.selected_offer.carrier.company_name ||
                          bid.selected_offer.carrier.full_name ||
                          "Carrier",
                        role: "carrier",
                      });
                      setShowRatingModal(true);
                    }}
                  >
                    Rate Carrier
                  </Button>
                )}
                {!isBidOwner && user?.role === "carrier" && bid.user && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      // For carrier rating shipper
                      setRatingTarget({
                        id: bid.user.id,
                        name:
                          bid.user.company_name ||
                          bid.user.full_name ||
                          bid.shipperName ||
                          "Shipper",
                        role: "shipper",
                      });
                      setShowRatingModal(true);
                    }}
                  >
                    Rate Shipper
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Submit Offer Section - Only show if user is not the bid owner */}
          {!isBidOwner && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Submit Your Offer
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Ready to transport this cargo? Submit your competitive offer
                below.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() =>
                    navigate(`/dashboard/bids/${bid.id}/submit-offer`)
                  }
                >
                  Submit Offer
                </Button>
                <Button variant="outline">Contact Shipper</Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Rating Modal */}
      {ratingTarget && bid && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setRatingTarget(null);
          }}
          bidId={bid.id}
          bidTitle={bid.title}
          rateeId={ratingTarget.id}
          rateeName={ratingTarget.name}
          rateeRole={ratingTarget.role}
          onSuccess={() => {
            // Refresh the page or show success message
            toast.success("Rating submitted successfully!");
          }}
        />
      )}
    </div>
  );
}
