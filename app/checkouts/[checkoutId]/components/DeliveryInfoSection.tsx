"use client";

import { ClockCircle } from "@solar-icons/react";
import AddressDrawer from "./AddressDrawer";
import ContactInfoDrawer from "./ContactInfoDrawer";
import type { Address as DbAddress } from "@/lib/supabase";

interface ContactInfo {
  name: string;
  phone: string;
  alternatePhone: string;
}

interface DeliveryInfoSectionProps {
  checkoutId: string;
  addresses: DbAddress[];
  addressText: string;
  selectedAddressId: string | null;
  checkoutData: any;
  contactInfo: ContactInfo;
  session: any;
  onAddressTextChange: (text: string) => void;
  onSelectedAddressIdChange: (id: string) => void;
  onCheckoutDataChange: (data: any) => void;
  onContactInfoChange: (contactInfo: ContactInfo) => void;
}

export default function DeliveryInfoSection({
  checkoutId,
  addresses,
  addressText,
  selectedAddressId,
  checkoutData,
  contactInfo,
  session,
  onAddressTextChange,
  onSelectedAddressIdChange,
  onCheckoutDataChange,
  onContactInfoChange,
}: DeliveryInfoSectionProps) {
  // Function to calculate delivery time based on address distance
  const calculateDeliveryTime = () => {
    if (!addressText || addresses.length === 0) return null;

    // Find the current address from the addresses list
    const currentAddress = addresses.find(
      (addr) => addr.full_address === addressText
    );
    if (!currentAddress?.distance) return null;

    // Preparation time: 1 hour (60 minutes)
    const preparationTime = 60;

    // Travel time: use the duration from the address if available, otherwise calculate
    // The address page shows ~31min for 13km, so we'll use a more realistic calculation
    let travelTime;
    if (currentAddress.duration) {
      // Use the actual duration from the address
      travelTime = currentAddress.duration;
    } else {
      // Fallback calculation: 1 km = ~2.4 minutes (based on 13km = 31min)
      travelTime = Math.round(currentAddress.distance * 2.4);
    }

    // Total delivery time
    const totalTime = preparationTime + travelTime;

    return totalTime;
  };

  // Function to format time in hours and minutes
  const formatDeliveryTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes} mins`;
    } else if (minutes === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${minutes} mins`;
    }
  };

  return (
    <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
      {/* Delivery Time Section */}
      <div className="flex items-start mb-4">
        <ClockCircle className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-black" />
        <div>
          <h3 className="font-medium text-gray-800 dark:text-gray-200">
            {(() => {
              const deliveryTime = calculateDeliveryTime();
              if (deliveryTime) {
                return `Delivery in ${formatDeliveryTime(deliveryTime)} (aprx)`;
              }
              return "Add address to see delivery time";
            })()}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-[12px]">
            Delivery time is approximate and will be confirmed after your order.
          </p>
        </div>
      </div>

      {/* Address Drawer */}
      <AddressDrawer
        checkoutId={checkoutId}
        addresses={addresses}
        addressText={addressText}
        selectedAddressId={selectedAddressId}
        checkoutData={checkoutData}
        onAddressSelect={(address) => {
          // This will be handled by the component internally
        }}
        onAddressTextChange={onAddressTextChange}
        onSelectedAddressIdChange={onSelectedAddressIdChange}
        onCheckoutDataChange={onCheckoutDataChange}
      />

      {/* Contact Info Drawer */}
      <ContactInfoDrawer
        checkoutId={checkoutId}
        contactInfo={contactInfo}
        session={session}
        onContactInfoChange={onContactInfoChange}
      />
    </div>
  );
}

