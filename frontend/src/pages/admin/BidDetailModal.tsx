import { AnimatePresence, motion } from "framer-motion";
import type { AdminBid } from "@/types";
import { Button } from "@/components/ui/button";

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
              Bid Details
            </h3>
            <div className="space-y-2 text-sm text-gray-800">
              <p>
                <strong>Title:</strong> {bid.title}
              </p>
              <p>
                <strong>Budget:</strong> {bid.budget || "—"}
              </p>
              <p>
                <strong>Status:</strong> {bid.status || "—"}
              </p>
              <p>
                <strong>Deadline:</strong> {bid.deadline || "—"}
              </p>
              <p>
                <strong>Offers:</strong> {bid.offers_count ?? 0}
              </p>
              <p>
                <strong>Lowest Offer:</strong> {bid.lowest_offer || "—"}
              </p>
              <p>
                <strong>Created:</strong> {bid.created_at || "—"}
              </p>
              <p>
                <strong>User:</strong>{" "}
                {bid.user
                  ? bid.user.company_name ||
                    bid.user.full_name ||
                    bid.user.email ||
                    "Unknown"
                  : "—"}
              </p>
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
