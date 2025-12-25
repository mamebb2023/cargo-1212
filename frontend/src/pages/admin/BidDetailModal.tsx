import { AnimatePresence, motion } from "framer-motion";
import type { AdminBid } from "@/types";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

type Props = {
  bid: AdminBid | null;
  onClose: () => void;
  onOpenBid: (id: number) => void;
};

export default function BidDetailModal({ bid, onClose, onOpenBid }: Props) {
  return (
    <AnimatePresence>
      {bid && (
        <motion.div
          key="bid-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Complete Bid Details for Review
            </h3>
            <div className="space-y-4 text-sm text-gray-800 max-h-[60vh] overflow-y-auto">
              {/* Basic Information */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                <div className="space-y-1">
                  <p>
                    <strong>Title:</strong> {bid.title}
                  </p>
                  {bid.description && (
                    <p>
                      <strong>Description:</strong> {bid.description}
                    </p>
                  )}
                  <p>
                    <strong>Budget:</strong> {bid.budget || "—"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        bid.status === "active"
                          ? "bg-green-100 text-green-700"
                          : bid.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {bid.status || "—"}
                    </span>
                  </p>
                  <p>
                    <strong>Deadline:</strong> {bid.deadline || "—"}
                  </p>
                </div>
              </div>

              {/* Route and Location Information */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Route & Location</h4>
                <div className="space-y-1">
                  <p>
                    <strong>Origin:</strong> {bid.origin || "—"}
                  </p>
                  {bid.origin_address && (
                    <p className="text-xs text-gray-600 ml-4">
                      Address: {bid.origin_address}
                    </p>
                  )}
                  <p>
                    <strong>Destination:</strong> {bid.destination || "—"}
                  </p>
                  {bid.destination_address && (
                    <p className="text-xs text-gray-600 ml-4">
                      Address: {bid.destination_address}
                    </p>
                  )}
                </div>
              </div>

              {/* Cargo Information */}
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Cargo Details</h4>
                <div className="space-y-1">
                  <p>
                    <strong>Cargo Type:</strong> {bid.cargo_type || "—"}
                  </p>
                  <p>
                    <strong>Weight:</strong> {bid.weight || "—"}
                  </p>
                  {bid.special_requirements && (
                    <p>
                      <strong>Special Requirements:</strong>{" "}
                      {bid.special_requirements}
                    </p>
                  )}
                  {bid.bid_files_url && (
                    <div className="flex items-center gap-2 mt-2">
                      <strong>Attached Files:</strong>
                      <a
                        href={bid.bid_files_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
                      >
                        <Download className="w-3 h-3" />
                        Download/View
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* User/Shipper Information */}
              <div className="bg-purple-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Shipper Information</h4>
                <div className="space-y-1">
                  <p>
                    <strong>Name:</strong>{" "}
                    {bid.user
                      ? bid.user.company_name ||
                        bid.user.full_name ||
                        "Unknown"
                      : "—"}
                  </p>
                  {bid.user?.company_name && bid.user?.full_name && (
                    <p className="text-xs text-gray-600 ml-4">
                      Contact Person: {bid.user.full_name}
                    </p>
                  )}
                  {bid.user?.email && (
                    <p>
                      <strong>Email:</strong> {bid.user.email}
                    </p>
                  )}
                  {bid.user?.phone && (
                    <p>
                      <strong>Phone:</strong> {bid.user.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Offers and Metrics */}
              <div className="bg-orange-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Offers & Statistics</h4>
                <div className="space-y-1">
                  <p>
                    <strong>Total Offers:</strong> {bid.offers_count ?? 0}
                  </p>
                  {bid.lowest_offer && (
                    <p>
                      <strong>Lowest Offer:</strong>{" "}
                      <span className="text-green-600 font-semibold">
                        {bid.lowest_offer}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                <div className="space-y-1">
                  <p>
                    <strong>Created:</strong>{" "}
                    {bid.created_at
                      ? new Date(bid.created_at).toLocaleString()
                      : "—"}
                  </p>
                  {bid.updated_at && (
                    <p>
                      <strong>Last Updated:</strong>{" "}
                      {new Date(bid.updated_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button variant="secondary" onClick={() => onOpenBid(bid.id)}>
                Open Bid Page
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
