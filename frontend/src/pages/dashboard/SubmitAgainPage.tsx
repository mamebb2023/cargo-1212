import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { verificationApi } from "@/lib/api";
import { useAuthContext } from "@/hooks/useAuth";
import { FileText, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

type VerificationStatus = "loading" | "pending" | "rejected" | "verified";

export default function SubmitAgainPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [documents, setDocuments] = useState<
    Array<{ id: number; document_type: string; status: string }>
  >([]);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [hasNewUpload, setHasNewUpload] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<
    Record<number, { file: File; name: string }>
  >({});
  const fileInputsRef = useRef<Record<number, HTMLInputElement | null>>({});

  const loadDocuments = useCallback(async () => {
    if (!user) return;
    try {
      const res = await verificationApi.getDocuments();
      const docs = Array.isArray(res.data) ? res.data : [];
      setDocuments(docs);
      const hasRejected = docs.some((d) => d.status === "rejected");
      const hasPending = docs.some((d) => d.status === "pending");
      const hasApproved = docs.some((d) => d.status === "approved");

      if (user.is_verified) {
        setStatus("verified");
      } else if (hasRejected) {
        setStatus("rejected");
      } else if (hasPending) {
        setStatus("pending");
      } else if (
        docs.length > 0 &&
        hasApproved &&
        !hasPending &&
        !hasRejected
      ) {
        // All documents are approved but user.is_verified might not be updated yet
        setStatus("verified");
      } else {
        setStatus("pending");
      }
    } catch {
      setStatus(user?.is_verified ? "verified" : "pending");
    }
  }, [user]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const triggerFileSelect = (docId: number) => {
    const input = fileInputsRef.current[docId];
    if (input) input.click();
  };

  const handleFileChange = (
    docId: number,
    _documentType: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPendingUploads((prev) => ({
      ...prev,
      [docId]: { file, name: file.name },
    }));
    setHasNewUpload(true);
  };

  const handleUploadAll = async () => {
    const entries = Object.entries(pendingUploads);
    if (entries.length === 0) return;

    try {
      setUploadingId(-1); // indicate bulk upload
      for (const [docIdStr, { file }] of entries) {
        const docId = Number(docIdStr);
        const doc = documents.find((d) => d.id === docId);
        if (!doc) continue;

        const formData = new FormData();
        formData.append("document_type", doc.document_type);
        formData.append("file", file);

        await verificationApi.uploadDocument(formData);
      }
      toast.success("Documents uploaded. Awaiting review.");
      setPendingUploads({});
      setHasNewUpload(false);
      await loadDocuments();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload documents. Please try again."
      );
    } finally {
      setUploadingId(null);
      // reset inputs
      Object.values(fileInputsRef.current).forEach((input) => {
        if (input) input.value = "";
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <FileText className="w-6 h-6 text-blue-600 shrink-0" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Resubmit Documents
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Your documents were not approved. Please review and submit again.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-blue-600" />
          <p className="text-sm text-gray-700">
            Current status: {status === "loading" ? "Checking..." : status}
          </p>
        </div>

        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-100 rounded-lg p-3 sm:p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {doc.document_type}
                  </p>
                  <p
                    className={`text-xs font-semibold ${
                      doc.status === "approved"
                        ? "text-green-500"
                        : "text-gray-500"
                    }`}
                  >
                    Status:{" "}
                    {doc.status === "approved"
                      ? doc.status.toUpperCase()
                      : doc.status}
                  </p>
                </div>
                {doc.status !== "approved" && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      ref={(el) => {
                        fileInputsRef.current[doc.id] = el;
                      }}
                      onChange={(e) =>
                        handleFileChange(doc.id, doc.document_type, e)
                      }
                    />
                    {pendingUploads[doc.id] && (
                      <div className="flex items-center gap-3 px-3 sm:px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 text-sm w-full">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-blue-900 truncate text-xs">
                              {pendingUploads[doc.id].name}
                            </p>
                            <p className="text-blue-600 text-xs hidden sm:block">
                              Ready to upload
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingUploads((prev) => {
                              const next = { ...prev };
                              delete next[doc.id];
                              return next;
                            })
                          }
                          className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center shrink-0 transition-colors touch-manipulation"
                          title="Remove file"
                        >
                          <span className="text-red-600 text-sm font-medium">
                            ×
                          </span>
                        </button>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => triggerFileSelect(doc.id)}
                      disabled={uploadingId === doc.id}
                      className="flex items-center gap-2"
                    >
                      {uploadingId === doc.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Reupload"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            No documents found. Please submit your verification documents.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="secondary"
            disabled={!hasNewUpload}
            onClick={handleUploadAll}
            className="w-full sm:w-auto"
          >
            Upload
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
