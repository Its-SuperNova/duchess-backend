"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  HomeSmileAngle,
  Pen,
  MenuDots,
  HomeAngle,
  Routing,
  ClockCircle,
} from "@solar-icons/react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent } from "@/components/ui/drawer";
import { getDisplayDistance } from "@/lib/address-utils";
import type { Address as DbAddress } from "@/lib/supabase";

interface AddressDrawerProps {
  checkoutId: string;
  addresses: DbAddress[];
  addressText: string;
  selectedAddressId: string | null;
  checkoutData: any;
  onAddressSelect: (address: DbAddress) => void;
  onAddressTextChange: (text: string) => void;
  onSelectedAddressIdChange: (id: string) => void;
  onCheckoutDataChange: (data: any) => void;
}

export default function AddressDrawer({
  checkoutId,
  addresses,
  addressText,
  selectedAddressId,
  checkoutData,
  onAddressSelect,
  onAddressTextChange,
  onSelectedAddressIdChange,
  onCheckoutDataChange,
}: AddressDrawerProps) {
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const { toast } = useToast();

  const handleAddressClick = async (addr: DbAddress) => {
    console.log("📍 Address clicked:", {
      id: addr.id,
      full_address: addr.full_address,
      distance: addr.distance,
      duration: addr.duration,
      area: addr.area,
    });

    onAddressTextChange(addr.full_address);
    onSelectedAddressIdChange(addr.id);
    setIsAddressDrawerOpen(false);

    // Calculate delivery fee when address is selected
    if (checkoutData?.items && checkoutData.items.length > 0) {
      const orderValue = checkoutData.items.reduce(
        (total: number, item: any) => total + (item.total_price || 0),
        0
      );

      console.log("🚚 Address selected, calculating delivery:", {
        addressId: addr.id,
        orderValue,
        addressText: addr.full_address,
        distance: addr.distance,
        duration: addr.duration,
        zone: addr.area || "Zone A",
        checkoutDataItems: checkoutData.items,
        hasDistance: !!addr.distance,
      });

      // Calculate delivery fee using API
      let calculatedDeliveryFee = 0;
      if (addr.distance) {
        try {
          const response = await fetch("/api/calculate-delivery", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              addressId: addr.id,
              addressText: addr.full_address,
              checkoutId: checkoutId,
              distance: addr.distance,
              orderValue: orderValue,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            calculatedDeliveryFee = result.deliveryCharge;
          } else {
            throw new Error("Failed to calculate delivery fee");
          }
        } catch (error) {
          console.error("Error calculating delivery fee:", error);
          // Show error instead of fallback calculation
          toast({
            title: "Delivery Calculation Error",
            description:
              "Unable to calculate delivery fee for this address. Please try again later.",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Show error if no distance data
        toast({
          title: "Address Error",
          description:
            "No distance data available for this address. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      // Note: Tax calculation is handled by the main checkout page using database-fetched rates
      // We don't calculate taxes here to avoid inconsistencies
      const calculatedCgstAmount = 0; // Will be calculated by main page
      const calculatedSgstAmount = 0; // Will be calculated by main page

      const newTotal =
        orderValue +
        calculatedDeliveryFee +
        calculatedCgstAmount +
        calculatedSgstAmount;

      console.log("🚚 Address selected - direct calculation:", {
        addressId: addr.id,
        distance: addr.distance,
        distanceInKm: addr.distance || 0,
        orderValue,
        calculatedDeliveryFee,
        newTotal,
      });

      // Update checkout session with calculated delivery fee
      try {
        const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selectedAddressId: addr.id,
            addressText: addr.full_address,
            distance: addr.distance,
            duration: addr.duration,
            deliveryFee: calculatedDeliveryFee,
            totalAmount: newTotal,
          }),
        });

        if (updateResponse.ok) {
          console.log("✅ Checkout session updated with address selection:", {
            deliveryFee: calculatedDeliveryFee,
            totalAmount: newTotal,
          });

          // Update local checkout data state
          onCheckoutDataChange((prev: any) => ({
            ...prev,
            deliveryFee: calculatedDeliveryFee,
            totalAmount: newTotal,
            addressText: addr.full_address,
            selectedAddressId: addr.id,
            distance: addr.distance,
            duration: addr.duration,
          }));
        } else {
          console.error("❌ Failed to update checkout session");
        }
      } catch (updateError) {
        console.error("❌ Error updating checkout session:", updateError);
      }
    }
  };

  return (
    <>
      {/* Address Button Section */}
      <div className="flex items-start mb-4">
        <HomeSmileAngle className="h-5 w-5 mr-3 flex-shrink-0 text-black" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              Delivery at Home
            </h3>
            {(() => {
              const currentAddress = addresses.find(
                (addr) => addr.full_address === addressText
              );
              if (currentAddress?.distance) {
                return (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E9FFF3] text-[#15A05A] text-xs">
                    <Routing weight="Broken" className="h-4 w-4" />
                    {getDisplayDistance(currentAddress.distance)?.toFixed(1) ??
                      "-"}{" "}
                    km
                  </span>
                );
              }
              return null;
            })()}
          </div>
          <div className="mt-1 flex items-center justify-between gap-3 min-w-0">
            {addressText &&
            addressText !== "2nd street, Barathipuram, Kannampalayam" ? (
              <>
                <p className="text-gray-500 dark:text-gray-400 text-sm truncate min-w-0">
                  {addressText}
                </p>
                <button
                  className="text-[#2664eb] hover:text-[#1d4ed8] transition-colors p-1 rounded-full hover:bg-blue-50"
                  onClick={() => setIsAddressDrawerOpen(true)}
                  aria-label="Change delivery address"
                >
                  <Pen weight="Broken" size={16} color="#2664eb" />
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Add address to proceed with checkout
                </p>
                <Link href={`/addresses/new?returnTo=/checkouts/${checkoutId}`}>
                  <button
                    className="text-[#2664eb] hover:text-[#1d4ed8] transition-colors px-3 py-1 rounded-full hover:bg-blue-50 text-sm font-medium"
                    aria-label="Add delivery address"
                  >
                    Add
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Address Selection Drawer */}
      <Drawer
        modal={true}
        open={isAddressDrawerOpen}
        onOpenChange={setIsAddressDrawerOpen}
      >
        <DrawerContent className="h-[550px] rounded-t-2xl bg-[#F5F6FB] flex flex-col">
          {/* Fixed Header */}
          <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
            <h2 className="text-[18px] font-semibold text-gray-800">
              Select an address
            </h2>
            <div className="flex items-center gap-2">
              <Link href="/addresses">
                <button
                  aria-label="Manage addresses"
                  className="h-9 w-9 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center shadow-sm"
                >
                  <MenuDots weight="Broken" className="h-5 w-5 text-gray-700" />
                </button>
              </Link>
              <DrawerClose asChild>
                <button
                  aria-label="Close"
                  className="h-9 w-9 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center shadow-sm"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </DrawerClose>
            </div>
          </div>

          {/* Fixed Add Address Button */}
          <div className="flex-shrink-0 px-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
            <Link
              href={`/addresses/new?returnTo=/checkouts/${checkoutId}`}
              className="w-full block"
            >
              <button className="w-full flex items-center justify-between bg-white rounded-[14px] px-4 py-3 shadow-sm hover:bg-gray-50 transition-colors">
                <span className="flex items-center gap-3 text-[#570000] font-medium">
                  <span className="h-6 w-6 flex items-center justify-center rounded-full text-[#570000] text-lg leading-none">
                    +
                  </span>
                  Add address
                </span>
                <span className="text-[#570000]">›</span>
              </button>
            </Link>
          </div>

          {/* Fixed SAVED ADDRESS Title */}
          <div className="flex-shrink-0 px-4 mt-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
            <div className="flex items-center gap-3 text-gray-400 font-semibold tracking-[0.15em] text-xs">
              <div className="h-px flex-1 bg-gray-200" />
              <span>SAVED ADDRESS</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
          </div>

          {/* Scrollable Address List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pt-6 pb-10 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
            {addresses.length > 0 ? (
              addresses.map((addr, index) => (
                <div
                  key={addr.id}
                  className={`bg-white rounded-[18px] shadow-sm p-4 ${
                    index > 0 ? "mt-3" : ""
                  } ${
                    selectedAddressId === addr.id ||
                    checkoutData?.selectedAddressId === addr.id
                      ? "ring-2 ring-[#2664eb] ring-opacity-50 border-[#2664eb]"
                      : "hover:bg-gray-50 cursor-pointer"
                  }`}
                  onClick={() => handleAddressClick(addr)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-xl items-center justify-center flex">
                        <HomeAngle
                          weight="Broken"
                          className="h-5 w-5 text-[#570000]"
                        />
                      </span>
                      <span className="font-medium text-gray-800">
                        {addr.address_name || "Address"}
                      </span>
                      {selectedAddressId === addr.id && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#2664eb] text-white text-xs">
                          ✓
                        </span>
                      )}
                    </div>
                    <button className="text-[#570000]">
                      <MenuDots
                        weight="Broken"
                        className="h-5 w-5 text-[#570000]"
                      />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 leading-snug">
                    {addr.full_address}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E9FFF3] text-[#15A05A] text-xs">
                      <Routing weight="Broken" className="h-4 w-4" />
                      {getDisplayDistance(addr.distance)?.toFixed(1) ?? "-"} km
                    </span>
                    {addr.duration && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F3FF] text-[#2664eb] text-xs">
                        <ClockCircle className="h-4 w-4" />~{addr.duration}min
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-3">
                  <HomeAngle
                    weight="Broken"
                    className="h-16 w-16 mx-auto text-gray-300"
                  />
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  No addresses found. Add an address to proceed with checkout.
                </p>
                <Link href={`/addresses/new?returnTo=/checkouts/${checkoutId}`}>
                  <Button className="bg-[#570000] hover:bg-[#450000] text-white">
                    Add New Address
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
