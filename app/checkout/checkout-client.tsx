"use client";

import {
  Clock,
  Home,
  Ticket,
  FileText,
  ChevronRight,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Trash2 } from "lucide-react";
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
  const { cart, getSubtotal, updateQuantity, removeFromCart } = useCart();
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
  // Address change drawer state and address text
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [addressText, setAddressText] = useState(
    "2nd street, Barathipuram, Kannampalayam"
  );
  const [tempAddress, setTempAddress] = useState(addressText);
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<DbAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);

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
        <div className="max-w-screen-md mx-auto px-4 py-4">
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

      <div className="max-w-screen-xl mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content (below on mobile, left on desktop) */}
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
            {/* Note Section (moves below Order Summary on mobile) */}
            <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
              {/* Mobile - Drawer */}
              <div className="lg:hidden">
                <Drawer modal={true} onOpenChange={setIsNoteDrawerOpen}>
                  <DrawerTrigger asChild>
                    <button className="w-full flex items-center justify-between text-left">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
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
                  <DrawerContent className="h-[550px] lg:max-w-96 lg:fixed lg:right-0 lg:left-auto lg:rounded-t-2xl bg-[#F5F6FB] overflow-y-auto scrollbar-hide">
                    <DrawerHeader className="text-left">
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
                    <div className="px-4 ">
                      <Textarea
                        placeholder="E.g., Special cake message, delivery instructions, dietary preferences, etc."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="min-h-[150px] rounded-[18px] placeholder:text-[#C0C0C0] placeholder:font-normal"
                      />
                    </div>
                    <DrawerFooter className="pt-2 pb-6">
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

              {/* Address Change Drawer (mobile) */}
              <div className="lg:hidden mt-3">
                <Drawer
                  modal={true}
                  open={isAddressDrawerOpen}
                  onOpenChange={setIsAddressDrawerOpen}
                >
                  <DrawerContent className="h-[550px] overflow-y-auto lg:max-w-96 lg:fixed lg:right-0 lg:left-auto lg:rounded-t-2xl bg-[#F5F6FB]">
                    <div className="px-4 pt-3 pb-2 flex items-center justify-between">
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
                    <div className="px-4">
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
                    <div className="px-4 mt-4">
                      <div className="flex items-center gap-3 text-gray-400 font-semibold tracking-[0.15em] text-xs">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span>SAVED ADDRESS</span>
                        <div className="h-px flex-1 bg-gray-200" />
                      </div>
                    </div>
                    <div className="px-4 mt-3">
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

              {/* Desktop - Expandable Text Box */}
              <div className="hidden lg:block">
                <button
                  onClick={() => setIsNoteDrawerOpen(!isNoteDrawerOpen)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
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
                    <IoIosArrowForward
                      className={`h-5 w-5 text-gray-600  transition-transform duration-200 ${
                        isNoteDrawerOpen ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </button>

                {isNoteDrawerOpen && (
                  <div className="mt-4 space-y-3">
                    <Textarea
                      placeholder="E.g., Special cake message, delivery instructions, dietary preferences, etc."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNote("")}
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setIsNoteDrawerOpen(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Coupons Section */}
            <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
              <Link href="/checkout/coupons">
                <button className="w-full flex items-center justify-between text-left">
                  <div className="flex items-center">
                    <Ticket className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
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

            {/* Delivery Info */}
            <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-start mb-4">
                <Clock className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-gray-600 dark:text-gray-400" />
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
                <Home className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-gray-600 dark:text-gray-400" />
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-3 mt-1 flex-shrink-0 text-gray-600 dark:text-gray-400"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
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

            {/* Bill Details (mobile-only, strictly at bottom below delivery info) */}
            <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600 lg:hidden">
              <div className="flex items-center mb-3">
                <TiDocumentText className="h-5 w-5 mr-2 text-primary" />
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
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
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
            <div className="bg-white mx-4 p-3 rounded-[22px] border border-gray-200 dark:border-gray-600 sticky top-4 overflow-hidden">
              <div className="space-y-4">
                {cart.map((item) => {
                  const uid = (item.uniqueId ||
                    `${item.id}-${item.variant}`) as string;
                  const qty = item.quantity || 1;
                  return (
                    <div key={uid} className="flex items-start justify-between">
                      <div className="flex w-full min-w-0 pr-3">
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
                              <Trash2 className="h-4 w-4 text-red-600" />
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

              {/* Bill Details (desktop) */}
              <div className="hidden lg:block mt-6">
                <div className="flex items-center mb-3">
                  <TiDocumentText className="h-5 w-5 mr-2 text-primary" />
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
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200 mt-2">
                      <span>To Pay</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Place Order Button moved to fixed bottom bar */}
            </div>
          </div>
        </div>
        {/* Fixed bottom Place Order bar */}
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200">
          <div className="mx-auto px-4 py-3 w-full max-w-screen-xl">
            <Link href="/checkout/confirmation" className="w-full">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-[18px] mb-2 text-lg font-medium h-auto">
                Proceed to Payment
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
