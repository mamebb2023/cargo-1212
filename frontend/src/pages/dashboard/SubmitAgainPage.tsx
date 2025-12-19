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
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to upload documents. Please try again."
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Resubmit Documents
          </h1>
          <p className="text-gray-600">
            Your documents were not approved. Please review and submit again.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
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
                className="flex items-center justify-between gap-3 border border-gray-100 rounded-lg p-3"
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
                  <div className="flex items-center gap-2">
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
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="truncate max-w-[120px]">
                          {pendingUploads[doc.id].name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingUploads((prev) => {
                              const next = { ...prev };
                              delete next[doc.id];
                              return next;
                            })
                          }
                          className="text-red-500 hover:text-red-600"
                        >
                          <Loader2 className="w-4 h-4 rotate-90 opacity-0" />
                          {/* visually hidden icon placeholder to keep layout */}
                          ×
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

        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            disabled={!hasNewUpload}
            onClick={handleUploadAll}
          >
            Upload
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
