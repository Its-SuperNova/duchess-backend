"use client";

import { Minus, Plus, X, ShoppingCart } from "lucide-react";
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
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
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
// Delivery calculation moved to server-side API
import type { Address as DbAddress } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import zeroPurchaseAnimation from "@/public/Lottie/Zero Purchase.json";
import paymentFailedAnimation from "@/public/Lottie/Payment-Failed.json";
import { optimizeCheckoutFlow } from "@/lib/performance-utils";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import CheckoutSuccessOverlay from "@/components/checkout-success-overlay";
import CheckoutSkeleton from "@/components/checkout-skeleton";
import CheckoutExpiryScreen from "@/components/checkout-expiry-screen";
import RazorpayButton from "@/components/RazorpayButton";
import DeliveryFeeDisplay from "@/components/delivery-fee-display";
import FreeDeliveryProgress from "@/components/free-delivery-progress";
import { useDeliveryCalculation } from "@/hooks/use-delivery-calculation";
import React from "react";

export default function CheckoutClient() {
  // Get checkoutId from URL params
  const params = useParams();
  const checkoutId = params.checkoutId as string;

  // Get cart items and functions from cart context (for fallback/editing)
  const {
    cart,
    getSubtotal,
    updateQuantity,
    removeFromCart,
    updateCartItemCustomization,
    clearCart,
    isLoading: cartLoading,
  } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);

  // Checkout session data
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(true);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Fetch checkout session data
  useEffect(() => {
    if (!checkoutId) {
      setCheckoutError("Invalid checkout session");
      setCheckoutLoading(false);
      return;
    }

    const fetchCheckoutData = async () => {
      try {
        setCheckoutLoading(true);
        const response = await fetch(`/api/checkout/${checkoutId}`);
        const data = await response.json();

        if (!response.ok) {
          // Check if the error is due to session expiry
          if (data.error === "Checkout session not found or expired") {
            setIsSessionExpired(true);
            setCheckoutError(data.error);
          } else {
            throw new Error(data.error || "Failed to fetch checkout data");
          }
          return;
        }

        // Handle different session statuses for better UX
        if (data.status === "expired") {
          setIsSessionExpired(true);
          setCheckoutError(
            "Checkout session has expired. Please start a new checkout."
          );
          return;
        } else if (data.status === "completed") {
          // Redirect to confirmation page if order is already completed
          if (data.checkout.databaseOrderId) {
            router.push(
              `/confirmation?orderId=${data.checkout.databaseOrderId}`
            );
            return;
          }
        } else if (data.status === "failed") {
          setCheckoutError("Previous payment failed. Please try again.");
          return;
        }

        setCheckoutData(data.checkout);

        // Set selected address ID from checkout data
        if (data.checkout.selectedAddressId) {
          setSelectedAddressId(data.checkout.selectedAddressId);
        }

        // Log comprehensive delivery fee data from checkout session
        console.log("📦 Checkout session data fetched with delivery details:", {
          checkoutId,
          deliveryFee: data.checkout.deliveryFee,
          totalAmount: data.checkout.totalAmount,
          addressText: data.checkout.addressText,
          selectedAddressId: data.checkout.selectedAddressId,
          distance: data.checkout.distance,
          duration: data.checkout.duration,
          items: data.checkout.items?.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total_price: item.total_price,
          })),
          financialBreakdown: {
            subtotal: data.checkout.subtotal,
            discount: data.checkout.discount,
            deliveryFee: data.checkout.deliveryFee,
            cgstAmount: data.checkout.cgstAmount,
            sgstAmount: data.checkout.sgstAmount,
            totalAmount: data.checkout.totalAmount,
          },
          orderValue:
            data.checkout.items?.reduce(
              (total: number, item: any) =>
                total + (item.total_price || item.price * item.quantity),
              0
            ) || 0,
        });

        // Populate form fields from checkout data
        console.log("🔄 Loading form fields from checkout session:", {
          notes: data.checkout.notes,
          note: data.checkout.note, // Check both field names
          messageCardText: data.checkout.messageCardText,
          cakeText: data.checkout.cakeText,
          customizationOptions: data.checkout.customizationOptions,
          contactInfo: data.checkout.contactInfo,
        });

        if (data.checkout.notes) {
          console.log(
            "✅ Loading notes from checkout session:",
            data.checkout.notes
          );
          setNote(data.checkout.notes);
        }
        if (data.checkout.couponCode)
          setSelectedCoupon(data.checkout.couponCode);
        if (data.checkout.cakeText) setCakeText(data.checkout.cakeText);
        if (data.checkout.messageCardText) {
          console.log(
            "✅ Loading messageCardText from checkout session:",
            data.checkout.messageCardText
          );
          setMessageCardText(data.checkout.messageCardText);
        }
        if (data.checkout.contactInfo)
          setContactInfo(data.checkout.contactInfo);
        if (data.checkout.addressText) {
          setAddressText(data.checkout.addressText);
          // Find the address ID that matches the address text
          if (data.addresses && data.addresses.length > 0) {
            const matchingAddress = data.addresses.find(
              (addr: any) => addr.full_address === data.checkout.addressText
            );
            if (matchingAddress) {
              setSelectedAddressId(matchingAddress.id);
            }
          }
        }
        if (data.checkout.customizationOptions)
          setCustomizationOptions(data.checkout.customizationOptions);

        // Calculate delivery fee if we have address and distance data
        if (
          data.checkout.addressText &&
          data.checkout.distance &&
          data.checkout.items
        ) {
          const orderValue = data.checkout.items.reduce(
            (total: number, item: any) => total + (item.total_price || 0),
            0
          );

          console.log("🚚 Auto-calculating delivery fee on checkout load:", {
            addressText: data.checkout.addressText,
            distance: data.checkout.distance,
            orderValue,
            checkoutId,
          });

          // Calculate delivery fee using distance from checkout session
          await calculateDelivery({
            addressId: data.checkout.selectedAddressId,
            orderValue,
            addressText: data.checkout.addressText,
            distance: data.checkout.distance,
          });

          // Fallback: If delivery calculation failed, calculate manually
          if (
            (!data.checkout.deliveryFee || data.checkout.deliveryFee === 0) &&
            data.checkout.distance
          ) {
            console.log("🔄 Fallback delivery calculation on page load:", {
              distance: data.checkout.distance,
              distanceInKm: data.checkout.distance,
              orderValue,
            });

            // Simple distance-based calculation as fallback
            const distanceInKm = data.checkout.distance; // Distance is already in km
            let fallbackDeliveryFee = 0;

            if (distanceInKm <= 10) {
              fallbackDeliveryFee = 49;
            } else if (distanceInKm <= 20) {
              fallbackDeliveryFee = 89;
            } else if (distanceInKm <= 30) {
              fallbackDeliveryFee = 109;
            } else if (distanceInKm <= 35) {
              fallbackDeliveryFee = 149;
            } else {
              fallbackDeliveryFee = 200; // For distances > 35km
            }

            console.log(
              "💰 Fallback delivery fee calculated on page load:",
              fallbackDeliveryFee
            );

            // Update checkout session with fallback delivery fee
            try {
              const updateResponse = await fetch(
                `/api/checkout/${checkoutId}`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    deliveryFee: fallbackDeliveryFee,
                    totalAmount: orderValue + fallbackDeliveryFee,
                  }),
                }
              );

              if (updateResponse.ok) {
                console.log(
                  "✅ Checkout session updated with fallback delivery fee on page load:",
                  {
                    deliveryFee: fallbackDeliveryFee,
                    totalAmount: orderValue + fallbackDeliveryFee,
                  }
                );

                // Update local checkout data state
                setCheckoutData((prev: any) => ({
                  ...prev,
                  deliveryFee: fallbackDeliveryFee,
                  totalAmount: orderValue + fallbackDeliveryFee,
                }));
              }
            } catch (updateError) {
              console.error(
                "❌ Error updating checkout session with fallback on page load:",
                updateError
              );
            }
          }

          // Update checkout session with calculated delivery fee
          try {
            const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                deliveryFee: deliveryCharge,
                totalAmount: orderValue + deliveryCharge,
              }),
            });

            if (updateResponse.ok) {
              console.log(
                "✅ Checkout session updated with calculated delivery fee:",
                {
                  deliveryFee: deliveryCharge,
                  totalAmount: orderValue + deliveryCharge,
                }
              );

              // Update local checkout data state
              setCheckoutData((prev: any) => ({
                ...prev,
                deliveryFee: deliveryCharge,
                totalAmount: orderValue + deliveryCharge,
              }));
            }
          } catch (updateError) {
            console.error("❌ Error updating checkout session:", updateError);
          }
        }
      } catch (err) {
        console.error("Error fetching checkout data:", err);
        setCheckoutError(
          err instanceof Error ? err.message : "Failed to load checkout data"
        );
      } finally {
        setCheckoutLoading(false);
      }
    };

    fetchCheckoutData();
  }, [checkoutId]);

  // Load applied coupon code to show update/view UI
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("appliedCoupon")
          : null;
      if (raw) {
        const c = JSON.parse(raw);
        // Only set selectedCoupon if the coupon is valid
        if (c?.code && isCouponValid(c)) {
          setSelectedCoupon(c.code);
        } else {
          // Remove invalid coupon from localStorage
          localStorage.removeItem("appliedCoupon");
          setSelectedCoupon(null);
        }
      } else {
        setSelectedCoupon(null);
      }
    } catch {
      setSelectedCoupon(null);
    }
  }, [getSubtotal]);

  // Function to check if a coupon is valid for the current order
  const isCouponValid = (coupon: any) => {
    if (!coupon) return false;

    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);
    const currentSubtotal = getSubtotal();

    return (
      coupon.is_active &&
      now >= validFrom &&
      now <= validUntil &&
      currentSubtotal >= coupon.min_order_amount
    );
  };

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
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<DbAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);
  const [taxSettings, setTaxSettings] = useState<{
    cgst_rate: number;
    sgst_rate: number;
  } | null>(null);

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
  const [tempContactInfo, setTempContactInfo] = useState(contactInfo);
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);

  // Debug: Log when contact drawer opens
  useEffect(() => {
    if (isContactDrawerOpen) {
      console.log(
        "🔍 Contact drawer opened - tempContactInfo:",
        tempContactInfo
      );
      console.log("🔍 Contact drawer opened - contactInfo:", contactInfo);
      console.log(
        "🔍 Are they equal?",
        JSON.stringify(tempContactInfo) === JSON.stringify(contactInfo)
      );

      // Ensure tempContactInfo is synced with contactInfo when drawer opens
      if (JSON.stringify(tempContactInfo) !== JSON.stringify(contactInfo)) {
        console.log("🔧 Syncing tempContactInfo with contactInfo");
        setTempContactInfo(contactInfo);
      }
    }
  }, [isContactDrawerOpen, tempContactInfo, contactInfo]);

  // Debug: Log when contactInfo changes
  useEffect(() => {
    console.log("🔍 ContactInfo state changed:", contactInfo);
  }, [contactInfo]);

  // Debug: Log when tempContactInfo changes
  useEffect(() => {
    console.log("🔍 TempContactInfo state changed:", tempContactInfo);
  }, [tempContactInfo]);

  // Payment dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "opening" | "verifying" | "success" | "failed"
  >("idle");
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showFailureOverlay, setShowFailureOverlay] = useState(false);
  const [failureCountdown, setFailureCountdown] = useState(0);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  // Delivery calculation
  const {
    calculateDelivery,
    isCalculating: isCalculatingDelivery,
    deliveryData,
    deliveryCharge,
    isFreeDelivery,
    totalWithDelivery,
    error: deliveryError,
  } = useDeliveryCalculation({ checkoutId });

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
              setSelectedAddressId(address.id);

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

        console.log(
          "🏠 Addresses loaded:",
          list?.map((addr) => ({
            id: addr.id,
            full_address: addr.full_address,
            distance: addr.distance,
            duration: addr.duration,
            area: addr.area,
          }))
        );

        // Set contact info from user profile
        const autoFilledContactInfo = {
          name: user.name || "",
          phone: user.phone_number || "",
          alternatePhone: "",
        };

        setContactInfo(autoFilledContactInfo);

        // Auto-save contact info to checkout session if we have valid data
        if (autoFilledContactInfo.name && autoFilledContactInfo.phone) {
          try {
            console.log("🔄 Auto-saving contact info to checkout session:", {
              checkoutId,
              contactInfo: autoFilledContactInfo,
            });

            const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contactInfo: autoFilledContactInfo,
              }),
            });

            if (updateResponse.ok) {
              const responseData = await updateResponse.json();
              console.log(
                "✅ Contact info auto-saved to checkout session:",
                responseData
              );
            } else {
              console.error(
                "❌ Failed to auto-save contact info:",
                await updateResponse.text()
              );
            }
          } catch (error) {
            console.error("❌ Error auto-saving contact info:", error);
          }
        }

        // Only set address text if we don't already have it from new address data
        if (!addressText) {
          const def = await getDefaultAddress(user.id);
          let selectedAddress = null;

          if (def?.full_address) {
            setAddressText(def.full_address);
            setSelectedAddressId(def.id);
            selectedAddress = def;
          } else if (list?.[0]?.full_address) {
            setAddressText(list[0].full_address);
            setSelectedAddressId(list[0].id);
            selectedAddress = list[0];
          }

          // Auto-save address info to checkout session if we have a selected address
          if (selectedAddress) {
            try {
              console.log("🔄 Auto-saving address info to checkout session:", {
                checkoutId,
                addressText: selectedAddress.full_address,
                selectedAddressId: selectedAddress.id,
                distance: selectedAddress.distance,
                duration: selectedAddress.duration,
              });

              const updateResponse = await fetch(
                `/api/checkout/${checkoutId}`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    addressText: selectedAddress.full_address,
                    selectedAddressId: selectedAddress.id,
                    distance: selectedAddress.distance,
                    duration: selectedAddress.duration,
                  }),
                }
              );

              if (updateResponse.ok) {
                const responseData = await updateResponse.json();
                console.log(
                  "✅ Address info auto-saved to checkout session:",
                  responseData
                );
              } else {
                console.error(
                  "❌ Failed to auto-save address info:",
                  await updateResponse.text()
                );
              }
            } catch (error) {
              console.error("❌ Error auto-saving address info:", error);
            }
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

  // Calculate checkout totals - use checkout data if available, otherwise fall back to cart
  const calculateSubtotal = () => {
    if (checkoutData) {
      return checkoutData.items.reduce(
        (total: number, item: any) => total + item.unit_price * item.quantity,
        0
      );
    }
    return getSubtotal();
  };

  const subtotal = calculateSubtotal();
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

  // Fetch tax settings from database
  const fetchTaxSettings = async () => {
    // Prevent duplicate fetches
    if (taxSettings) {
      console.log("Tax settings already loaded, skipping fetch");
      return;
    }

    try {
      console.log("Fetching tax settings...");
      const response = await fetch("/api/tax-settings");
      const result = await response.json();
      if (response.ok && result.data) {
        console.log("Tax settings loaded:", result.data);
        setTaxSettings({
          cgst_rate: result.data.cgst_rate,
          sgst_rate: result.data.sgst_rate,
        });
      } else {
        console.log("No tax settings found, using defaults");
        // Use default tax rates if no settings found
        setTaxSettings({ cgst_rate: 9.0, sgst_rate: 9.0 });
      }
    } catch (error) {
      console.error("Error fetching tax settings:", error);
      // Use default tax rates on error
      setTaxSettings({ cgst_rate: 9.0, sgst_rate: 9.0 });
    }
  };

  // Fetch tax settings on component mount
  useEffect(() => {
    fetchTaxSettings();
  }, []);

  // State for calculated tax amounts
  const [calculatedCgstAmount, setCalculatedCgstAmount] = useState(0);
  const [calculatedSgstAmount, setCalculatedSgstAmount] = useState(0);

  // Calculate taxes when tax settings, subtotal, or discount change
  useEffect(() => {
    const taxableAmount = subtotal - discount;

    // Always calculate taxes dynamically based on current subtotal
    // Use tax rates from database or default to 9%
    const cgstRate = taxSettings?.cgst_rate || 9.0;
    const sgstRate = taxSettings?.sgst_rate || 9.0;

    const cgstAmount = (taxableAmount * cgstRate) / 100;
    const sgstAmount = (taxableAmount * sgstRate) / 100;

    // Ensure minimum tax calculation
    const finalCgstAmount = cgstAmount > 0 ? cgstAmount : 0;
    const finalSgstAmount = sgstAmount > 0 ? sgstAmount : 0;

    console.log("Tax calculation (frontend - correct method):", {
      taxableAmount,
      cgstRate,
      sgstRate,
      cgstAmount,
      sgstAmount,
      finalCgstAmount,
      finalSgstAmount,
      taxSettings,
      subtotal,
      discount,
    });

    setCalculatedCgstAmount(finalCgstAmount);
    setCalculatedSgstAmount(finalSgstAmount);
  }, [taxSettings, subtotal, discount]);

  // Auto-update checkout session with tax values when they change
  useEffect(() => {
    if (checkoutId && (calculatedCgstAmount > 0 || calculatedSgstAmount > 0)) {
      const updateTaxesInCheckoutSession = async () => {
        try {
          console.log("🔄 Auto-updating tax values in checkout session:", {
            checkoutId,
            cgstAmount: calculatedCgstAmount,
            sgstAmount: calculatedSgstAmount,
            subtotal,
            discount,
          });

          const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cgstAmount: calculatedCgstAmount,
              sgstAmount: calculatedSgstAmount,
              subtotal: subtotal,
              discount: discount,
              totalAmount:
                subtotal -
                discount +
                calculatedCgstAmount +
                calculatedSgstAmount +
                (deliveryCharge || 0),
            }),
          });

          if (updateResponse.ok) {
            const responseData = await updateResponse.json();
            console.log(
              "✅ Tax values auto-updated in checkout session:",
              responseData
            );
          } else {
            console.error(
              "❌ Failed to auto-update tax values:",
              await updateResponse.text()
            );
          }
        } catch (error) {
          console.error("❌ Error auto-updating tax values:", error);
        }
      };

      // Debounce the update to avoid too many API calls
      const timeoutId = setTimeout(updateTaxesInCheckoutSession, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [
    checkoutId,
    calculatedCgstAmount,
    calculatedSgstAmount,
    subtotal,
    discount,
    deliveryCharge,
  ]);

  // Recalculate delivery fee when checkout data changes
  useEffect(() => {
    if (
      checkoutData?.addressText &&
      checkoutData?.distance &&
      checkoutData?.items
    ) {
      const orderValue = checkoutData.items.reduce(
        (total: number, item: any) => total + (item.total_price || 0),
        0
      );

      // Only recalculate if we don't already have delivery data, if the order value changed, or if delivery fee is not set
      if (
        (!deliveryData || deliveryData.orderValue !== orderValue) &&
        (!checkoutData?.deliveryFee || checkoutData.deliveryFee === 0)
      ) {
        console.log(
          "🔄 Recalculating delivery fee due to checkout data change:",
          {
            addressText: checkoutData.addressText,
            distance: checkoutData.distance,
            duration: checkoutData.duration,
            selectedAddressId: checkoutData.selectedAddressId,
            orderValue,
            checkoutId,
            currentDeliveryFee: checkoutData.deliveryFee,
            currentTotalAmount: checkoutData.totalAmount,
            items: checkoutData.items?.map((item: any) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              total_price: item.total_price,
            })),
          }
        );

        calculateDelivery({
          addressId: checkoutData.selectedAddressId,
          orderValue,
          addressText: checkoutData.addressText,
          distance: checkoutData.distance,
        });
      }
    }
  }, [
    checkoutData?.addressText,
    checkoutData?.distance,
    checkoutData?.items,
    calculateDelivery,
    deliveryData,
  ]);

  const cgstAmount = calculatedCgstAmount;
  const sgstAmount = calculatedSgstAmount;

  const calculateTotal = () => {
    const baseTotal = subtotal - discount + cgstAmount + sgstAmount;
    // Only add delivery fee if address is selected
    const hasAddress = selectedAddressId || checkoutData?.selectedAddressId;
    const deliveryFee = hasAddress
      ? checkoutData?.deliveryFee || deliveryCharge || 0
      : 0;
    const totalWithDelivery = baseTotal + deliveryFee;
    return totalWithDelivery;
  };

  const total = calculateTotal();

  // Auto-calculate delivery fee when address is automatically selected
  useEffect(() => {
    const calculateDeliveryForAutoSelectedAddress = async () => {
      if (!selectedAddressId || !addresses.length || !checkoutData?.items)
        return;

      // Don't recalculate if delivery fee is already set and not 0
      if (checkoutData?.deliveryFee && checkoutData.deliveryFee > 0) {
        console.log(
          "🚫 Skipping auto-calculation - delivery fee already set:",
          checkoutData.deliveryFee
        );
        return;
      }

      const selectedAddress = addresses.find(
        (addr) => addr.id === selectedAddressId
      );
      if (!selectedAddress) return;

      console.log("🚚 Auto-calculating delivery for selected address:", {
        addressId: selectedAddressId,
        addressText: selectedAddress.full_address,
        distance: selectedAddress.distance,
        duration: selectedAddress.duration,
        zone: selectedAddress.area || "Zone A",
      });

      // Calculate order value
      const orderValue = checkoutData.items.reduce(
        (total: number, item: any) => total + (item.total_price || 0),
        0
      );

      // Calculate delivery fee using server-side API
      let calculatedDeliveryFee = 0;
      if (selectedAddress.distance) {
        try {
          const distanceInKm = selectedAddress.distance; // Distance is already in km
          console.log("🔍 Client-side distance before API call:", {
            originalDistance: selectedAddress.distance,
            distanceInKm: distanceInKm,
            type: typeof distanceInKm,
          });
          const response = await fetch("/api/calculate-delivery", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              addressId: selectedAddress.id,
              addressText: selectedAddress.full_address,
              checkoutId: checkoutId,
              distance: distanceInKm,
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
          // Fallback calculation based on distance ranges
          const distance = selectedAddress.distance;
          if (distance <= 10) {
            calculatedDeliveryFee = 49;
          } else if (distance <= 20) {
            calculatedDeliveryFee = 89;
          } else if (distance <= 30) {
            calculatedDeliveryFee = 109;
          } else if (distance <= 35) {
            calculatedDeliveryFee = 149;
          } else {
            calculatedDeliveryFee = 200; // For distances > 35km
          }
        }
      }

      const newTotal = orderValue + calculatedDeliveryFee;

      // Update checkout session with delivery information
      try {
        const updateData = {
          addressText: selectedAddress.full_address,
          selectedAddressId: selectedAddress.id,
          distance: selectedAddress.distance,
          duration: selectedAddress.duration,
          deliveryFee: calculatedDeliveryFee,
          totalAmount: newTotal,
        };

        const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (updateResponse.ok) {
          console.log("✅ Checkout session auto-updated with delivery info:", {
            deliveryFee: calculatedDeliveryFee,
            totalAmount: newTotal,
            addressText: selectedAddress.full_address,
            distance: selectedAddress.distance,
            duration: selectedAddress.duration,
          });

          // Update local checkout data state to reflect the changes
          setCheckoutData((prev: any) => ({
            ...prev,
            deliveryFee: calculatedDeliveryFee,
            totalAmount: newTotal,
            addressText: selectedAddress.full_address,
            selectedAddressId: selectedAddress.id,
            distance: selectedAddress.distance,
            duration: selectedAddress.duration,
          }));
        } else {
          console.error("❌ Failed to auto-update checkout session");
        }
      } catch (error) {
        console.error("❌ Error auto-updating checkout session:", error);
      }
    };

    calculateDeliveryForAutoSelectedAddress();
  }, [selectedAddressId, addresses, checkoutData?.items, checkoutId]);

  // Optimize checkout flow performance
  useEffect(() => {
    // Optimize checkout flow performance
    optimizeCheckoutFlow();
    console.log("Checkout flow optimization initiated");
  }, []);

  // Handle performance metrics
  const handlePerformanceMetrics = (metrics: any) => {
    console.log("Checkout Performance Metrics:", metrics);
    // You can send these metrics to your analytics service
    // or use them for optimization insights
  };

  // Payment processing function - Updated to work with checkout session
  const handlePaymentConfirm = async () => {
    if (isPaymentInProgress) return; // Prevent multiple payment attempts

    try {
      setIsPaymentInProgress(true);
      setPaymentStatus("processing");

      // Find the complete address object based on the selected address text
      const selectedAddressObj = addresses.find(
        (addr) => addr.full_address === addressText
      );

      if (!selectedAddressObj) {
        toast({
          title: "Error",
          description: "Address not found. Please select a valid address.",
          variant: "destructive",
        });
        return;
      }

      // Update checkout session with current form data
      const updateData = {
        note,
        addressText,
        selectedAddressId: selectedAddressObj.id,
        couponCode: selectedCoupon,
        customizationOptions,
        cakeText,
        messageCardText,
        contactInfo,
        deliveryTiming: "same_day",
        deliveryDate: new Date().toISOString().split("T")[0],
        deliveryTimeSlot: "evening",
        estimatedDeliveryTime: null, // Set to null to avoid timestamp format errors
        distance: selectedAddressObj.distance,
        duration: selectedAddressObj.duration,
        // Financial data
        subtotal: subtotal,
        discount: discount,
        deliveryFee: deliveryCharge, // Include calculated delivery fee
        cgstAmount: cgstAmount,
        sgstAmount: sgstAmount,
        totalAmount: total,
      };

      // Debug: Log financial data being sent to checkout session
      console.log("💳 Financial data being sent to checkout session:", {
        subtotal,
        discount,
        deliveryFee: deliveryCharge,
        cgstAmount,
        sgstAmount,
        total,
        addressText,
        selectedAddressObj: selectedAddressObj?.id,
      });

      // Update the checkout session
      console.log("🔄 Updating checkout session:");
      const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update checkout session");
      }

      // Update payment status to processing
      await fetch(`/api/checkout/${checkoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentStatus: "processing",
        }),
      });

      // Keep dialog open for payment
      setPaymentStatus("processing");

      console.log("Checkout session updated:", updateData);
    } catch (err) {
      console.error("Error in payment flow:", err);
      toast({
        title: "Error",
        description: "Payment preparation failed. Please try again.",
        variant: "destructive",
      });
      setPaymentStatus("failed");
    } finally {
      setIsPaymentInProgress(false);
    }
  };

  // Razorpay payment success handler
  const handleRazorpayPaymentSuccess = async (paymentData: any) => {
    console.log("Razorpay payment success:", paymentData);

    try {
      // Close main payment dialog
      setIsPaymentDialogOpen(false);
      setPaymentStatus("success");

      // Clear cart and show success overlay
      clearCart();
      setShowSuccessOverlay(true);
      setSuccessOrderId(paymentData?.orderId);

      toast({
        title: "Payment Successful!",
        description: "Your order has been placed successfully.",
        variant: "default",
      });

      // Redirect to confirmation page
      setTimeout(() => {
        router.push(`/confirmation?orderId=${paymentData?.orderId}`);
      }, 1000);
    } catch (error) {
      console.error("Error handling payment success:", error);
      handleRazorpayPaymentFailure("Payment processing error");
    }
  };

  // Razorpay payment failure handler
  const handleRazorpayPaymentFailure = async (error: any) => {
    console.error("Razorpay payment failed:", error);

    // Close main payment dialog
    setIsPaymentDialogOpen(false);
    setPaymentStatus("failed");

    toast({
      title: "Payment Failed",
      description:
        "Payment failed. Please try again or contact support if the issue persists.",
      variant: "destructive",
    });
  };

  // Razorpay payment close handler
  const handleRazorpayPaymentClose = async () => {
    setIsPaymentDialogOpen(false);
    setIsPaymentInProgress(false);

    // Reset payment status when user cancels
    setPaymentStatus("idle");
  };

  // Razorpay modal opening handler
  const handleRazorpayModalOpening = () => {
    console.log("Razorpay modal is opening...");
    setPaymentStatus("opening");
  };

  // Razorpay payment verification handler
  const handleRazorpayPaymentVerifying = () => {
    console.log("Verifying Razorpay payment...");
    setPaymentStatus("verifying");
  };

  // Handle animation completion
  const handleAnimationComplete = useCallback(() => {
    console.log("=== ANIMATION COMPLETION CALLBACK TRIGGERED ===");
    console.log("Animation completed, redirecting to confirmation page");
    console.log("Success overlay state:", {
      showSuccessOverlay,
      successOrderId,
    });

    // Redirect to confirmation page with order ID
    if (successOrderId) {
      // Use redirectUrl from API response if available, otherwise construct it
      const redirectUrl = `/confirmation?orderId=${successOrderId}`;
      router.push(redirectUrl);
    }
  }, [
    showSuccessOverlay,
    successOrderId,
    checkoutId,
    checkoutData,
    total,
    cart,
    addressText,
    contactInfo,
    router,
  ]);

  // Handle failure animation completion
  const handleFailureAnimationComplete = useCallback(() => {
    console.log("=== FAILURE ANIMATION COMPLETION CALLBACK TRIGGERED ===");
    console.log("Failure animation completed, starting 5-second countdown");

    // Start 5-second countdown before returning to checkout page
    setFailureCountdown(5);
    const countdownInterval = setInterval(() => {
      setFailureCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowFailureOverlay(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

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
    note,
    addressText,
    addresses,
    selectedCoupon,
    customizationOptions,
    cakeText,
    messageCardText,
    contactInfo,
  ]);

  // Show skeleton loader while cart or checkout is loading
  if (cartLoading || checkoutLoading) {
    return <CheckoutSkeleton />;
  }

  // Show expiry screen if session is expired
  if (isSessionExpired) {
    return <CheckoutExpiryScreen checkoutId={checkoutId} />;
  }

  // Show error if checkout failed to load (non-expiry errors)
  if (checkoutError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FB]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Checkout Session Not Found
          </h2>
          <p className="text-gray-600 mb-6">{checkoutError}</p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/cart")}
              className="w-full bg-[#523435] hover:bg-[#402627]"
            >
              Back to Cart
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/products")}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to home if cart is empty (only after loading is complete)
  // BUT don't redirect if we're showing the success or failure overlay
  if (
    (checkoutData ? checkoutData.items.length === 0 : cart.length === 0) &&
    !showSuccessOverlay &&
    !showFailureOverlay
  ) {
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
      <PerformanceMonitor onMetrics={handlePerformanceMetrics} />

      {/* Show success overlay if payment was successful */}
      {showSuccessOverlay && successOrderId && (
        <CheckoutSuccessOverlay
          key={`success-${successOrderId}`}
          orderId={successOrderId}
          isVisible={showSuccessOverlay}
          onAnimationComplete={handleAnimationComplete}
        />
      )}

      {/* Show failure overlay if payment failed */}
      {showFailureOverlay && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-[400px] h-[300px] mx-auto mb-6">
              <Lottie
                animationData={paymentFailedAnimation}
                loop={false}
                autoplay={true}
                onComplete={handleFailureAnimationComplete}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-4">
              Your payment could not be processed. Please try again.
            </p>
            {failureCountdown > 0 && (
              <p className="text-sm text-gray-500 mb-6">
                Redirecting to checkout page in {failureCountdown} seconds...
              </p>
            )}
            <Button
              onClick={() => setShowFailureOverlay(false)}
              className="bg-[#523435] hover:bg-[#4a2a2a] text-white px-8 py-3 rounded-lg"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Main checkout content - hidden when showing success or failure overlay */}
      <div
        style={{
          display: showSuccessOverlay || showFailureOverlay ? "none" : "block",
        }}
      >
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
                      <div className="w-full flex items-center justify-between text-left cursor-pointer  rounded-lg">
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
                              onClick={() => {
                                setIsNoteDrawerOpen(true);
                              }}
                            >
                              Edit
                            </button>
                          )}
                          <IoIosArrowForward className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
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
                          onClick={async () => {
                            setNote("");
                            // Clear note from checkout session
                            try {
                              const updateResponse = await fetch(
                                `/api/checkout/${checkoutId}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    notes: "",
                                  }),
                                }
                              );

                              if (updateResponse.ok) {
                                console.log(
                                  "✅ Note cleared from checkout session"
                                );
                              }
                            } catch (error) {
                              console.error("❌ Error clearing note:", error);
                            }
                          }}
                          className="h-9 px-5 rounded-[12px]"
                        >
                          Clear
                        </Button>
                        <DrawerClose asChild>
                          <Button
                            size="sm"
                            className="h-9 px-5 rounded-[12px]"
                            onClick={async () => {
                              // Save note to checkout session
                              try {
                                console.log(
                                  "🔄 Saving note to checkout session:",
                                  {
                                    checkoutId,
                                    notes: note,
                                  }
                                );

                                const updateResponse = await fetch(
                                  `/api/checkout/${checkoutId}`,
                                  {
                                    method: "PATCH",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      notes: note,
                                    }),
                                  }
                                );

                                if (updateResponse.ok) {
                                  const responseData =
                                    await updateResponse.json();
                                  console.log(
                                    "✅ Note saved to checkout session:",
                                    responseData
                                  );
                                } else {
                                  console.error(
                                    "❌ Failed to save note:",
                                    await updateResponse.text()
                                  );
                                }
                              } catch (error) {
                                console.error("❌ Error saving note:", error);
                              }
                            }}
                          >
                            Save
                          </Button>
                        </DrawerClose>
                      </div>
                      <DrawerFooter className="pt-2 pb-6 lg:hidden">
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={async () => {
                              setNote("");
                              // Clear note from checkout session
                              try {
                                const updateResponse = await fetch(
                                  `/api/checkout/${checkoutId}`,
                                  {
                                    method: "PATCH",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      notes: "",
                                    }),
                                  }
                                );

                                if (updateResponse.ok) {
                                  console.log(
                                    "✅ Note cleared from checkout session (mobile)"
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  "❌ Error clearing note (mobile):",
                                  error
                                );
                              }
                            }}
                            className="flex-1 rounded-[20px] text-[16px]"
                          >
                            Clear
                          </Button>
                          <DrawerClose asChild>
                            <Button
                              size="lg"
                              className="flex-1 py-5 rounded-[20px] text-[16px]"
                              onClick={async () => {
                                // Save note to checkout session
                                try {
                                  console.log(
                                    "🔄 Saving note to checkout session (mobile):",
                                    {
                                      checkoutId,
                                      notes: note,
                                    }
                                  );

                                  const updateResponse = await fetch(
                                    `/api/checkout/${checkoutId}`,
                                    {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        notes: note,
                                      }),
                                    }
                                  );

                                  if (updateResponse.ok) {
                                    const responseData =
                                      await updateResponse.json();
                                    console.log(
                                      "✅ Note saved to checkout session (mobile):",
                                      responseData
                                    );
                                  } else {
                                    console.error(
                                      "❌ Failed to save note (mobile):",
                                      await updateResponse.text()
                                    );
                                  }
                                } catch (error) {
                                  console.error(
                                    "❌ Error saving note (mobile):",
                                    error
                                  );
                                }
                              }}
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
                                selectedAddressId === addr.id ||
                                checkoutData?.selectedAddressId === addr.id
                                  ? "ring-2 ring-[#2664eb] ring-opacity-50 border-[#2664eb]"
                                  : "hover:bg-gray-50 cursor-pointer"
                              }`}
                              onClick={async () => {
                                console.log("📍 Address clicked:", {
                                  id: addr.id,
                                  full_address: addr.full_address,
                                  distance: addr.distance,
                                  duration: addr.duration,
                                  area: addr.area,
                                });

                                // Simple test alert - REMOVED
                                // alert(
                                //   `Address clicked: ${
                                //     addr.full_address
                                //   }\nDistance: ${(addr.distance || 0).toFixed(
                                //     2
                                //   )}km`
                                // );

                                setAddressText(addr.full_address);
                                setSelectedAddressId(addr.id);
                                setIsAddressDrawerOpen(false);

                                // Calculate delivery fee when address is selected
                                if (
                                  checkoutData?.items &&
                                  checkoutData.items.length > 0
                                ) {
                                  const orderValue = checkoutData.items.reduce(
                                    (total: number, item: any) =>
                                      total + (item.total_price || 0),
                                    0
                                  );

                                  console.log(
                                    "🚚 Address selected, calculating delivery:",
                                    {
                                      addressId: addr.id,
                                      orderValue,
                                      addressText: addr.full_address,
                                      distance: addr.distance,
                                      duration: addr.duration,
                                      zone: addr.area || "Zone A",
                                      checkoutDataItems: checkoutData.items,
                                      hasDistance: !!addr.distance,
                                    }
                                  );

                                  // Calculate delivery fee directly based on distance
                                  let calculatedDeliveryFee = 0;
                                  if (addr.distance) {
                                    const distanceInKm = addr.distance; // Distance is already in km
                                    if (distanceInKm <= 10) {
                                      calculatedDeliveryFee = 49;
                                    } else if (distanceInKm <= 20) {
                                      calculatedDeliveryFee = 89;
                                    } else if (distanceInKm <= 30) {
                                      calculatedDeliveryFee = 109;
                                    } else if (distanceInKm <= 35) {
                                      calculatedDeliveryFee = 149;
                                    } else {
                                      calculatedDeliveryFee = 200; // For distances > 35km
                                    }
                                  } else {
                                    // Fallback if no distance data
                                    calculatedDeliveryFee = 49;
                                  }

                                  const newTotal =
                                    orderValue + calculatedDeliveryFee;

                                  console.log(
                                    "🚚 Address selected - direct calculation:",
                                    {
                                      addressId: addr.id,
                                      distance: addr.distance,
                                      distanceInKm: addr.distance || 0,
                                      orderValue,
                                      calculatedDeliveryFee,
                                      newTotal,
                                    }
                                  );

                                  // Update checkout session with calculated delivery fee
                                  try {
                                    const updateResponse = await fetch(
                                      `/api/checkout/${checkoutId}`,
                                      {
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
                                      }
                                    );

                                    if (updateResponse.ok) {
                                      console.log(
                                        "✅ Checkout session updated with address selection:",
                                        {
                                          deliveryFee: calculatedDeliveryFee,
                                          totalAmount: newTotal,
                                        }
                                      );

                                      // Update local checkout data state
                                      setCheckoutData((prev: any) => ({
                                        ...prev,
                                        deliveryFee: calculatedDeliveryFee,
                                        totalAmount: newTotal,
                                        addressText: addr.full_address,
                                        selectedAddressId: addr.id,
                                        distance: addr.distance,
                                        duration: addr.duration,
                                      }));

                                      // Show success message - REMOVED
                                      // alert(
                                      //   `✅ Address selected!\n\nDelivery Fee: ₹${calculatedDeliveryFee}\nTotal: ₹${newTotal}\n\nValues updated successfully.`
                                      // );
                                    } else {
                                      console.error(
                                        "❌ Failed to update checkout session"
                                      );
                                    }
                                  } catch (updateError) {
                                    console.error(
                                      "❌ Error updating checkout session:",
                                      updateError
                                    );
                                  }

                                  // Fallback: If delivery calculation failed, calculate manually
                                  if (deliveryCharge === 0 && addr.distance) {
                                    console.log(
                                      "🔄 Fallback delivery calculation:",
                                      {
                                        distance: addr.distance,
                                        distanceInKm: addr.distance,
                                        orderValue,
                                      }
                                    );

                                    // Simple distance-based calculation as fallback
                                    const distanceInKm = addr.distance; // Distance is already in km
                                    let fallbackDeliveryFee = 0;

                                    if (distanceInKm <= 10) {
                                      fallbackDeliveryFee = 49;
                                    } else if (distanceInKm <= 20) {
                                      fallbackDeliveryFee = 89;
                                    } else if (distanceInKm <= 30) {
                                      fallbackDeliveryFee = 109;
                                    } else if (distanceInKm <= 35) {
                                      fallbackDeliveryFee = 149;
                                    } else {
                                      fallbackDeliveryFee = 200; // For distances > 35km
                                    }

                                    console.log(
                                      "💰 Fallback delivery fee calculated:",
                                      fallbackDeliveryFee
                                    );

                                    // Update checkout session with fallback delivery fee
                                    try {
                                      const updateResponse = await fetch(
                                        `/api/checkout/${checkoutId}`,
                                        {
                                          method: "PATCH",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            selectedAddressId: addr.id,
                                            addressText: addr.full_address,
                                            distance: addr.distance,
                                            duration: addr.duration,
                                            deliveryFee: fallbackDeliveryFee,
                                            totalAmount:
                                              orderValue + fallbackDeliveryFee,
                                          }),
                                        }
                                      );

                                      if (updateResponse.ok) {
                                        console.log(
                                          "✅ Checkout session updated with fallback delivery fee:",
                                          {
                                            deliveryFee: fallbackDeliveryFee,
                                            totalAmount:
                                              orderValue + fallbackDeliveryFee,
                                          }
                                        );

                                        // Update local checkout data state
                                        setCheckoutData((prev: any) => ({
                                          ...prev,
                                          deliveryFee: fallbackDeliveryFee,
                                          totalAmount:
                                            orderValue + fallbackDeliveryFee,
                                          addressText: addr.full_address,
                                          selectedAddressId: addr.id,
                                          distance: addr.distance,
                                          duration: addr.duration,
                                        }));
                                      }
                                    } catch (updateError) {
                                      console.error(
                                        "❌ Error updating checkout session with fallback:",
                                        updateError
                                      );
                                    }
                                  }

                                  // REMOVED: Duplicate update with outdated deliveryCharge from hook
                                  // The delivery fee is already updated in the first calculation above
                                }
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
                                  <Routing
                                    weight="Broken"
                                    className="h-4 w-4"
                                  />
                                  {getDisplayDistance(addr.distance)?.toFixed(
                                    1
                                  ) ?? "-"}{" "}
                                  km
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
                            <Link
                              href={`/addresses/new?returnTo=/checkouts/${checkoutId}`}
                            >
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
                      <div className="w-full flex items-center justify-between text-left cursor-pointer rounded-lg">
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
                              onClick={() => {
                                setIsCustomizationDrawerOpen(true);
                              }}
                            >
                              Edit
                            </button>
                          )}
                          <IoIosArrowForward className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
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
                                  onClick={() =>
                                    setIsMessageCardDrawerOpen(true)
                                  }
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
                            onClick={async () => {
                              const clearedOptions = {
                                addTextOnCake: false,
                                addCandles: false,
                                addKnife: false,
                                addMessageCard: false,
                              };
                              setCustomizationOptions(clearedOptions);
                              updateAllCartItemsCustomization(clearedOptions);

                              // Clear customization options from checkout session
                              try {
                                const updateResponse = await fetch(
                                  `/api/checkout/${checkoutId}`,
                                  {
                                    method: "PATCH",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      customizationOptions: clearedOptions,
                                    }),
                                  }
                                );

                                if (updateResponse.ok) {
                                  console.log(
                                    "✅ Customization options cleared from checkout session"
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  "❌ Error clearing customization options:",
                                  error
                                );
                              }
                            }}
                            className="h-9 px-5 rounded-[12px]"
                          >
                            Clear All
                          </Button>
                          <DrawerClose asChild>
                            <Button
                              size="sm"
                              className="h-9 px-5 rounded-[12px]"
                              onClick={async () => {
                                // Save customization options to checkout session
                                try {
                                  console.log(
                                    "🔄 Saving customization options to checkout session:",
                                    {
                                      checkoutId,
                                      customizationOptions:
                                        customizationOptions,
                                    }
                                  );

                                  const updateResponse = await fetch(
                                    `/api/checkout/${checkoutId}`,
                                    {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        customizationOptions:
                                          customizationOptions,
                                      }),
                                    }
                                  );

                                  if (updateResponse.ok) {
                                    const responseData =
                                      await updateResponse.json();
                                    console.log(
                                      "✅ Customization options saved to checkout session:",
                                      responseData
                                    );
                                  } else {
                                    console.error(
                                      "❌ Failed to save customization options:",
                                      await updateResponse.text()
                                    );
                                  }
                                } catch (error) {
                                  console.error(
                                    "❌ Error saving customization options:",
                                    error
                                  );
                                }
                              }}
                            >
                              Save
                            </Button>
                          </DrawerClose>
                        </div>
                        {/* Mobile action row */}
                        <div className="lg:hidden flex gap-3">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={async () => {
                              const clearedOptions = {
                                addTextOnCake: false,
                                addCandles: false,
                                addKnife: false,
                                addMessageCard: false,
                              };
                              setCustomizationOptions(clearedOptions);
                              updateAllCartItemsCustomization(clearedOptions);

                              // Clear customization options from checkout session
                              try {
                                const updateResponse = await fetch(
                                  `/api/checkout/${checkoutId}`,
                                  {
                                    method: "PATCH",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      customizationOptions: clearedOptions,
                                    }),
                                  }
                                );

                                if (updateResponse.ok) {
                                  console.log(
                                    "✅ Customization options cleared from checkout session (mobile)"
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  "❌ Error clearing customization options (mobile):",
                                  error
                                );
                              }
                            }}
                            className="flex-1 rounded-[20px] text-[16px]"
                          >
                            Clear All
                          </Button>
                          <DrawerClose asChild>
                            <Button
                              size="lg"
                              className="flex-1 py-5 rounded-[20px] text-[16px]"
                              onClick={async () => {
                                // Save customization options to checkout session
                                try {
                                  console.log(
                                    "🔄 Saving customization options to checkout session (mobile):",
                                    {
                                      checkoutId,
                                      customizationOptions:
                                        customizationOptions,
                                    }
                                  );

                                  const updateResponse = await fetch(
                                    `/api/checkout/${checkoutId}`,
                                    {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        customizationOptions:
                                          customizationOptions,
                                      }),
                                    }
                                  );

                                  if (updateResponse.ok) {
                                    const responseData =
                                      await updateResponse.json();
                                    console.log(
                                      "✅ Customization options saved to checkout session (mobile):",
                                      responseData
                                    );
                                  } else {
                                    console.error(
                                      "❌ Failed to save customization options (mobile):",
                                      await updateResponse.text()
                                    );
                                  }
                                } catch (error) {
                                  console.error(
                                    "❌ Error saving customization options (mobile):",
                                    error
                                  );
                                }
                              }}
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
                      onClick={async () => {
                        setMessageCardText("");
                        // Clear message card text from checkout session
                        try {
                          const updateResponse = await fetch(
                            `/api/checkout/${checkoutId}`,
                            {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                messageCardText: "",
                              }),
                            }
                          );

                          if (updateResponse.ok) {
                            console.log(
                              "✅ Message card text cleared from checkout session"
                            );
                          }
                        } catch (error) {
                          console.error(
                            "❌ Error clearing message card text:",
                            error
                          );
                        }
                      }}
                      className="h-9 px-5 rounded-[12px]"
                    >
                      Clear
                    </Button>
                    <DrawerClose asChild>
                      <Button
                        size="sm"
                        className="h-9 px-5 rounded-[12px]"
                        onClick={async () => {
                          // Save message card text to checkout session
                          try {
                            console.log(
                              "🔄 Saving message card text to checkout session:",
                              {
                                checkoutId,
                                messageCardText: messageCardText,
                              }
                            );

                            const updateResponse = await fetch(
                              `/api/checkout/${checkoutId}`,
                              {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  messageCardText: messageCardText,
                                }),
                              }
                            );

                            if (updateResponse.ok) {
                              const responseData = await updateResponse.json();
                              console.log(
                                "✅ Message card text saved to checkout session:",
                                responseData
                              );
                            } else {
                              console.error(
                                "❌ Failed to save message card text:",
                                await updateResponse.text()
                              );
                            }
                          } catch (error) {
                            console.error(
                              "❌ Error saving message card text:",
                              error
                            );
                          }
                        }}
                      >
                        Save
                      </Button>
                    </DrawerClose>
                  </div>
                  <DrawerFooter className="pt-2 pb-6 lg:hidden">
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={async () => {
                          setMessageCardText("");
                          // Clear message card text from checkout session
                          try {
                            const updateResponse = await fetch(
                              `/api/checkout/${checkoutId}`,
                              {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  messageCardText: "",
                                }),
                              }
                            );

                            if (updateResponse.ok) {
                              console.log(
                                "✅ Message card text cleared from checkout session (mobile)"
                              );
                            }
                          } catch (error) {
                            console.error(
                              "❌ Error clearing message card text (mobile):",
                              error
                            );
                          }
                        }}
                        className="flex-1 rounded-[20px] text-[16px]"
                      >
                        Clear
                      </Button>
                      <DrawerClose asChild>
                        <Button
                          size="lg"
                          className="flex-1 py-5 rounded-[20px] text-[16px]"
                          onClick={async () => {
                            // Save message card text to checkout session
                            try {
                              console.log(
                                "🔄 Saving message card text to checkout session (mobile):",
                                {
                                  checkoutId,
                                  messageCardText: messageCardText,
                                }
                              );

                              const updateResponse = await fetch(
                                `/api/checkout/${checkoutId}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    messageCardText: messageCardText,
                                  }),
                                }
                              );

                              if (updateResponse.ok) {
                                const responseData =
                                  await updateResponse.json();
                                console.log(
                                  "✅ Message card text saved to checkout session (mobile):",
                                  responseData
                                );
                              } else {
                                console.error(
                                  "❌ Failed to save message card text (mobile):",
                                  await updateResponse.text()
                                );
                              }
                            } catch (error) {
                              console.error(
                                "❌ Error saving message card text (mobile):",
                                error
                              );
                            }
                          }}
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
                          onChange={(e) => {
                            console.log(
                              "🔍 Name field changed:",
                              e.target.value
                            );
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
                      onClick={async () => {
                        console.log(
                          "🔍 Save button clicked - tempContactInfo:",
                          tempContactInfo
                        );

                        // Validate phone number (must be exactly 10 digits)
                        if (
                          !tempContactInfo.phone ||
                          tempContactInfo.phone.length !== 10 ||
                          !/^\d{10}$/.test(tempContactInfo.phone)
                        ) {
                          console.log("❌ Phone validation failed:", {
                            phone: tempContactInfo.phone,
                            length: tempContactInfo.phone?.length,
                            isValid: /^\d{10}$/.test(
                              tempContactInfo.phone || ""
                            ),
                          });
                          toast({
                            title: "Invalid Phone Number",
                            description:
                              "Phone number must be exactly 10 digits.",
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
                            description:
                              "Alternate phone number must be exactly 10 digits.",
                            variant: "destructive",
                          });
                          return;
                        }

                        // Validate name
                        if (
                          !tempContactInfo.name ||
                          tempContactInfo.name.trim() === ""
                        ) {
                          toast({
                            title: "Name Required",
                            description: "Please enter the receiver's name.",
                            variant: "destructive",
                          });
                          return;
                        }

                        // Update state first
                        setContactInfo(tempContactInfo);

                        // Update checkout session with contact info
                        try {
                          console.log(
                            "🔄 Updating contact info in checkout session:",
                            {
                              checkoutId,
                              contactInfo: tempContactInfo,
                            }
                          );

                          const updateResponse = await fetch(
                            `/api/checkout/${checkoutId}`,
                            {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                contactInfo: tempContactInfo,
                              }),
                            }
                          );

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
                          console.error(
                            "❌ Error updating contact info:",
                            error
                          );
                        }

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
                          title: "Receiver's information saved",
                          description:
                            "Receiver's details have been updated successfully.",
                        });

                        // Close drawer after state update
                        setIsContactDrawerOpen(false);
                      }}
                    >
                      {tempContactInfo.name && tempContactInfo.phone
                        ? "Save"
                        : "Add"}
                    </Button>
                  </div>
                  <DrawerFooter className="pt-2 pb-6 lg:hidden">
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setTempContactInfo(contactInfo)}
                        className="flex-1 rounded-[20px] text-[16px]"
                      >
                        Reset
                      </Button>
                      <Button
                        size="lg"
                        className="flex-1 py-5 rounded-[20px] text-[16px]"
                        onClick={async () => {
                          console.log(
                            "🔍 Mobile Save button clicked - tempContactInfo:",
                            tempContactInfo
                          );

                          // Validate phone number (must be exactly 10 digits)
                          if (
                            !tempContactInfo.phone ||
                            tempContactInfo.phone.length !== 10 ||
                            !/^\d{10}$/.test(tempContactInfo.phone)
                          ) {
                            toast({
                              title: "Invalid Phone Number",
                              description:
                                "Phone number must be exactly 10 digits.",
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
                              description:
                                "Alternate phone number must be exactly 10 digits.",
                              variant: "destructive",
                            });
                            return;
                          }

                          // Validate name
                          if (
                            !tempContactInfo.name ||
                            tempContactInfo.name.trim() === ""
                          ) {
                            toast({
                              title: "Name Required",
                              description: "Please enter the receiver's name.",
                              variant: "destructive",
                            });
                            return;
                          }

                          // Update state first
                          setContactInfo(tempContactInfo);

                          // Update checkout session with contact info
                          try {
                            console.log(
                              "🔄 Updating contact info in checkout session:",
                              {
                                checkoutId,
                                contactInfo: tempContactInfo,
                              }
                            );

                            const updateResponse = await fetch(
                              `/api/checkout/${checkoutId}`,
                              {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  contactInfo: tempContactInfo,
                                }),
                              }
                            );

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
                            console.error(
                              "❌ Error updating contact info:",
                              error
                            );
                          }

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
                            title: "Receiver's information saved",
                            description:
                              "Receiver's details have been updated successfully.",
                          });

                          // Close drawer after state update
                          setIsContactDrawerOpen(false);
                        }}
                      >
                        {tempContactInfo.name && tempContactInfo.phone
                          ? "Save"
                          : "Add"}
                      </Button>
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
                              {getDisplayDistance(
                                currentAddress.distance
                              )?.toFixed(1) ?? "-"}{" "}
                              km
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
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
                          <Link
                            href={`/addresses/new?returnTo=/checkouts/${checkoutId}`}
                          >
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
                          Secure Payment Gateway
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
                    {(checkoutData ? checkoutData.items : cart).map(
                      (item: any, index: number) => {
                        const uid = checkoutData
                          ? `${item.product_id}-${index}`
                          : ((item.uniqueId ||
                              `${item.id}-${item.variant}`) as string);
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
                                    (checkoutData
                                      ? item.product_image
                                      : item.image) ||
                                    "/placeholder.svg?height=88&width=88&query=food%20thumbnail"
                                  }
                                  alt={
                                    checkoutData ? item.product_name : item.name
                                  }
                                  fill
                                  sizes="88px"
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
                                      title={
                                        checkoutData
                                          ? item.product_name
                                          : item.name
                                      }
                                    >
                                      {checkoutData
                                        ? item.product_name
                                        : item.name}
                                    </h3>
                                    <p className="text-[14px] text-gray-500 dark:text-gray-400 truncate max-w-full">
                                      {checkoutData
                                        ? item.category || item.variant
                                        : item.category ?? item.variant}
                                    </p>
                                  </div>

                                  {/* remove button - only show for cart items, not checkout data */}
                                  {!checkoutData && (
                                    <button
                                      aria-label="Remove item"
                                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 self-start"
                                      onClick={() => removeFromCart(uid)}
                                    >
                                      <TrashBinTrash className="h-5 w-5 text-red-600" />
                                    </button>
                                  )}
                                </div>

                                {/* bottom row */}
                                <div className="flex items-center justify-between w-full">
                                  {/* price */}
                                  <p className="text-[16px] font-semibold text-black dark:text-gray-100">
                                    {"₹"}
                                    {(checkoutData
                                      ? item.unit_price
                                      : item.price
                                    ).toFixed(2)}
                                  </p>

                                  {/* quantity controls - show for both cart items and checkout data */}
                                  <div className="flex items-center gap-2 bg-[#F5F4F7] rounded-full p-1 shrink-0">
                                    <button
                                      aria-label="Decrease quantity"
                                      className="w-[26px] h-[26px] flex items-center justify-center rounded-full border border-gray-200 bg-white transition-colors"
                                      onClick={() => {
                                        if (checkoutData) {
                                          // Update checkout data quantity
                                          const newItems =
                                            checkoutData.items.map(
                                              (
                                                checkoutItem: any,
                                                idx: number
                                              ) =>
                                                idx === index
                                                  ? {
                                                      ...checkoutItem,
                                                      quantity: Math.max(
                                                        1,
                                                        checkoutItem.quantity -
                                                          1
                                                      ),
                                                    }
                                                  : checkoutItem
                                            );
                                          setCheckoutData({
                                            ...checkoutData,
                                            items: newItems,
                                          });
                                        } else {
                                          // Update cart quantity
                                          updateQuantity(
                                            uid,
                                            Math.max(1, qty - 1)
                                          );
                                        }
                                      }}
                                    >
                                      <Minus className="h-3 w-3 text-gray-600" />
                                    </button>
                                    <span className="font-medium text-gray-900 dark:text-white min-w-[24px] text-center text-[12px]">
                                      {String(qty).padStart(2, "0")}
                                    </span>
                                    <button
                                      aria-label="Increase quantity"
                                      className="w-[26px] h-[26px] flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                                      onClick={() => {
                                        if (checkoutData) {
                                          // Update checkout data quantity
                                          const newItems =
                                            checkoutData.items.map(
                                              (
                                                checkoutItem: any,
                                                idx: number
                                              ) =>
                                                idx === index
                                                  ? {
                                                      ...checkoutItem,
                                                      quantity:
                                                        checkoutItem.quantity +
                                                        1,
                                                    }
                                                  : checkoutItem
                                            );
                                          setCheckoutData({
                                            ...checkoutData,
                                            items: newItems,
                                          });
                                        } else {
                                          // Update cart quantity
                                          updateQuantity(uid, qty + 1);
                                        }
                                      }}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
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

                      {/* Delivery Fee - Only show when address is selected */}
                      {(selectedAddressId ||
                        checkoutData?.selectedAddressId) && (
                        <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                          <span>Delivery Fee</span>
                          <span
                            className={
                              isFreeDelivery ? "text-green-600 font-medium" : ""
                            }
                          >
                            {isCalculatingDelivery ? (
                              <div className="flex items-center gap-1">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                                <span className="text-xs">Calculating...</span>
                              </div>
                            ) : (checkoutData?.deliveryFee ||
                                deliveryCharge) === 0 ? (
                              "FREE"
                            ) : (
                              `₹${(
                                checkoutData?.deliveryFee || deliveryCharge
                              ).toFixed(2)}`
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                        <span>CGST ({taxSettings?.cgst_rate || 9}%)</span>
                        <span>₹{cgstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                        <span>SGST ({taxSettings?.sgst_rate || 9}%)</span>
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
                        Confirm Order
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
                      modified. We do not offer refunds for cancelled orders
                      under any circumstances.
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

                {/* Delivery Fee - Only show when address is selected */}
                {(selectedAddressId || checkoutData?.selectedAddressId) && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery Fee</span>
                    <span
                      className={
                        isFreeDelivery ? "text-green-600 font-medium" : ""
                      }
                    >
                      {isCalculatingDelivery ? (
                        <div className="flex items-center gap-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                          <span className="text-xs">Calculating...</span>
                        </div>
                      ) : (checkoutData?.deliveryFee || deliveryCharge) ===
                        0 ? (
                        "FREE"
                      ) : (
                        `₹${(
                          checkoutData?.deliveryFee || deliveryCharge
                        ).toFixed(2)}`
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>CGST ({taxSettings?.cgst_rate || 9}%)</span>
                  <span>₹{cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>SGST ({taxSettings?.sgst_rate || 9}%)</span>
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
                    Secure Payment Gateway
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
                Once your order is placed, it cannot be cancelled or modified.
                We do not offer refunds for cancelled orders under any
                circumstances.
              </p>
            </div>
          </div>

          {/* Fixed bottom Place Order bar (mobile only) */}
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 lg:hidden">
            <div className="mx-auto px-4 py-3 w-full max-w-[1200px]">
              <Button
                onClick={() => setIsPaymentDialogOpen(true)}
                disabled={
                  !addressText ||
                  addressText === "2nd street, Barathipuram, Kannampalayam" ||
                  !contactInfo.name ||
                  !contactInfo.phone
                }
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-[18px] h-[48px] text-[16px] font-medium"
              >
                Proceed to Payment
              </Button>
            </div>
          </div>

          {/* Payment Confirmation Dialog */}
          <Dialog
            open={isPaymentDialogOpen && paymentStatus !== "success"}
            onOpenChange={(open) => {
              // Only allow closing if payment is not in progress
              if (
                !open &&
                paymentStatus !== "idle" &&
                paymentStatus !== "failed"
              ) {
                return; // Prevent closing during payment process
              }
              setIsPaymentDialogOpen(open);
              if (!open) {
                setPaymentStatus("idle");
                setIsPaymentInProgress(false);
              }
            }}
          >
            <DialogContent className="w-[calc(100%-40px)] rounded-[22px]">
              <DialogHeader>
                <DialogTitle>Confirm Payment</DialogTitle>
                <DialogDescription>
                  You're about to place an order for ₹{total.toFixed(2)}
                </DialogDescription>
              </DialogHeader>

              {paymentStatus !== "idle" ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  {paymentStatus === "success" ? (
                    <div className="rounded-full h-12 w-12 border-2 border-green-500 bg-green-100 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  ) : paymentStatus === "failed" ? (
                    <div className="rounded-full h-12 w-12 border-2 border-red-500 bg-red-100 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  )}
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {paymentStatus === "processing" && "Processing..."}
                      {paymentStatus === "opening" &&
                        "Opening Payment Gateway..."}
                      {paymentStatus === "verifying" && "Verifying Payment..."}
                      {paymentStatus === "success" && "Payment successful!"}
                      {paymentStatus === "failed" && "Payment failed"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {paymentStatus === "processing" &&
                        "Please wait while we process your request..."}
                      {paymentStatus === "opening" &&
                        "Razorpay payment gateway is opening. Please wait..."}
                      {paymentStatus === "verifying" &&
                        "Verifying your payment with the bank. This may take a few seconds..."}
                      {paymentStatus === "success" &&
                        "Your order has been placed successfully!"}
                      {paymentStatus === "failed" &&
                        "There was an issue with your payment. Please try again."}
                    </p>
                  </div>
                </div>
              ) : (
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
                        <span>CGST ({taxSettings?.cgst_rate || 9}%):</span>
                        <span>₹{cgstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST ({taxSettings?.sgst_rate || 9}%):</span>
                        <span>₹{sgstAmount.toFixed(2)}</span>
                      </div>
                      {/* Delivery Fee - Only show when address is selected */}
                      {(selectedAddressId ||
                        checkoutData?.selectedAddressId) && (
                        <div className="flex justify-between">
                          <span>Delivery Fee:</span>
                          <span
                            className={
                              isFreeDelivery ? "text-green-600 font-medium" : ""
                            }
                          >
                            {(checkoutData?.deliveryFee || deliveryCharge) === 0
                              ? "FREE"
                              : `₹${(
                                  checkoutData?.deliveryFee || deliveryCharge
                                ).toFixed(2)}`}
                          </span>
                        </div>
                      )}
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
                </div>
              )}

              <DialogFooter className="gap-2">
                {paymentStatus === "idle" && (
                  <RazorpayButton
                    amount={total}
                    currency="INR"
                    checkoutId={checkoutId}
                    userDetails={{
                      name: contactInfo.name,
                      email: session?.user?.email || "guest@example.com",
                      phone: contactInfo.phone,
                    }}
                    onSuccess={handleRazorpayPaymentSuccess}
                    onFailure={handleRazorpayPaymentFailure}
                    onClose={handleRazorpayPaymentClose}
                    onModalOpening={handleRazorpayModalOpening}
                    onPaymentVerifying={handleRazorpayPaymentVerifying}
                    disabled={isPaymentInProgress}
                    className="w-full"
                  />
                )}
                {paymentStatus === "failed" && (
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPaymentStatus("idle");
                        setIsPaymentInProgress(false);
                      }}
                      className="flex-1 rounded-[18px] h-[48px] text-[16px] font-medium"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={() => {
                        setIsPaymentDialogOpen(false);
                        setPaymentStatus("idle");
                        setIsPaymentInProgress(false);
                      }}
                      className="flex-1 bg-primary hover:bg-primary/90 rounded-[18px] h-[48px] text-[16px] font-medium"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Payment component removed - implement manually */}
        </div>
      </div>
    </div>
  );
}
