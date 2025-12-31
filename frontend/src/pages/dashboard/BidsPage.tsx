import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Package, Plus } from "lucide-react";
import { bidsApi, paymentsApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/hooks/useAuth";
import { RatingDisplay } from "@/components/ui/rating";
import RatingDetailsModal from "@/components/RatingDetailsModal";
// import { usersApi } from "@/lib/api";
import type { DashboardBidSummary } from "@/types";

type ProcessedBid = DashboardBidSummary & {
  isPaid: boolean;
  cargoType: string; // This is cargo_type from API
  description: string;
  weight: string;
  offers: number; // This is offers_count from API
  deadline: string;
  budget: string;
  lowestOffer?: string | null;
  origin: string;
  destination: string;
};

export default function BidsPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [deadlineFilter, setDeadlineFilter] = useState<string>("all");
  const [offersFilter, setOffersFilter] = useState<string>("all");
  const [cargoTypeFilter, setCargoTypeFilter] = useState<string>("all");

  const [bids, setBids] = useState<DashboardBidSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [paidBids, setPaidBids] = useState<Set<number>>(new Set());
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<{
    userId: number;
    userName: string;
  } | null>(null);

  // Redirect shippers to my-bids page
  useEffect(() => {
    console.log("User role:", user?.role, "User ID:", user?.id);
    if (user && user.role === "shipper") {
      console.log("Redirecting shipper to my-bids page");
      navigate("/dashboard/my-bids", { replace: true });
    }
  }, [user, navigate]);

  const checkPaidBids = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Get user's payments to see which bids they've paid for
      const paymentsResponse = await paymentsApi.getPayments();
      const userPayments = Array.isArray(paymentsResponse.data)
        ? (paymentsResponse.data as Array<{
            bid?: number | { id: number };
            status: string;
          }>)
        : [];

      // Create a set of bid IDs that the user has approved payments for
      const paidBidIds = new Set<number>();
      userPayments.forEach((payment) => {
        if (payment.bid && payment.status === "approved") {
          // Handle both object and number bid references
          let bidId: number;
          if (typeof payment.bid === "object" && payment.bid?.id) {
            bidId = payment.bid.id;
          } else if (typeof payment.bid === "number") {
            bidId = payment.bid;
          } else if (typeof payment.bid === "string") {
            bidId = parseInt(payment.bid, 10);
          } else {
            console.warn("Invalid bid reference in payment:", payment);
            return;
          }

          // console.log('Found paid bid:', bidId, 'for payment:', payment.id, 'status:', payment.status);
          paidBidIds.add(bidId);
        }
      });

      console.log(
        "Total paid bids found:",
        paidBidIds.size,
        Array.from(paidBidIds)
      );
      setPaidBids(paidBidIds);
    } catch (error) {
      console.error("Failed to check payment status:", error);
      setPaidBids(new Set());
    }
  }, [user?.id]);

  const fetchBids = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bidsApi.getBids();
      // Ensure we always set an array
      const bidsData = Array.isArray(response.data) ? response.data : [];
      setBids(bidsData);

      // Check payment status for these bids
      await checkPaidBids();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load bids";
      toast.error(errorMessage);
      setBids([]);
    } finally {
      setLoading(false);
    }
  }, [checkPaidBids]);

  // Fetch bids on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchBids();
    }
  }, [fetchBids, user]);

  // Refresh data when the tab regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchBids();
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchBids, user]);

  // Process bids data to add payment status
  const processedBids = bids
    .filter(
      (bid) =>
        bid.status === "active" ||
        bid.status === "approved" ||
        bid.status === undefined
    )
    .map((bid: DashboardBidSummary) => ({
      ...bid,
      isPaid: paidBids.has(bid.id),
      offers: bid.offers_count, // Map offers_count to offers
      cargoType: bid.cargo_type, // Map cargo_type to cargoType
      lowestOffer: bid.lowest_offer, // Map lowest_offer to lowestOffer
    }));

  // Security check: Ensure we never show full details for unpaid bids
  const secureBids = processedBids.map((bid: ProcessedBid) => ({
    ...bid,
    // Override sensitive fields for unpaid bids to prevent accidental exposure
    ...(bid.isPaid
      ? {}
      : {
          budget: undefined,
          deadline: undefined,
          lowestOffer: undefined,
          origin: bid.origin ? bid.origin.substring(0, 1) + "***" : undefined,
          destination: bid.destination
            ? bid.destination.substring(0, 1) + "***"
            : undefined,
        }),
  }));

  const formatStatusLabel = (status?: string) => {
    if (!status) return "Active";
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Extract unique cargo types for filter
  const cargoTypes = Array.from(
    new Set(secureBids.map((bid) => bid.cargoType))
  );

  const filteredBids = secureBids.filter((bid) => {
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transport Bids</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Browse freight transport opportunities posted by shippers. Submit
            competitive offers to win contracts.
          </p>
        </div>
        {user?.role === "shipper" && (
          <Button
            variant="secondary"
            onClick={() => navigate("/dashboard/bids/create")}
            className="flex items-center gap-2 w-full sm:w-auto self-start"
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
                  className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div>

                    <h3 className="text-lg font-semibold text-gray-900">
                      {bid.title}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {bid.description}
                    </p>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded whitespace-nowrap ${
                          bid.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {formatStatusLabel(bid.status)}
                      </span>

                      {/* Company Rating - clickable */}
                      <div 
                        className="flex flex-col items-end gap-1 flex-shrink-0 cursor-pointer p-2 hover:bg-gray-500/10  rounded-lg transition-all"
                        onClick={() => {
                          setRatingTarget({
                            userId: bid.user.id,
                            userName: bid.user.company_name || bid.user.full_name,
                          });
                          setShowRatingModal(true);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <RatingDisplay
                            rating={Number(bid.user.average_rating) || 0}
                            showText={false}
                            size="sm"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {(Number(bid.user.average_rating) || 0).toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600">
                          {bid.user.company_name || bid.user.full_name}
                        </span>
                      </div>
                      </div>
                    </div>

                    {bid.isPaid ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <strong className="text-gray-900 text-xs">Route:</strong>
                            <span className="truncate">{bid.origin} → {bid.destination}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <strong className="text-gray-900 text-xs">Cargo:</strong>
                            <span className="truncate">{bid.cargoType} ({bid.weight})</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-500">
                          <div>
                            <strong className="text-xs">Budget:</strong>
                            <div className="text-gray-900">{bid.budget}</div>
                          </div>
                          <div>
                            <strong className="text-xs">Deadline:</strong>
                            <div className="text-gray-900">{bid.deadline}</div>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <strong className="text-xs">Offers:</strong>
                            <div className="text-gray-900">
                              {bid.offers === 0 ? "No offers" : bid.offers}
                            </div>
                          </div>
                        </div>
                        {bid.lowestOffer && (
                          <div className="text-sm text-green-600 font-semibold bg-green-50 px-3 py-2 rounded-lg">
                            <strong>Lowest Offer:</strong> {bid.lowestOffer}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-blue-700 text-sm">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
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
                            Pay ETB 200 to unlock full bid details and submit offers
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-end pt-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/dashboard/bids/${bid.id}`)}
                        className="w-full sm:w-auto"
                      >
                        View Details
                      </Button>
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

      {/* Rating Details Modal */}
      {ratingTarget && (
        <RatingDetailsModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setRatingTarget(null);
          }}
          userId={ratingTarget.userId}
          userName={ratingTarget.userName}
        />
      )}
    </div>
  );
}
