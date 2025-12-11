import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Upload, Info, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";

type PaymentModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { paymentMethod: string; file: File }) => Promise<void> | void;
  onSuccess?: () => void;
  amountLabel?: string;
  title?: string;
  description?: string;
};

export default function PaymentModal({
  open,
  onClose,
  onSubmit,
  onSuccess,
  amountLabel = "ETB 200",
  title = "Unlock Complete Bid Details & Offer Submission",
  description = "Choose your payment method and upload proof of payment",
}: PaymentModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedText(null), 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPaymentMethod || !uploadedFile) {
      toast.error("Please select a payment method and upload a screenshot");
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit({
        paymentMethod: selectedPaymentMethod,
        file: uploadedFile,
      });
      onSuccess?.();
      setSelectedPaymentMethod(null);
      setUploadedFile(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Payment submission failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="payment-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  Payment Amount: {amountLabel}
                </p>
              </div>

              <div className="space-y-4">
                {/* CBE Option */}
                <div
                  onClick={() => setSelectedPaymentMethod("cbe")}
                  className={`bg-purple-50 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedPaymentMethod === "cbe"
                      ? "border-purple-600 ring-2 ring-purple-200"
                      : "border-purple-300 hover:border-purple-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src="/img/cbe.png" alt="CBE" className="w-10 h-10" />
                      <span className="text-gray-900 font-medium">CBE</span>
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
                  onClick={() => setSelectedPaymentMethod("telebirr")}
                  className={`bg-green-50 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedPaymentMethod === "telebirr"
                      ? "border-green-600 ring-2 ring-green-200"
                      : "border-green-300 hover:border-green-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src="/img/telebirr.png" alt="TeleBirr" className="h-10" />
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
                        <span className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        onClose();
                        setSelectedPaymentMethod(null);
                        setUploadedFile(null);
                      }}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      variant="secondary"
                      className="flex-1"
                      disabled={!uploadedFile || isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Payment Proof"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

