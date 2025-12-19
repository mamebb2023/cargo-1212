import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Truck, DollarSign, Calendar } from "lucide-react";
import { useAuthContext } from "@/hooks/useAuth";
import { bidsApi, verificationApi, offersApi } from "@/lib/api";
import type { BackendBidDetail } from "@/types";

export default function SubmitOfferPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "verified" | "pending" | "rejected"
  >("loading");
  const [bid, setBid] = useState<BackendBidDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    offerAmount: "",
    estimatedDeliveryTime: "",
    vehicleType: "",
    cpoServiceNumber: "",
    specialNotes: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Fetch bid details
  useEffect(() => {
    const fetchBidDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await bidsApi.getBidDetails(parseInt(id));
        setBid(response.data as BackendBidDetail);
      } catch {
        toast.error("Failed to load bid details");
        navigate("/dashboard/bids");
      } finally {
        setLoading(false);
      }
    };

    fetchBidDetails();
  }, [id, navigate]);

  useEffect(() => {
    const loadVerification = async () => {
      if (!user) return;
      try {
        const res = await verificationApi.getDocuments();
        const docs = Array.isArray(res.data) ? res.data : [];
        const hasRejected = docs.some((d) => d.status === "rejected");
        const hasPending = docs.some((d) => d.status === "pending");
        const hasApproved = docs.some((d) => d.status === "approved");

        if (user.is_verified) {
          setVerificationStatus("verified");
        } else if (hasRejected) {
          setVerificationStatus("rejected");
        } else if (hasPending) {
          setVerificationStatus("pending");
        } else if (
          docs.length > 0 &&
          hasApproved &&
          !hasPending &&
          !hasRejected
        ) {
          // All documents are approved but user.is_verified might not be updated yet
          setVerificationStatus("verified");
        } else {
          setVerificationStatus("pending");
        }
      } catch {
        setVerificationStatus(user?.is_verified ? "verified" : "pending");
      }
    };
    void loadVerification();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bid) {
      toast.error("Bid data not loaded");
      return;
    }

    if (verificationStatus === "loading") {
      toast.error("Please wait while we check your verification status");
      return;
    }

    if (verificationStatus !== "verified") {
      toast.error(
        verificationStatus === "rejected"
          ? "Your documents were rejected. Please resubmit before placing offers."
          : "Your documents are pending. Please wait for approval before placing offers."
      );
      return;
    }

    if (
      !formData.offerAmount ||
      !formData.estimatedDeliveryTime ||
      !formData.vehicleType ||
      !formData.cpoServiceNumber
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate offer amount
    const offerAmount = parseFloat(formData.offerAmount);
    if (isNaN(offerAmount) || offerAmount <= 0) {
      toast.error("Please enter a valid offer amount");
      return;
    }

    try {
      setSubmitting(true);

      // Prepare offer data
      const offerData = {
        bid: bid.id,
        price: offerAmount,
        delivery_time: formData.estimatedDeliveryTime,
        vehicle_type: formData.vehicleType,
        cpo_service_number: formData.cpoServiceNumber,
        notes: formData.specialNotes,
      };

      // Submit offer to backend
      await offersApi.createOffer(offerData);

      toast.success("Your offer has been submitted successfully!");
      navigate(`/dashboard/bids/${bid.id}`);
    } catch (error) {
      const errorMessage =
        (error as Error)?.message || "Failed to submit offer";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Bid not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/dashboard/bids/${bid.id}`)}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submit Offer</h1>
          <p className="text-gray-600 mt-1">
            Submit your competitive offer for this transport bid
          </p>
        </div>
      </div>

      {verificationStatus !== "verified" && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-semibold">
            You are not allowed to submit an offer before your documents are
            reviewed and approved.
          </p>
          <p className="text-sm mt-1">
            Current status:{" "}
            {verificationStatus === "loading"
              ? "Checking..."
              : verificationStatus === "rejected"
              ? "Rejected - please resubmit your documents."
              : "Pending review."}
          </p>
        </div>
      )}

      {/* Bid Summary */}
      {bid && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Bid Summary
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Transport Request
              </p>
              <p className="text-gray-900">
                {bid.title || bid.description || "Transport Bid"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Route</p>
                <p className="text-gray-900">
                  {bid.origin} → {bid.destination}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Cargo</p>
                <p className="text-gray-900">
                  {bid.cargo_type || bid.cargoType} ({bid.weight})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Budget</p>
                <p className="text-gray-900 font-semibold">ETB {bid.budget}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Deadline</p>
                <p className="text-gray-900">{bid.deadline}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offer Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-gray-200 p-6 space-y-6"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offerAmount" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Offer Amount (ETB) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="offerAmount"
                type="number"
                placeholder="e.g., 22500"
                value={formData.offerAmount}
                onChange={(e) => handleChange("offerAmount", e.target.value)}
                required
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500">
                Enter your competitive offer amount. Lower offers are more
                likely to win the bid.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="estimatedDeliveryTime"
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Estimated Delivery Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="estimatedDeliveryTime"
                type="date"
                value={formData.estimatedDeliveryTime}
                onChange={(e) =>
                  handleChange("estimatedDeliveryTime", e.target.value)
                }
                required
                min={new Date().toISOString().split("T")[0]} // Prevent past dates
              />
              <p className="text-xs text-gray-500">
                Select the date when you expect to deliver the cargo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleType" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Vehicle Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="vehicleType"
                value={formData.vehicleType}
                onChange={(e) => handleChange("vehicleType", e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                <option value="">Select vehicle type</option>
                <option value="flatbed">Flatbed Truck</option>
                <option value="box-truck">Box Truck</option>
                <option value="refrigerated">Refrigerated Truck</option>
                <option value="container">Container Truck</option>
                <option value="tanker">Tanker Truck</option>
                <option value="other">Other</option>
              </select>
              <p className="text-xs text-gray-500">
                Select the type of vehicle you will use for this transport
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpoServiceNumber">
                CPO Service Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cpoServiceNumber"
                type="number"
                placeholder="e.g., 12345"
                value={formData.cpoServiceNumber}
                onChange={(e) =>
                  handleChange("cpoServiceNumber", e.target.value)
                }
                required
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialNotes">Special Notes (Optional)</Label>
            <textarea
              id="specialNotes"
              rows={4}
              placeholder="Add any additional information about your offer, capabilities, or terms..."
              value={formData.specialNotes}
              onChange={(e) => handleChange("specialNotes", e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/dashboard/bids/${bid.id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="secondary" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Offer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
