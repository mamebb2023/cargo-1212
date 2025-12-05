import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
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

export default function ToReviewPage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    label: string;
  } | null>(null);

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
    if (document.fileUrl) {
      return document.fileUrl;
    }
    // Construct URL from fileName (assuming files are stored in a public/uploads directory)
    // In production, this should come from the backend API
    return `/uploads/${document.fileName}`;
  };

  // Handle viewing image
  const handleViewImage = (document: SubmissionDocument) => {
    const fileUrl = getFileUrl(document);
    setSelectedImage({ url: fileUrl, label: document.label });
  };

  // Handle downloading file
  const handleDownloadFile = (doc: SubmissionDocument) => {
    const fileUrl = getFileUrl(doc);
    const link = window.document.createElement("a");
    link.href = fileUrl;
    link.download = doc.fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    toast.success("Download started");
  };

  const [submissions, setSubmissions] = useState<DocumentSubmission[]>([
    {
      id: 1,
      userId: 3,
      userName: "Mike Johnson",
      userEmail: "mike@example.com",
      userPhone: "+251 911 234 567",
      userRole: "carrier",
      carrierSubcategory: "company",
      companyName: "ABC Transport Ltd.",
      companyNumberOfTrucks: "15",
      submittedDate: "2024-01-20",
      documents: [
        {
          id: 101,
          label: "Business License",
          fileName: "business_license.pdf",
          fileUrl: "/uploads/business_license.pdf",
          status: "pending",
        },
        {
          id: 102,
          label: "Tax Clearance",
          fileName: "tax_clearance.webp",
          fileUrl: "/uploads/tax_clearance.webp",
          status: "pending",
        },
      ],
    },
    {
      id: 2,
      userId: 6,
      userName: "Emily Davis",
      userEmail: "emily@example.com",
      userPhone: "+251 922 345 678",
      userRole: "carrier",
      carrierSubcategory: "truckOwner",
      companyName: "Emily's Trucking",
      truckLibrehNumber: "LIB-12345",
      truckTinNumber: "TIN-67890",
      submittedDate: "2024-01-19",
      documents: [
        {
          id: 201,
          label: "Vehicle Registration",
          fileName: "vehicle_registration.jpg",
          fileUrl: "/uploads/vehicle_registration.jpg",
          status: "pending",
        },
        {
          id: 202,
          label: "Insurance Certificate",
          fileName: "insurance_certificate.pdf",
          fileUrl: "/uploads/insurance_certificate.pdf",
          status: "pending",
        },
      ],
    },
    {
      id: 3,
      userId: 10,
      userName: "Maria Martinez",
      userEmail: "maria@example.com",
      userPhone: "+251 933 456 789",
      userRole: "shipper",
      companyName: "Martinez Logistics",
      submittedDate: "2024-01-18",
      documents: [
        {
          id: 301,
          label: "Business License",
          fileName: "business_license.pdf",
          status: "approved",
        },
        {
          id: 302,
          label: "Tax Certificate",
          fileName: "tax_certificate.pdf",
          status: "approved",
        },
      ],
    },
    {
      id: 4,
      userId: 14,
      userName: "Linda White",
      userEmail: "linda@example.com",
      userPhone: "+251 944 567 890",
      userRole: "carrier",
      carrierSubcategory: "plc",
      companyName: "White Logistics PLC",
      plcNumberOfTrucks: "25",
      submittedDate: "2024-01-17",
      documents: [
        {
          id: 401,
          label: "Insurance Certificate",
          fileName: "insurance_cert.pdf",
          status: "rejected",
        },
        {
          id: 402,
          label: "Vehicle Inspection",
          fileName: "vehicle_inspection.pdf",
          status: "rejected",
        },
      ],
    },
  ]);

  useEffect(() => {
    // Check if user is admin
    const isAdmin = sessionStorage.getItem("isAdmin");
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleDocumentAction = (
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

    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? {
              ...sub,
              documents: sub.documents.map((doc) =>
                doc.id === documentId
                  ? {
                      ...doc,
                      status: action === "approve" ? "approved" : "rejected",
                    }
                  : doc
              ),
            }
          : sub
      )
    );

    const message =
      action === "approve"
        ? "Document approved successfully"
        : "Document rejected";

    if (action === "approve") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const pendingSubmissions = submissions.filter((sub) =>
    sub.documents.some((doc) => doc.status === "pending")
  );
  const reviewedSubmissions = submissions.filter((sub) =>
    sub.documents.every((doc) => doc.status !== "pending")
  );

  const documentStatusStyles: Record<SubmissionDocument["status"], string> = {
    pending: "bg-yellow-50 border-yellow-200",
    approved: "bg-green-50 border-green-200",
    rejected: "bg-red-50 border-red-200",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Document Review</h1>
        <p className="text-gray-600 mt-1">
          Review and verify submitted user documents
        </p>
      </div>

      {/* Pending Reviews */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Reviews
            </h2>
            <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-700 rounded">
              {pendingSubmissions.length} pending
            </span>
          </div>
        </div>
        <div className="p-6">
          {pendingSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No pending documents to review</p>
            </div>
          ) : (
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
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                    >
                      {submission.userRole === "carrier" ? (
                        <Truck className="w-5 h-5 text-white" />
                      ) : (
                        <Package className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
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

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-500">
                      Files and Documents
                    </p>
                    <div className="space-y-2">
                      {submission.documents.map((document) => (
                        <div
                          key={document.id}
                          className={`flex items-center justify-between gap-3 rounded-full border px-4 py-2 ${
                            documentStatusStyles[document.status]
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {document.label}
                            </p>
                            <p className="text-xs text-gray-600">
                              {document.fileName}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {isImageFile(document.fileName) ? (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="View image"
                                onClick={() =>
                                  handleDocumentAction(
                                    submission.id,
                                    document.id,
                                    "view"
                                  )
                                }
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 rounded-full"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Download document"
                                onClick={() =>
                                  handleDocumentAction(
                                    submission.id,
                                    document.id,
                                    "download"
                                  )
                                }
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recently Reviewed */}
      {reviewedSubmissions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recently Reviewed
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {reviewedSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
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
                          <p className="text-xs text-gray-600">
                            {document.fileName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isImageFile(document.fileName) ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="View image"
                              onClick={() =>
                                handleDocumentAction(
                                  submission.id,
                                  document.id,
                                  "view"
                                )
                              }
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 rounded-full"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Download document"
                              onClick={() =>
                                handleDocumentAction(
                                  submission.id,
                                  document.id,
                                  "download"
                                )
                              }
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 rounded-full"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <span
                            className={`text-xs font-semibold ${
                              document.status === "approved"
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {document.status.charAt(0).toUpperCase() +
                              document.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
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
              <img
                src={selectedImage.url}
                alt={selectedImage.label}
                className="max-w-full max-h-[calc(90vh-120px)] object-contain rounded"
                onError={() => {
                  toast.error("Failed to load image");
                  setSelectedImage(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
