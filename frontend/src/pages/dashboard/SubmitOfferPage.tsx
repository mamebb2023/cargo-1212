import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Truck, DollarSign } from "lucide-react";

export default function SubmitOfferPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    offerAmount: "",
    estimatedDeliveryTime: "",
    vehicleType: "",
    cpoServiceNumber: "",
    specialNotes: "",
  });

  // Mock bid data - in real app, fetch based on id
  const bid = {
    id: parseInt(id || "1"),
    title: "Freight Transport from Addis Ababa to Dire Dawa",
    origin: "Addis Ababa",
    destination: "Dire Dawa",
    cargoType: "Construction Materials",
    weight: "50 tons",
    budget: "ETB 25,000",
    deadline: "2024-01-18",
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.offerAmount ||
      !formData.estimatedDeliveryTime ||
      !formData.vehicleType ||
      !formData.cpoServiceNumber
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate offer amount
    const offerAmount = parseFloat(formData.offerAmount);
    // const budgetAmount = parseFloat(bid.budget.replace(/[^\d.]/g, ""));

    if (isNaN(offerAmount) || offerAmount <= 0) {
      toast.error("Please enter a valid offer amount");
      return;
    }

    // Handle offer submission
    toast.success("Your offer has been submitted successfully!");
    navigate(`/dashboard/bids/${bid.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/dashboard/bids/${bid.id}`)}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submit Offer</h1>
          <p className="text-gray-600 mt-1">
            Submit your competitive offer for this transport bid
          </p>
        </div>
      </div>

      {/* Bid Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Bid Summary
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Transport Request
            </p>
            <p className="text-gray-900">{bid.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Route</p>
              <p className="text-gray-900">
                {bid.origin} → {bid.destination}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Cargo</p>
              <p className="text-gray-900">
                {bid.cargoType} ({bid.weight})
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Budget</p>
              <p className="text-gray-900 font-semibold">{bid.budget}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Deadline</p>
              <p className="text-gray-900">{bid.deadline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-gray-200 p-6 space-y-6"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="offerAmount" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Offer Amount (ETB) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="offerAmount"
              type="number"
              placeholder="e.g., 22500"
              value={formData.offerAmount}
              onChange={(e) => handleChange("offerAmount", e.target.value)}
              required
              min="0"
              step="0.01"
            />
            <p className="text-xs text-gray-500">
              Enter your competitive offer amount. Lower offers are more likely
              to win the bid.
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="estimatedDeliveryTime"
              className="flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Estimated Delivery Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="estimatedDeliveryTime"
              type="text"
              placeholder="e.g., 3 days, 48 hours"
              value={formData.estimatedDeliveryTime}
              onChange={(e) =>
                handleChange("estimatedDeliveryTime", e.target.value)
              }
              required
            />
            <p className="text-xs text-gray-500">
              How long will it take to deliver the cargo?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleType" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Vehicle Type <span className="text-red-500">*</span>
            </Label>
            <select
              id="vehicleType"
              value={formData.vehicleType}
              onChange={(e) => handleChange("vehicleType", e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="">Select vehicle type</option>
              <option value="flatbed">Flatbed Truck</option>
              <option value="box-truck">Box Truck</option>
              <option value="refrigerated">Refrigerated Truck</option>
              <option value="container">Container Truck</option>
              <option value="tanker">Tanker Truck</option>
              <option value="other">Other</option>
            </select>
            <p className="text-xs text-gray-500">
              Select the type of vehicle you will use for this transport
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpoServiceNumber">
              CPO Service Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cpoServiceNumber"
              type="number"
              placeholder="e.g., 12345"
              value={formData.cpoServiceNumber}
              onChange={(e) => handleChange("cpoServiceNumber", e.target.value)}
              required
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialNotes">Special Notes (Optional)</Label>
            <textarea
              id="specialNotes"
              rows={4}
              placeholder="Add any additional information about your offer, capabilities, or terms..."
              value={formData.specialNotes}
              onChange={(e) => handleChange("specialNotes", e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/dashboard/bids/${bid.id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="secondary">
            Submit Offer
          </Button>
        </div>
      </form>
    </div>
  );
}
