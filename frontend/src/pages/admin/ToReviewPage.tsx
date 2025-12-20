import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  adminApi,
  verificationApi,
  paymentsApi,
  bidsApi,
  API_BASE_URL,
} from "@/lib/api";
import Loading from "@/components/ui/loading";
import type {
  VerificationDocument as ApiVerificationDocument,
  AdminBid,
} from "@/types";
import { useAuthContext } from "@/hooks/useAuth";
import {
  FileText,
  Download,
  Check,
  X,
  Eye,
  Building2,
  Truck,
  Package,
} from "lucide-react";

interface SubmissionDocument {
  id: number;
  label: string;
  fileName: string;
  fileUrl?: string; // URL to the actual file
  status: "pending" | "approved" | "rejected";
}

interface DocumentSubmission {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userRole: "shipper" | "carrier";
  carrierSubcategory?: "company" | "plc" | "truckOwner";
  companyName?: string;
  companyNumberOfTrucks?: string;
  plcNumberOfTrucks?: string;
  truckLibrehNumber?: string;
  truckTinNumber?: string;
  submittedDate: string;
  documents: SubmissionDocument[];
}

type AdminPayment = {
  id: number;
  user?: { full_name?: string; email?: string; id?: number };
  user_name?: string;
  payment_method?: string;
  reference_number?: string;
  amount?: number | string | null;
  created_at?: string;
  payment_proof_url?: string | null;
  status?: string;
  bid?: number | { id: number; title?: string };
};

