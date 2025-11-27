import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Eye, Trash2 } from "lucide-react";

export default function MyBidsPage() {
  const navigate = useNavigate();
  const [myBids] = useState([
    {
      id: 1,
      title: "Freight Transport from Addis Ababa to Dire Dawa",
      description:
        "Transport 50 tons of construction materials. Delivery required within 3 days.",
      budget: "ETB 25,000",
      postedDate: "2024-01-15",
      deadline: "2024-01-18",
      offers: 5,
      lowestOffer: "ETB 22,500",
      origin: "Addis Ababa",
      destination: "Dire Dawa",
      cargoType: "Construction Materials",
      weight: "50 tons",
      status: "active",
    },
    {
      id: 5,
      title: "Agricultural Products Delivery to Gondar",
      description:
        "Transport fresh agricultural products. Temperature-controlled transport required.",
      budget: "ETB 18,000",
      postedDate: "2024-01-12",
      deadline: "2024-01-16",
      offers: 2,
      lowestOffer: "ETB 17,000",
      origin: "Addis Ababa",
      destination: "Gondar",
      cargoType: "Agricultural Products",
      weight: "3 tons",
      status: "active",
    },
    {
      id: 7,
      title: "Electronics Shipment to Jimma",
      description: "Secure transport of electronic equipment. Insurance required.",
      budget: "ETB 30,000",
      postedDate: "2024-01-08",
      deadline: "2024-01-12",
      offers: 8,
      lowestOffer: "ETB 28,500",
      origin: "Addis Ababa",
      destination: "Jimma",
      cargoType: "Electronics",
      weight: "1.5 tons",
      status: "closed",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
          <p className="text-gray-600 mt-1">
            View and manage your posted freight transport bids
          </p>
        </div>
      </div>

      {/* Bids List */}
      <div className="space-y-4">
        {myBids.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              You haven't posted any bids yet
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate("/dashboard/bids/create")}
            >
              Create Your First Bid
            </Button>
          </div>
        ) : (
          myBids.map((bid) => (
            <div
              key={bid.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {bid.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        bid.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {bid.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>
                        <strong className="text-gray-900">Route:</strong>{" "}
                        {bid.origin} → {bid.destination}
                      </span>
                      <span>
                        <strong className="text-gray-900">Cargo:</strong>{" "}
                        {bid.cargoType} ({bid.weight})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>
                        <strong>Budget:</strong> {bid.budget}
                      </span>
                      {bid.lowestOffer && (
                        <span>
                          <strong>Lowest Offer:</strong>{" "}
                          <span className="text-green-600 font-semibold">
                            {bid.lowestOffer}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>
                        <strong>Posted:</strong> {bid.postedDate}
                      </span>
                      <span>
                        <strong>Deadline:</strong> {bid.deadline}
                      </span>
                      <span>
                        <strong>Offers Received:</strong> {bid.offers}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/dashboard/bids/${bid.id}`)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Offers
                  </Button>
                  {bid.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

