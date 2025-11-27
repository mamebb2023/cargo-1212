import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Package, Plus } from "lucide-react";

export default function BidsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const bids = [
    {
      id: 1,
      title: "Freight Transport from Addis Ababa to Dire Dawa",
      description:
        "Transport 50 tons of construction materials. Delivery required within 3 days.",
      status: "active",
      budget: "ETB 25,000",
      postedDate: "2024-01-15",
      deadline: "2024-01-18",
      offers: 5,
      lowestOffer: "ETB 22,500",
      shipperName: "ABC Construction Ltd.",
      origin: "Addis Ababa",
      destination: "Dire Dawa",
      cargoType: "Construction Materials",
      weight: "50 tons",
    },
    {
      id: 2,
      title: "Cargo Delivery to Mekelle",
      description:
        "Urgent delivery of medical supplies. Requires refrigerated transport.",
      status: "active",
      budget: "ETB 35,000",
      postedDate: "2024-01-14",
      deadline: "2024-01-17",
      offers: 8,
      lowestOffer: "ETB 32,000",
      shipperName: "Health Supplies Co.",
      origin: "Addis Ababa",
      destination: "Mekelle",
      cargoType: "Medical Supplies",
      weight: "2 tons",
    },
    {
      id: 3,
      title: "Bulk Goods Transport to Bahir Dar",
      description:
        "Regular transport service for monthly delivery. Long-term contract available.",
      status: "pending",
      budget: "ETB 40,000",
      postedDate: "2024-01-13",
      deadline: "2024-01-20",
      offers: 3,
      lowestOffer: "ETB 38,500",
      shipperName: "Distribution Services Inc.",
      origin: "Addis Ababa",
      destination: "Bahir Dar",
      cargoType: "General Goods",
      weight: "15 tons",
    },
    {
      id: 4,
      title: "Express Delivery to Hawassa",
      description: "Small cargo delivery. Same-day service preferred.",
      status: "closed",
      budget: "ETB 15,000",
      postedDate: "2024-01-10",
      deadline: "2024-01-12",
      offers: 12,
      lowestOffer: "ETB 13,500",
      shipperName: "Express Logistics",
      origin: "Addis Ababa",
      destination: "Hawassa",
      cargoType: "Small Packages",
      weight: "500 kg",
    },
  ];

  const filteredBids = bids.filter((bid) => {
    const matchesSearch =
      bid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bid.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || bid.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transport Bids</h1>
          <p className="text-gray-600 mt-1">
            Browse freight transport opportunities posted by shippers. Submit
            competitive offers to win contracts.
          </p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => navigate("/dashboard/bids/create")}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create a Bid
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search bids by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Bids List */}
      <div className="space-y-4">
        {filteredBids.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No bids found matching your criteria
            </p>
          </div>
        ) : (
          filteredBids.map((bid) => (
            <div
              key={bid.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {bid.title}
                  </h3>
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
                        {bid.cargoType}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>
                        <strong>Deadline:</strong> {bid.deadline}
                      </span>
                      <span>
                        <strong>Offers:</strong> {bid.offers}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => navigate(`/dashboard/bids/${bid.id}`)}
                  >
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Submit Offer
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
