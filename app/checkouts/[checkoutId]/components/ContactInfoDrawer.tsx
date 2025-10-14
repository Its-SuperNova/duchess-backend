"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Phone, Pen } from "@solar-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/lib/auth-utils";

interface ContactInfo {
  name: string;
  phone: string;
  alternatePhone: string;
}

interface ContactInfoDrawerProps {
  checkoutId: string;
  contactInfo: ContactInfo;
  session: any;
  onContactInfoChange: (contactInfo: ContactInfo) => void;
}

export default function ContactInfoDrawer({
  checkoutId,
  contactInfo,
  session,
  onContactInfoChange,
}: ContactInfoDrawerProps) {
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);
  const [tempContactInfo, setTempContactInfo] = useState(contactInfo);
  const { toast } = useToast();

  // Sync tempContactInfo with contactInfo when drawer opens
  useEffect(() => {
    if (isContactDrawerOpen) {
      console.log(
        "🔍 Contact drawer opened - tempContactInfo:",
        tempContactInfo
      );
      // Check if tempContactInfo is different from contactInfo
      if (JSON.stringify(tempContactInfo) === JSON.stringify(contactInfo)) {
        console.log("✅ tempContactInfo is already in sync with contactInfo");
      } else {
        // Ensure tempContactInfo is synced with contactInfo when drawer opens
        if (JSON.stringify(tempContactInfo) !== JSON.stringify(contactInfo)) {
          console.log("🔧 Syncing tempContactInfo with contactInfo");
          setTempContactInfo(contactInfo);
        }
      }
    }
  }, [isContactDrawerOpen, contactInfo]);

  // Update tempContactInfo when contactInfo changes
  useEffect(() => {
    setTempContactInfo(contactInfo);
  }, [contactInfo]);

  const handleSaveContact = async () => {
    console.log("🔍 Save button clicked - tempContactInfo:", tempContactInfo);

    // Validate phone number (must be exactly 10 digits)
    if (
      !tempContactInfo.phone ||
      tempContactInfo.phone.length !== 10 ||
      !/^\d{10}$/.test(tempContactInfo.phone)
    ) {
      console.log("❌ Phone validation failed:", {
        phone: tempContactInfo.phone,
        length: tempContactInfo.phone?.length,
        isValid: /^\d{10}$/.test(tempContactInfo.phone || ""),
      });
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }

    // Validate alternate phone if provided
    if (
      tempContactInfo.alternatePhone &&
      (tempContactInfo.alternatePhone.length !== 10 ||
        !/^\d{10}$/.test(tempContactInfo.alternatePhone))
    ) {
      toast({
        title: "Invalid Alternate Phone Number",
        description: "Alternate phone number must be exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }

    // Validate name
    if (!tempContactInfo.name || tempContactInfo.name.trim() === "") {
      toast({
        title: "Name Required",
        description: "Please enter the receiver's name.",
        variant: "destructive",
      });
      return;
    }

    // Update state first
    onContactInfoChange(tempContactInfo);

    // Update checkout session with contact info
    try {
      console.log("🔄 Updating contact info in checkout session:", {
        checkoutId,
        contactInfo: tempContactInfo,
      });

      const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactInfo: tempContactInfo,
        }),
      });

      if (updateResponse.ok) {
        const responseData = await updateResponse.json();
        console.log(
          "✅ Contact info updated in checkout session:",
          responseData
        );
      } else {
        console.error(
          "❌ Failed to update contact info:",
          await updateResponse.text()
        );
      }
    } catch (error) {
      console.error("❌ Error updating contact info:", error);
    }

    // Save to localStorage immediately
    if (typeof window !== "undefined") {
      try {
        const savedContext = localStorage.getItem("checkoutContext");
        const currentContext = savedContext ? JSON.parse(savedContext) : {};
        const updatedContext = {
          ...currentContext,
          contactInfo: tempContactInfo,
        };
        localStorage.setItem("checkoutContext", JSON.stringify(updatedContext));
      } catch (error) {
        console.error("Error saving contact info to localStorage:", error);
      }
    }

    // If this is a new contact, also update the user profile
    if (!tempContactInfo.name || !tempContactInfo.phone) {
      // Update user profile with new contact info
      if (session?.user?.email) {
        updateUserProfile(session.user.email, {
          name: tempContactInfo.name,
          phone_number: tempContactInfo.phone,
        });
      }
    }

    // Show success message
    toast({
      title: "Receiver's information saved",
      description: "Receiver's details have been updated successfully.",
    });

    // Close drawer after state update
    setIsContactDrawerOpen(false);
  };

  const handleResetContact = () => {
    setTempContactInfo(contactInfo);
  };

  return (
    <>
      {/* Receiver's Details Button Section */}
      <div className="flex items-start">
        <Phone className="h-5 w-5 mr-3 flex-shrink-0 text-black" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 dark:text-gray-200">
            Receiver's Details
          </h3>
          <div className="mt-1 flex items-center justify-between gap-3 min-w-0">
            {contactInfo.name && contactInfo.phone ? (
              <>
                <p className="text-gray-500 dark:text-gray-400 text-sm truncate min-w-0">
                  {contactInfo.name}, {contactInfo.phone}
                </p>
                <button
                  className="text-[#2664eb] hover:text-[#1d4ed8] transition-colors p-1 rounded-full hover:bg-blue-50"
                  onClick={() => {
                    setTempContactInfo(contactInfo);
                    setIsContactDrawerOpen(true);
                  }}
                  aria-label="Edit contact information"
                >
                  <Pen weight="Broken" size={16} color="#2664eb" />
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Add contact to proceed with checkout
                </p>
                <button
                  className="text-[#2664eb] hover:text-[#1d4ed8] transition-colors px-3 py-1 rounded-full hover:bg-blue-50 text-sm font-medium"
                  onClick={() => {
                    setIsContactDrawerOpen(true);
                  }}
                  aria-label="Add contact information"
                >
                  Add
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contact Edit Drawer */}
      <Drawer
        modal={true}
        open={isContactDrawerOpen}
        onOpenChange={setIsContactDrawerOpen}
      >
        <DrawerContent className="h-[600px] md:h-[550px] rounded-t-2xl bg-[#F5F6FB] flex flex-col">
          {/* Fixed Header */}
          <DrawerHeader className="text-left lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <DrawerTitle className="text-[20px]">
                {contactInfo.name && contactInfo.phone
                  ? "Edit Receiver's Information"
                  : "Add Receiver's Information"}
              </DrawerTitle>
              <DrawerClose asChild>
                <button
                  aria-label="Close"
                  className="h-[36px] w-[36px] rounded-full bg-white hover:bg-gray-50 flex items-center justify-center"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
            <div className="space-y-4 pt-4 pb-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <Input
                  id="contact-name"
                  placeholder="Enter your full name"
                  value={tempContactInfo.name}
                  onChange={(e) => {
                    console.log("🔍 Name field changed:", e.target.value);
                    setTempContactInfo((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }));
                  }}
                  className="rounded-[12px] placeholder:text-[#C0C0C0]"
                />
              </div>
              <div>
                <label
                  htmlFor="contact-phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={tempContactInfo.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    console.log("🔍 Phone field changed:", value);
                    if (value.length <= 10) {
                      setTempContactInfo((prev) => ({
                        ...prev,
                        phone: value,
                      }));
                    }
                  }}
                  maxLength={10}
                  className="rounded-[12px] placeholder:text-[#C0C0C0]"
                />
              </div>
              <div>
                <label
                  htmlFor="contact-alternate-phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Alternate Phone Number
                </label>
                <Input
                  id="contact-alternate-phone"
                  type="tel"
                  placeholder="Enter 10-digit alternate phone (optional)"
                  value={tempContactInfo.alternatePhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setTempContactInfo((prev) => ({
                        ...prev,
                        alternatePhone: value,
                      }));
                    }
                  }}
                  maxLength={10}
                  className="rounded-[12px] placeholder:text-[#C0C0C0]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If the main contact number is not available, the delivery
                  partner will contact the alternate number
                </p>
              </div>
            </div>
          </div>

          {/* Fixed Action Buttons */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-[#F5F6FB] px-4 py-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
            {/* Desktop action row */}
            <div className="hidden lg:flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetContact}
                className="h-9 px-5 rounded-[12px]"
              >
                Reset
              </Button>
              <Button
                size="sm"
                className="h-9 px-5 rounded-[12px]"
                onClick={handleSaveContact}
              >
                {tempContactInfo.name && tempContactInfo.phone ? "Save" : "Add"}
              </Button>
            </div>
            {/* Mobile action row */}
            <div className="lg:hidden flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleResetContact}
                className="flex-1 rounded-[20px] text-[16px]"
              >
                Reset
              </Button>
              <Button
                size="lg"
                className="flex-1 py-5 rounded-[20px] text-[16px]"
                onClick={handleSaveContact}
              >
                {tempContactInfo.name && tempContactInfo.phone ? "Save" : "Add"}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

