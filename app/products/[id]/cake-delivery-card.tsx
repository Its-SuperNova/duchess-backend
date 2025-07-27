"use client";

import {
  Check,
  Flame,
  Gift,
  MessageSquare,
  Pencil,
  Utensils,
  Clock,
  MapPin,
  Percent,
  Copy,
  Home,
  Building,
  Landmark,
  Hash,
  Plus,
  CalendarIcon,
  ChevronRight,
  Loader2,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
  DialogDescription,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { format, addDays, startOfToday } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCurrentLocationAddress } from "@/lib/address-utils";

// Function to calculate delivery time based on stock status and location
const calculateDeliveryTime = (stock: number, location: string) => {
  // Base delivery times for different areas (in minutes)
  const baseDeliveryTimes = {
    "New Delhi": 60,
    Mumbai: 90,
    Bangalore: 75,
    Pune: 80,
  };

  // Extract city from location
  const city = location.split(",")[1]?.trim() || "New Delhi";
  // Get base delivery time for the city
  const baseTime =
    city in baseDeliveryTimes
      ? baseDeliveryTimes[city as keyof typeof baseDeliveryTimes]
      : 60; // Default to 60 minutes if city not found

  // Add 4 hours (240 minutes) if product is out of stock
  const additionalTime = stock === 0 ? 240 : 0;

  // Total delivery time in minutes
  const totalMinutes = baseTime + additionalTime;

  // Convert to hours and minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Format the time string
  let timeString = "";
  if (hours > 0) {
    timeString += `${hours} hr${hours > 1 ? "s" : ""}`;
  }
  if (minutes > 0) {
    timeString += `${hours > 0 ? " " : ""}${minutes} min${
      minutes > 1 ? "s" : ""
    }`;
  }

  return {
    totalMinutes,
    timeString,
    isDelayed: stock === 0,
  };
};

