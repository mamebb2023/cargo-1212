import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Package,
  Eye,
  Trash2,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { useAuthContext } from "@/hooks/useAuth";
import { bidsApi } from "@/lib/api";
import type { BackendBidDetail } from "@/types";

export default function MyBidsPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const isShipper = user?.role === "shipper";
  const isAdmin = user?.role === "admin";
  const [loading, setLoading] = useState(true);
  const [myBids, setMyBids] = useState<
    Array<{
      id: number;
      title: string;
      description?: string;
      budget?: string;
      postedDate?: string;
      deadline?: string;
      offers?: number;
      lowestOffer?: string | null;
      origin?: string;
      destination?: string;
      cargoType?: string;
      weight?: string;
      status?: string;
    }>
  >([]);

  const formatDate = useCallback((value?: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  }, []);

  const mapBid = useCallback(
    (bid: BackendBidDetail) => {
      const normalizedStatus = (bid.status || "active").toLowerCase();
      return {
        id: bid.id,
        title: bid.title,
        description: bid.description,
        budget: bid.budget,
        postedDate: formatDate(bid.created_at),
        deadline: formatDate(bid.deadline),
        offers: bid.offers_count ?? 0,
        lowestOffer: bid.lowest_offer ?? null,
        origin: bid.origin,
        destination: bid.destination,
        cargoType: bid.cargo_type ?? bid.cargoType,
        weight: bid.weight,
        status: normalizedStatus,
      };
    },
    [formatDate]
  );

  const loadMyBids = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bidsApi.getMyBids();
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray((res as any)?.data?.results)
        ? (res as any).data.results
        : [];
      setMyBids(data.map(mapBid));
    } catch (error) {
      console.error("Failed to load my bids", error);
      // fall back to empty list but keep UI responsive
      setMyBids([]);
    } finally {
      setLoading(false);
    }
  }, [mapBid]);

  useEffect(() => {
    void loadMyBids();
  }, [loadMyBids]);

  // Refresh data when the tab regains focus
  useEffect(() => {
    const handleFocus = () => {
      void loadMyBids();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadMyBids]);

  const formatStatusLabel = (status?: string) => {
    if (!status) return "—";
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = myBids.length;
    const active = myBids.filter((bid) => bid.status === "active").length;
    const closed = myBids.filter((bid) => bid.status === "closed").length;
    const pending = myBids.filter((bid) => bid.status === "pending").length;
    const rejected = myBids.filter((bid) => bid.status === "rejected").length;
    const approved = myBids.filter((bid) => bid.status === "approved").length;
    return { total, active, closed, pending, rejected, approved };
  }, [myBids]);

  if (!isShipper && !isAdmin) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center space-y-4">
        <Package className="w-10 h-10 text-gray-400 mx-auto" />
        <p className="text-gray-700">
          My Bids is available for shippers and admins only.
        </p>
        <Button variant="secondary" onClick={() => navigate("/dashboard/bids")}>
          Go to Bids
        </Button>
      </div>
    );
  }

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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bids List - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Loading your bids…</p>
            </div>
          ) : myBids.length === 0 ? (
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
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          bid.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : bid.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : bid.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {formatStatusLabel(bid.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {bid.description || "No description provided."}
                    </p>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>
                          <strong className="text-gray-900">Route:</strong>{" "}
                          {bid.origin || "—"} → {bid.destination || "—"}
                        </span>
                        <span>
                          <strong className="text-gray-900">Cargo:</strong>{" "}
                          {bid.cargoType || "—"}{" "}
                          {bid.weight ? `(${bid.weight})` : ""}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>
                          <strong>Budget:</strong> {bid.budget || "—"}
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
                          <strong>Posted:</strong> {bid.postedDate || "—"}
                        </span>
                        <span>
                          <strong>Deadline:</strong> {bid.deadline || "—"}
                        </span>
                        <span>
                          <strong>Offers Received:</strong>{" "}
                          {typeof bid.offers === "number" ? bid.offers : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/dashboard/offers/${bid.id}`)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Offers
                    </Button>
                    {isShipper && bid.status === "active" && (
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

        {/* Stats Panel - Right Side */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Bid Statistics
            </h2>
            <div className="space-y-4">
              {/* Total Bids */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Bids
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>

              {/* Active Bids */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {stats.active}
                </p>
              </div>

              {/* Closed Bids */}
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Closed</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-700">
                  {stats.closed}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
