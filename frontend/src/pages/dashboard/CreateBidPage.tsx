import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";

export default function CreateBidPage() {
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    origin: "",
    destination: "",
    cargoType: "",
    weight: "",
    budget: "",
    deadline: "",
    specialRequirements: "",
  });

  const handleChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields are filled
    const requiredFields = [
      "title",
      "description",
      "origin",
      "destination",
      "cargoType",
      "weight",
      "budget",
      "deadline",
    ];
    
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setShowSummary(true);
  };

  const handlePayment = () => {
    // Handle payment logic here
    toast.success("Payment successful! Your bid has been submitted for review.");
    navigate("/dashboard/bids");
  };

  if (showSummary) {
    return (
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
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Description</p>
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
                  <p className="text-sm font-medium text-gray-500">Destination</p>
                  <p className="text-gray-900">{formData.destination}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Cargo Type</p>
                  <p className="text-gray-900">{formData.cargoType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Weight</p>
                  <p className="text-gray-900">{formData.weight}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Deadline</p>
                  <p className="text-gray-900">{formData.deadline}</p>
                </div>
                {formData.specialRequirements && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">
                      Special Requirements
                    </p>
                    <p className="text-gray-900">{formData.specialRequirements}</p>
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
                This fee covers bid posting and verification. Payment is required to publish your bid.
              </p>
            </div>

            <Button
              onClick={handlePayment}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              Pay ETB 200 and Post Bid
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/bids")}
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

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
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
              onChange={(e) => handleChange("specialRequirements", e.target.value)}
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

