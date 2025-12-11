import { AnimatePresence, motion } from "framer-motion";
import type { User, VerificationDocument } from "@/types";
import Loading from "@/components/ui/loading";
import { Button } from "@/components/ui/button";

type Props = {
  user: User | null;
  documents: VerificationDocument[];
  loadingDocuments: boolean;
  onClose: () => void;
  formatDateTime: (value?: string | null) => string;
};

export default function UserDetailModal({
  user,
  documents,
  loadingDocuments,
  onClose,
  formatDateTime,
}: Props) {
  return (
    <AnimatePresence>
      {user && (
        <motion.div
          key="user-modal"
          initial={{ opacity: 0, marginBottom: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 flex-center"
              aria-label="Close"
            >
              ✕
            </Button>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold shadow">
                {user.full_name
                  ?.split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("") || "U"}
              </div>
              <div className="flex-1 space-y-2 text-sm text-gray-800">
                <h3 className="text-xl font-semibold text-gray-900">
                  User Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <p>
                    <strong>Name:</strong> {user.full_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {user.phone}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>
                  <p>
                    <strong>Company:</strong> {user.company_name || "—"}
                  </p>
                  <p>
                    <strong>Carrier Type:</strong> {user.carrier_type || "—"}
                  </p>
                  <p>
                    <strong>Verified:</strong> {user.is_verified ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Payment Confirmed:</strong>{" "}
                    {user.is_payment_confirmed ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Created:</strong> {formatDateTime(user.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Documents
              </h4>
              {loadingDocuments ? (
                <Loading message="Loading documents..." />
              ) : documents.length === 0 ? (
                <p className="text-sm text-gray-600">No documents found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`border rounded-lg p-3 text-sm ${
                        doc.status === "approved"
                          ? "border-green-200 bg-green-50 text-green-800"
                          : doc.status === "rejected"
                          ? "border-red-200 bg-red-50 text-red-800"
                          : "border-gray-200 bg-gray-50 text-gray-800"
                      }`}
                    >
                      <p className="font-medium text-gray-900">
                        {doc.document_type}
                      </p>
                      <p className="text-xs mt-1 font-semibold">
                        Status:{" "}
                        {doc.status === "approved"
                          ? "APPROVED"
                          : doc.status === "rejected"
                          ? "REJECTED"
                          : "PENDING"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
