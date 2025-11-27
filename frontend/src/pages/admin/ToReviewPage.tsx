import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { FileText, User, Download, Check, X } from "lucide-react";

interface SubmissionDocument {
  id: number;
  label: string;
  fileName: string;
  status: "pending" | "approved" | "rejected";
}

interface DocumentSubmission {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  submittedDate: string;
  documents: SubmissionDocument[];
}

export default function ToReviewPage() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<DocumentSubmission[]>([
    {
      id: 1,
      userId: 3,
      userName: "Mike Johnson",
      userEmail: "mike@example.com",
      submittedDate: "2024-01-20",
      documents: [
        {
          id: 101,
          label: "Business License",
          fileName: "business_license.pdf",
          status: "pending",
        },
        {
          id: 102,
          label: "Tax Clearance",
          fileName: "tax_clearance.pdf",
          status: "pending",
        },
      ],
    },
    {
      id: 2,
      userId: 6,
      userName: "Emily Davis",
      userEmail: "emily@example.com",
      submittedDate: "2024-01-19",
      documents: [
        {
          id: 201,
          label: "Vehicle Registration",
          fileName: "vehicle_registration.pdf",
          status: "pending",
        },
        {
          id: 202,
          label: "Insurance Certificate",
          fileName: "insurance_certificate.pdf",
          status: "pending",
        },
      ],
    },
    {
      id: 3,
      userId: 10,
      userName: "Maria Martinez",
      userEmail: "maria@example.com",
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
    action: "approve" | "reject" | "download"
  ) => {
    if (action === "download") {
      toast.success("Download started");
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
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {submission.userName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {submission.userEmail}
                      </p>
                      <p className="text-xs text-gray-500">
                        Submitted on {submission.submittedDate}
                      </p>
                    </div>
                  </div>

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
                            >
                              <Download className="w-4 h-4" />
                            </Button>
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
                              className="text-green-600 hover:text-green-700"
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
                              className="text-red-600 hover:text-red-700"
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
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {submission.userName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {submission.userEmail}
                      </p>
                      <p className="text-xs text-gray-500">
                        Submitted on {submission.submittedDate}
                      </p>
                    </div>
                  </div>
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
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
