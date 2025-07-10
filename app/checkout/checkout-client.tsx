"use client";

import { Minus, Plus, X } from "lucide-react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
// removed Trash2, using Solar icon via Iconify
import { TiDocumentText } from "react-icons/ti";
import { TbPaperBag } from "react-icons/tb";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import dynamic from "next/dynamic";
const Icon = dynamic(() => import("@iconify/react").then((m) => m.Icon), {
  ssr: false,
}) as any;
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
import { useCart } from "@/context/cart-context";
import { getUserByEmail } from "@/lib/auth-utils";
import {
  getDefaultAddress,
  getDisplayDistance,
  getUserAddresses,
} from "@/lib/address-utils";
import type { Address as DbAddress } from "@/lib/supabase";

export default function CheckoutClient() {
  // Get cart items and functions from cart context
  const {
    cart,
    getSubtotal,
    updateQuantity,
    removeFromCart,
    updateCartItemCustomization,
  } = useCart();
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
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);
  const [isCustomizationDrawerOpen, setIsCustomizationDrawerOpen] =
    useState(false);
  // Address change drawer state and address text
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [addressText, setAddressText] = useState(
    "2nd street, Barathipuram, Kannampalayam"
  );
  const [tempAddress, setTempAddress] = useState(addressText);
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

  useEffect(() => {
    const load = async () => {
      if (!session?.user?.email) return;
      try {
        setLoadingAddresses(true);
        const user = await getUserByEmail(session.user.email);
        if (!user) return;
        const list = await getUserAddresses(user.id);
        setAddresses(list || []);
        const def = await getDefaultAddress(user.id);
        if (def?.full_address) {
          setAddressText(def.full_address);
        } else if (list?.[0]?.full_address) {
          setAddressText(list[0].full_address);
        }
      } finally {
        setLoadingAddresses(false);
      }
    };
    load();
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
  const deliveryFee = subtotal > 0 ? 49 : 0;
  const total = subtotal - discount + deliveryFee;

  // Persist lightweight checkout context for payment step
  useEffect(() => {
    try {
      const ctx = {
        subtotal,
        discount,
        deliveryFee,
        note,
        addressText,
        couponCode: selectedCoupon,
        customizationOptions,
        cakeText,
        messageCardText,
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
    selectedCoupon,
    customizationOptions,
    cakeText,
    messageCardText,
  ]);

  // Redirect to home if cart is empty
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FB]">
        <div className="text-center">
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
            <Link href="/">
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
                <Drawer modal={true} onOpenChange={setIsNoteDrawerOpen}>
                  <DrawerTrigger asChild>
                    <button className="w-full flex items-center justify-between text-left">
                      <div className="flex items-center">
                        <Icon
                          icon="solar:document-add-broken"
                          className="h-5 w-5 mr-3 text-black"
                        />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {note ? note : "Add a note"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {note && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Edit
                          </span>
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
                        onChange={(e) => setNote(e.target.value)}
                        className="min-h-[150px] rounded-[18px] placeholder:text-[#C0C0C0] placeholder:font-normal"
                      />
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
                      <DrawerClose asChild>
                        <button
                          aria-label="Close"
                          className="h-9 w-9 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center shadow-sm"
                        >
                          <X className="h-5 w-5 text-gray-700" />
                        </button>
                      </DrawerClose>
                    </div>
                    <div className="px-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                      <button className="w-full flex items-center justify-between bg-white rounded-[14px] px-4 py-3 shadow-sm">
                        <span className="flex items-center gap-3 text-[#570000] font-medium">
                          <span className="h-6 w-6 flex items-center justify-center rounded-full text-[#570000] text-lg leading-none">
                            +
                          </span>
                          Add address
                        </span>
                        <span className="text-[#570000]">›</span>
                      </button>
                    </div>
                    <div className="px-4 mt-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                      <div className="flex items-center gap-3 text-gray-400 font-semibold tracking-[0.15em] text-xs">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span>SAVED ADDRESS</span>
                        <div className="h-px flex-1 bg-gray-200" />
                      </div>
                    </div>
                    <div className="px-4 mt-3 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="bg-white rounded-[18px] shadow-sm p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="h-6 w-6 rounded-xl items-center justify-center  flex">
                                <Icon
                                  icon="solar:home-angle-broken"
                                  className="h-5 w-5 text-[#570000]"
                                />
                              </span>
                              <span className="font-medium text-gray-800">
                                {addr.address_name || "Address"}
                              </span>
                            </div>
                            <button className="text-[#570000]">
                              <Icon
                                icon="solar:menu-dots-outline"
                                className="h-5 w-5 text-[#570000]"
                              />
                            </button>
                          </div>
                          <p className="mt-2 text-sm text-gray-500 leading-snug">
                            {addr.full_address}
                          </p>
                          <div className="mt-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E9FFF3] text-[#15A05A] text-xs">
                              <Icon
                                icon="solar:routing-broken"
                                className="h-4 w-4"
                              />
                              {getDisplayDistance(addr.distance) ?? "-"} km
                            </span>
                          </div>
                        </div>
                      ))}
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
                    <Icon
                      icon="solar:ticket-sale-broken"
                      className="h-5 w-5 mr-3 text-black"
                    />
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
                        <Icon
                          icon="solar:settings-broken"
                          className="h-5 w-5 mr-3 text-black"
                        />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {Object.values(customizationOptions).some(
                            (opt) => opt
                          )
                            ? "Customization options selected"
                            : "Add customization options"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
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
                        {/* Add Text on Cake */}
                        <div className="bg-white rounded-[18px] p-4 border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon
                                icon="solar:pen-broken"
                                className="h-5 w-5 text-[#570000]"
                              />
                              <div>
                                <h3 className="font-medium text-gray-800">
                                  Add Text on Cake
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Personalize your cake with custom text
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={customizationOptions.addTextOnCake}
                              onCheckedChange={(checked) => {
                                const newOptions = {
                                  ...customizationOptions,
                                  addTextOnCake: checked,
                                };
                                setCustomizationOptions(newOptions);
                                updateAllCartItemsCustomization(newOptions);
                              }}
                            />
                          </div>
                          {customizationOptions.addTextOnCake && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => setIsCakeTextDrawerOpen(true)}
                                className="w-full text-left p-3 bg-gray-50 rounded-[12px] hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    {cakeText
                                      ? cakeText
                                      : "Click to add cake text"}
                                  </span>
                                  <Icon
                                    icon="solar:pen-broken"
                                    className="h-4 w-4 text-gray-400"
                                  />
                                </div>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Add Candles */}
                        <div className="bg-white rounded-[18px] p-4 border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon
                                icon="majesticons:cake-line"
                                className="h-5 w-5 text-[#570000]"
                              />
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

                        {/* Add Knife */}
                        <div className="bg-white rounded-[18px] p-4 border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon
                                icon="mdi:silverware-fork-knife"
                                className="h-5 w-5 text-[#570000]"
                              />
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

                        {/* Add Message Card */}
                        <div className="bg-white rounded-[18px] p-4 border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon
                                icon="solar:card-broken"
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
                                  <Icon
                                    icon="solar:card-broken"
                                    className="h-4 w-4 text-gray-400"
                                  />
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
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

            {/* Cake Text Input Drawer */}
            <Drawer
              modal={true}
              open={isCakeTextDrawerOpen}
              onOpenChange={setIsCakeTextDrawerOpen}
            >
              <DrawerContent className="h-[600px] md:h-[550px] rounded-t-2xl bg-[#F5F6FB] overflow-y-auto scrollbar-hide">
                <DrawerHeader className="text-left lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                  <div className="flex items-center justify-between w-full">
                    <DrawerTitle className="text-[20px]">
                      Add Text on Cake
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
                    placeholder="E.g., Happy Birthday Varun!!"
                    value={cakeText}
                    onChange={(e) => setCakeText(e.target.value)}
                    maxLength={30}
                    className="min-h-[150px] rounded-[18px] placeholder:text-[#C0C0C0] placeholder:font-normal"
                  />
                  <div className="flex justify-end mt-2">
                    <span
                      className={`text-sm ${
                        cakeText.length >= 30 ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      {cakeText.length}/30 characters
                    </span>
                  </div>
                </div>
                {/* Desktop action row */}
                <div className="hidden lg:flex justify-end gap-2 px-4 pt-3 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCakeText("")}
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
                      onClick={() => setCakeText("")}
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

            {/* Delivery Info */}
            <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-start mb-4">
                <Icon
                  icon="solar:clock-circle-broken"
                  className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-black"
                />
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    Delivery in 32 mins
                  </h3>
                  <button className="text-gray-500 dark:text-gray-400 underline text-sm">
                    Want this later? Schedule it
                  </button>
                </div>
              </div>

              <div className="flex items-start mb-4">
                <Icon
                  icon="solar:home-smile-angle-broken"
                  className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-black"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    Delivery at Home
                  </h3>
                  <div className="mt-1 flex items-center justify-between gap-3 min-w-0">
                    <p className="text-gray-500 dark:text-gray-400 text-sm truncate min-w-0">
                      {addressText}
                    </p>
                    <button
                      className="text-sm text-[#2664eb] hover:underline shrink-0"
                      onClick={() => {
                        setTempAddress(addressText);
                        setIsAddressDrawerOpen(true);
                      }}
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <Icon
                  icon="solar:phone-broken"
                  className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-black"
                />
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    Contact
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Ashwin C S, +91-8248669086
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop cancellation policy under delivery info */}
            <div className="hidden lg:block mx-4 mt-4 text-[#9AA3C7]">
              <h4 className="uppercase tracking-wide font-semibold text-[14px]">
                Cancellation Policy
              </h4>
              <p className="mt-2 text-sm">
                Once your order is placed, it cannot be cancelled or modified.
                We do not offer refunds for cancelled orders under any
                circumstances.
              </p>
            </div>

            {/* Bill Details (mobile-only, strictly at bottom below delivery info) */}
            <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600 lg:hidden">
              <div className="flex items-center mb-3 gap-2">
                <Icon
                  icon="solar:bill-list-broken"
                  className="h-5 w-5 text-[#570000]"
                />
                <h3 className="font-medium text-gray-800 dark:text-gray-200">
                  Bill Details
                </h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                  <span>Item Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {/* GST & Taxes removed per request */}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="pt-2 mt-2">
                  <div className="w-full h-[1.5px] bg-[repeating-linear-gradient(90deg,_rgba(156,163,175,0.5)_0,_rgba(156,163,175,0.5)_8px,_transparent_8px,_transparent_14px)] rounded-full"></div>
                  <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200 mt-2">
                    <span>To Pay</span>
                    <span>₹{total.toFixed(2)}</span>
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
                                <Icon
                                  icon="solar:trash-bin-trash-broken"
                                  className="h-5 w-5 text-red-600"
                                />
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
                    <Icon
                      icon="solar:bill-list-broken"
                      className="h-5 w-5 text-[#570000]"
                    />
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
                      <span>Delivery Fee</span>
                      <span>₹{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 mt-2">
                      <div className="w-full h-[1.5px] bg-[repeating-linear-gradient(90deg,_rgba(156,163,175,0.5)_0,_rgba(156,163,175,0.5)_8px,_transparent_8px,_transparent_14px)] rounded-full"></div>
                      <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200 mt-2">
                        <span>To Pay</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/checkout/payment?amount=${total.toFixed(2)}`}
                      className="w-full"
                    >
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-[18px] text-[16px] font-medium h-auto">
                        Proceed to Payment
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Disclaimer (mobile-only at page bottom) */}
        <div className="mx-4 lg:hidden mt-6 text-[#9AA3C7]">
          <h4 className="uppercase tracking-wide font-semibold text-[14px]">
            Cancellation Policy
          </h4>
          <p className="mt-2 text-sm">
            Once your order is placed, it cannot be cancelled or modified. We do
            not offer refunds for cancelled orders under any circumstances.
          </p>
        </div>
        {/* Fixed bottom Place Order bar (mobile only) */}
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 lg:hidden">
          <div className="mx-auto px-4 py-3 w-full max-w-[1200px]">
            <Link
              href={`/checkout/payment?amount=${total.toFixed(2)}`}
              className="w-full"
            >
              <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-[18px] mb-2 text-[16px] font-medium h-auto">
                Proceed to Payment
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
