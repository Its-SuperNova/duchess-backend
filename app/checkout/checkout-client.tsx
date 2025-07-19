"use client";

import { Minus, Plus, X } from "lucide-react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
// removed Trash2, using Solar icon via Iconify
import { TiDocumentText } from "react-icons/ti";
import { TbPaperBag } from "react-icons/tb";
import { RiKnifeFill } from "react-icons/ri";
import { FaCakeCandles } from "react-icons/fa6";
import {
  TrashBinTrash,
  DocumentAdd,
  TicketSale,
  WidgetAdd,
  ClockCircle,
  HomeSmileAngle,
  Phone,
  Bill,
  Pen,
  HomeAngle,
  MenuDots,
  Routing,
  Card,
  ListCheckMinimalistic,
  InfoCircle,
} from "@solar-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import Lottie to reduce initial bundle size
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => (
    <div className="w-24 h-24 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
    </div>
  ),
});
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/context/cart-context";
import { getUserByEmail, updateUserProfile } from "@/lib/auth-utils";
import {
  getDefaultAddress,
  getDisplayDistance,
  getUserAddresses,
} from "@/lib/address-utils";
import { calculateDeliveryFee } from "@/lib/distance";
import type { Address as DbAddress } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import zeroPurchaseAnimation from "@/public/Lottie/Zero Purchase.json";