// AddressDrawer component
function AddressDrawer({
  open,
  setOpen,
  addresses,
  selectedAddress,
  setSelectedAddress,
  showAddAddress,
  setShowAddAddress,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  addresses: { label: string; address: string }[];
  selectedAddress: number;
  setSelectedAddress: (index: number) => void;
  showAddAddress: boolean;
  setShowAddAddress: (show: boolean) => void;
}) {
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    label: "Home",
    street: "",
    area: "",
    pincode: "",
    alternatePhone: "",
  });

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      const result = await getCurrentLocationAddress();

      if (result.error) {
        setLocationError(result.error);
      } else if (result.address) {
        setAddressFormData({
          label: "Home",
          street: "", // Leave street address empty for manual entry
          area: result.address.city,
          pincode: result.address.zipCode,
          alternatePhone: "",
        });
        setLocationError(
          "Location detected! City, state, and zipcode filled automatically. Please enter your street address and alternate phone."
        );
      } else {
        setLocationError(
          "Location detected but couldn't get address details. Please fill in manually."
        );
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationError("Failed to get your location. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  };

  // Auto-populate area when ZIP code changes
  useEffect(() => {
    const getAreaFromPincode = async () => {
      if (addressFormData.pincode && addressFormData.pincode.length === 6) {
        try {
          // Import the validation function at the top of this file instead of making API call
          const { autofillAddressFromPincode } = await import(
            "@/lib/address-validation"
          );
          const result = await autofillAddressFromPincode(
            addressFormData.pincode
          );

          if (result.isValid && result.area) {
            setAddressFormData((prev) => ({
              ...prev,
              area: result.area || "",
            }));
          }
        } catch (error) {
          console.error("Error getting area from pincode:", error);
        }
      }
    };

    // Debounce to avoid too many API calls
    const timeoutId = setTimeout(getAreaFromPincode, 1000);
    return () => clearTimeout(timeoutId);
  }, [addressFormData.pincode]);

  // Validation function for address form
  const isAddressFormValid = () => {
    return (
      addressFormData.label.trim() !== "" &&
      addressFormData.street.trim() !== "" &&
      addressFormData.area.trim() !== "" &&
      addressFormData.pincode.trim() !== "" &&
      addressFormData.alternatePhone.trim() !== ""
    );
  };

  return (
    <DrawerContent className="max-h-[90vh]">
      {!showAddAddress ? (
        <>
          <DrawerHeader>
            <DrawerTitle>Select Delivery Address</DrawerTitle>
            <DrawerDescription>
              Choose your delivery address or add a new one
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-2 space-y-3">
            {/* Use Current Location Button */}
            <button
              onClick={handleUseCurrentLocation}
              disabled={locationLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-primary bg-white text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locationLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Getting location...</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>Auto-fill City, State & ZIP</span>
                </>
              )}
            </button>

            {/* Location Error Message */}
            {locationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{locationError}</p>
              </div>
            )}

            {/* Existing Addresses */}
            {addresses.map((address, index) => (
              <AddressRadio
                key={index}
                checked={selectedAddress === index}
                onChange={() => setSelectedAddress(index)}
                label={address.label}
                address={address.address}
              />
            ))}
          </div>
          <DrawerFooter className="flex flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddAddress(true)}
            >
              Add New Address
            </Button>
            <DrawerClose asChild>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
                onClick={() => setOpen(false)}
              >
                Confirm
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </>
      ) : (
        <>
          <DrawerHeader>
            <DrawerTitle>Add New Address</DrawerTitle>
            <DrawerDescription>Enter your new address below.</DrawerDescription>
          </DrawerHeader>
          <form className="space-y-3 px-4 my-4">
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Label (e.g. Home, Work)"
                className="bg-white text-sm pl-10"
                value={addressFormData.label}
                onChange={(e) =>
                  setAddressFormData((prev) => ({
                    ...prev,
                    label: e.target.value,
                  }))
                }
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Street Address"
                className="bg-white text-sm pl-10"
                value={addressFormData.street}
                onChange={(e) =>
                  setAddressFormData((prev) => ({
                    ...prev,
                    street: e.target.value,
                  }))
                }
              />
            </div>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Area (auto-fills from ZIP)"
                className="bg-white text-sm pl-10"
                value={addressFormData.area}
                onChange={(e) =>
                  setAddressFormData((prev) => ({
                    ...prev,
                    area: e.target.value,
                  }))
                }
              />
            </div>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ZIP Code (6 digits)"
                className="bg-white text-sm pl-10"
                value={addressFormData.pincode}
                onChange={(e) =>
                  setAddressFormData((prev) => ({
                    ...prev,
                    pincode: e.target.value,
                  }))
                }
                maxLength={6}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Phone*"
                className="bg-white text-sm pl-10"
                value={addressFormData.alternatePhone}
                onChange={(e) =>
                  setAddressFormData((prev) => ({
                    ...prev,
                    alternatePhone: e.target.value,
                  }))
                }
                required
              />
            </div>
          </form>
          <DrawerFooter className="flex flex-row gap-3">
            <button
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              onClick={() => setShowAddAddress(false)}
            >
              Back
            </button>
            <DrawerClose asChild>
              <button
                className={`flex-1 px-4 py-3 rounded-lg border font-semibold transition-colors ${
                  isAddressFormValid()
                    ? "!border-primary bg-black text-white hover:bg-gray-900"
                    : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (isAddressFormValid()) {
                    setOpen(false);
                  } else {
                    setLocationError(
                      "Please fill in all required fields including phone number."
                    );
                  }
                }}
                disabled={!isAddressFormValid()}
              >
                Save
              </button>
            </DrawerClose>
          </DrawerFooter>
        </>
      )}
    </DrawerContent>
  );
}

// Simplified Delivery Date Picker (7 days only)
function DeliveryDatePicker({
  open,
  setOpen,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  isMobile,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTimeSlot: string;
  setSelectedTimeSlot: (slot: string) => void;
  isMobile: boolean;
}) {
  // Generate next 7 days
  const today = startOfToday();
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(today, i + 1));

  // Available time slots
  const timeSlots = {
    morning: "9:00 AM - 12:00 PM",
    afternoon: "12:00 PM - 3:00 PM",
    evening: "3:00 PM - 6:00 PM",
    night: "6:00 PM - 9:00 PM",
  };

  // Function to handle save
  const handleSave = () => {
    setOpen(false);
  };

  const Content = () => (
    <>
      <div className="py-2">
        <h4 className="text-sm font-medium mb-3">Select Delivery Date</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
          {next7Days.map((date, index) => (
            <button
              key={index}
              onClick={() => setSelectedDate(date)}
              className={`py-3 px-2 rounded-lg text-sm transition-all flex flex-col items-center ${
                selectedDate &&
                format(selectedDate, "yyyy-MM-dd") ===
                  format(date, "yyyy-MM-dd")
                  ? "bg-blue-500 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-xs opacity-80">{format(date, "EEE")}</span>
              <span className="font-medium">{format(date, "d")}</span>
              <span className="text-xs opacity-80">{format(date, "MMM")}</span>
            </button>
          ))}
        </div>

        <h4 className="text-sm font-medium mb-3">Select Time Slot</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(timeSlots).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setSelectedTimeSlot(key)}
              className={`py-3 px-4 rounded-lg text-sm transition-all ${
                selectedTimeSlot === key
                  ? "bg-primary text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Schedule Delivery</DrawerTitle>
            <DrawerDescription>
              Select your preferred delivery date and time
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-2">
            <Content />
          </div>
          <DrawerFooter className="flex flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
              onClick={handleSave}
              disabled={!selectedDate || !selectedTimeSlot}
            >
              Confirm
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Delivery</DialogTitle>
          <DialogDescription>
            Select your preferred delivery date and time
          </DialogDescription>
        </DialogHeader>
        <Content />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleSave}
              disabled={!selectedDate || !selectedTimeSlot}
            >
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Radio button for address selection
function AddressRadio({
  checked,
  onChange,
  label,
  address,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  address: string;
}) {
  return (
    <label
      className="flex items-start gap-3 cursor-pointer w-full px-4 py-3 rounded-lg border transition-all"
      style={{
        borderColor: checked ? "black" : "#e5e7eb",
        background: checked ? "#f3f4f6" : "white",
      }}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="form-radio h-4 w-4 mt-1 text-black border-gray-300 focus:ring-black"
      />
      <div>
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-sm text-gray-500">{address}</div>
      </div>
    </label>
  );
}

export default function CakeDeliveryCard({ stock = 15 }: { stock?: number }) {
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<
    "same-day" | "scheduled"
  >("same-day");
  const [selectedCustomizations, setSelectedCustomizations] = useState<
    string[]
  >([]);
  const { toast } = useToast();
  const [cakeText, setCakeText] = useState("");
  const [messageCardText, setMessageCardText] = useState("");
  const [openModal, setOpenModal] = useState<null | "text" | "card">(null);
  const [tempCakeText, setTempCakeText] = useState("");
  const [tempMessageCardText, setTempMessageCardText] = useState("");
  const [dialogType, setDialogType] = useState<null | "text" | "card">(null);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("morning");

  const addresses = [
    { label: "Home", address: "123 Main St, New Delhi, 110001" },
    { label: "Work", address: "456 Park Ave, Mumbai, 400001" },
    { label: "Parents", address: "789 Lake Rd, Bangalore, 560001" },
    { label: "Other", address: "101 Hilltop, Pune, 411001" },
  ];

  const isMobile = useIsMobile();

  // Time slot display names
  const timeSlotNames = {
    morning: "9:00 AM - 12:00 PM",
    afternoon: "12:00 PM - 3:00 PM",
    evening: "3:00 PM - 6:00 PM",
    night: "6:00 PM - 9:00 PM",
  };

  const toggleCustomization = (option: string) => {
    if (selectedCustomizations.includes(option)) {
      setSelectedCustomizations(
        selectedCustomizations.filter((item) => item !== option)
      );
    } else {
      setSelectedCustomizations([...selectedCustomizations, option]);
      if (option === "text") {
        setTempCakeText(cakeText);
        setOpenModal("text");
      } else if (option === "card") {
        setTempMessageCardText(messageCardText);
        setOpenModal("card");
      }
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        toast({
          title: "Coupon copied",
          className: "bg-green-50 text-green-800 border-green-300 py-3",
          duration: 2000,
        });
      })
      .catch((error) => {
        console.error("Failed to copy code:", error);
        toast({
          title: "Failed to copy",
          variant: "destructive",
          duration: 2000,
        });
      });
  };

  const getCustomizationOptions = () => [
    {
      id: "text",
      icon: <Pencil className="h-4 w-4" />,
      label: "Add text on cake",
      description: "Add a short message to be written on the cake",
    },
    {
      id: "candles",
      icon: <Flame className="h-4 w-4" />,
      label: "Add candles",
      description: "Add birthday candles to your cake",
    },
    {
      id: "knife",
      icon: <Utensils className="h-4 w-4" />,
      label: "Add knife",
      description: "Include a cake knife with your order",
    },
    {
      id: "card",
      icon: <MessageSquare className="h-4 w-4" />,
      label: "Add message card",
      description: "Include a personalized message card",
    },
  ];

  // Handle delivery option change
  const handleDeliveryOptionChange = (option: "same-day" | "scheduled") => {
    setSelectedDeliveryOption(option);
    if (option === "scheduled" && !selectedDate) {
      setCalendarOpen(true);
    }
  };

  // Generate next 7 days for quick selection
  const today = startOfToday();
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(today, i + 1));

  return (
    <div className="px-0 md:px-8 mt-4 md:mt-0">
      <Card className="w-full bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="grid gap-6 p-6">
          {/* Delivery Options - Enhanced with Calendar */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-800">
              Delivery Options
            </h3>

            {/* Delivery Option Toggle */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleDeliveryOptionChange("same-day")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                  selectedDeliveryOption === "same-day"
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Same Day Delivery
              </button>
              <button
                onClick={() => handleDeliveryOptionChange("scheduled")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                  selectedDeliveryOption === "scheduled"
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Schedule for Later
              </button>
            </div>

            {/* Delivery Details */}
            {selectedDeliveryOption === "same-day" ? (
              <div className="mt-2">
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    stock === 0
                      ? "bg-amber-50 border-amber-100"
                      : "bg-green-50 border-green-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`${
                        stock === 0 ? "bg-amber-600" : "bg-green-600"
                      } text-white p-2 rounded-lg`}
                    >
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          stock === 0 ? "text-amber-800" : "text-green-800"
                        }`}
                      >
                        {stock === 0
                          ? "Extended delivery time"
                          : "Same-day delivery available"}
                      </p>
                      <p
                        className={`text-sm ${
                          stock === 0 ? "text-amber-600" : "text-green-600"
                        }`}
                      >
                        {stock === 0
                          ? "Additional 4 hours for restocking"
                          : "Order within 2 hrs to get it today"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-sm font-medium ${
                        stock === 0 ? "text-amber-800" : "text-green-800"
                      }`}
                    >
                      {stock === 0 ? "Today + 4hrs" : "Today"}
                    </span>
                    <span
                      className={`text-xs ${
                        stock === 0 ? "text-amber-600" : "text-green-600"
                      }`}
                    >
                      {stock === 0 ? "9:00 PM - 11:00 PM" : "5:00 PM - 7:00 PM"}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Choose delivery time
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        time: stock === 0 ? "9-11 PM" : "5-7 PM",
                        available: stock === 0 ? false : true,
                      },
                      {
                        time: stock === 0 ? "11-1 AM" : "7-9 PM",
                        available: stock === 0,
                      },
                      {
                        time: stock === 0 ? "1-3 AM" : "9-11 PM",
                        available: false,
                      },
                    ].map((slot, index) => (
                      <button
                        key={index}
                        disabled={!slot.available}
                        className={`py-2 px-3 text-sm rounded-lg border transition-colors ${
                          index === 0
                            ? "bg-primary text-white border-primary"
                            : slot.available
                            ? "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                        }`}
                      >
                        {slot.time}
                        {!slot.available && (
                          <span className="block text-xs">Unavailable</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                {selectedDate && selectedTimeSlot ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary text-white p-2 rounded-lg">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {format(selectedDate, "EEEE, MMMM d")}
                        </p>
                        <p className="text-sm text-gray-500">
                          Delivery between{" "}
                          {
                            timeSlotNames[
                              selectedTimeSlot as keyof typeof timeSlotNames
                            ]
                          }
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-primary border-primary hover:bg-primary/5"
                      onClick={() => setCalendarOpen(true)}
                    >
                      Edit
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 gap-2">
                      {next7Days.slice(0, 4).map((date, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedDate(date);
                            if (!selectedTimeSlot)
                              setSelectedTimeSlot("morning");
                          }}
                          className="py-2 text-sm border border-gray-200 rounded-lg hover:border-primary/30 hover:bg-primary/5 flex flex-col items-center"
                        >
                          <span className="text-xs text-gray-500">
                            {format(date, "EEE")}
                          </span>
                          <span className="font-medium">
                            {format(date, "d")}
                          </span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCalendarOpen(true)}
                      className="w-full mt-2 py-2 text-sm border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      More Options
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      Delivering to:
                    </span>
                    <span className="text-sm font-medium text-primary mt-0.5">
                      {addresses[selectedAddress].label}
                    </span>
                    <div className="text-sm text-gray-600 mt-0.5">
                      {(() => {
                        const [line1, city, pincode] = addresses[
                          selectedAddress
                        ].address
                          .split(",")
                          .map((part) => part.trim());
                        return (
                          <>
                            <div>{line1}</div>
                            <div>
                              {city}, {pincode}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                {isMobile ? (
                  <>
                    <button
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-primary font-medium text-sm hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm"
                      onClick={() => {
                        setShowAddAddress(false);
                        setAddressDialogOpen(true);
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                      Change
                    </button>
                    <Drawer
                      open={addressDialogOpen}
                      onOpenChange={setAddressDialogOpen}
                    >
                      <AddressDrawer
                        open={addressDialogOpen}
                        setOpen={setAddressDialogOpen}
                        addresses={addresses}
                        selectedAddress={selectedAddress}
                        setSelectedAddress={setSelectedAddress}
                        showAddAddress={showAddAddress}
                        setShowAddAddress={setShowAddAddress}
                      />
                    </Drawer>
                  </>
                ) : (
                  <Dialog
                    open={addressDialogOpen}
                    onOpenChange={setAddressDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <button
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-primary font-medium text-sm hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm"
                        onClick={() => {
                          setShowAddAddress(false);
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                        Change
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      {!showAddAddress ? null : (
                        <AddressDrawer
                          open={addressDialogOpen}
                          setOpen={setAddressDialogOpen}
                          addresses={addresses}
                          selectedAddress={selectedAddress}
                          setSelectedAddress={setSelectedAddress}
                          showAddAddress={showAddAddress}
                          setShowAddAddress={setShowAddAddress}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>

          {/* Simplified Date Picker Dialog/Drawer */}
          <DeliveryDatePicker
            open={calendarOpen}
            setOpen={setCalendarOpen}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTimeSlot={selectedTimeSlot}
            setSelectedTimeSlot={setSelectedTimeSlot}
            isMobile={isMobile}
          />

          <Separator />

          {/* Customization - Enhanced with Input Fields - Hidden on Mobile */}
          {!isMobile && (
            <>
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-800">
                  Customization
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {getCustomizationOptions().map((option) => (
                    <Dialog
                      key={option.id}
                      open={dialogType === option.id}
                      onOpenChange={(open) => {
                        if (open) {
                          if (!selectedCustomizations.includes(option.id)) {
                            toggleCustomization(option.id);
                          }
                          setDialogType(option.id as "text" | "card");
                          if (option.id === "text") setTempCakeText(cakeText);
                          if (option.id === "card")
                            setTempMessageCardText(messageCardText);
                        } else {
                          setDialogType(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <button
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                            selectedCustomizations.includes(option.id)
                              ? "border-gray-400 bg-gray-100"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span
                            className={
                              selectedCustomizations.includes(option.id)
                                ? "text-black"
                                : "text-gray-500"
                            }
                          >
                            {option.icon}
                          </span>
                          <span
                            className={`${
                              selectedCustomizations.includes(option.id)
                                ? "text-black"
                                : "text-gray-700"
                            } truncate`}
                          >
                            {option.label}
                          </span>
                          {selectedCustomizations.includes(option.id) && (
                            <Check className="h-3.5 w-3.5 ml-auto text-black" />
                          )}
                        </button>
                      </DialogTrigger>
                      {(option.id === "text" || option.id === "card") && (
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {option.id === "text"
                                ? "Text on Cake"
                                : "Message Card"}
                            </DialogTitle>
                            <DialogDescription>
                              {option.id === "text"
                                ? "This will be written on the cake. Max 30 characters."
                                : "This message will be printed on a card."}
                            </DialogDescription>
                          </DialogHeader>
                          {option.id === "text" ? (
                            <>
                              <div className="flex items-start justify-between gap-2">
                                <Input
                                  value={tempCakeText}
                                  onChange={(e) =>
                                    setTempCakeText(e.target.value.slice(0, 30))
                                  }
                                  placeholder="e.g., Happy Birthday John!"
                                  className={`flex-1 bg-white text-sm focus-visible:ring-primary ${
                                    tempCakeText.trim().length > 0 &&
                                    tempCakeText.trim().length < 4
                                      ? "border-red-300 focus-visible:ring-red-500"
                                      : ""
                                  }`}
                                  maxLength={30}
                                />
                                <span className="ml-2 text-xs text-gray-500 pt-2">
                                  {tempCakeText.length}/30
                                </span>
                              </div>
                              {tempCakeText.trim().length > 0 &&
                                tempCakeText.trim().length < 4 && (
                                  <div className="text-xs text-red-500 mb-4">
                                    Minimum 4 characters required
                                  </div>
                                )}
                            </>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-2">
                                <Textarea
                                  value={tempMessageCardText}
                                  onChange={(e) =>
                                    setTempMessageCardText(e.target.value)
                                  }
                                  placeholder="e.g., Wishing you a wonderful birthday filled with happiness and love!"
                                  className={`flex-1 bg-white text-sm resize-none focus-visible:ring-primary ${
                                    tempMessageCardText.trim().length > 0 &&
                                    tempMessageCardText.trim().length < 4
                                      ? "border-red-300 focus-visible:ring-red-500"
                                      : ""
                                  }`}
                                  rows={4}
                                />
                                <span className="ml-2 text-xs text-gray-500 pt-2">
                                  {tempMessageCardText.length}/100
                                </span>
                              </div>
                              {tempMessageCardText.trim().length > 0 &&
                                tempMessageCardText.trim().length < 4 && (
                                  <div className="text-xs text-red-500 mb-4">
                                    Minimum 4 characters required
                                  </div>
                                )}
                            </>
                          )}
                          <DialogFooter>
                            <DialogClose asChild>
                              <button
                                className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                                onClick={() => setDialogType(null)}
                              >
                                Cancel
                              </button>
                            </DialogClose>
                            <DialogClose asChild>
                              <button
                                className={`px-4 py-2 rounded-lg border font-semibold transition-colors ${
                                  (option.id === "text" &&
                                    tempCakeText.trim().length >= 4) ||
                                  (option.id === "card" &&
                                    tempMessageCardText.trim().length >= 4) ||
                                  (option.id === "text" &&
                                    tempCakeText.trim().length === 0) ||
                                  (option.id === "card" &&
                                    tempMessageCardText.trim().length === 0)
                                    ? "border-primary bg-primary text-white hover:bg-primary/90"
                                    : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                                disabled={
                                  (option.id === "text" &&
                                    tempCakeText.trim().length > 0 &&
                                    tempCakeText.trim().length < 4) ||
                                  (option.id === "card" &&
                                    tempMessageCardText.trim().length > 0 &&
                                    tempMessageCardText.trim().length < 4)
                                }
                                onClick={() => {
                                  if (option.id === "text")
                                    setCakeText(tempCakeText);
                                  if (option.id === "card")
                                    setMessageCardText(tempMessageCardText);
                                  setDialogType(null);
                                }}
                              >
                                Save
                              </button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                  ))}
                </div>

                {/* Selected Customizations Summary */}
                {selectedCustomizations.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      * All customizations will be added to your order when you
                      click "Add to Cart"
                    </p>
                  </div>
                )}
              </div>

              <Separator />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
