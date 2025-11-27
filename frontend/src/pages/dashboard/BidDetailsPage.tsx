import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, CreditCard, Package, MapPin, Calendar, Truck } from "lucide-react";

export default function BidDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hasPaid, setHasPaid] = useState(false);

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
    toast.success("Payment successful! Full details are now available.");
    setHasPaid(true);
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
            {hasPaid ? "Complete bid information" : "Limited information - pay to unlock full details"}
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
                <p className="text-gray-900 text-lg font-semibold">{bid.budget}</p>
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
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Unlock Full Details
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Pay a small fee to access complete bid information including shipper contact details, exact addresses, and special requirements.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 max-w-sm mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">Access Fee</span>
                <span className="text-2xl font-bold text-gray-900">ETB 200</span>
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
                Pay ETB 50 and View Full Details
              </Button>
            </div>
          </div>
        </div>
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
                  <p className="text-sm font-medium text-gray-500">Company Name</p>
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
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pickup Location</p>
                  <p className="text-gray-900 font-medium">{bid.origin}</p>
                  <p className="text-sm text-gray-600">{bid.originAddress}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Delivery Location</p>
                  <p className="text-gray-900 font-medium">{bid.destination}</p>
                  <p className="text-sm text-gray-600">{bid.destinationAddress}</p>
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
              Ready to transport this cargo? Submit your competitive offer below.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1">
                Submit Offer
              </Button>
              <Button variant="outline">
                Contact Shipper
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