export default function CheckoutClient() {
  // Get cart items and functions from cart context
  const {
    cart,
    getSubtotal,
    updateQuantity,
    removeFromCart,
    updateCartItemCustomization,
    clearCart,
  } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);

  // Load applied coupon code to show update/view UI
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("appliedCoupon")
          : null;
      if (raw) {
        const c = JSON.parse(raw);
        if (c?.code) setSelectedCoupon(c.code);
      } else {
        setSelectedCoupon(null);
      }
    } catch {
      setSelectedCoupon(null);
    }
  }, []);

  // Load note and customization options from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedNote = localStorage.getItem("checkoutNote");
        if (savedNote) {
          setNote(savedNote);
        }

        const savedCustomization = localStorage.getItem(
          "checkoutCustomization"
        );
        if (savedCustomization) {
          setCustomizationOptions(JSON.parse(savedCustomization));
        }

        const savedCakeText = localStorage.getItem("checkoutCakeText");
        if (savedCakeText) {
          setCakeText(savedCakeText);
        }

        const savedMessageCardText = localStorage.getItem(
          "checkoutMessageCardText"
        );
        if (savedMessageCardText) {
          setMessageCardText(savedMessageCardText);
        }
      } catch (error) {
        console.error("Error loading checkout data:", error);
      }
    }
  }, []);
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);
  const [isCustomizationDrawerOpen, setIsCustomizationDrawerOpen] =
    useState(false);
  // Address change drawer state and address text
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [addressText, setAddressText] = useState("");
  const [tempAddress, setTempAddress] = useState("");
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<DbAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);

  // Customization options state
  const [customizationOptions, setCustomizationOptions] = useState({
    addTextOnCake: false,
    addCandles: false,
    addKnife: false,
    addMessageCard: false,
  });

  // Text input states for customization options
  const [cakeText, setCakeText] = useState("");
  const [messageCardText, setMessageCardText] = useState("");
  const [isCakeTextDrawerOpen, setIsCakeTextDrawerOpen] = useState(false);
  const [isMessageCardDrawerOpen, setIsMessageCardDrawerOpen] = useState(false);

  // Contact information state
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    alternatePhone: "",
  });
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);
  const [tempContactInfo, setTempContactInfo] = useState(contactInfo);

  // Payment dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Load checkout context from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedContext = localStorage.getItem("checkoutContext");
        if (savedContext) {
          const parsedContext = JSON.parse(savedContext);
          if (parsedContext.contactInfo) {
            setContactInfo(parsedContext.contactInfo);
            setTempContactInfo(parsedContext.contactInfo);
          }
        }
      } catch (error) {
        console.error("Error loading checkout context:", error);
      }
    }
  }, []);

  // Update tempContactInfo when contactInfo changes
  useEffect(() => {
    setTempContactInfo(contactInfo);
  }, [contactInfo]);

  // Save note to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (note) {
        localStorage.setItem("checkoutNote", note);
      } else {
        localStorage.removeItem("checkoutNote");
      }
    }
  }, [note]);

  // Save customization options to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (Object.values(customizationOptions).some(Boolean)) {
        localStorage.setItem(
          "checkoutCustomization",
          JSON.stringify(customizationOptions)
        );
      } else {
        localStorage.removeItem("checkoutCustomization");
      }
    }
  }, [customizationOptions]);

  // Save cake text to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (cakeText) {
        localStorage.setItem("checkoutCakeText", cakeText);
      } else {
        localStorage.removeItem("checkoutCakeText");
      }
    }
  }, [cakeText]);

  // Save message card text to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (messageCardText) {
        localStorage.setItem("checkoutMessageCardText", messageCardText);
      } else {
        localStorage.removeItem("checkoutMessageCardText");
      }
    }
  }, [messageCardText]);

  // Function to clear checkout context
  const clearCheckoutContext = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("checkoutContext");
        localStorage.removeItem("checkoutNote");
        localStorage.removeItem("checkoutCustomization");
        localStorage.removeItem("checkoutCakeText");
        localStorage.removeItem("checkoutMessageCardText");
      } catch (error) {
        console.error("Error clearing checkout context:", error);
      }
    }
  };

  // Clear checkout context when component unmounts (order completed or user leaves)
  useEffect(() => {
    return () => {
      // Only clear if we're not in the middle of an order
      if (typeof window !== "undefined") {
        try {
          const savedContext = localStorage.getItem("checkoutContext");
          if (savedContext) {
            const parsedContext = JSON.parse(savedContext);
            // Keep the context for a while in case user comes back
            // It will be cleared after order completion or manually
          }
        } catch (error) {
          console.error("Error handling checkout context cleanup:", error);
        }
      }
    };
  }, []);

  // Add beforeunload event listener to clear context when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear checkout context when user leaves the page
      clearCheckoutContext();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
    };
  }, []);
  const [isAddAddressDrawerOpen, setIsAddAddressDrawerOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    addressName: "",
    fullAddress: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Lottie animation state for payment section
  const [paymentAnimationData, setPaymentAnimationData] = useState(null);

  // Load payment animation data
  useEffect(() => {
    const loadPaymentAnimation = async () => {
      try {
        const response = await fetch("/Lottie/Digital Payment.json");
        const data = await response.json();
        setPaymentAnimationData(data);
      } catch (error) {
        console.error("Failed to load payment animation:", error);
      }
    };

    loadPaymentAnimation();
  }, []);

  // Sync customization options from cart items
  useEffect(() => {
    if (cart.length > 0) {
      // Check if any cart item has customization options enabled
      const hasCustomizations = cart.some(
        (item) =>
          item.addTextOnCake ||
          item.addCandles ||
          item.addKnife ||
          item.addMessageCard
      );

      if (hasCustomizations) {
        // Aggregate customization options from all cart items
        const aggregatedOptions = {
          addTextOnCake: cart.some((item) => item.addTextOnCake),
          addCandles: cart.some((item) => item.addCandles),
          addKnife: cart.some((item) => item.addKnife),
          addMessageCard: cart.some((item) => item.addMessageCard),
        };

        setCustomizationOptions(aggregatedOptions);
      }
    }
  }, [cart]);

  // Function to update all cart items with new customization options
  const updateAllCartItemsCustomization = (
    newOptions: typeof customizationOptions
  ) => {
    cart.forEach((item) => {
      if (item.uniqueId) {
        updateCartItemCustomization(item.uniqueId, newOptions);
      }
    });
  };

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

  // Load addresses from database
  useEffect(() => {
    const load = async () => {
      if (!session?.user?.email) return;
      try {
        setLoadingAddresses(true);

        // Check for new address data from sessionStorage first
        const newAddressData = sessionStorage.getItem("newAddressData");
        if (newAddressData) {
          try {
            const { address, timestamp } = JSON.parse(newAddressData);
            const now = Date.now();

            // Only use data that's less than 5 minutes old
            if (now - timestamp < 5 * 60 * 1000) {
              // Auto-fill the address with the newly created one
              setAddressText(address.full_address);

              // Clear the sessionStorage data
              sessionStorage.removeItem("newAddressData");

              // Update the addresses list to include the new address
              const user = await getUserByEmail(session.user.email);
              if (user) {
                const list = await getUserAddresses(user.id);
                setAddresses(list || []);
              }

              return; // Don't proceed with the full refresh since we already have the data
            } else {
              // Data is too old, remove it
              sessionStorage.removeItem("newAddressData");
            }
          } catch (parseError) {
            console.error("Error parsing new address data:", parseError);
            sessionStorage.removeItem("newAddressData");
          }
        }

        const user = await getUserByEmail(session.user.email);
        if (!user) return;
        const list = await getUserAddresses(user.id);
        setAddresses(list || []);

        // Set contact info from user profile
        setContactInfo({
          name: user.name || "",
          phone: user.phone_number || "",
          alternatePhone: "",
        });

        // Only set address text if we don't already have it from new address data
        if (!addressText) {
          const def = await getDefaultAddress(user.id);
          if (def?.full_address) {
            setAddressText(def.full_address);
          } else if (list?.[0]?.full_address) {
            setAddressText(list[0].full_address);
          }
        }
      } finally {
        setLoadingAddresses(false);
      }
    };
    load();
  }, [session]);

  // Auto-refresh data when returning from address creation
  useEffect(() => {
    const handleFocus = async () => {
      // Check if we're returning from address creation by looking at the URL
      if (window.location.pathname === "/checkout" && session?.user?.email) {
        try {
          // Check for new address data from sessionStorage
          const newAddressData = sessionStorage.getItem("newAddressData");
          if (newAddressData) {
            try {
              const { address, timestamp } = JSON.parse(newAddressData);
              const now = Date.now();

              // Only use data that's less than 5 minutes old
              if (now - timestamp < 5 * 60 * 1000) {
                // Auto-fill the address with the newly created one
                setAddressText(address.full_address);

                // Clear the sessionStorage data
                sessionStorage.removeItem("newAddressData");

                // Update the addresses list to include the new address
                const user = await getUserByEmail(session.user.email);
                if (user) {
                  const list = await getUserAddresses(user.id);
                  setAddresses(list || []);
                }

                return; // Don't proceed with the full refresh since we already have the data
              } else {
                // Data is too old, remove it
                sessionStorage.removeItem("newAddressData");
              }
            } catch (parseError) {
              console.error("Error parsing new address data:", parseError);
              sessionStorage.removeItem("newAddressData");
            }
          }

          // Regular refresh if no new address data
          const user = await getUserByEmail(session.user.email);
          if (user) {
            const list = await getUserAddresses(user.id);
            setAddresses(list || []);

            // Update contact info from user profile
            setContactInfo({
              name: user.name || "",
              phone: user.phone_number || "",
              alternatePhone: "",
            });

            // Update address if we have new addresses
            if (list && list.length > 0) {
              const def = await getDefaultAddress(user.id);
              if (def?.full_address) {
                setAddressText(def.full_address);
              } else if (list[0]?.full_address) {
                setAddressText(list[0].full_address);
              }
            }
          }
        } catch (error) {
          console.error("Error refreshing data:", error);
        }
      }
    };

    // Listen for when the page becomes visible (user returns from another page)
    document.addEventListener("visibilitychange", handleFocus);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("focus", handleFocus);
    };
  }, [session]);

  // Calculate checkout totals
  const subtotal = getSubtotal();
  // GST & Taxes removed from calculation per request
  const gstAndTaxes = 0;
  // Load applied coupon (if any) from localStorage and compute discount strictly from coupon
  let discount = 0;
  try {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("appliedCoupon")
        : null;
    if (raw) {
      const c = JSON.parse(raw);
      const now = new Date();
      const validFrom = new Date(c.valid_from);
      const validUntil = new Date(c.valid_until);
      const meetsMin = subtotal >= (c.min_order_amount || 0);
      const inWindow = now >= validFrom && now <= validUntil;
      if (meetsMin && inWindow) {
        if (c.type === "percentage") {
          const pct = (subtotal * c.value) / 100;
          discount = Math.min(pct, c.max_discount_cap ?? Infinity);
        } else if (c.type === "flat") {
          discount = c.value || 0;
        }
      }
    }
  } catch {}
  // Calculate delivery fee based on selected address distance
  const calculateDeliveryFeeFromAddress = () => {
    if (!addressText || addresses.length === 0) return 0;

    // Find the current address from the addresses list
    const currentAddress = addresses.find(
      (addr) => addr.full_address === addressText
    );

    if (!currentAddress?.distance) {
      // If no distance info, use a default fee (could be based on pincode or area)
      return 80; // Default to ₹80 for unknown distances
    }

    // Convert stored distance (integer * 10) back to display format
    const distanceInKm = currentAddress.distance / 10;

    // Calculate delivery fee based on distance
    return calculateDeliveryFee(distanceInKm);
  };

  const deliveryFee = subtotal > 0 ? calculateDeliveryFeeFromAddress() : 0;
  // Calculate taxes (CGST 9% + SGST 9% = 18% total)
  const taxableAmount = subtotal - discount;
  const cgstAmount = taxableAmount * 0.09;
  const sgstAmount = taxableAmount * 0.09;
  const total = subtotal - discount + deliveryFee + cgstAmount + sgstAmount;

  // Helper function to get delivery fee breakdown information
  const getDeliveryFeeBreakdown = () => {
    if (!addressText || addresses.length === 0) return null;

    const currentAddress = addresses.find(
      (addr) => addr.full_address === addressText
    );

    if (!currentAddress?.distance) {
      // Return default breakdown for addresses without distance info
      return {
        distance: null,
        fee: 80,
        formattedDistance: "Unknown distance",
      };
    }

    const distanceInKm = currentAddress.distance / 10;
    const fee = calculateDeliveryFee(distanceInKm);

    return {
      distance: distanceInKm,
      fee,
      formattedDistance: `${distanceInKm.toFixed(1)} km`,
    };
  };

  const deliveryBreakdown = getDeliveryFeeBreakdown();

  // Payment processing function
  const handlePaymentConfirm = async () => {
    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      // Find the complete address object based on the selected address text
      const selectedAddressObj = addresses.find(
        (addr) => addr.full_address === addressText
      );

      if (!selectedAddressObj) {
        setPaymentError("Address not found. Please select a valid address.");
        return;
      }

      // Use the already calculated tax amounts from the main calculation

      // Get coupon data for coupon ID
      let appliedCouponData = null;
      let couponId = null;
      try {
        const appliedCouponRaw =
          typeof window !== "undefined"
            ? localStorage.getItem("appliedCoupon")
            : null;
        if (appliedCouponRaw) {
          appliedCouponData = JSON.parse(appliedCouponRaw);
          couponId = appliedCouponData?.id || null;

          // If no ID found but coupon code exists, warn but continue
          if (!couponId && appliedCouponData?.code) {
            console.warn(
              "Applied coupon found but missing ID. Please reapply the coupon:",
              appliedCouponData.code
            );
          }
        }
      } catch (error) {
        console.error("Error parsing applied coupon:", error);
      }

      // Prepare comprehensive order data
      const orderData = {
        subtotalAmount: subtotal,
        discountAmount: discount,
        deliveryFee: deliveryFee,
        totalAmount: total,
        note: note,
        addressText: addressText,
        couponCode: selectedCoupon,
        couponId: couponId, // Add coupon ID for database relationship
        contactInfo: contactInfo,
        // Address ID for database relationship
        deliveryAddressId: selectedAddressObj.id,
        // Contact information for order
        contactName: contactInfo.name,
        contactNumber: contactInfo.phone,
        contactAlternateNumber: contactInfo.alternatePhone || null,
        // Enhanced customization options
        customizationOptions: {
          addTextOnCake: customizationOptions.addTextOnCake || false,
          addCandles: customizationOptions.addCandles || false,
          addKnife: customizationOptions.addKnife || false,
          addMessageCard: customizationOptions.addMessageCard || false,
          cakeText: cakeText || "",
          messageCardText: messageCardText || "",
        },
        // Financial information
        itemTotal: subtotal,
        // Tax information
        cgstAmount: cgstAmount,
        sgstAmount: sgstAmount,
        // Payment method
        paymentMethod: "online",
        specialInstructions: note || "",
      };

      console.log("Applied coupon data:", appliedCouponData);
      console.log("Extracted coupon ID:", couponId);
      console.log("Creating order with data:", orderData);

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to create order:", response.status, errorData);
        setPaymentError(
          `Failed to create order: ${
            errorData.error || `HTTP ${response.status}`
          }`
        );
        return;
      }

      const { orderId, orderNumber } = await response.json();
      console.log("Order created successfully:", orderId);

      // Clear cart and storage
      clearCart();
      clearCheckoutContext();

      // Navigate to confirmation
      router.replace("/checkout/confirmation?orderId=" + orderId);
    } catch (err) {
      console.error("Error creating order:", err);
      setPaymentError(
        `Payment failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Persist lightweight checkout context for payment step
  useEffect(() => {
    try {
      // Find the complete address object based on the selected address text
      const selectedAddressObj = addresses.find(
        (addr) => addr.full_address === addressText
      );

      const ctx = {
        subtotal,
        discount,
        deliveryFee,
        note,
        addressText,
        selectedAddress: selectedAddressObj || null, // Store the complete address object
        couponCode: selectedCoupon,
        customizationOptions,
        cakeText,
        messageCardText,
        contactInfo,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("checkoutContext", JSON.stringify(ctx));
      }
    } catch {}
  }, [
    subtotal,
    discount,
    deliveryFee,
    note,
    addressText,
    addresses,
    selectedCoupon,
    customizationOptions,
    cakeText,
    messageCardText,
    contactInfo,
  ]);

  // Redirect to home if cart is empty
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FB]">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-[400px] h-[300px] md:h-[400px] md:w-[500px]">
              <Lottie
                animationData={zeroPurchaseAnimation}
                loop={true}
                autoplay={true}
              />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some items to your cart to proceed with checkout.
          </p>
          <Link href="/products">
            <Button className="bg-primary hover:bg-primary/90">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FB] pb-28">
      {/* Header */}
      <div className="bg-[#F5F6FB]">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between md:justify-start md:gap-4">
            <Link
              href="/"
              onClick={() => {
                // Clear checkout context when going back to home
                clearCheckoutContext();
              }}
            >
              <div className="bg-white p-3 md:p-2 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                <IoIosArrowBack className="h-5 w-5 text-gray-700" />
              </div>
            </Link>
            <h1 className="text-xl font-semibold absolute left-1/2 transform -translate-x-1/2 md:relative md:left-auto md:transform-none">
              Checkout
            </h1>
            <div className="w-9 md:hidden"></div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content (below on mobile, left on desktop) */}
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            {/* Note Section (moves below Order Summary on mobile) */}
            <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
              {/* Note Drawer (all screens, full-width) */}
              <div>
                <Drawer
                  modal={true}
                  open={isNoteDrawerOpen}
                  onOpenChange={setIsNoteDrawerOpen}
                >
                  <DrawerTrigger asChild>
                    <button className="w-full flex items-center justify-between text-left">
                      <div className="flex items-center">
                        <DocumentAdd className="h-5 w-5 mr-3 text-black" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {note ? "Note added" : "Add a note"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {note && (
                          <button
                            className="text-[#2664eb] hover:text-[#1d4ed8] transition-colors p-1 rounded-full hover:bg-blue-50 text-sm font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsNoteDrawerOpen(true);
                            }}
                          >
                            Edit
                          </button>
                        )}
                        <IoIosArrowForward className="h-5 w-5 text-gray-600" />
                      </div>
                    </button>
                  </DrawerTrigger>
                  <DrawerContent className="h-[600px] md:h-[550px] rounded-t-2xl bg-[#F5F6FB] overflow-y-auto scrollbar-hide">
                    <DrawerHeader className="text-left lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                      <div className="flex items-center justify-between w-full">
                        <DrawerTitle className="text-[20px]">
                          Add a Note to your order
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
                    <div className="px-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                      <Textarea
                        placeholder="E.g., Special cake message, delivery instructions, dietary preferences, etc."
                        value={note}
                        onChange={(e) => {
                          if (e.target.value.length <= 100) {
                            setNote(e.target.value);
                          }
                        }}
                        maxLength={100}
                        className="min-h-[150px] rounded-[18px] placeholder:text-[#C0C0C0] placeholder:font-normal"
                      />
                      <div className="flex justify-end mt-2">
                        <span className="text-sm text-gray-500">
                          {note.length}/100 characters
                        </span>
                      </div>
                    </div>
                    {/* Desktop action row under textarea */}
                    <div className="hidden lg:flex justify-end gap-2 px-4 pt-3 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNote("")}
                        className="h-9 px-5 rounded-[12px]"
                      >
                        Clear
                      </Button>
                      <DrawerClose asChild>
                        <Button size="sm" className="h-9 px-5 rounded-[12px]">
                          Save
                        </Button>
                      </DrawerClose>
                    </div>
                    <DrawerFooter className="pt-2 pb-6 lg:hidden">
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="xl"
                          onClick={() => setNote("")}
                          className="flex-1 rounded-[20px] text-[16px]"
                        >
                          Clear
                        </Button>
                        <DrawerClose asChild>
                          <Button
                            size="xl"
                            className="flex-1 py-5 rounded-[20px] text-[16px]"
                          >
                            Save
                          </Button>
                        </DrawerClose>
                      </div>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>

              {/* Address Change Drawer (all screens; full-width on desktop) */}
              <div className="">
                <Drawer
                  modal={true}
                  open={isAddressDrawerOpen}
                  onOpenChange={setIsAddressDrawerOpen}
                >
                  <DrawerContent className="h-[550px] overflow-y-auto scrollbar-hide rounded-t-2xl bg-[#F5F6FB]">
                    <div className="px-4 py-3 flex items-center justify-between lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                      <h2 className="text-[18px] font-semibold text-gray-800">
                        Select an address
                      </h2>
                      <div className="flex items-center gap-2">
                        <Link href="/addresses">
                          <button
                            aria-label="Manage addresses"
                            className="h-9 w-9 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center shadow-sm"
                          >
                            <MenuDots
                              weight="Broken"
                              className="h-5 w-5 text-gray-700"
                            />
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
                    <div className="px-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                      <Link
                        href="/addresses/new?returnTo=/checkout"
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
                    <div className="px-4 mt-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                      <div className="flex items-center gap-3 text-gray-400 font-semibold tracking-[0.15em] text-xs">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span>SAVED ADDRESS</span>
                        <div className="h-px flex-1 bg-gray-200" />
                      </div>
                    </div>
                    <div className="px-4 mt-3 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                      {addresses.length > 0 ? (
                        addresses.map((addr, index) => (
                          <div
                            key={addr.id}
                            className={`bg-white rounded-[18px] shadow-sm p-4 ${
                              index > 0 ? "mt-3" : ""
                            } ${
                              addressText === addr.full_address
                                ? "ring-2 ring-[#2664eb] ring-opacity-50 border-[#2664eb]"
                                : "hover:bg-gray-50 cursor-pointer"
                            }`}
                            onClick={() => {
                              setAddressText(addr.full_address);
                              setIsAddressDrawerOpen(false);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded-xl items-center justify-center  flex">
                                  <HomeAngle
                                    weight="Broken"
                                    className="h-5 w-5 text-[#570000]"
                                  />
                                </span>
                                <span className="font-medium text-gray-800">
                                  {addr.address_name || "Address"}
                                </span>
                                {addressText === addr.full_address && (
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
                                {getDisplayDistance(addr.distance) ?? "-"} km
                              </span>
                              {addr.duration && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F3FF] text-[#2664eb] text-xs">
                                  <ClockCircle className="h-4 w-4" />~
                                  {addr.duration}min
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
                            No addresses found. Add an address to proceed with
                            checkout.
                          </p>
                          <Link href="/addresses/new?returnTo=/checkout">
                            <Button className="bg-[#570000] hover:bg-[#450000] text-white">
                              Add New Address
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>

              {/* Add New Address Drawer */}
              <Drawer
                modal={true}
                open={isAddAddressDrawerOpen}
                onOpenChange={setIsAddAddressDrawerOpen}
              >
                <DrawerContent className="h-[600px] md:h-[550px] rounded-t-2xl bg-[#F5F6FB] overflow-y-auto scrollbar-hide">
                  <DrawerHeader className="text-left lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                    <div className="flex items-center justify-between w-full">
                      <DrawerTitle className="text-[20px]">
                        Add New Address
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
                  <div className="px-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="address-name"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Address Name
                        </label>
                        <Input
                          id="address-name"
                          placeholder="e.g., Home, Office, etc."
                          value={newAddress.addressName}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              addressName: e.target.value,
                            }))
                          }
                          className="rounded-[12px] placeholder:text-[#C0C0C0]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="full-address"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Full Address
                        </label>
                        <Textarea
                          id="full-address"
                          placeholder="Enter your complete address"
                          value={newAddress.fullAddress}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              fullAddress: e.target.value,
                            }))
                          }
                          className="min-h-[100px] rounded-[12px] placeholder:text-[#C0C0C0]"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label
                            htmlFor="city"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            City
                          </label>
                          <Input
                            id="city"
                            placeholder="City"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                            className="rounded-[12px] placeholder:text-[#C0C0C0]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="state"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            State
                          </label>
                          <Input
                            id="state"
                            placeholder="State"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                state: e.target.value,
                              }))
                            }
                            className="rounded-[12px] placeholder:text-[#C0C0C0]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="pincode"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Pincode
                          </label>
                          <Input
                            id="pincode"
                            placeholder="Pincode"
                            value={newAddress.pincode}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                pincode: e.target.value,
                              }))
                            }
                            className="rounded-[12px] placeholder:text-[#C0C0C0]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Desktop action row */}
                  <div className="hidden lg:flex justify-end gap-2 px-4 pt-3 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setNewAddress({
                          addressName: "",
                          fullAddress: "",
                          city: "",
                          state: "",
                          pincode: "",
                        })
                      }
                      className="h-9 px-5 rounded-[12px]"
                    >
                      Clear
                    </Button>
                    <DrawerClose asChild>
                      <Button
                        size="sm"
                        className="h-9 px-5 rounded-[12px]"
                        onClick={() => {
                          if (newAddress.fullAddress.trim()) {
                            setAddressText(newAddress.fullAddress);
                            setIsAddAddressDrawerOpen(false);
                            setNewAddress({
                              addressName: "",
                              fullAddress: "",
                              city: "",
                              state: "",
                              pincode: "",
                            });
                          }
                        }}
                      >
                        Save Address
                      </Button>
                    </DrawerClose>
                  </div>
                  <DrawerFooter className="pt-2 pb-6 lg:hidden">
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="xl"
                        onClick={() =>
                          setNewAddress({
                            addressName: "",
                            fullAddress: "",
                            city: "",
                            state: "",
                            pincode: "",
                          })
                        }
                        className="flex-1 rounded-[20px] text-[16px]"
                      >
                        Clear
                      </Button>
                      <DrawerClose asChild>
                        <Button
                          size="xl"
                          className="flex-1 py-5 rounded-[20px] text-[16px]"
                          onClick={() => {
                            if (newAddress.fullAddress.trim()) {
                              setAddressText(newAddress.fullAddress);
                              setIsAddAddressDrawerOpen(false);
                              setNewAddress({
                                addressName: "",
                                fullAddress: "",
                                city: "",
                                state: "",
                                pincode: "",
                              });
                            }
                          }}
                        >
                          Save Address
                        </Button>
                      </DrawerClose>
                    </div>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
            {/* Coupons Section */}
            <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
              <Link href="/checkout/coupons">
                <button className="w-full flex items-center justify-between text-left">
                  <div className="flex items-center">
                    <TicketSale className="h-5 w-5 mr-3 text-black" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {selectedCoupon ? selectedCoupon : "View all coupons"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#2664eb]">View all</span>
                    <IoIosArrowForward className="h-5 w-5 text-gray-600" />
                  </div>
                </button>
              </Link>
            </div>

            {/* Customization Options Section */}
            <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
              <div>
                <Drawer
                  modal={true}
                  onOpenChange={setIsCustomizationDrawerOpen}
                >
                  <DrawerTrigger asChild>
                    <button className="w-full flex items-center justify-between text-left">
                      <div className="flex items-center">
                        {Object.values(customizationOptions).some(
                          (opt) => opt
                        ) ? (
                          <ListCheckMinimalistic className="h-5 w-5 mr-3 text-black" />
                        ) : (
                          <WidgetAdd className="h-5 w-5 mr-3 text-black" />
                        )}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Customization options
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {Object.values(customizationOptions).some(
                          (opt) => opt
                        ) && (
                          <button
                            className="text-[#2664eb] hover:text-[#1d4ed8] transition-colors p-1 rounded-full hover:bg-blue-50 text-sm font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsCustomizationDrawerOpen(true);
                            }}
                          >
                            Edit
                          </button>
                        )}
                        <IoIosArrowForward className="h-5 w-5 text-gray-600" />
                      </div>
                    </button>
                  </DrawerTrigger>
                  <DrawerContent className="h-[600px] md:h-[550px] rounded-t-2xl bg-[#F5F6FB] flex flex-col">
                    <DrawerHeader className="text-left lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full flex-shrink-0">
                      <div className="flex items-center justify-between w-full">
                        <DrawerTitle className="text-[20px]">
                          Customization Options
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

                    {/* Scrollable content area */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                      <div className="space-y-4 pb-4">
                        {/* Add Candles - Only show if cart has cake products */}
                        {cart.some(
                          (item) => item.category?.toLowerCase() === "cake"
                        ) && (
                          <div className="bg-white rounded-[18px] p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FaCakeCandles className="h-5 w-5 text-[#570000]" />
                                <div>
                                  <h3 className="font-medium text-gray-800">
                                    Add Candles
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    Include birthday candles for celebration
                                  </p>
                                </div>
                              </div>
                              <Switch
                                checked={customizationOptions.addCandles}
                                onCheckedChange={(checked) => {
                                  const newOptions = {
                                    ...customizationOptions,
                                    addCandles: checked,
                                  };
                                  setCustomizationOptions(newOptions);
                                  updateAllCartItemsCustomization(newOptions);
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Add Knife - Only show if cart has cake products */}
                        {cart.some(
                          (item) => item.category?.toLowerCase() === "cake"
                        ) && (
                          <div className="bg-white rounded-[18px] p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <RiKnifeFill className="h-5 w-5 text-[#570000]" />
                                <div>
                                  <h3 className="font-medium text-gray-800">
                                    Add Knife
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    Include a cake cutting knife
                                  </p>
                                </div>
                              </div>
                              <Switch
                                checked={customizationOptions.addKnife}
                                onCheckedChange={(checked) => {
                                  const newOptions = {
                                    ...customizationOptions,
                                    addKnife: checked,
                                  };
                                  setCustomizationOptions(newOptions);
                                  updateAllCartItemsCustomization(newOptions);
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Add Message Card */}
                        <div className="bg-white rounded-[18px] p-4 border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Card
                                weight="Broken"
                                className="h-5 w-5 text-[#570000]"
                              />
                              <div>
                                <h3 className="font-medium text-gray-800">
                                  Add Message Card
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Include a personalized message card
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={customizationOptions.addMessageCard}
                              onCheckedChange={(checked) => {
                                const newOptions = {
                                  ...customizationOptions,
                                  addMessageCard: checked,
                                };
                                setCustomizationOptions(newOptions);
                                updateAllCartItemsCustomization(newOptions);
                              }}
                            />
                          </div>
                          {customizationOptions.addMessageCard && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => setIsMessageCardDrawerOpen(true)}
                                className="w-full text-left p-3 bg-gray-50 rounded-[12px] hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    {messageCardText
                                      ? messageCardText
                                      : "Click to add message card text"}
                                  </span>
                                  <Card
                                    weight="Broken"
                                    className="h-4 w-4 text-gray-400"
                                  />
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Disclaimer */}
                      <div className="mt-6 px-4 text-[#9AA3C7]">
                        <h4 className="uppercase tracking-wide font-semibold text-[14px]">
                          Additional Customization
                        </h4>
                        <p className="mt-2 text-sm">
                          For more customization options on your order, please
                          contact the kitchen after order confirmation or try
                          our call order service.
                        </p>
                      </div>
                    </div>

                    {/* Fixed bottom action buttons */}
                    <div className="flex-shrink-0 border-t border-gray-200 bg-[#F5F6FB] px-4 py-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                      {/* Desktop action row */}
                      <div className="hidden lg:flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const clearedOptions = {
                              addTextOnCake: false,
                              addCandles: false,
                              addKnife: false,
                              addMessageCard: false,
                            };
                            setCustomizationOptions(clearedOptions);
                            updateAllCartItemsCustomization(clearedOptions);
                          }}
                          className="h-9 px-5 rounded-[12px]"
                        >
                          Clear All
                        </Button>
                        <DrawerClose asChild>
                          <Button size="sm" className="h-9 px-5 rounded-[12px]">
                            Save
                          </Button>
                        </DrawerClose>
                      </div>
                      {/* Mobile action row */}
                      <div className="lg:hidden flex gap-3">
                        <Button
                          variant="outline"
                          size="xl"
                          onClick={() => {
                            const clearedOptions = {
                              addTextOnCake: false,
                              addCandles: false,
                              addKnife: false,
                              addMessageCard: false,
                            };
                            setCustomizationOptions(clearedOptions);
                            updateAllCartItemsCustomization(clearedOptions);
                          }}
                          className="flex-1 rounded-[20px] text-[16px]"
                        >
                          Clear All
                        </Button>
                        <DrawerClose asChild>
                          <Button
                            size="xl"
                            className="flex-1 py-5 rounded-[20px] text-[16px]"
                          >
                            Save
                          </Button>
                        </DrawerClose>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>

            {/* Message Card Text Input Drawer */}
            <Drawer
              modal={true}
              open={isMessageCardDrawerOpen}
              onOpenChange={setIsMessageCardDrawerOpen}
            >
              <DrawerContent className="h-[600px] md:h-[550px] rounded-t-2xl bg-[#F5F6FB] overflow-y-auto scrollbar-hide">
                <DrawerHeader className="text-left lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                  <div className="flex items-center justify-between w-full">
                    <DrawerTitle className="text-[20px]">
                      Add Message Card Text
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
                <div className="px-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                  <Textarea
                    placeholder="E.g., Wishing you a wonderful birthday filled with joy and laughter!, May your special day be as amazing as you are!, etc."
                    value={messageCardText}
                    onChange={(e) => setMessageCardText(e.target.value)}
                    maxLength={100}
                    className="min-h-[150px] rounded-[18px] placeholder:text-[#C0C0C0] placeholder:font-normal"
                  />
                  <div className="flex justify-end mt-2">
                    <span
                      className={`text-sm ${
                        messageCardText.length >= 100
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {messageCardText.length}/100 characters
                    </span>
                  </div>
                </div>
                {/* Desktop action row */}
                <div className="hidden lg:flex justify-end gap-2 px-4 pt-3 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMessageCardText("")}
                    className="h-9 px-5 rounded-[12px]"
                  >
                    Clear
                  </Button>
                  <DrawerClose asChild>
                    <Button size="sm" className="h-9 px-5 rounded-[12px]">
                      Save
                    </Button>
                  </DrawerClose>
                </div>
                <DrawerFooter className="pt-2 pb-6 lg:hidden">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="xl"
                      onClick={() => setMessageCardText("")}
                      className="flex-1 rounded-[20px] text-[16px]"
                    >
                      Clear
                    </Button>
                    <DrawerClose asChild>
                      <Button
                        size="xl"
                        className="flex-1 py-5 rounded-[20px] text-[16px]"
                      >
                        Save
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            {/* Contact Edit Drawer */}
            <Drawer
              modal={true}
              open={isContactDrawerOpen}
              onOpenChange={setIsContactDrawerOpen}
            >
              <DrawerContent className="h-[600px] md:h-[550px] rounded-t-2xl bg-[#F5F6FB] overflow-y-auto scrollbar-hide">
                <DrawerHeader className="text-left lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                  <div className="flex items-center justify-between w-full">
                    <DrawerTitle className="text-[20px]">
                      {contactInfo.name && contactInfo.phone
                        ? "Edit Contact Information"
                        : "Add Contact Information"}
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
                <div className="px-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                  <div className="space-y-4">
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
                        onChange={(e) =>
                          setTempContactInfo((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
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
                        placeholder="Enter your phone number"
                        value={tempContactInfo.phone}
                        onChange={(e) =>
                          setTempContactInfo((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
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
                        placeholder="Enter alternate phone number (optional)"
                        value={tempContactInfo.alternatePhone}
                        onChange={(e) =>
                          setTempContactInfo((prev) => ({
                            ...prev,
                            alternatePhone: e.target.value,
                          }))
                        }
                        className="rounded-[12px] placeholder:text-[#C0C0C0]"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        If the main contact number is not available, the
                        delivery partner will contact the alternate number
                      </p>
                    </div>
                  </div>
                </div>
                {/* Desktop action row */}
                <div className="hidden lg:flex justify-end gap-2 px-4 pt-3 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTempContactInfo(contactInfo)}
                    className="h-9 px-5 rounded-[12px]"
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 px-5 rounded-[12px]"
                    onClick={() => {
                      // Update state first
                      setContactInfo(tempContactInfo);

                      // Save to localStorage immediately
                      if (typeof window !== "undefined") {
                        try {
                          const savedContext =
                            localStorage.getItem("checkoutContext");
                          const currentContext = savedContext
                            ? JSON.parse(savedContext)
                            : {};
                          const updatedContext = {
                            ...currentContext,
                            contactInfo: tempContactInfo,
                          };
                          localStorage.setItem(
                            "checkoutContext",
                            JSON.stringify(updatedContext)
                          );
                        } catch (error) {
                          console.error(
                            "Error saving contact info to localStorage:",
                            error
                          );
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
                        title: "Contact information saved",
                        description:
                          "Your contact details have been updated successfully.",
                      });

                      // Close drawer after state update
                      setIsContactDrawerOpen(false);
                    }}
                  >
                    {tempContactInfo.name && tempContactInfo.phone
                      ? "Save"
                      : "Add"}
                  </Button>
                  <DrawerClose asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-5 rounded-[12px]"
                    >
                      Cancel
                    </Button>
                  </DrawerClose>
                </div>
                <DrawerFooter className="pt-2 pb-6 lg:hidden">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="xl"
                      onClick={() => setTempContactInfo(contactInfo)}
                      className="flex-1 rounded-[20px] text-[16px]"
                    >
                      Reset
                    </Button>
                    <Button
                      size="xl"
                      className="flex-1 py-5 rounded-[20px] text-[16px]"
                      onClick={() => {
                        // Update state first
                        setContactInfo(tempContactInfo);

                        // Save to localStorage immediately
                        if (typeof window !== "undefined") {
                          try {
                            const savedContext =
                              localStorage.getItem("checkoutContext");
                            const currentContext = savedContext
                              ? JSON.parse(savedContext)
                              : {};
                            const updatedContext = {
                              ...currentContext,
                              contactInfo: tempContactInfo,
                            };
                            localStorage.setItem(
                              "checkoutContext",
                              JSON.stringify(updatedContext)
                            );
                          } catch (error) {
                            console.error(
                              "Error saving contact info to localStorage:",
                              error
                            );
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
                          title: "Contact information saved",
                          description:
                            "Your contact details have been updated successfully.",
                        });

                        // Close drawer after state update
                        setIsContactDrawerOpen(false);
                      }}
                    >
                      {tempContactInfo.name && tempContactInfo.phone
                        ? "Save"
                        : "Add"}
                    </Button>
                    <DrawerClose asChild>
                      <Button
                        variant="outline"
                        size="xl"
                        className="flex-1 py-5 rounded-[20px] text-[16px]"
                      >
                        Cancel
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            {/* Delivery Info */}
            <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-start mb-4">
                <ClockCircle className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-black" />
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    {(() => {
                      const deliveryTime = calculateDeliveryTime();
                      if (deliveryTime) {
                        return `Delivery in ${formatDeliveryTime(
                          deliveryTime
                        )} (aprx)`;
                      }
                      return "Add address to see delivery time";
                    })()}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-[12px]">
                    Delivery time is approximate and will be confirmed after
                    your order.
                  </p>
                </div>
              </div>

              <div className="flex items-start mb-4">
                <HomeSmileAngle className="h-5 w-5 mr-3 flex-shrink-0 text-black" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    Delivery at Home
                  </h3>
                  <div className="mt-1 flex items-center justify-between gap-3 min-w-0">
                    {addressText &&
                    addressText !==
                      "2nd street, Barathipuram, Kannampalayam" ? (
                      <>
                        <p className="text-gray-500 dark:text-gray-400 text-sm truncate min-w-0">
                          {addressText}
                        </p>
                        <button
                          className="text-[#2664eb] hover:text-[#1d4ed8] transition-colors p-1 rounded-full hover:bg-blue-50"
                          onClick={() => {
                            setTempAddress(addressText);
                            setIsAddressDrawerOpen(true);
                          }}
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
                        <button
                          className="text-[#2664eb] hover:text-[#1d4ed8] transition-colors px-3 py-1 rounded-full hover:bg-blue-50 text-sm font-medium"
                          onClick={() => {
                            setIsAddAddressDrawerOpen(true);
                          }}
                          aria-label="Add delivery address"
                        >
                          Add
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-3 flex-shrink-0 text-black" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    Contact
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
            </div>

            {/* Payment Section - Desktop (below Delivery Info) */}
            <div className="hidden lg:block mx-4 mt-4">
              <div className="bg-white p-4 rounded-[22px] border border-gray-200 dark:border-gray-600">
                <div className="flex items-start gap-6">
                  {/* Lottie animation on the left */}
                  <div className="flex-1">
                    {paymentAnimationData && (
                      <Lottie
                        animationData={paymentAnimationData}
                        loop={true}
                        style={{ width: "100%", height: "200px" }}
                      />
                    )}
                  </div>

                  {/* Content on the right */}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                      Payment
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      All transactions are secure and encrypted
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      After clicking "Pay now", you will be redirected to{" "}
                      <span className="font-medium text-[#2664eb]">
                        Razorpay Secure
                      </span>{" "}
                      (UPI, Cards, Wallets, NetBanking) to complete your
                      purchase securely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary (top on mobile, right on desktop) */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="space-y-4">
              <div className="bg-white mx-4 p-3 rounded-[22px] border border-gray-200 dark:border-gray-600 sticky top-4 overflow-hidden">
                <div className="space-y-4">
                  {cart.map((item) => {
                    const uid = (item.uniqueId ||
                      `${item.id}-${item.variant}`) as string;
                    const qty = item.quantity || 1;
                    return (
                      <div
                        key={uid}
                        className="flex items-start justify-between"
                      >
                        <div className="flex w-full min-w-0">
                          {/* product image */}
                          <div className="relative h-[88px] w-[88px] rounded-[20px] overflow-hidden mr-3 shrink-0">
                            <Image
                              src={
                                item.image ||
                                "/placeholder.svg?height=88&width=88&query=food%20thumbnail"
                              }
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* product details */}
                          <div className="flex flex-col justify-between flex-1 min-w-0">
                            {/* top row */}
                            <div className="flex items-start justify-between w-full gap-2 max-w-full min-w-0">
                              {/* name and category */}
                              <div className="flex-1 w-full min-w-0">
                                {/* Single-line name with ellipsis */}
                                <h3
                                  className="block truncate text-[15px] leading-tight font-medium text-black dark:text-gray-200"
                                  title={item.name}
                                >
                                  {item.name}
                                </h3>
                                <p className="text-[14px] text-gray-500 dark:text-gray-400 truncate max-w-full">
                                  {item.category ?? item.variant}
                                </p>
                              </div>

                              {/* remove button */}
                              <button
                                aria-label="Remove item"
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 self-start"
                                onClick={() => removeFromCart(uid)}
                              >
                                <TrashBinTrash className="h-5 w-5 text-red-600" />
                              </button>
                            </div>

                            {/* bottom row */}
                            <div className="flex items-center justify-between w-full">
                              {/* price */}
                              <p className="text-[16px] font-semibold text-black dark:text-gray-100">
                                {"₹"}
                                {item.price.toFixed(2)}
                              </p>

                              {/* quantity controls */}
                              <div className="flex items-center gap-2 bg-[#F5F4F7] rounded-full p-1 shrink-0">
                                <button
                                  aria-label="Decrease quantity"
                                  className="w-[26px] h-[26px] flex items-center justify-center rounded-full border border-gray-200 bg-white transition-colors"
                                  onClick={() =>
                                    updateQuantity(uid, Math.max(1, qty - 1))
                                  }
                                >
                                  <Minus className="h-3 w-3 text-gray-600" />
                                </button>
                                <span className="font-medium text-gray-900 dark:text-white min-w-[24px] text-center text-[12px]">
                                  {String(qty).padStart(2, "0")}
                                </span>
                                <button
                                  aria-label="Increase quantity"
                                  className="w-[26px] h-[26px] flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                                  onClick={() => updateQuantity(uid, qty + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Place Order Button moved to fixed bottom bar */}
              </div>

              {/* Bill Details (desktop in separate card) */}
              <div className="hidden lg:block">
                <div className="bg-white mx-4 p-4 rounded-[22px] border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center mb-3 gap-2">
                    <Bill className="h-5 w-5 text-[#570000]" />
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">
                      Bill Details
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                      <span>Item Total</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 text-sm">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span>Delivery Fee</span>
                          <Link
                            href="/legal/shipping-delivery#delivery-fees"
                            className="text-blue-500 hover:text-blue-600 transition-colors"
                            title="Click to view delivery fee details"
                          >
                            <InfoCircle className="h-4 w-4" />
                          </Link>
                        </div>
                        {deliveryBreakdown && (
                          <span className="text-xs text-gray-500">
                            {deliveryBreakdown.distance
                              ? `${deliveryBreakdown.formattedDistance} from shop`
                              : "Default fee (distance unknown)"}
                          </span>
                        )}
                      </div>
                      <span>₹{deliveryFee.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                      <span>CGST (9%)</span>
                      <span>₹{cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                      <span>SGST (9%)</span>
                      <span>₹{sgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 mt-2">
                      <div className="w-full h-[1.5px] bg-[repeating-linear-gradient(90deg,_rgba(156,163,175,0.5)_0,_rgba(156,163,175,0.5)_8px,_transparent_8px,_transparent_14px)] rounded-full"></div>
                      <div className="flex justify-between font-semibold text-black dark:text-white mt-2">
                        <span>To Pay</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-[18px] text-[16px] font-medium h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        !addressText ||
                        addressText ===
                          "2nd street, Barathipuram, Kannampalayam" ||
                        !contactInfo.name ||
                        !contactInfo.phone
                      }
                      onClick={() => setIsPaymentDialogOpen(true)}
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                </div>

                {/* Cancellation Policy - Desktop (below Bill Details) */}
                <div className="mx-4 mt-4 text-[#9AA3C7]">
                  <h4 className="uppercase tracking-wide font-semibold text-[14px]">
                    Cancellation Policy
                  </h4>
                  <p className="mt-2 text-sm">
                    Once your order is placed, it cannot be cancelled or
                    modified. We do not offer refunds for cancelled orders under
                    any circumstances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Bill Details and Payment Sections - At bottom */}
        <div className="lg:hidden space-y-4 mt-6">
          {/* Bill Details - Mobile */}
          <div className="bg-white mx-4 p-4 rounded-[22px] border border-gray-200 dark:border-gray-600">
            <div className="flex items-center mb-3 gap-2">
              <Bill className="h-5 w-5 text-[#570000]" />
              <h3 className="font-medium text-gray-800 dark:text-gray-200">
                Bill Details
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Item Total</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Discount</span>
                  <span className="text-[#15A05A]">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span>Delivery Fee</span>
                    <Link
                      href="/legal/shipping-delivery#delivery-fees"
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                      title="Click to view delivery fee details"
                    >
                      <InfoCircle className="h-4 w-4" />
                    </Link>
                  </div>
                  {deliveryBreakdown && (
                    <span className="text-xs text-gray-500">
                      {deliveryBreakdown.distance
                        ? `${deliveryBreakdown.formattedDistance} from shop`
                        : "Default fee (distance unknown)"}
                    </span>
                  )}
                </div>
                <span>₹{deliveryFee}</span>
              </div>

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>CGST (9%)</span>
                <span>₹{cgstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>SGST (9%)</span>
                <span>₹{sgstAmount.toFixed(2)}</span>
              </div>
              <div className="pt-2 mt-2">
                <div className="w-full h-[1.5px] bg-[repeating-linear-gradient(90deg,_rgba(156,163,175,0.5)_0,_rgba(156,163,175,0.5)_8px,_transparent_8px,_transparent_14px)] rounded-full"></div>
                <div className="flex justify-between text-black dark:text-white font-semibold mt-2">
                  <span>To Pay</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section - Mobile */}
          <div className="bg-white mx-4 p-4 pb-6 rounded-[22px] border border-gray-200 dark:border-gray-600">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                Payment
              </h3>
              {/* Lottie animation below the title */}
              <div className="mt-3">
                {paymentAnimationData && (
                  <Lottie
                    animationData={paymentAnimationData}
                    loop={true}
                    style={{ width: "100%", height: "250px" }}
                  />
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">
                All transactions are secure and encrypted
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                After clicking "Pay now", you will be redirected to{" "}
                <span className="font-medium text-[#2664eb]">
                  Razorpay Secure
                </span>{" "}
                (UPI, Cards, Wallets, NetBanking) to complete your purchase
                securely.
              </p>
            </div>
          </div>

          {/* Cancellation Policy - Mobile (moved below Payment) */}
          <div className="mx-4 px-4 text-[#9AA3C7]">
            <h4 className="uppercase tracking-wide font-semibold text-[14px]">
              Cancellation Policy
            </h4>
            <p className="mt-2 text-sm">
              Once your order is placed, it cannot be cancelled or modified. We
              do not offer refunds for cancelled orders under any circumstances.
            </p>
          </div>
        </div>

        {/* Fixed bottom Place Order bar (mobile only) */}
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 lg:hidden">
          <div className="mx-auto px-4 py-3 w-full max-w-[1200px]">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-[18px] mb-2 text-[16px] font-medium h-auto disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                !addressText ||
                addressText === "2nd street, Barathipuram, Kannampalayam" ||
                !contactInfo.name ||
                !contactInfo.phone
              }
              onClick={() => setIsPaymentDialogOpen(true)}
            >
              Proceed to Payment
            </Button>
          </div>
        </div>

        {/* Payment Confirmation Dialog */}
        <Dialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
              <DialogDescription>
                You're about to place an order for ₹{total.toFixed(2)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Item Total:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST (9%):</span>
                    <span>₹{cgstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (9%):</span>
                    <span>₹{sgstAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-1 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Delivery Address</h4>
                <p className="text-sm text-gray-700">{addressText}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Contact: {contactInfo.name}, {contactInfo.phone}
                </p>
              </div>

              {selectedCoupon && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-green-800">
                    Applied Coupon
                  </h4>
                  <p className="text-sm text-green-700 font-mono">
                    {selectedCoupon}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Discount: ₹{discount.toFixed(2)}
                  </p>
                </div>
              )}

              {paymentError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{paymentError}</p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPaymentDialogOpen(false)}
                disabled={isProcessingPayment}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentConfirm}
                disabled={isProcessingPayment}
                className="bg-primary hover:bg-primary/90"
              >
                {isProcessingPayment ? "Processing..." : "Confirm & Pay"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
