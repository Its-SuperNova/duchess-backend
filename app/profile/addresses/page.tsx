"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  getUserAddresses,
  setDefaultAddress,
  deleteAddress,
} from "@/lib/address-utils";
import { getUserByEmail } from "@/lib/auth-utils";
import type { Address } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import AddressDistanceDisplay from "@/components/address-distance-display";

export default function ManageAddressPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load addresses from database
  useEffect(() => {
    const loadAddresses = async () => {
      if (!session?.user?.email) {
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
        setAddresses(userAddresses);
      } catch (err) {
        console.error("Error loading addresses:", err);
        setError("Failed to load addresses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, [session]);

  const handleSetDefault = async (addressId: string) => {
    if (!session?.user?.email) return;

    try {
      // Get the actual user ID from the database using email
      const user = await getUserByEmail(session.user.email);
      if (!user) {
        setError("User not found. Please try logging in again.");
        return;
      }

      const success = await setDefaultAddress(user.id, addressId);

      if (success) {
        // Update local state
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            is_default: addr.id === addressId,
          }))
        );
      }
    } catch (err) {
      console.error("Error setting default address:", err);
      setError("Failed to set default address. Please try again.");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const success = await deleteAddress(addressId);

      if (success) {
        // Remove from local state
        setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      setError("Failed to delete address. Please try again.");
    }
  };

  const formatAddress = (address: Address) => {
    return `${address.full_address}, ${address.city}, ${address.state} ${address.zip_code}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6FB] flex flex-col">
        <div className="p-4 flex items-center">
          <Link href="/profile" className="inline-block">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <ArrowLeft className="h-5 w-5" />
            </div>
          </Link>
          <h1 className="text-xl font-semibold ml-4">My Addresses</h1>
        </div>

        {/* Add New Address Button */}
        <div className="px-4 mb-4">
          <Link href="/profile/addresses/new">
            <Button
              variant="ghost"
              className="w-full bg-white rounded-2xl shadow-sm p-4 py-6 flex items-center justify-between text-[#7A0000] hover:bg-[#7A0000]/10 border border-gray-200"
            >
              <div className="flex items-center gap-4">
                <Plus className="h-5 w-5 text-[#7A0000]" />
                <span className="text-[#7A0000]">Add New Address</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#7A0000]" />
            </Button>
          </Link>
        </div>

        <div className="flex-1 p-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FB] flex flex-col">
      {/* Back Button and Title */}
      <div className="p-4 flex items-center">
        <Link href="/profile" className="inline-block">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </div>
        </Link>
        <h1 className="text-xl font-semibold ml-4">My Addresses</h1>
      </div>

      {/* Add New Address Button */}
      <div className="px-4 mb-4">
        <Link href="/profile/addresses/new">
          <Button
            variant="ghost"
            className="w-full bg-white rounded-2xl shadow-sm p-4 py-6 flex items-center justify-between text-[#7A0000] hover:bg-[#7A0000]/10 border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <Plus className="h-5 w-5 text-[#7A0000]" />
              <span className="text-[#7A0000]">Add New Address</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#7A0000]" />
          </Button>
        </Link>
      </div>

      {/* Saved Addresses Title */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] flex-1 bg-gray-200"></div>
          <span className="text-gray-500 text-sm font-medium tracking-wider">
            SAVED ADDRESSES
          </span>
          <div className="h-[1px] flex-1 bg-gray-200"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {addresses.length === 0 ? (
          <></>
        ) : (
          <>
            {/* Addresses List */}
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {address.address_name}
                        </h3>
                        {address.is_default && (
                          <span className="px-2 py-1 text-xs bg-[#7A0000] text-white rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mb-3">
                        {formatAddress(address)}
                      </p>

                      {/* Distance from shop */}
                      <div className="mb-3">
                        <AddressDistanceDisplay address={address} />
                      </div>

                      {/* Alternate Phone */}
                      {address.alternate_phone && (
                        <div className="mb-3">
                          <p className="text-gray-500 text-sm">
                            <span className="font-medium">
                              Alternate Phone:
                            </span>{" "}
                            {address.alternate_phone}
                          </p>
                        </div>
                      )}

                      {/* Set as default button */}
                      {!address.is_default && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="text-[#7A0000] text-sm font-medium hover:text-[#5A0000] transition-colors"
                        >
                          Set as default
                        </button>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          router.push(`/profile/addresses/edit/${address.id}`)
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
