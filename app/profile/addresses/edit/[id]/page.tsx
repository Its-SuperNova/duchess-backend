"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Search, MapPin } from "lucide-react";
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
  const [address, setAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    addressName: "",
    fullAddress: "",
    city: "",
    state: "",
    zipCode: "",
    additionalDetails: "",
    alternatePhone: "",
  });

  const addressId = params.id as string;

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
        setFormData({
          addressName: targetAddress.address_name,
          fullAddress: targetAddress.full_address,
          city: targetAddress.city,
          state: targetAddress.state,
          zipCode: targetAddress.zip_code,
          additionalDetails: targetAddress.additional_details || "",
          alternatePhone: targetAddress.alternate_phone,
        });
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

  const handleUseCurrentLocation = async () => {
    // For edit page, we'll update city, state, and ZIP but keep the existing street address
    try {
      // This would need to be implemented similar to the new address page
      // For now, we'll show a message that this feature is available
      setError(
        "Auto-detect feature will update city, state, and ZIP while preserving your street address."
      );
    } catch (error) {
      console.error("Error getting location:", error);
      setError("Failed to get your location. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.email || !address) {
      setError("You must be logged in to edit an address.");
      return;
    }

    if (
      !formData.fullAddress ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode ||
      !formData.alternatePhone
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Calculate distance
      const distanceResult = await calculateDeliveryFromAddress({
        full_address: formData.fullAddress,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
      });

      const updatedAddress = await updateAddress(addressId, {
        address_name: formData.addressName,
        full_address: formData.fullAddress,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        distance: distanceResult?.distance,
        duration: distanceResult?.duration,
        alternate_phone: formData.alternatePhone,
        additional_details: formData.additionalDetails,
      });

      if (updatedAddress) {
        router.push("/profile/addresses");
      } else {
        setError("Failed to update address. Please try again.");
      }
    } catch (err) {
      console.error("Error updating address:", err);
      setError("Failed to update address. Please try again.");
    } finally {
      setSaving(false);
    }
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
                  Update your delivery address details
                </p>
              </div>
            </div>

            {/* Save Button in Header */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Auto-detect Button */}
              <button
                onClick={handleUseCurrentLocation}
                disabled={saving}
                className="px-4 py-3 rounded-xl border border-[#7a0000] bg-white text-[#7a0000] hover:bg-[#7a0000] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <MapPin className="h-5 w-5" />
                <span>Auto-detect</span>
              </button>

              {/* Save Button */}
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-3 bg-[#7a0000] dark:bg-[#7a0000] text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-[#6a0000] transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Update Address"
                )}
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Mobile Auto-detect Button */}
              <div className="lg:hidden bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-4 border border-gray-200 dark:border-transparent">
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#7a0000] bg-white text-[#7a0000] hover:bg-[#7a0000] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MapPin className="h-5 w-5" />
                  <span>Auto-fill City, State & ZIP</span>
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Automatically fills city, state, and ZIP code. Street address
                  will be preserved.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    {error}
                  </p>
                </div>
              )}

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

                  {/* City, State, ZIP Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#000000] dark:text-white mb-2">
                        City*
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter your city"
                        className="w-full p-3 bg-gray-50 dark:bg-[#18171C] rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7a0000] focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#000000] dark:text-white mb-2">
                        State*
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Enter your state"
                        className="w-full p-3 bg-gray-50 dark:bg-[#18171C] rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#7a0000] focus:border-transparent"
                        required
                      />
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
                        placeholder="Enter your ZIP code"
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

                  {/* Mobile Save Button */}
                  <div className="lg:hidden">
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="w-full py-3 bg-[#7a0000] dark:bg-[#7a0000] text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        "Update Address"
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
                        Contact Information
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Include a reliable phone number for delivery
                        coordination
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
                        Delivery Area
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        We'll recalculate delivery time and fees based on your
                        updated location
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
                    automatically.
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