export default function ToReviewPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuthContext();
  const isAdmin = user?.role === "admin";
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    label: string;
  } | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processingDocumentId, setProcessingDocumentId] = useState<
    number | null
  >(null);
  const [processingPaymentId, setProcessingPaymentId] = useState<number | null>(
    null
  );
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [pendingBids, setPendingBids] = useState<AdminBid[]>([]);
  const [isLoadingBids, setIsLoadingBids] = useState(false);

  // Helper function to truncate long file names
  const truncateFileName = (
    fileName: string,
    maxLength: number = 25
  ): string => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split(".").pop();
    const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf("."));
    const truncatedName = nameWithoutExt.slice(
      0,
      maxLength - 3 - (extension ? extension.length + 1 : 0)
    );
    return extension
      ? `${truncatedName}...${extension}`
      : `${truncatedName}...`;
  };

  // Helper function to check if file is an image
  const isImageFile = (fileName: string): boolean => {
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
    ];
    const lowerFileName = fileName.toLowerCase();
    return imageExtensions.some((ext) => lowerFileName.endsWith(ext));
  };

  // Helper function to get file URL (construct from fileName if fileUrl not provided)
  const getFileUrl = (document: SubmissionDocument): string => {
    const url = document.fileUrl || `/uploads/${document.fileName}`;
    const isAbsolute = url.startsWith("http://") || url.startsWith("https://");
    const isApiRelative =
      url.startsWith("/media") || url.startsWith("/uploads");
    if (isAbsolute) return url;
    if (isApiRelative) return `${API_BASE_URL.replace(/\/api$/, "")}${url}`;
    return url;
  };

  // Handle viewing image
  const handleViewImage = (document: SubmissionDocument) => {
    const fileUrl = getFileUrl(document);
    setIsImageLoading(true);
    setSelectedImage({ url: fileUrl, label: document.label });
  };

  // Handle downloading file
  const handleDownloadFile = (doc: SubmissionDocument) => {
    const fileUrl = getFileUrl(doc);
    const isPdf = doc.fileName.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      // Open PDF in new tab
      window.open(fileUrl, "_blank");
      toast.success("PDF opened in new tab");
    } else {
      // Download other files
      const link = window.document.createElement("a");
      link.href = fileUrl;
      link.download = doc.fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      toast.success("Download started");
    }
  };

  const [submissions, setSubmissions] = useState<DocumentSubmission[]>([]);

  const formatDocumentLabel = useCallback((documentType: string): string => {
    const mapping: Record<string, string> = {
      business_license: "Business License",
      tax_clearance: "Tax Clearance",
      company_registration: "Company Registration",
      identity_document: "Identity Document",
      company_business_registration: "Company Business Registration",
      company_business_license: "Company Business License",
      company_competency_certificate: "Company Competency Certificate",
      company_tax_clearance: "Company Tax Clearance",
      company_vat_certificate: "Company VAT Certificate",
      plc_registration: "PLC Registration",
      plc_business_license: "PLC Business License",
      plc_competency_certificate: "PLC Competency Certificate",
      plc_tax_clearance: "PLC Tax Clearance",
      plc_vat_certificate: "PLC VAT Certificate",
      truck_business_licence: "Truck Business Licence",
    };

    if (mapping[documentType]) {
      return mapping[documentType];
    }

    return documentType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  const mapCarrierSubcategory = useCallback(
    (carrierType?: string | null): DocumentSubmission["carrierSubcategory"] => {
      if (!carrierType) return undefined;
      if (carrierType === "truck_owner") return "truckOwner";
      if (carrierType === "company" || carrierType === "plc") {
        return carrierType;
      }
      return undefined;
    },
    []
  );

  const mapDocumentsToSubmissions = useCallback(
    (documents: ApiVerificationDocument[]): DocumentSubmission[] => {
      const submissionsMap = new Map<number, DocumentSubmission>();

      documents.forEach((doc) => {
        const user = doc.user;
        if (!user) return;

        const carrierSubcategory = mapCarrierSubcategory(user.carrier_type);
        const formattedDocument: SubmissionDocument = {
          id: doc.id,
          label: formatDocumentLabel(doc.document_type),
          fileName:
            doc.file_url?.split("/").pop() || `${doc.document_type}.document`,
          fileUrl: doc.file_url || undefined,
          status: doc.status as SubmissionDocument["status"],
        };

        const existingSubmission = submissionsMap.get(user.id);

        if (existingSubmission) {
          existingSubmission.documents.push(formattedDocument);
          return;
        }

        submissionsMap.set(user.id, {
          id: user.id,
          userId: user.id,
          userName: user.full_name,
          userEmail: user.email,
          userPhone: user.phone,
          userRole: user.role === "carrier" ? "carrier" : "shipper",
          carrierSubcategory,
          companyName: user.company_name,
          companyNumberOfTrucks:
            carrierSubcategory === "company" && user.number_of_trucks
              ? String(user.number_of_trucks)
              : undefined,
          plcNumberOfTrucks:
            carrierSubcategory === "plc" && user.number_of_trucks
              ? String(user.number_of_trucks)
              : undefined,
          truckLibrehNumber: user.truck_libreh_number || undefined,
          truckTinNumber: user.truck_tin_number || undefined,
          submittedDate: doc.created_at
            ? new Date(doc.created_at).toLocaleDateString()
            : "",
          documents: [formattedDocument],
        });
      });

      return Array.from(submissionsMap.values());
    },
    [formatDocumentLabel, mapCarrierSubcategory]
  );

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getVerificationDocuments();
      const docs = Array.isArray(response.data) ? response.data : [];
      setSubmissions(mapDocumentsToSubmissions(docs));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load submissions";
      toast.error(message);
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [mapDocumentsToSubmissions]);

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoadingPayments(true);
      // Fetch all payments instead of just pending ones to include reviewed payments
      const res = await adminApi.getPayments();
      const data = Array.isArray(res.data) ? res.data : [];
      setPayments(data as AdminPayment[]);
    } catch {
      setPayments([]);
    } finally {
      setIsLoadingPayments(false);
    }
  }, []);

  const fetchBids = useCallback(async () => {
    try {
      setIsLoadingBids(true);
      const res = await adminApi.getBids({ status: "pending" });
      const data = Array.isArray(res.data) ? res.data : [];
      setPendingBids(data);
    } catch {
      setPendingBids([]);
    } finally {
      setIsLoadingBids(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      navigate("/dashboard/stats");
      return;
    }

    fetchSubmissions();
    fetchPayments();
    fetchBids();
  }, [fetchSubmissions, fetchPayments, fetchBids, isAdmin, navigate, loading]);

  // Auto-refresh on interval and when the tab regains focus
  useEffect(() => {
    const handleFocus = () => {
      void fetchSubmissions();
      void fetchPayments();
      void fetchBids();
    };

    const intervalId = window.setInterval(() => {
      void fetchSubmissions();
      void fetchPayments();
      void fetchBids();
    }, 20000);

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.clearInterval(intervalId);
    };
  }, [fetchSubmissions, fetchPayments, fetchBids]);

  const handlePaymentAction = async (
    paymentId: number,
    action: "approve" | "reject"
  ) => {
    const nextStatus = action === "approve" ? "approved" : "rejected";

    try {
      setProcessingPaymentId(paymentId);
      await paymentsApi.updatePaymentStatus(paymentId, nextStatus);

      setPayments((prev) =>
        prev.map((pay) =>
          pay.id === paymentId ? { ...pay, status: nextStatus } : pay
        )
      );

      toast.success(
        nextStatus === "approved"
          ? "Payment approved successfully"
          : "Payment rejected"
      );

      // Refresh payments data to ensure UI is up to date
      fetchPayments();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update payment";
      toast.error(message);
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleBidAction = async (
    bidId: number,
    action: "approve" | "reject"
  ) => {
    const nextStatus = action === "approve" ? "active" : "rejected";

    try {
      setProcessingDocumentId(bidId); // Reuse the processing state
      await bidsApi.updateBid(bidId, { status: nextStatus });

      setPendingBids((prev) => prev.filter((bid) => bid.id !== bidId));

      toast.success(
        nextStatus === "active" ? "Bid approved successfully" : "Bid rejected"
      );

      // Refresh bids data to ensure UI is up to date
      fetchBids();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update bid";
      toast.error(message);
    } finally {
      setProcessingDocumentId(null);
    }
  };

  const handleDocumentAction = async (
    submissionId: number,
    documentId: number,
    action: "approve" | "reject" | "download" | "view"
  ) => {
    const submission = submissions.find((s) => s.id === submissionId);
    const document = submission?.documents.find((d) => d.id === documentId);

    if (!document) return;

    if (action === "view" && isImageFile(document.fileName)) {
      handleViewImage(document);
      return;
    }

    if (action === "download") {
      handleDownloadFile(document);
      return;
    }

    const nextStatus = action === "approve" ? "approved" : "rejected";

    try {
      setProcessingDocumentId(documentId);
      await verificationApi.updateDocumentStatus(
        documentId,
        nextStatus,
        action === "reject" ? "Rejected by admin" : undefined
      );

      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === submissionId
            ? {
                ...sub,
                documents: sub.documents.map((doc) =>
                  doc.id === documentId ? { ...doc, status: nextStatus } : doc
                ),
              }
            : sub
        )
      );

      toast.success(
        nextStatus === "approved"
          ? "Document approved successfully"
          : "Document rejected"
      );

      // Refresh submissions data to ensure UI is up to date
      fetchSubmissions();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update document";
      toast.error(message);
    } finally {
      setProcessingDocumentId(null);
    }
  };

  const pendingSubmissions = useMemo(
    () =>
      submissions.filter((sub) =>
        sub.documents.some((doc) => doc.status === "pending")
      ),
    [submissions]
  );

  const pendingPayments = useMemo(
    () => payments.filter((pay) => pay.status === "pending"),
    [payments]
  );

  // Calculate total pending items (documents + payments + bids)
  const totalPendingItems = useMemo(
    () =>
      pendingSubmissions.length + pendingPayments.length + pendingBids.length,
    [pendingSubmissions.length, pendingPayments.length, pendingBids.length]
  );

  const reviewedSubmissions = useMemo(
    () =>
      submissions.filter((sub) =>
        sub.documents.every((doc) => doc.status !== "pending")
      ),
    [submissions]
  );

  const reviewedPayments = useMemo(
    () =>
      payments.filter(
        (pay) => pay.status === "approved" || pay.status === "rejected"
      ),
    [payments]
  );

  const totalReviewedItems = useMemo(
    () => reviewedSubmissions.length + reviewedPayments.length,
    [reviewedSubmissions.length, reviewedPayments.length]
  );

  const documentStatusStyles: Record<SubmissionDocument["status"], string> = {
    pending: "bg-yellow-50 border-yellow-200",
    approved: "bg-green-50 border-green-200",
    rejected: "bg-red-50 border-red-200",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Review Center</h1>
        <p className="text-gray-600 mt-1">
          Review and verify submitted user documents and payments
        </p>
      </div>

      {/* Pending Documents and Payments */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Documents and Payments
            </h2>
            <div className="flex items-center gap-2">
              {(isLoading || isLoadingPayments) && <Loading message="" />}
              <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-700 rounded">
                {totalPendingItems} pending
              </span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {isLoading || isLoadingPayments || isLoadingBids ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading pending items...</p>
            </div>
          ) : totalPendingItems === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No pending documents or payments to review
              </p>
            </div>
          ) : totalPendingItems === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No pending documents, payments, or bids to review
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending Payments Section */}
              {pendingPayments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Payments
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pendingPayments.map((pay) => (
                      <div
                        key={pay.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-300">
                            <Package className="w-5 h-5 text-gray-700" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900">
                                {pay.user_name ||
                                  pay.user?.full_name ||
                                  "Unknown User"}
                              </p>
                              <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700">
                                Payment
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {pay.user?.email || pay.user_name || "No email"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Submitted on{" "}
                              {pay.created_at
                                ? new Date(pay.created_at).toLocaleDateString()
                                : "Unknown"}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm font-medium text-gray-500 mb-3">
                          Payment Details
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between rounded-full border px-4 py-2 bg-gray-50">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Method:{" "}
                                {pay.payment_method?.toUpperCase() || "—"}
                              </p>
                              <p className="text-xs text-gray-600">
                                Ref: {pay.reference_number || "—"} | Amount:{" "}
                                {pay.amount || "—"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {pay.payment_proof_url &&
                              isImageFile(pay.payment_proof_url) ? (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="View payment proof"
                                  onClick={() => {
                                    setIsImageLoading(true);
                                    setSelectedImage({
                                      url: pay.payment_proof_url!,
                                      label: `Payment Proof - ${
                                        pay.user_name ||
                                        pay.user?.full_name ||
                                        "Unknown User"
                                      }`,
                                    });
                                  }}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 rounded-full"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              ) : pay.payment_proof_url ? (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Download payment proof"
                                  onClick={() => {
                                    const link =
                                      window.document.createElement("a");
                                    link.href = pay.payment_proof_url!;
                                    link.download = `payment_proof_${pay.id}.jpg`;
                                    window.document.body.appendChild(link);
                                    link.click();
                                    window.document.body.removeChild(link);
                                    toast.success("Download started");
                                  }}
                                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 rounded-full"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              ) : (
                                <span className="text-xs text-gray-500">
                                  No proof
                                </span>
                              )}
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Approve payment"
                                onClick={() =>
                                  handlePaymentAction(pay.id, "approve")
                                }
                                disabled={processingPaymentId === pay.id}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 rounded-full"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Reject payment"
                                onClick={() =>
                                  handlePaymentAction(pay.id, "reject")
                                }
                                disabled={processingPaymentId === pay.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 rounded-full"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">
                                PENDING
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Bids Section */}
              {pendingBids.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Bids
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pendingBids.map((bid) => (
                      <div
                        key={bid.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-300">
                            <Package className="w-5 h-5 text-gray-700" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900">
                                {bid.user?.full_name ||
                                  bid.user?.company_name ||
                                  "Unknown User"}
                              </p>
                              <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">
                                Bid
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {bid.user?.email || "No email"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Submitted on{" "}
                              {bid.created_at
                                ? new Date(bid.created_at).toLocaleDateString()
                                : "Unknown"}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm font-medium text-gray-500 mb-3">
                          Bid Details
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between rounded-full border px-4 py-2 bg-gray-50">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {bid.title}
                              </p>
                              <p className="text-xs text-gray-600">
                                Route: {bid.origin || "—"} →{" "}
                                {bid.destination || "—"} | Budget:{" "}
                                {bid.budget || "—"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Approve bid"
                                onClick={() =>
                                  handleBidAction(bid.id, "approve")
                                }
                                disabled={processingDocumentId === bid.id}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 rounded-full"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Reject bid"
                                onClick={() =>
                                  handleBidAction(bid.id, "reject")
                                }
                                disabled={processingDocumentId === bid.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 rounded-full"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">
                                PENDING
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Documents Section */}
              {pendingSubmissions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Documents
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pendingSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              submission.userRole === "carrier"
                                ? "bg-blue-300"
                                : "bg-green-300"
                            }`}
                          >
                            {submission.userRole === "carrier" ? (
                              <Truck className="w-5 h-5 text-gray-700" />
                            ) : (
                              <Package className="w-5 h-5 text-gray-700" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900">
                                {submission.userName}
                              </p>
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded ${
                                  submission.userRole === "carrier"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {submission.userRole === "carrier"
                                  ? "Carrier"
                                  : "Shipper"}
                              </span>
                              {submission.carrierSubcategory && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                                  {submission.carrierSubcategory === "company"
                                    ? "Company"
                                    : submission.carrierSubcategory === "plc"
                                    ? "PLC"
                                    : "Truck Owner"}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {submission.userEmail}
                            </p>
                            {submission.userPhone && (
                              <p className="text-sm text-gray-600">
                                {submission.userPhone}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Submitted on {submission.submittedDate}
                            </p>
                          </div>
                        </div>

                        {/* Additional User Details */}
                        {(submission.companyName ||
                          submission.companyNumberOfTrucks ||
                          submission.plcNumberOfTrucks ||
                          submission.truckLibrehNumber ||
                          submission.truckTinNumber) && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="w-4 h-4 text-gray-600" />
                              <p className="text-sm font-medium text-gray-700">
                                Company Details
                              </p>
                            </div>
                            <div className="space-y-1.5 text-sm">
                              {submission.companyName && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600 font-medium min-w-[120px]">
                                    Company Name:
                                  </span>
                                  <span className="text-gray-900">
                                    {submission.companyName}
                                  </span>
                                </div>
                              )}
                              {submission.companyNumberOfTrucks && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600 font-medium min-w-[120px]">
                                    Number of Trucks:
                                  </span>
                                  <span className="text-gray-900">
                                    {submission.companyNumberOfTrucks}
                                  </span>
                                </div>
                              )}
                              {submission.plcNumberOfTrucks && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600 font-medium min-w-[120px]">
                                    PLC Trucks:
                                  </span>
                                  <span className="text-gray-900">
                                    {submission.plcNumberOfTrucks}
                                  </span>
                                </div>
                              )}
                              {submission.truckLibrehNumber && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600 font-medium min-w-[120px]">
                                    Libreh Number:
                                  </span>
                                  <span className="text-gray-900">
                                    {submission.truckLibrehNumber}
                                  </span>
                                </div>
                              )}
                              {submission.truckTinNumber && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600 font-medium min-w-[120px]">
                                    TIN Number:
                                  </span>
                                  <span className="text-gray-900">
                                    {submission.truckTinNumber}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <p className="text-sm font-medium text-gray-500 mb-3">
                          Files and Documents
                        </p>
                        <div className="space-y-2">
                          {submission.documents.map((document) => (
                            <div
                              key={document.id}
                              className={`flex items-center justify-between rounded-full border px-4 py-2 ${
                                documentStatusStyles[document.status]
                              }`}
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {document.label}
                                </p>
                                <p
                                  className="text-xs text-gray-600"
                                  title={document.fileName}
                                >
                                  {truncateFileName(document.fileName)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {isImageFile(document.fileName) ? (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label="View image"
                                    onClick={() => handleViewImage(document)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 rounded-full"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label="Download document"
                                    onClick={() => handleDownloadFile(document)}
                                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 rounded-full"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Approve document"
                                  onClick={() =>
                                    handleDocumentAction(
                                      submission.id,
                                      document.id,
                                      "approve"
                                    )
                                  }
                                  disabled={
                                    processingDocumentId === document.id
                                  }
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 rounded-full"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Reject document"
                                  onClick={() =>
                                    handleDocumentAction(
                                      submission.id,
                                      document.id,
                                      "reject"
                                    )
                                  }
                                  disabled={
                                    processingDocumentId === document.id
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 rounded-full"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                                <span
                                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                    document.status === "approved"
                                      ? "bg-green-100 text-green-700"
                                      : document.status === "pending"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {document.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviewed Items */}
      {totalReviewedItems > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Recently Reviewed
              </h2>
              <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded">
                {totalReviewedItems} reviewed
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Reviewed Documents */}
              {reviewedSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        submission.userRole === "carrier"
                          ? "bg-blue-200"
                          : "bg-green-200"
                      }`}
                    >
                      {submission.userRole === "carrier" ? (
                        <Truck className="w-5 h-5 text-gray-700" />
                      ) : (
                        <Package className="w-5 h-5 text-gray-700" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {submission.userName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {submission.userEmail}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {submission.documents.map((document) => (
                      <div
                        key={document.id}
                        className={`flex items-center justify-between rounded-full border px-4 py-2 ${
                          documentStatusStyles[document.status]
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {document.label}
                          </p>
                          <p
                            className="text-xs text-gray-600"
                            title={document.fileName}
                          >
                            {truncateFileName(document.fileName)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isImageFile(document.fileName) ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="View image"
                              onClick={() => handleViewImage(document)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 rounded-full"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Download document"
                              onClick={() => handleDownloadFile(document)}
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 rounded-full"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              document.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {document.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Reviewed Payments */}
              {reviewedPayments.map((pay) => (
                <div
                  key={`payment-${pay.id}`}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-200">
                      <Package className="w-5 h-5 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {pay.user?.full_name || pay.user_name || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {pay.user?.email || "No email"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-full border px-4 py-2 bg-white">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Method: {pay.payment_method?.toUpperCase() || "—"}
                        </p>
                        <p className="text-xs text-gray-600">
                          Ref: {pay.reference_number || "—"} | Amount:{" "}
                          {pay.amount || "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {pay.payment_proof_url &&
                        isImageFile(pay.payment_proof_url) ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="View payment proof"
                            onClick={() => {
                              setIsImageLoading(true);
                              setSelectedImage({
                                url: pay.payment_proof_url!,
                                label: `Payment Proof - ${
                                  pay.user_name ||
                                  pay.user?.full_name ||
                                  "Unknown User"
                                }`,
                              });
                            }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 rounded-full"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        ) : pay.payment_proof_url ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Download payment proof"
                            onClick={() => {
                              const link = window.document.createElement("a");
                              link.href = pay.payment_proof_url!;
                              link.download = `payment_proof_${pay.id}.jpg`;
                              window.document.body.appendChild(link);
                              link.click();
                              window.document.body.removeChild(link);
                              toast.success("Download started");
                            }}
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 rounded-full"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-500">
                            No proof
                          </span>
                        )}
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            pay.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {pay.status?.toUpperCase() || "UNKNOWN"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedImage.label}
              </h3>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSelectedImage(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] flex items-center justify-center">
              {isImageLoading && <Loading message="Loading image..." />}
              <img
                src={selectedImage.url}
                alt={selectedImage.label}
                className="max-w-full max-h-[calc(90vh-120px)] object-contain rounded"
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  toast.error("Failed to load image");
                  setSelectedImage(null);
                  setIsImageLoading(false);
                }}
                style={{ display: isImageLoading ? "none" : "block" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
