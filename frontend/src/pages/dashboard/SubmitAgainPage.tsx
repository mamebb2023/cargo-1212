import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { verificationApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { FileText, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

type VerificationStatus = "loading" | "pending" | "rejected" | "verified";

export default function SubmitAgainPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [documents, setDocuments] = useState<
    Array<{ id: number; document_type: string; status: string }>
  >([]);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [hasNewUpload, setHasNewUpload] = useState(false);
  const fileInputsRef = useRef<Record<number, HTMLInputElement | null>>({});

  const loadDocuments = useCallback(async () => {
    if (!user) return;
    try {
      const res = await verificationApi.getDocuments();
      const docs = Array.isArray(res.data) ? res.data : [];
      setDocuments(docs);
      const hasRejected = docs.some((d) => d.status === "rejected");
      const hasPending = docs.some((d) => d.status === "pending");
      if (user.is_verified) {
        setStatus("verified");
      } else if (hasRejected) {
        setStatus("rejected");
      } else if (hasPending || docs.length === 0) {
        setStatus("pending");
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

  const handleFileChange = async (
    docId: number,
    documentType: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("document_type", documentType);
    formData.append("file", file);

    try {
      setUploadingId(docId);
      await verificationApi.uploadDocument(formData);
      toast.success("Document uploaded. Awaiting review.");
      await loadDocuments();
      setHasNewUpload(true);
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to upload document. Please try again."
      );
    } finally {
      setUploadingId(null);
      if (fileInputsRef.current[docId]) {
        fileInputsRef.current[docId]!.value = "";
      }
    }
  };

  const hasDocuments = documents.length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resubmit Documents</h1>
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
                  <p className="font-medium text-gray-900">{doc.document_type}</p>
                  <p className="text-xs text-gray-500">Status: {doc.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    ref={(el) => {
                      fileInputsRef.current[doc.id] = el;
                    }}
                    onChange={(e) => handleFileChange(doc.id, doc.document_type, e)}
                  />
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
            onClick={() => toast.success("Documents queued. They'll be reviewed shortly.")}
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

