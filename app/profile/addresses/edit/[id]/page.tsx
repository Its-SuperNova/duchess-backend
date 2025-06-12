"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateAddress, getUserAddresses } from "@/lib/address-utils";
import type { Address } from "@/lib/supabase";

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

        const userId = session.user.email;
        const userAddresses = await getUserAddresses(userId);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.email || !address) {
      setError("You must be logged in to edit an address.");
      return;
    }

    // Validate form data
    if (
      !formData.addressName.trim() ||
      !formData.fullAddress.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.zipCode.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updatedAddress = await updateAddress(addressId, {
        address_name: formData.addressName.trim(),
        full_address: formData.fullAddress.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip_code: formData.zipCode.trim(),
      });

      if (updatedAddress) {
        // Success - navigate back to addresses list
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
      <div className="min-h-screen bg-white flex flex-col">
        <div className="sticky top-0 z-50 bg-white p-4 flex items-center border-b shadow-sm">
          <Link href="/profile/addresses" className="mr-4">
            <div className="bg-gray-100 p-2 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </div>
          </Link>
          <h1 className="text-xl font-semibold">Edit Address</h1>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading address...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !address) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="sticky top-0 z-50 bg-white p-4 flex items-center border-b shadow-sm">
          <Link href="/profile/addresses" className="mr-4">
            <div className="bg-gray-100 p-2 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </div>
          </Link>
          <h1 className="text-xl font-semibold">Edit Address</h1>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/profile/addresses">
              <div className="px-4 py-2 bg-[#8B4513] text-white rounded-full">
                Back to Addresses
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white p-4 flex items-center border-b shadow-sm">
        <Link href="/profile/addresses" className="mr-4">
          <div className="bg-gray-100 p-2 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </div>
        </Link>
        <h1 className="text-xl font-semibold">Edit Address</h1>
      </div>

      {/* Form */}
      <div className="flex-1 p-4 pb-24">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="addressName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address Name
            </label>
            <input
              type="text"
              id="addressName"
              name="addressName"
              value={formData.addressName}
              onChange={handleChange}
              className="w-full p-3 pl-5 bg-[#F0F4F8] rounded-full border-none focus:outline-none focus:ring-1 focus:ring-[#361C1C] placeholder:text-sm"
              placeholder="Home, Office, etc."
              required
              disabled={saving}
            />
          </div>

          <div>
            <label
              htmlFor="fullAddress"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Street Address
            </label>
            <input
              type="text"
              id="fullAddress"
              name="fullAddress"
              value={formData.fullAddress}
              onChange={handleChange}
              className="w-full p-3 pl-5 bg-[#F0F4F8] rounded-full border-none focus:outline-none focus:ring-1 focus:ring-[#361C1C] placeholder:text-sm"
              placeholder="Enter your street address"
              required
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-3 pl-5 bg-[#F0F4F8] rounded-full border-none focus:outline-none focus:ring-1 focus:ring-[#361C1C] placeholder:text-sm"
                placeholder="City"
                required
                disabled={saving}
              />
            </div>
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full p-3 pl-5 bg-[#F0F4F8] rounded-full border-none focus:outline-none focus:ring-1 focus:ring-[#361C1C] placeholder:text-sm"
                placeholder="State"
                required
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="zipCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ZIP Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className="w-full p-3 pl-5 bg-[#F0F4F8] rounded-full border-none focus:outline-none focus:ring-1 focus:ring-[#361C1C] placeholder:text-sm"
              placeholder="ZIP Code"
              required
              disabled={saving}
            />
          </div>
        </form>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-[60px] left-0 right-0 p-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-3 bg-[#8B4513] text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Update Address"
          )}
        </button>
      </div>
    </div>
  );
}
