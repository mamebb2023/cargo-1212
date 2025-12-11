import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Package, Plus, Check, X, Eye } from "lucide-react";
import { bidsApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

export default function BidsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [deadlineFilter, setDeadlineFilter] = useState<string>("all");
  const [offersFilter, setOffersFilter] = useState<string>("all");
  const [cargoTypeFilter, setCargoTypeFilter] = useState<string>("all");

  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paidBids, setPaidBids] = useState<number[]>([]);

  // Fetch bids on component mount
  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const response = await bidsApi.getBids();
      // Ensure we always set an array
      const bidsData = Array.isArray(response.data) ? response.data : [];
      setBids(bidsData);

      // For now, we'll assume all bids are unpaid for demo
      // In real app, this would check user's payment status for each bid
      setPaidBids([]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load bids";
      toast.error(errorMessage);
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  // Process bids data to add payment status
  const processedBids = bids
    .filter(
      (bid) =>
        bid.status === "active" ||
        bid.status === "approved" ||
        bid.status === undefined
    )
    .map((bid) => ({
      ...bid,
      isPaid: paidBids.includes(bid.id),
    }));

  const formatStatusLabel = (status?: string) => {
    if (!status) return "Active";
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Extract unique cargo types for filter
  const cargoTypes = Array.from(
    new Set(processedBids.map((bid) => bid.cargoType))
  );

  const filteredBids = processedBids.filter((bid) => {
    const matchesSearch =
      bid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bid.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || bid.status === filterStatus;

    // Deadline filter (compare dates - simple implementation)
    let matchesDeadline = true;
    if (deadlineFilter === "urgent") {
      const deadlineDate = new Date(bid.deadline);
      const today = new Date();
      const diffDays = Math.ceil(
        (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      matchesDeadline = diffDays <= 3;
    } else if (deadlineFilter === "soon") {
      const deadlineDate = new Date(bid.deadline);
      const today = new Date();
      const diffDays = Math.ceil(
        (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      matchesDeadline = diffDays > 3 && diffDays <= 7;
    }

    // Offers filter
    let matchesOffers = true;
    if (offersFilter === "low") {
      matchesOffers = bid.offers <= 3;
    } else if (offersFilter === "medium") {
      matchesOffers = bid.offers > 3 && bid.offers <= 8;
    } else if (offersFilter === "high") {
      matchesOffers = bid.offers > 8;
    }

    // Cargo type filter
    const matchesCargoType =
      cargoTypeFilter === "all" || bid.cargoType === cargoTypeFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDeadline &&
      matchesOffers &&
      matchesCargoType
    );
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
        {user?.role === "shipper" && (
          <Button
            variant="secondary"
            onClick={() => navigate("/dashboard/bids/create")}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create a Bid
          </Button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side - Search and Bids List */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Filter */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className={`flex flex-col md:flex-row md:items-center gap-4`}>
              <div
                className={`flex-1 relative ${
                  showMobileFilters ? "transition-all duration-300" : ""
                }`}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search bids by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
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
                {/* Mobile Filter Button - Hidden on lg screens */}
                <Button
                  variant="outline"
                  className="flex items-center gap-2 lg:hidden"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                  <Filter className="w-4 h-4" />
                  More Filters
                </Button>
              </div>

              {/* Mobile Filters - Expandable */}
              {showMobileFilters && (
                <div className="lg:hidden border-t border-gray-200 pt-4 space-y-4">
                  {/* Deadline Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="deadline"
                          value="all"
                          checked={deadlineFilter === "all"}
                          onChange={(e) => setDeadlineFilter(e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">All</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="deadline"
                          value="urgent"
                          checked={deadlineFilter === "urgent"}
                          onChange={(e) => setDeadlineFilter(e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">
                          Urgent (≤3 days)
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="deadline"
                          value="soon"
                          checked={deadlineFilter === "soon"}
                          onChange={(e) => setDeadlineFilter(e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">
                          Soon (4-7 days)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Offers Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Offers
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="offers"
                          value="all"
                          checked={offersFilter === "all"}
                          onChange={(e) => setOffersFilter(e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">All</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="offers"
                          value="low"
                          checked={offersFilter === "low"}
                          onChange={(e) => setOffersFilter(e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Low (≤3)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="offers"
                          value="medium"
                          checked={offersFilter === "medium"}
                          onChange={(e) => setOffersFilter(e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">
                          Medium (4-8)
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="offers"
                          value="high"
                          checked={offersFilter === "high"}
                          onChange={(e) => setOffersFilter(e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">High (9+)</span>
                      </label>
                    </div>
                  </div>

                  {/* Cargo Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cargo Type
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="cargoType"
                          value="all"
                          checked={cargoTypeFilter === "all"}
                          onChange={(e) => setCargoTypeFilter(e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">All</span>
                      </label>
                      {cargoTypes.map((type) => (
                        <label key={type} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="cargoType"
                            value={type}
                            checked={cargoTypeFilter === type}
                            onChange={(e) => setCargoTypeFilter(e.target.value)}
                            className="text-blue-600"
                          />
                          <span className="text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bids List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading bids...</p>
              </div>
            ) : filteredBids.length === 0 ? (
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
                        <span className="inline-flex items-center gap-2">
                          {bid.title}
                          <span
                            className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                              bid.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {formatStatusLabel(bid.status)}
                          </span>
                        </span>
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {bid.description}
                      </p>

                      {/* Show additional details only if paid */}
                      {bid.isPaid ? (
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
                            <span>
                              <strong>Deadline:</strong> {bid.deadline}
                            </span>
                            <span>
                              <strong>Offers:</strong> {bid.offers}
                            </span>
                          </div>
                          {bid.lowestOffer && (
                            <div className="text-sm text-green-600 font-semibold">
                              <strong>Lowest Offer:</strong> {bid.lowestOffer}
                            </div>
                          )}
                          <div className="text-sm text-gray-500">
                            <strong>Shipper:</strong> {bid.shipperName}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-blue-700 text-sm">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>
                              Pay ETB 200 to unlock full bid details and submit
                              offers
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/dashboard/bids/${bid.id}`)}
                      >
                        View Details
                      </Button>
                      {!bid.isPaid && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/dashboard/bids/${bid.id}`)}
                        >
                          Pay & Unlock
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Filters (Hidden on mobile, visible on lg screens) */}
        <div className="hidden lg:block">
          <div className="sticky top-6 bg-gray-100 border border-gray-300 rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>

            {/* Deadline Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Deadline
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deadline-lg"
                    value="all"
                    checked={deadlineFilter === "all"}
                    onChange={(e) => setDeadlineFilter(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">All</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deadline-lg"
                    value="urgent"
                    checked={deadlineFilter === "urgent"}
                    onChange={(e) => setDeadlineFilter(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    Urgent (≤3 days)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deadline-lg"
                    value="soon"
                    checked={deadlineFilter === "soon"}
                    onChange={(e) => setDeadlineFilter(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Soon (4-7 days)</span>
                </label>
              </div>
            </div>

            {/* Offers Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Offers
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="offers-lg"
                    value="all"
                    checked={offersFilter === "all"}
                    onChange={(e) => setOffersFilter(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">All</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="offers-lg"
                    value="low"
                    checked={offersFilter === "low"}
                    onChange={(e) => setOffersFilter(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Low (≤3)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="offers-lg"
                    value="medium"
                    checked={offersFilter === "medium"}
                    onChange={(e) => setOffersFilter(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Medium (4-8)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="offers-lg"
                    value="high"
                    checked={offersFilter === "high"}
                    onChange={(e) => setOffersFilter(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">High (9+)</span>
                </label>
              </div>
            </div>

            {/* Cargo Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Cargo Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cargoType-lg"
                    value="all"
                    checked={cargoTypeFilter === "all"}
                    onChange={(e) => setCargoTypeFilter(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">All</span>
                </label>
                {cargoTypes.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="cargoType-lg"
                      value={type}
                      checked={cargoTypeFilter === type}
                      onChange={(e) => setCargoTypeFilter(e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
