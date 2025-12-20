import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Mail, Phone, MapPin, Factory } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";
import { verificationApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import type { User } from "@/types";
import Loading from "@/components/ui/loading";

type ProfileForm = {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  zip_code: string;
  company_name?: string;
  carrier_type?: string;
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuthContext();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "verified" | "pending" | "rejected"
  >("loading");
  const [profileData, setProfileData] = useState<ProfileForm>({
    full_name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    street: "",
    zip_code: "",
    company_name: "",
    carrier_type: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || "",
        city: user.city || "",
        street: user.street || "",
        zip_code: user.zip_code || "",
        company_name: user.company_name || "",
        carrier_type: user.carrier_type || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const loadVerification = async () => {
      if (!user) return;
      try {
        const res = await verificationApi.getDocuments();
        const docs = Array.isArray(res.data) ? res.data : [];
        const hasRejected = docs.some((d) => d.status === "rejected");
        const hasPending = docs.some((d) => d.status === "pending");
        const hasApproved = docs.some((d) => d.status === "approved");

        if (user.is_verified) {
          setVerificationStatus("verified");
        } else if (hasRejected) {
          setVerificationStatus("rejected");
        } else if (hasPending) {
          setVerificationStatus("pending");
        } else if (
          docs.length > 0 &&
          hasApproved &&
          !hasPending &&
          !hasRejected
        ) {
          // All documents are approved but user.is_verified might not be updated yet
          setVerificationStatus("verified");
        } else {
          setVerificationStatus("pending");
        }
      } catch {
        setVerificationStatus(user?.is_verified ? "verified" : "pending");
      }
    };
    void loadVerification();
  }, [user]);

  const isCarrier = user?.role === "carrier";

  const statusBadge = useMemo(() => {
    if (verificationStatus === "loading") {
      return <Loading message="Loading…" />;
    }

    const verified = verificationStatus === "verified";
    const rejected = verificationStatus === "rejected";
    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded ${
          verified
            ? "bg-green-100 text-green-700"
            : rejected
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {verified ? "Verified" : rejected ? "Rejected" : "Pending Verification"}
      </span>
    );
  }, [verificationStatus]);

  const roleBadge = useMemo(() => {
    if (!user?.role) return null;
    const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    return (
      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
        {roleLabel}
      </span>
    );
  }, [user]);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<User> = {
        full_name: profileData.full_name,
        phone: profileData.phone,
        country: profileData.country,
        city: profileData.city,
        street: profileData.street,
        zip_code: profileData.zip_code,
        company_name: profileData.company_name,
        carrier_type: profileData.carrier_type as User["carrier_type"],
      };

      const response = await authApi.updateProfile(payload);
      if (response.success) {
        toast.success("Profile updated");
        await refreshUser();
        setIsEditing(false);
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        toast.error(
          (error as { message?: string }).message || "Failed to update profile"
        );
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900">
              {profileData.full_name || "—"}
            </h2>
            <p className="text-gray-600">{profileData.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {roleBadge}
              {statusBadge}
              {verificationStatus === "rejected" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/dashboard/submit-again")}
                  className="h-8"
                >
                  Submit Again
                </Button>
              )}
            </div>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="secondary"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-gray-200 p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              id="full_name"
              type="text"
              value={profileData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input id="email" type="email" value={profileData.email} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Country
            </Label>
            <Input
              id="country"
              type="text"
              value={profileData.country}
              onChange={(e) => handleChange("country", e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              City
            </Label>
            <Input
              id="city"
              type="text"
              value={profileData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="street" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Street
            </Label>
            <Input
              id="street"
              type="text"
              value={profileData.street}
              onChange={(e) => handleChange("street", e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              ZIP / Postal Code
            </Label>
            <Input
              id="zip_code"
              type="text"
              value={profileData.zip_code}
              onChange={(e) => handleChange("zip_code", e.target.value)}
              disabled={!isEditing}
            />
          </div>

          {isCarrier && (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="company_name"
                  className="flex items-center gap-2"
                >
                  <Factory className="w-4 h-4" />
                  Company Name
                </Label>
                <Input
                  id="company_name"
                  type="text"
                  value={profileData.company_name}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carrier_type">Carrier Type</Label>
                <Input
                  id="carrier_type"
                  type="text"
                  value={profileData.carrier_type}
                  onChange={(e) => handleChange("carrier_type", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="secondary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
