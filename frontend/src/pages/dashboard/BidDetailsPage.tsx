import { useState } from "react";
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

  // Mock bid data - in real app, fetch based on id
  const bid = {
    id: parseInt(id || "1"),
    title: "Freight Transport from Addis Ababa to Dire Dawa",
    description:
      "Transport 50 tons of construction materials. Delivery required within 3 days. Materials include cement, steel bars, and building blocks. Must have proper securing equipment.",
    budget: "ETB 25,000",
    postedDate: "2024-01-15",
    deadline: "2024-01-18",
    offers: 5,
    lowestOffer: "ETB 22,500",
    shipperName: "ABC Construction Ltd.",
    shipperPhone: "+251 911 234 567",
    shipperEmail: "contact@abcconstruction.com",
    origin: "Addis Ababa",
    originAddress: "Bole Road, near Edna Mall",
    destination: "Dire Dawa",
    destinationAddress: "Industrial Area, Warehouse 12",
    cargoType: "Construction Materials",
    weight: "50 tons",
    specialRequirements:
      "Requires flatbed truck with securing straps. Loading assistance available at origin. Unloading equipment available at destination.",
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

  const handlePaymentSubmit = () => {
    if (!selectedPaymentMethod || !uploadedFile) {
      toast.error("Please select a payment method and upload a screenshot");
      return;
    }
    toast.success(
      "Payment information submitted and under review. You will be notified once approved."
    );
    setHasPaid(true);
    setShowPaymentForm(false);
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedText(null), 2000);
  };

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
              ? "Complete bid information"
              : "Limited information - pay to unlock full details"}
          </p>
        </div>
      </div>

      {/* Basic Information (Always Visible) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {bid.title}
          </h2>
          <p className="text-gray-600 line-clamp-3">{bid.description}</p>
        </div>

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
                <p className="text-sm font-medium text-gray-500">Deadline</p>
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
            <span className="text-gray-600">
              <strong>Posted:</strong> {bid.postedDate}
            </span>
            <span className="text-gray-600">
              <strong>Offers Received:</strong> {bid.offers}
            </span>
            {bid.lowestOffer && (
              <span className="text-green-600 font-semibold">
                <strong>Lowest Offer:</strong> {bid.lowestOffer}
              </span>
            )}
          </div>
        </div>
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
                  Unlock Full Details and bid participation
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Pay a small fee to access complete bid information including
                  shipper contact details, exact addresses, and special
                  requirements.
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
                          Unlock Full Details and bid participation
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
                              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                CBE
                              </div>
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
                              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                TB
                              </div>
                              <span className="text-gray-900 font-medium">
                                TeleBirr
                              </span>
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
