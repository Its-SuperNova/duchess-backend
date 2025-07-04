"use client";

import { Clock, Home, Ticket, FileText, ChevronRight } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { TiDocumentText } from "react-icons/ti";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
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

export default function CheckoutClient() {
  // Get cart items and functions from cart context
  const { cart, getSubtotal } = useCart();
  const [note, setNote] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);

  // Sample coupons data
  const availableCoupons = [
    {
      id: 1,
      code: "SAVE20",
      title: "Save ₹20",
      description: "Minimum order ₹200",
      discount: 20,
    },
    {
      id: 2,
      code: "FIRST50",
      title: "First Order",
      description: "₹50 off on first order",
      discount: 50,
    },
    {
      id: 3,
      code: "SWEET10",
      title: "Sweet Deal",
      description: "10% off on all items",
      discount: 10,
      isPercentage: true,
    },
    {
      id: 4,
      code: "BULK25",
      title: "Bulk Order",
      description: "₹25 off on orders above ₹500",
      discount: 25,
    },
  ];

  // Calculate checkout totals
  const subtotal = getSubtotal();
  const gstAndTaxes = subtotal * 0.05;
  const discount = subtotal > 0 ? 100 : 0;
  const deliveryFee = subtotal > 0 ? 49 : 0;
  const total = subtotal + gstAndTaxes - discount + deliveryFee;

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
    <div className="min-h-screen bg-[#F5F6FB]">
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

      <div className="max-w-screen-md mx-auto py-6 ">
        <div className="space-y-4">
          {/* Cart Items Summary */}
          <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
            {cart.map((item) => (
              <div
                key={item.uniqueId || item.id}
                className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-600 last:border-0"
              >
                <div className="flex">
                  <div className="relative h-12 w-12 rounded-md overflow-hidden mr-3">
                    <Image
                      src={item.image || "/images/red-velvet.png"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-[8px]"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.variant}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      ₹{item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-medium text-sm">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Note Section */}
          <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
            <Drawer modal={true} onOpenChange={setIsNoteDrawerOpen}>
              <DrawerTrigger asChild>
                <button className="w-full flex items-center justify-between text-left">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {note ? note : "Add a note for the restaurant"}
                    </span>
                  </div>
                  {note && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Edit
                    </span>
                  )}
                </button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh] lg:max-w-96 lg:fixed lg:right-0 lg:left-auto lg:rounded-t-2xl">
                <DrawerHeader>
                  <DrawerTitle>Add a note</DrawerTitle>
                  <DrawerDescription>
                    Add any special instructions or requests for the restaurant.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4 pb-0">
                  <Textarea
                    placeholder="E.g., Please make it less spicy, no onions, etc."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
                <DrawerFooter className="pt-2 pb-6">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setNote("")}
                      className="flex-1"
                    >
                      Clear
                    </Button>
                    <DrawerClose asChild>
                      <Button className="bg-primary flex-1">Save</Button>
                    </DrawerClose>
                  </div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Coupons Section */}
          <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
            <Drawer modal={false}>
              <DrawerTrigger asChild>
                <button className="w-full flex items-center justify-between text-left">
                  <div className="flex items-center">
                    <Ticket className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {selectedCoupon ? selectedCoupon : "View all coupons"}
                    </span>
                  </div>
                  {selectedCoupon && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Applied
                    </span>
                  )}
                </button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh] lg:max-w-96 lg:fixed lg:right-0 lg:left-auto lg:rounded-t-2xl">
                <DrawerHeader>
                  <DrawerTitle>Apply Coupon</DrawerTitle>
                  <DrawerDescription>
                    Choose from available coupons or enter a coupon code.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4 pb-0">
                  {/* Coupon Code Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Enter Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (couponCode) {
                            setSelectedCoupon(couponCode);
                            setCouponCode("");
                          }
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>

                  {/* Available Coupons */}
                  <div className="space-y-3 max-h-[200px] overflow-y-auto">
                    <h3 className="font-medium text-sm">Available Coupons</h3>
                    {availableCoupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setSelectedCoupon(coupon.code)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {coupon.code}
                              </span>
                              <span className="text-green-600 font-semibold text-sm">
                                {coupon.title}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {coupon.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <DrawerFooter className="pt-2 pb-6">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCoupon(null);
                        setCouponCode("");
                      }}
                      className="flex-1"
                    >
                      Clear
                    </Button>
                    <DrawerClose asChild>
                      <Button className="bg-primary flex-1">Done</Button>
                    </DrawerClose>
                  </div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
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
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">
                  Delivery at Home
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm break-words">
                  2nd street, Barathipuram, Kannampalayam
                </p>
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

          {/* Bill Details */}
          <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
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
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                <span>GST & Taxes</span>
                <span>₹{gstAndTaxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600 text-sm">
                <span>Discount</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200">
                  <span>To Pay</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:static md:border-0 md:p-0 md:mt-6">
          <Link href="/checkout/confirmation" className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-full text-lg font-medium">
              Place Order • ₹{total.toFixed(0)}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
