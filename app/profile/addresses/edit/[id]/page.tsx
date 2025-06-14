"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Search,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateAddress, getUserAddresses } from "@/lib/address-utils";
import { getUserByEmail } from "@/lib/auth-utils";
import type { Address } from "@/lib/supabase";
import { calculateDeliveryFromAddress } from "@/lib/distance";
import DesktopHeader from "@/components/block/DesktopHeader";

export default function EditAddressPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);
  const [originalFormData, setOriginalFormData] = useState({
    addressName: "",
    fullAddress: "",
    area: "",
    zipCode: "",
    additionalDetails: "",
    alternatePhone: "",
  });
  const [formData, setFormData] = useState({
    addressName: "",
    fullAddress: "",
    area: "",
    zipCode: "",
    additionalDetails: "",
    alternatePhone: "",
  });

  const addressId = params.id as string;

  // Check if form has been modified
  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(originalFormData);

  // Load address data
  useEffect(() => {
    const loadAddress = async () => {
      if (!session?.user?.email || !addressId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get the actual user ID from the database using email
        const user = await getUserByEmail(session.user.email);
        if (!user) {
          setError("User not found. Please try logging in again.");
          setLoading(false);
          return;
        }

        const userAddresses = await getUserAddresses(user.id);
        const targetAddress = userAddresses.find(
          (addr) => addr.id === addressId
        );

        if (!targetAddress) {
          setError("Address not found.");
          setLoading(false);
          return;
        }

        setAddress(targetAddress);
        const initialFormData = {
          addressName: targetAddress.address_name,
          fullAddress: targetAddress.full_address,
          area: targetAddress.city,
          zipCode: targetAddress.zip_code,
          additionalDetails: targetAddress.additional_details || "",
          alternatePhone: targetAddress.alternate_phone,
        };
        setFormData(initialFormData);
        setOriginalFormData(initialFormData);
      } catch (err) {
        console.error("Error loading address:", err);
        setError("Failed to load address. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadAddress();
  }, [session, addressId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form to original values
  const handleReset = () => {
    setFormData(originalFormData);
    setValidationResult(null);
  };

  // Auto-populate area when ZIP code changes
  useEffect(() => {
    const getAreaFromPincode = async () => {
      if (formData.zipCode && formData.zipCode.length === 6) {
        setPincodeLoading(true);
        try {
          const response = await fetch("/api/coimbatore-validation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "pincode",
              pincode: formData.zipCode,
            }),
          });

          const data = await response.json();
          if (data.success && data.result.locationDetails) {
            const locationDetails = data.result.locationDetails;
            // Use specific locality if available, otherwise fallback to district or city
            const area =
              locationDetails.locality ||
              locationDetails.district ||
              locationDetails.city ||
              "";
            setFormData((prev) => ({
              ...prev,
              area: area,
            }));
          }
        } catch (error) {
          console.error("Error getting area from pincode:", error);
        } finally {
          setPincodeLoading(false);
        }
      }
    };

    // Debounce to avoid too many API calls
    const timeoutId = setTimeout(getAreaFromPincode, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData.zipCode]);

  // Real-time validation when area or zipCode changes
  useEffect(() => {
    const validateAddress = async () => {
      if (formData.area && formData.zipCode) {
        setValidationLoading(true);
        try {
          const response = await fetch("/api/coimbatore-validation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "address",
              address: {
                city: formData.area,
                state: "Tamil Nadu", // Always Tamil Nadu for Coimbatore
                zip_code: formData.zipCode,
              },
            }),
          });

          const data = await response.json();
          if (data.success) {
            setValidationResult(data.result);
          } else {
            setValidationResult({ error: data.error || "Validation failed" });
          }
        } catch (error) {
          console.error("Validation error:", error);
          setValidationResult({ error: "Failed to validate address" });
        } finally {
          setValidationLoading(false);
        }
      } else {
        setValidationResult(null);
      }
    };

    // Debounce validation to avoid too many API calls
    const timeoutId = setTimeout(validateAddress, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData.area, formData.zipCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.email || !address) {
      setError("You must be logged in to edit an address.");
      return;
    }

    if (
      !formData.fullAddress ||
      !formData.area ||
      !formData.zipCode ||
      !formData.alternatePhone
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Check if address is validated for Coimbatore area
    if (validationResult && !validationResult.isCoimbatoreArea) {
      setError(
        validationResult.error ||
          "Address is outside our Coimbatore delivery area."
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const result = await updateAddress(addressId, {
        address_name: formData.addressName,
        full_address: formData.fullAddress,
        city: formData.area,
        state: "Tamil Nadu", // Always Tamil Nadu for Coimbatore
        zip_code: formData.zipCode,
        alternate_phone: formData.alternatePhone,
        additional_details: formData.additionalDetails,
      });

      if (result.address) {
        router.push("/profile/addresses");
      } else {
        setError(result.error || "Failed to update address. Please try again.");
      }
    } catch (err) {
      console.error("Error updating address:", err);
      setError("Failed to update address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Validation status component
  const ValidationStatus = () => {
    if (validationLoading) {
      return (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-blue-700 dark:text-blue-300 text-sm">
            Validating address...
          </span>
        </div>
      );
    }

    if (!validationResult) return null;

    if (validationResult.error) {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <XCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-700 dark:text-red-300 text-sm">
            {validationResult.error}
          </span>
        </div>
      );
    }

    if (validationResult.isCoimbatoreArea && validationResult.isDeliverable) {
      return (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-green-700 dark:text-green-300 text-sm">
            ✓ Address is within our Coimbatore delivery area (
            {validationResult.distance.toFixed(1)}km away)
          </span>
        </div>
      );
    }

    if (validationResult.isCoimbatoreArea && !validationResult.isDeliverable) {
      return (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-yellow-700 dark:text-yellow-300 text-sm">
            Address is in Coimbatore area but outside our delivery range (
            {validationResult.distance.toFixed(1)}km away)
          </span>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <>
        <DesktopHeader />
        <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#18171C] py-8 px-4 lg:pt-24">
          <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading address...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error && !address) {
    return (
      <>
        <DesktopHeader />
        <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#18171C] py-8 px-4 lg:pt-24">
          <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Link href="/profile/addresses">
                  <div className="px-4 py-2 bg-[#7a0000] text-white rounded-xl">
                    Back to Addresses
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DesktopHeader />
      <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#18171C] py-8 px-4 lg:pt-24">
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/profile/addresses">
                <div className="bg-white dark:bg-[#202028] p-2 rounded-lg shadow-sm">
                  <ArrowLeft className="h-5 w-5" />
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-[#000000] dark:text-white">
                  Edit Address
                </h1>
                <p className="text-[#858585] dark:text-gray-400 text-sm">
                  Update your delivery address details (Coimbatore area only)
                </p>
              </div>
            </div>

            {/* Save Button in Header */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Reset Button */}
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className="px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Reset</span>
              </button>

              {/* Save Button */}
              <button
                onClick={handleSubmit}
                disabled={
                  saving ||
                  (validationResult && !validationResult.isCoimbatoreArea)
                }
                className="px-6 py-3 bg-[#7a0000] dark:bg-[#7a0000] text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-[#6a0000] transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    {error}
                  </p>
                </div>
              )}

              {/* Validation Status */}
              <ValidationStatus />

              {/* Address Form */}
              <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-transparent">
                <h2 className="text-lg font-semibold text-[#000000] dark:text-white mb-6">
                  Address Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Address Label */}
                  <div>
                    <label className="block text-sm font-medium text-[#000000] dark:text-white mb-2">
                      Address Label*
                    </label>
                    <input
                      type="text"
                      name="addressName"
                      value={formData.addressName}
                      onChange={handleInputChange}
                      placeholder="e.g., Home, Work, Office"
                      className="w-full p-3 bg-gray-50 dark:bg-[#18171C] rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7a0000] focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-sm font-medium text-[#000000] dark:text-white mb-2">
                      Street Address*
                    </label>
                    <input
                      type="text"
                      name="fullAddress"
                      value={formData.fullAddress}
                      onChange={handleInputChange}
                      placeholder="Enter your street address"
                      className="w-full p-3 bg-gray-50 dark:bg-[#18171C] rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7a0000] focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Area and ZIP Code Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#000000] dark:text-white mb-2">
                        Area*
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="area"
                          value={formData.area}
                          onChange={handleInputChange}
                          placeholder="Area will auto-fill from ZIP code"
                          className="w-full p-3 bg-gray-50 dark:bg-[#18171C] rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7a0000] focus:border-transparent"
                          required
                        />
                        {pincodeLoading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#000000] dark:text-white mb-2">
                        ZIP Code*
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="Enter 6-digit ZIP code"
                        maxLength={6}
                        className="w-full p-3 bg-gray-50 dark:bg-[#18171C] rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7a0000] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Additional Details and Phone Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#000000] dark:text-white mb-2">
                        Additional Details
                      </label>
                      <input
                        type="text"
                        name="additionalDetails"
                        value={formData.additionalDetails}
                        onChange={handleInputChange}
                        placeholder="e.g., Floor, House no., Landmark"
                        className="w-full p-3 bg-gray-50 dark:bg-[#18171C] rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7a0000] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#000000] dark:text-white mb-2">
                        Alternate Phone*
                      </label>
                      <input
                        type="text"
                        name="alternatePhone"
                        value={formData.alternatePhone}
                        onChange={handleInputChange}
                        placeholder="Enter your alternate phone"
                        className="w-full p-3 bg-gray-50 dark:bg-[#18171C] rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7a0000] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Mobile Buttons */}
                  <div className="lg:hidden space-y-3">
                    {/* Reset Button */}
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={!hasChanges}
                      className="w-full py-3 rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                      <RotateCcw className="h-5 w-5" />
                      <span>Reset Changes</span>
                    </button>

                    {/* Save Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={
                        saving ||
                        (validationResult && !validationResult.isCoimbatoreArea)
                      }
                      className="w-full py-3 bg-[#7a0000] dark:bg-[#7a0000] text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Information Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-transparent sticky top-8">
                <h3 className="text-lg font-semibold text-[#000000] dark:text-white mb-4">
                  Address Guidelines
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#7a0000] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-[#000000] dark:text-white">
                        Coimbatore Area Only
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        We only deliver within 30km of Coimbatore city
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#7a0000] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-[#000000] dark:text-white">
                        Accurate Street Address
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Provide the complete street address for precise delivery
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#7a0000] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-[#000000] dark:text-white">
                        Manual Entry Recommended
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Auto-detect may not be accurate. Enter ZIP code to
                        auto-fill area, then verify manually
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#7a0000] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-[#000000] dark:text-white">
                        Contact Information
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        This alternate number will be contacted if your
                        registered number is not available
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#7a0000] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-[#000000] dark:text-white">
                        Additional Details
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Add landmarks, floor numbers, or special instructions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#7a0000] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-[#000000] dark:text-white">
                        Real-time Validation
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        We'll validate your address and calculate delivery time
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    ✏️ Edit Mode
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-200">
                    Your existing address details are pre-filled. You can modify
                    any field and the delivery calculations will be updated
                    automatically. Use the Reset button to revert changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
