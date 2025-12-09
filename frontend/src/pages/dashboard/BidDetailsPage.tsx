import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
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
  Upload,
  Info,
  Copy,
  Check,
} from "lucide-react";
import { bidsApi, paymentsApi } from "@/lib/api";
import type { BidDetail, BackendBidDetail } from "@/constant";

export default function BidDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hasPaid, setHasPaid] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [bid, setBid] = useState<BidDetail | null>(null);
  const [loading, setLoading] = useState(true);

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
      const data = response.data as BackendBidDetail;
      const mapped: BidDetail = {
        id: data.id,
        title: data.title,
        description: data.description,
        origin: data.origin,
        destination: data.destination,
        cargoType: data.cargo_type || data.cargoType || "",
        weight: data.weight,
        deadline: data.deadline,
        budget: data.budget,
        postedDate: data.created_at,
        offers: data.offers_count,
        lowestOffer: data.lowest_offer,
        originAddress: data.origin_address,
        destinationAddress: data.destination_address,
        specialRequirements: data.special_requirements,
        shipperName:
          data.user?.company_name || data.user?.full_name || data.user?.email,
        shipperPhone: data.user?.phone,
        shipperEmail: data.user?.email,
        bidFilesUrl: data.bid_files_url,
      };
      setBid(mapped);
      // For now, assume user hasn't paid - in real app check payment status
      setHasPaid(false);
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

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!bid) {
      toast.error("Bid not loaded yet.");
      return;
    }

    if (!selectedPaymentMethod || !uploadedFile) {
      toast.error("Please select a payment method and upload a screenshot");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("amount", "200.00"); // ETB 200
      formData.append("payment_method", selectedPaymentMethod);
      formData.append("reference_number", `REF-${Date.now()}`);
      formData.append("payment_proof", uploadedFile);
      formData.append("bid", bid.id.toString());

      await paymentsApi.createPayment(formData);

      toast.success(
        "Payment submitted successfully and is under review. You will be notified once approved."
      );
      setHasPaid(true);
      setShowPaymentForm(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Payment submission failed");
      } else {
        toast.error("Payment submission failed");
      }
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedText(null), 2000);
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
            {hasPaid
              ? "Complete bid information and submission options"
              : "Basic information only - pay ETB 200 to unlock full details and submit offers"}
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

        {/* Show additional details only after payment */}
        {hasPaid && (
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
                      {bid.budget}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="flex flex-col md:flex-row text-gray-600">
                  <strong>Posted:</strong> {bid.postedDate}
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
      {!hasPaid ? (
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

          {/* Animated Modal Overlay */}
          <AnimatePresence>
            {showPaymentForm && (
              <>
                {/* Modal Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setSelectedPaymentMethod(null);
                    setUploadedFile(null);
                  }}
                >
                  {/* Modal Content */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Unlock Complete Bid Details & Offer Submission
                        </h3>
                        <div className="flex items-center justify-center gap-3 mb-4">
                          <Info className="w-5 h-5 text-blue-600" />
                          <p className="text-sm text-gray-600">
                            Choose your payment method and upload proof of
                            payment
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* CBE Option */}
                        <div
                          onClick={() => handlePaymentMethodSelect("cbe")}
                          className={`bg-purple-50 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            selectedPaymentMethod === "cbe"
                              ? "border-purple-600 ring-2 ring-purple-200"
                              : "border-purple-300 hover:border-purple-400"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src="/img/cbe.png"
                                alt="CBE"
                                className="w-10 h-10"
                              />
                              <span className="text-gray-900 font-medium">
                                CBE
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-900 font-mono text-lg font-semibold">
                                1000123123123
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy("1000123123123", "cbe");
                                }}
                                className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                                title="Copy account number"
                              >
                                {copiedText === "cbe" ? (
                                  <Check className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Copy className="w-5 h-5 text-purple-600" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* TeleBirr Option */}
                        <div
                          onClick={() => handlePaymentMethodSelect("telebirr")}
                          className={`bg-green-50 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            selectedPaymentMethod === "telebirr"
                              ? "border-green-600 ring-2 ring-green-200"
                              : "border-green-300 hover:border-green-400"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src="/img/telebirr.png"
                                alt="TeleBirr"
                                className="h-10"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-900 font-mono text-lg font-semibold">
                                +251912121212
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy("+251912121212", "telebirr");
                                }}
                                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                title="Copy phone number"
                              >
                                {copiedText === "telebirr" ? (
                                  <Check className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Copy className="w-5 h-5 text-green-600" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Upload Section */}
                      {selectedPaymentMethod && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Upload Payment Screenshot
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                              <input
                                type="file"
                                id="payment-screenshot"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                              <label
                                htmlFor="payment-screenshot"
                                className="cursor-pointer flex flex-col items-center gap-2"
                              >
                                <Upload className="w-8 h-8 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {uploadedFile
                                    ? uploadedFile.name
                                    : "Click to upload or drag and drop"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  PNG, JPG, GIF up to 10MB
                                </span>
                              </label>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowPaymentForm(false);
                                setSelectedPaymentMethod(null);
                                setUploadedFile(null);
                              }}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handlePaymentSubmit}
                              variant="secondary"
                              className="flex-1"
                              disabled={!uploadedFile}
                            >
                              Submit Payment Proof
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      ) : (
        <>
          {/* Full Details (Visible After Payment) */}
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

          {/* Submit Offer Section */}
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
        </>
      )}
    </div>
  );
}
