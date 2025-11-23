import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { Upload, FileText, X } from "lucide-react";

type RegistrationStep = "form" | "role" | "documents";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<RegistrationStep>("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedRole, setSelectedRole] = useState<
    "shipper" | "carrier" | null
  >(null);
  const [files, setFiles] = useState<{
    [key: string]: File | null;
  }>({});
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});

  const shipperDocuments = [
    "Business License",
    "Tax Identification Certificate",
    "Company Registration Document",
    "Identity Document",
  ];

  const carrierDocuments = [
    "Vehicle Registration Certificate",
    "Driver's License",
    "Insurance Certificate",
    "Business License",
    "Tax Identification Certificate",
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof RegisterFormData] = issue.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setStep("role");
  };

  const handleFileChange = (documentName: string, file: File | null) => {
    setFiles((prev) => ({
      ...prev,
      [documentName]: file,
    }));
  };

  const handleDocumentsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredDocuments =
      selectedRole === "shipper" ? shipperDocuments : carrierDocuments;

    const missingDocuments = requiredDocuments.filter((doc) => !files[doc]);

    if (missingDocuments.length > 0) {
      toast.error(
        `Please upload all required documents: ${missingDocuments.join(", ")}`
      );
      return;
    }

    // Handle registration with files
    console.log("Registration data:", {
      ...formData,
      role: selectedRole,
      files,
    });

    toast.success(
      "Registration successful! Your documents are being reviewed."
    );
    // Navigate to login or dashboard after registration
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <AuthLayout>
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 min-w-sm max-w-2xl md:max-w-4xl w-full">
        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === "form"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/20 text-primary"
              }`}
            >
              1
            </div>
            <div className="w-12 h-0.5 bg-gray-300" />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === "role"
                  ? "bg-primary text-primary-foreground"
                  : step === "documents"
                  ? "bg-primary/20 text-primary"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
            <div className="w-12 h-0.5 bg-gray-300" />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === "documents"
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              3
            </div>
          </div>

          {/* Step 1: Registration Form */}
          {step === "form" && (
            <>
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold text-foreground">
                  Register
                </h1>
                <p className="text-sm text-muted-foreground">
                  Create a new account to get started
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="flex-1 flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+251 9XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className={errors.password ? "border-destructive" : ""}
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="********"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        updateField("confirmPassword", e.target.value)
                      }
                      className={
                        errors.confirmPassword ? "border-destructive" : ""
                      }
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full" variant="secondary">
                  Continue
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Login
                </Link>
              </div>
            </>
          )}

          {/* Step 2: Role Selection */}
          {step === "role" && (
            <>
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold text-foreground">
                  Select Your Role
                </h1>
                <p className="text-sm text-muted-foreground">
                  Choose whether you're a shipper or carrier
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole("shipper")}
                  className={`p-4 border-2 rounded-xl transition-all text-left ${
                    selectedRole === "shipper"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    Shipper
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Post freight transport opportunities (bids) and receive
                    competitive offers from carriers. You define your transport
                    needs and select the best carrier based on offers and
                    ratings.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("carrier")}
                  className={`p-4 border-2 rounded-xl transition-all text-left ${
                    selectedRole === "carrier"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    Carrier
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    View transport opportunities posted by shippers, submit
                    competitive offers, and provide freight transport services.
                    The lowest bidder typically wins the contract.
                  </p>
                </button>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  onClick={() => setStep("form")}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (selectedRole) {
                      setStep("documents");
                    } else {
                      toast.error("Please select a role to continue");
                    }
                  }}
                  variant="secondary"
                  className="flex-1"
                  disabled={!selectedRole}
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Document Upload */}
          {step === "documents" && (
            <>
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold text-foreground">
                  Upload Required Documents
                </h1>
                <p className="text-sm text-muted-foreground">
                  Please upload all required documents for verification
                </p>
              </div>

              <form onSubmit={handleDocumentsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(selectedRole === "shipper"
                    ? shipperDocuments
                    : carrierDocuments
                  ).map((docName) => (
                    <div key={docName} className="space-y-2">
                      <Label>{docName} *</Label>
                      {files[docName] ? (
                        <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted">
                          <FileText className="size-4" />
                          <span className="text-sm flex-1 truncate">
                            {files[docName]?.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleFileChange(docName, null)}
                            className="text-destructive hover:text-destructive/80 shrink-0"
                          >
                            <X className="size-4 hover:bg-red-100" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full p-2 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex gap-2 items-center justify-center p4">
                            <Upload className="size-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground text-center px-2">
                              Click to upload or drag and drop
                            </p>
                          </div>

                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleFileChange(docName, file);
                            }}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep("role")}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" variant="secondary">
                    Complete Registration
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
