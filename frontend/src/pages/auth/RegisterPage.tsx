import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { getCountries, getCitiesByCountry } from "@/constant";
import { Upload, FileText, X } from "lucide-react";

type RegistrationStep = "form" | "role" | "documents";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<RegistrationStep>("form");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "",
    city: "",
    street: "",
    zipCode: "",
  });
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const countries = getCountries();
  const [selectedRole, setSelectedRole] = useState<
    "shipper" | "carrier" | null
  >(null);
  const [carrierSubcategory, setCarrierSubcategory] = useState<
    "company" | "plc" | "truckOwner" | null
  >(null);
  const [carrierData, setCarrierData] = useState({
    companyName: "",
    companyNumberOfTrucks: "",
    plcNumberOfTrucks: "",
    truckLibrehNumber: "",
    truckTinNumber: "",
  });
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

  const getCarrierCompanyDocuments = () => [
    "Company business registration Doc.",
    "Company business license doc",
    "Company competency certificate doc",
    "Company tax clearance doc",
    "Company vat certificate doc",
  ];

  const getCarrierPLCDocuments = () => [
    "Plc registration doc",
    "Plc business license doc",
    "Plc competency certificate doc",
    "Plc tax clearance doc",
    "Plc vat certificate doc",
  ];

  const getCarrierTruckOwnerDocuments = () => [
    "Truck Business licence",
  ];

  const getRequiredDocuments = () => {
    if (selectedRole === "shipper") {
      return shipperDocuments;
    }
    if (selectedRole === "carrier") {
      if (carrierSubcategory === "company") {
        return getCarrierCompanyDocuments();
      }
      if (carrierSubcategory === "plc") {
        return getCarrierPLCDocuments();
      }
      if (carrierSubcategory === "truckOwner") {
        return getCarrierTruckOwnerDocuments();
      }
    }
    return [];
  };

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
    const requiredDocuments = getRequiredDocuments();

    // Validate number inputs for carriers
    if (selectedRole === "carrier") {
      if (!carrierData.companyName) {
        toast.error("Please enter the company name");
        return;
      }
      if (carrierSubcategory === "company") {
        if (!carrierData.companyNumberOfTrucks) {
          toast.error("Please enter the number of trucks");
          return;
        }
      }
      if (carrierSubcategory === "plc" && !carrierData.plcNumberOfTrucks) {
        toast.error("Please enter the number of trucks");
        return;
      }
      if (carrierSubcategory === "truckOwner") {
        if (!carrierData.truckLibrehNumber) {
          toast.error("Please enter the truck libreh number");
          return;
        }
        if (!carrierData.truckTinNumber) {
          toast.error("Please enter the truck TIN number");
          return;
        }
      }
    }

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
      carrierSubcategory,
      carrierData,
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
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // When country changes, reset city and update available cities
      if (field === "country") {
        updated.city = "";
        setAvailableCities(getCitiesByCountry(value));
      }
      return updated;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const updateCarrierData = (field: keyof typeof carrierData, value: string) => {
    setCarrierData((prev) => ({ ...prev, [field]: value }));
  };

  // Initialize cities when country is selected
  useEffect(() => {
    if (formData.country) {
      setAvailableCities(getCitiesByCountry(formData.country));
    } else {
      setAvailableCities([]);
    }
  }, [formData.country]);

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
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                  {/* Left side - Main form fields */}
                  <div className="flex-1 space-y-4">
                    <div className="flex-1 flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Enter your first name"
                          value={formData.firstName}
                          onChange={(e) => updateField("firstName", e.target.value)}
                          className={errors.firstName ? "border-destructive" : ""}
                        />
                        {errors.firstName && (
                          <p className="text-xs text-destructive max-w-xs">
                            {errors.firstName}
                          </p>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Enter your last name"
                          value={formData.lastName}
                          onChange={(e) => updateField("lastName", e.target.value)}
                          className={errors.lastName ? "border-destructive" : ""}
                        />
                        {errors.lastName && (
                          <p className="text-xs text-destructive max-w-xs">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
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
                        <p className="text-xs text-destructive max-w-xs">
                          {errors.email}
                        </p>
                      )}
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
                        <p className="text-xs text-destructive max-w-xs">
                          {errors.phone}
                        </p>
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
                          <p className="text-xs text-destructive max-w-xs">
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
                          <p className="text-xs text-destructive max-w-xs">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Address Fields */}
                  <div className="flex-1 space-y-4 pt-2 lg:pt-0 lg:pl-4 lg:border-l border-t lg:border-t-0 border-border">
                    <h3 className="text-sm font-semibold text-foreground">
                      Address Information
                    </h3>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                          id="country"
                          value={formData.country}
                          onChange={(e) => updateField("country", e.target.value)}
                          className={errors.country ? "border-destructive" : ""}
                        >
                          <option value="">Select a country</option>
                          {countries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </Select>
                        {errors.country && (
                          <p className="text-xs text-destructive max-w-xs">
                            {errors.country}
                          </p>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Select
                          id="city"
                          value={formData.city}
                          onChange={(e) => updateField("city", e.target.value)}
                          disabled={!formData.country}
                          className={errors.city ? "border-destructive" : ""}
                        >
                          <option value="">
                            {formData.country
                              ? "Select a city"
                              : "Select a country first"}
                          </option>
                          {availableCities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </Select>
                        {errors.city && (
                          <p className="text-xs text-destructive max-w-xs">
                            {errors.city}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street">Street</Label>
                      <Input
                        id="street"
                        type="text"
                        placeholder="Enter street address"
                        value={formData.street}
                        onChange={(e) => updateField("street", e.target.value)}
                        className={errors.street ? "border-destructive" : ""}
                      />
                      {errors.street && (
                        <p className="text-xs text-destructive max-w-xs">
                          {errors.street}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip code</Label>
                      <Input
                        id="zipCode"
                        type="text"
                        placeholder="Enter zip code"
                        value={formData.zipCode}
                        onChange={(e) => updateField("zipCode", e.target.value)}
                        className={errors.zipCode ? "border-destructive" : ""}
                      />
                      {errors.zipCode && (
                        <p className="text-xs text-destructive max-w-xs">
                          {errors.zipCode}
                        </p>
                      )}
                    </div>
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
                  onClick={() => {
                    setSelectedRole("shipper");
                    setCarrierSubcategory(null);
                  }}
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
                  onClick={() => {
                    setSelectedRole("carrier");
                    setCarrierSubcategory(null);
                  }}
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

              {/* Carrier Subcategories */}
              {selectedRole === "carrier" && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Select Carrier Type
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setCarrierSubcategory("company")}
                      className={`p-4 border-2 rounded-xl transition-all text-left ${
                        carrierSubcategory === "company"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      <h4 className="font-semibold mb-1 text-foreground">
                        Company
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Registered business company
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCarrierSubcategory("plc")}
                      className={`p-4 border-2 rounded-xl transition-all text-left ${
                        carrierSubcategory === "plc"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      <h4 className="font-semibold mb-1 text-foreground">PLC</h4>
                      <p className="text-xs text-muted-foreground">
                        Public Limited Company
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCarrierSubcategory("truckOwner")}
                      className={`p-4 border-2 rounded-xl transition-all text-left ${
                        carrierSubcategory === "truckOwner"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      <h4 className="font-semibold mb-1 text-foreground">
                        Truck Owner
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Individual truck owner
                      </p>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <Button
                  onClick={() => {
                    setStep("form");
                    setCarrierSubcategory(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (selectedRole === "shipper") {
                      setStep("documents");
                    } else if (selectedRole === "carrier") {
                      if (carrierSubcategory) {
                        setStep("documents");
                      } else {
                        toast.error("Please select a carrier type to continue");
                      }
                    } else {
                      toast.error("Please select a role to continue");
                    }
                  }}
                  variant="secondary"
                  className="flex-1"
                  disabled={!selectedRole || (selectedRole === "carrier" && !carrierSubcategory)}
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
                {/* Shipper Documents */}
                {selectedRole === "shipper" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {shipperDocuments.map((docName) => (
                      <div key={docName} className="space-y-2">
                        <Label>{docName} <span className="text-red-500">*</span></Label>
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
                )}

                {/* Carrier Company Documents */}
                {selectedRole === "carrier" && carrierSubcategory === "company" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">
                          Company name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="companyName"
                          type="text"
                          placeholder="Enter company name"
                          value={carrierData.companyName}
                          onChange={(e) =>
                            updateCarrierData("companyName", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyNumberOfTrucks">
                          Company number of trucks <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="companyNumberOfTrucks"
                          type="number"
                          min="1"
                          placeholder="Enter number of trucks"
                          value={carrierData.companyNumberOfTrucks}
                          onChange={(e) =>
                            updateCarrierData("companyNumberOfTrucks", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {getCarrierCompanyDocuments().map((docName) => (
                        <div key={docName} className="space-y-2">
                          <Label>{docName} <span className="text-red-500">*</span></Label>
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
                  </>
                )}

                {/* Carrier PLC Documents */}
                {selectedRole === "carrier" && carrierSubcategory === "plc" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">
                          Company name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="companyName"
                          type="text"
                          placeholder="Enter company name"
                          value={carrierData.companyName}
                          onChange={(e) =>
                            updateCarrierData("companyName", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="plcNumberOfTrucks">
                          PLC number of trucks <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="plcNumberOfTrucks"
                          type="number"
                          min="1"
                          placeholder="Enter number of trucks"
                          value={carrierData.plcNumberOfTrucks}
                          onChange={(e) =>
                            updateCarrierData("plcNumberOfTrucks", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {getCarrierPLCDocuments().map((docName) => (
                        <div key={docName} className="space-y-2">
                          <Label>{docName} <span className="text-red-500">*</span></Label>
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
                  </>
                )}

                {/* Carrier Truck Owner Documents */}
                {selectedRole === "carrier" && carrierSubcategory === "truckOwner" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">
                        Company name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Enter company name"
                        value={carrierData.companyName}
                        onChange={(e) =>
                          updateCarrierData("companyName", e.target.value)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="truckLibrehNumber">
                          Truck libreh number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="truckLibrehNumber"
                          type="text"
                          placeholder="Enter truck libreh number"
                          value={carrierData.truckLibrehNumber}
                          onChange={(e) =>
                            updateCarrierData("truckLibrehNumber", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="truckTinNumber">Truck TIN Number <span className="text-red-500">*</span></Label>
                        <Input
                          id="truckTinNumber"
                          type="text"
                          placeholder="Enter truck TIN number"
                          value={carrierData.truckTinNumber}
                          onChange={(e) =>
                            updateCarrierData("truckTinNumber", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {getCarrierTruckOwnerDocuments().map((docName) => (
                        <div key={docName} className="space-y-2">
                          <Label>{docName} <span className="text-red-500">*</span></Label>
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
                  </>
                )}

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
