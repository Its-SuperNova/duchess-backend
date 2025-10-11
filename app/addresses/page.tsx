"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MapPin, ChevronRight } from "lucide-react";
import { HomeSmile, Buildings, TrashBinTrash } from "@solar-icons/react";
import { GrLocation } from "react-icons/gr";
import { IoIosArrowBack } from "react-icons/io";
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
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ManageAddressPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [cameFromCheckout, setCameFromCheckout] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  // Detect if user came from checkout page
  useEffect(() => {
    const referrer = document.referrer;
    if (referrer.includes("/checkout") || referrer.includes("/checkouts")) {
      setCameFromCheckout(true);

      // Extract checkout ID from referrer URL if available
      const checkoutMatch = referrer.match(/\/checkouts\/([^\/]+)/);
      if (checkoutMatch) {
        setCheckoutId(checkoutMatch[1]);
      }
    }
  }, []);

  // Handle back navigation based on context
  const handleBackNavigation = () => {
    if (cameFromCheckout && checkoutId) {
      router.push(`/checkouts/${checkoutId}`);
    } else if (cameFromCheckout) {
      router.push("/checkouts");
    } else {
      router.push("/profile");
    }
  };

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
    const address = addresses.find((addr) => addr.id === addressId);
    if (address) {
      setAddressToDelete(address);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      setDeleting(true);
      const success = await deleteAddress(addressToDelete.id);

      if (success) {
        // Remove from local state
        setAddresses((prev) =>
          prev.filter((addr) => addr.id !== addressToDelete.id)
        );
        setDeleteDialogOpen(false);
        setAddressToDelete(null);
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      setError("Failed to delete address. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setAddressToDelete(null);
  };

  const formatAddress = (address: Address) => {
    return `${address.full_address}, ${address.city}, ${address.state} ${address.zip_code}`;
  };

  // Helper function to get address type icon and color
  const getAddressTypeIcon = (addressType: string) => {
    switch (addressType) {
      case "Home":
        return {
          icon: HomeSmile,
          color: "text-primary",
        };
      case "Work":
        return {
          icon: Buildings,
          color: "text-primary",
        };
      case "Other":
        return {
          icon: GrLocation,
          color: "text-primary",
        };
      default:
        return { icon: MapPin, color: "text-primary" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6FB] flex flex-col">
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="p-4 flex items-center">
            <button onClick={handleBackNavigation} className="inline-block">
              <div className="bg-white p-3 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                <IoIosArrowBack className="h-5 w-5 text-gray-700" />
              </div>
            </button>
            <h1 className="text-xl font-semibold ml-4">My Addresses</h1>
          </div>

          {/* Add New Address Button */}
          <div className="px-4 mb-4">
            <Link href="/addresses/new">
              <Button
                variant="ghost"
                className="w-full bg-white rounded-2xl shadow-sm p-4 py-6 flex items-center justify-between text-[#7A0000] border border-gray-200"
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FB] flex flex-col">
      <div className="max-w-[1200px] mx-auto w-full">
        {/* Back Button and Title */}
        <div className="p-4 flex items-center">
          <button onClick={handleBackNavigation} className="inline-block">
            <div className="bg-white p-3 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
              <IoIosArrowBack className="h-5 w-5 text-gray-700" />
            </div>
          </button>
          <h1 className="text-xl font-semibold ml-4">My Addresses</h1>
        </div>

        {/* Add New Address Button */}
        <div className="px-4 mb-4">
          <Link href="/addresses/new">
            <Button
              variant="ghost"
              className="w-full bg-white rounded-2xl shadow-sm p-4 py-6 flex items-center justify-between text-[#7A0000] border border-gray-200"
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
            <div className="text-center py-8">
              <p className="text-gray-500">
                No addresses found. Add your first address above.
              </p>
            </div>
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
                          {/* Address Type Icon */}
                          {(() => {
                            const addressType = address.address_type || "Home";
                            const { icon: IconComponent, color } =
                              getAddressTypeIcon(addressType);
                            return (
                              <div className={`rounded-full`}>
                                <IconComponent className={`h-5 w-5 ${color}`} />
                              </div>
                            );
                          })()}
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">
                              {address.address_name}
                            </h3>
                            {/* Address Type Label */}
                            {address.address_type &&
                              address.address_type !== "Home" && (
                                <span
                                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                                    address.address_type === "Work"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-purple-100 text-purple-700"
                                  }`}
                                >
                                  {address.address_type}
                                </span>
                              )}
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm mb-3">
                          {formatAddress(address)}
                        </p>

                        {/* Distance from shop */}
                        <div className="mb-3">
                          <AddressDistanceDisplay address={address} />
                        </div>

                        {/* Phone */}
                        {address.alternate_phone && (
                          <div className="mb-3">
                            <p className="text-gray-500 text-sm">
                              <span className="font-medium">Phone:</span>{" "}
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

                      {/* Default tag and Action buttons */}
                      <div className="flex items-center space-x-2">
                        {/* Default tag */}
                        {address.is_default && (
                          <span className="px-2 py-1 text-xs bg-primary text-white rounded-full">
                            Default
                          </span>
                        )}

                        {/* Action buttons */}
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="p-2 text-red-600"
                        >
                          <TrashBinTrash className="h-4 w-4" />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#202028] border border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#000000] dark:text-white">
              Delete Address
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete "{addressToDelete?.address_name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelDelete}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAddress}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete Address"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
