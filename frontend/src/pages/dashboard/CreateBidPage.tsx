import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { verificationApi, bidsApi } from "@/lib/api";
import { paymentsApi } from "@/lib/api";
import PaymentModal from "@/components/payments/PaymentModal";

export default function CreateBidPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "verified" | "pending" | "rejected"
  >("loading");
  const [showSummary, setShowSummary] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    origin: "",
    originAddress: "",
    destination: "",
    destinationAddress: "",
    cargoType: "",
    weight: "",
    budget: "",
    cpoAmount: "",
    deadline: "",
    status: "Open",
    specialRequirements: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const loadVerification = async () => {
      if (!user) return;
      try {
        const res = await verificationApi.getDocuments();
        const docs = Array.isArray(res.data) ? res.data : [];
        const hasRejected = docs.some((d) => d.status === "rejected");
        const hasPending = docs.some((d) => d.status === "pending");
        if (user.is_verified) {
          setVerificationStatus("verified");
        } else if (hasRejected) {
          setVerificationStatus("rejected");
        } else if (hasPending || docs.length === 0) {
          setVerificationStatus("pending");
        } else {
          setVerificationStatus("pending");
        }
      } catch {
        setVerificationStatus(user?.is_verified ? "verified" : "pending");
      }
    };
    void loadVerification();
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationStatus === "loading") {
      toast.error("Please wait while we check your verification status");
      return;
    }

    if (verificationStatus !== "verified") {
      toast.error(
        verificationStatus === "rejected"
          ? "Your documents were rejected. Please resubmit before posting a bid."
          : "Your documents are pending. Please wait for approval before posting a bid."
      );
      return;
    }

    // Validate all fields are filled
    const requiredFields = [
      "title",
      "description",
      "origin",
      "destination",
      "cargoType",
      "weight",
      "budget",
      "cpoAmount",
      "deadline",
      "status",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]
    );

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setShowSummary(true);
  };

  const handlePaymentSubmit = async ({
    paymentMethod,
    file,
  }: {
    paymentMethod: string;
    file: File;
  }) => {
    try {
      // First create the bid
      const bidData = {
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        origin: formData.origin,
        origin_address: formData.originAddress || "",
        destination: formData.destination,
        destination_address: formData.destinationAddress || "",
        cargo_type: formData.cargoType,
        weight: formData.weight,
        deadline: formData.deadline,
        special_requirements: formData.specialRequirements || "",
      };

      console.log("Creating bid with data:", bidData);
      const bidResponse = await bidsApi.createBid(bidData);
      console.log("Bid created:", bidResponse);

      // Then create the payment
      const formDataPayload = new FormData();
      formDataPayload.append("amount", formData.budget || "0");
      formDataPayload.append("payment_method", paymentMethod);
      formDataPayload.append("reference_number", `REF-${Date.now()}`);
      formDataPayload.append("payment_proof", file);

      await paymentsApi.createPayment(formDataPayload);
      toast.success("Bid created and payment uploaded. Your bid will be reviewed.");
      setPaymentModalOpen(false);
      navigate("/dashboard/my-bids");
    } catch (error: unknown) {
      console.error("Error creating bid:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create bid. Please try again."
      );
    }
  };

  if (showSummary) {
    return (
      <>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setShowSummary(false)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bid Summary</h1>
              <p className="text-gray-600 mt-1">
                Review your bid details before posting
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Bid Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Title</p>
                    <p className="text-gray-900">{formData.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Budget</p>
                    <p className="text-gray-900">ETB {formData.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      CPO Amount
                    </p>
                    <p className="text-gray-900">ETB {formData.cpoAmount}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">
                      Description
                    </p>
                    <p className="text-gray-900">{formData.description}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Shipment Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Origin</p>
                    <p className="text-gray-900">{formData.origin}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Destination
                    </p>
                    <p className="text-gray-900">{formData.destination}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Cargo Type
                    </p>
                    <p className="text-gray-900">{formData.cargoType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Weight</p>
                    <p className="text-gray-900">{formData.weight}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Deadline
                    </p>
                    <p className="text-gray-900">{formData.deadline}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-gray-900">{formData.status}</p>
                  </div>
                  {formData.specialRequirements && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">
                        Special Requirements
                      </p>
                      <p className="text-gray-900">
                        {formData.specialRequirements}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Posting Fee</p>
                    <p className="text-2xl font-bold text-gray-900">ETB 200</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This fee covers bid posting and verification. Payment is
                  required to publish your bid.
                </p>
              </div>

              <Button
                onClick={() => setPaymentModalOpen(true)}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                Pay ETB 200 and Post Bid
              </Button>
            </div>
          </div>
        </div>

        <PaymentModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onSubmit={handlePaymentSubmit}
          onSuccess={() => {
            setPaymentModalOpen(false);
            navigate("/dashboard/my-bids");
          }}
          amountLabel="ETB 200"
          title="Pay Posting Fee"
          description="Upload proof of payment to publish your bid"
        />
      </>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(user?.role === "shipper" ? "/dashboard/my-bids" : "/dashboard/bids")}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create a Bid</h1>
          <p className="text-gray-600 mt-1">
            Post a new freight transport opportunity
          </p>
        </div>
      </div>

      {verificationStatus !== "verified" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
          <p className="font-semibold">
            You must have approved documents before posting a bid.
          </p>
          <p className="text-sm mt-1">
            Current status:{" "}
            {verificationStatus === "loading"
              ? "Checking..."
              : verificationStatus === "rejected"
              ? "Rejected - please resubmit your documents."
              : "Pending review."}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-gray-200 p-6 space-y-6"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Bid Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Freight Transport from Addis Ababa to Dire Dawa"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="description"
              rows={4}
              placeholder="Provide detailed information about the cargo and transport requirements"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">
                Origin <span className="text-red-500">*</span>
              </Label>
              <Input
                id="origin"
                type="text"
                placeholder="e.g., Addis Ababa"
                value={formData.origin}
                onChange={(e) => handleChange("origin", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">
                Destination <span className="text-red-500">*</span>
              </Label>
              <Input
                id="destination"
                type="text"
                placeholder="e.g., Dire Dawa"
                value={formData.destination}
                onChange={(e) => handleChange("destination", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cargoType">
                Cargo Type <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cargoType"
                type="text"
                placeholder="e.g., Construction Materials"
                value={formData.cargoType}
                onChange={(e) => handleChange("cargoType", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">
                Weight <span className="text-red-500">*</span>
              </Label>
              <Input
                id="weight"
                type="text"
                placeholder="e.g., 50 tons"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">
                Budget (ETB) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 25000"
                value={formData.budget}
                onChange={(e) => handleChange("budget", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpoAmount">
                CPO Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cpoAmount"
                type="number"
                placeholder="e.g., 5000"
                value={formData.cpoAmount}
                onChange={(e) => handleChange("cpoAmount", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">
                Deadline <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange("deadline", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                required
              >
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="Closed">Closed</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequirements">
              Special Requirements (Optional)
            </Label>
            <textarea
              id="specialRequirements"
              rows={3}
              placeholder="Any special requirements or conditions for the transport"
              value={formData.specialRequirements}
              onChange={(e) =>
                handleChange("specialRequirements", e.target.value)
              }
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/bids")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="secondary">
            Continue to Payment
          </Button>
        </div>
      </form>
    </div>
  );
}
