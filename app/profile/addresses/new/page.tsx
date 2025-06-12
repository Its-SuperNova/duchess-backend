"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createAddress, getCurrentLocationAddress } from "@/lib/address-utils";

export default function NewAddressPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState({
    addressName: "Home",
    fullAddress: "",
    city: "",
    state: "",
    zipCode: "",
    additionalDetails: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    setError(null);

    try {
      const result = await getCurrentLocationAddress();

      if (result.error) {
        setError(result.error);
      } else if (result.address) {
        setFormData((prev) => ({
          ...prev,
          // Don't auto-fill street address - user should enter it manually
          city: result.address!.city,
          state: result.address!.state,
          zipCode: result.address!.zipCode,
        }));
      } else {
        setError(
          "Location detected but couldn't get address details. Please fill in manually."
        );
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setError("Failed to get your location. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.email) {
      setError("You must be logged in to add an address.");
      return;
    }

    if (
      !formData.fullAddress ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userId = session.user.email;
      const newAddress = await createAddress(userId, {
        address_name: formData.addressName,
        full_address: formData.fullAddress,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        is_default: false,
      });

      if (newAddress) {
        router.push("/profile/addresses");
      } else {
        setError("Failed to create address. Please try again.");
      }
    } catch (err) {
      console.error("Error creating address:", err);
      setError("Failed to create address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#18171C] py-8 px-4 lg:pt-24">
      <div className="max-w-md mx-auto space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile/addresses">
            <div className="bg-white dark:bg-[#202028] p-2 rounded-lg shadow-sm">
              <ArrowLeft className="h-5 w-5" />
            </div>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-[#000000] dark:text-white">
              Add New Address
            </h1>
            <p className="text-[#858585] dark:text-gray-400 text-sm">
              Enter your delivery address details
            </p>
          </div>
        </div>

        {/* Use Current Location Button */}
        <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-4 border border-gray-200 dark:border-transparent">
          <button
            onClick={handleUseCurrentLocation}
            disabled={locationLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#7a0000] bg-white text-[#7a0000] hover:bg-[#7a0000] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {locationLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Getting location...</span>
              </>
            ) : (
              <>
                <MapPin className="h-5 w-5" />
                <span>Auto-fill City, State & ZIP</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Automatically fills city, state, and ZIP code. Street address must
            be entered manually.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Address Form */}
        <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-transparent">
          <h2 className="text-lg font-semibold text-[#000000] dark:text-white mb-6">
            Address Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#7a0000] dark:bg-[#7a0000] text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Address"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
