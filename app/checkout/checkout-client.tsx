"use client";

import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Home,
  Ticket,
  FileText,
  AlertCircle,
} from "lucide-react";
import { TiDocumentText } from "react-icons/ti";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const { cart, updateQuantity, removeFromCart, getSubtotal } = useCart();
  const [note, setNote] = useState("");

  // Calculate totals based on actual cart items
  const subtotal = getSubtotal();
  const gstAndTaxes = subtotal * 0.05;
  const discount = subtotal > 0 ? 100 : 0; // Only apply discount if cart has items
  const deliveryFee = subtotal > 0 ? 49 : 0; // Only apply delivery fee if cart has items
  const total = subtotal + gstAndTaxes - discount + deliveryFee;

  return (
    <div
      className="min-h-screen pb-40 md:pb-24"
      style={{ backgroundColor: "#F5F6FB" }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white p-4 flex items-center border-b shadow-sm">
        <Link href="/cart" className="mr-4">
          <div className="bg-gray-100 p-2 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </div>
        </Link>
        <h1 className="text-xl font-semibold">Checkout</h1>
      </div>

      <div className="max-w-screen-md mx-auto pt-2">
        {/* Cart Items */}
        <div className="bg-white mx-4 my-4 p-4 rounded-2xl border border-gray-100 shadow-sm">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0"
            >
              <div className="flex">
                {/* Product image */}
                <div className="relative h-16 w-16 rounded-md overflow-hidden mr-3">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product details */}
                <div>
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                  <div className="flex items-center mt-1">
                    <p className="text-gray-700">₹{item.price.toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{item.variant}</p>
                </div>
              </div>

              <div className="flex flex-col items-end">
                {/* Quantity controls */}
                <div className="flex items-center border border-gray-300 rounded-lg mb-2">
                  <button
                    className="px-3 py-1 text-primary"
                    onClick={() => {
                      if (item.quantity > 1) {
                        updateQuantity(item.id, item.quantity - 1);
                      } else {
                        removeFromCart(item.id);
                      }
                    }}
                  >
                    -
                  </button>
                  <span className="px-3 py-1">{item.quantity}</span>
                  <button
                    className="px-3 py-1 text-primary"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                {/* Item total price */}
                <p className="font-medium">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-gray-500">
                Your cart is empty. Add some items to proceed with checkout.
              </p>
              <Link
                href="/products"
                className="text-primary font-medium mt-4 inline-block"
              >
                Browse Products
              </Link>
            </div>
          )}

          {/* Add More Items */}
          <button className="flex items-center text-primary font-medium mt-4">
            <span className="text-xl mr-2">+</span> Add more items
          </button>
        </div>

        {/* Note Section with Drawer */}
        <div className="mx-4 mt-4">
          <Drawer>
            <DrawerTrigger asChild>
              <button className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center text-gray-700">
                <FileText className="h-5 w-5 mr-3" />
                <span className="font-medium">
                  Add a note for the restaurant
                </span>
              </button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh]">
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
                <Button variant="outline" onClick={() => setNote("")}>
                  Clear
                </Button>
                <DrawerClose asChild>
                  <Button className="bg-primary">Save</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>

        {/* Coupons */}
        <button className="bg-white mx-4 my-4 p-4 rounded-2xl border border-gray-100 shadow-sm w-[calc(100%-2rem)] flex justify-between items-center">
          <div className="flex items-center">
            <Ticket className="h-5 w-5 mr-3" />
            <span className="font-medium">View all coupons</span>
          </div>
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Delivery Info */}
        <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-start mb-6">
            <Clock className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Delivery in 32 mins</h3>
              <button className="text-gray-500 underline">
                Want this later? Schedule it
              </button>
            </div>
          </div>

          <div className="flex items-start mb-6">
            <Home className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium">Delivery at Home</h3>
              <p className="text-gray-500 break-words">
                2nd street, Barathipuram, Kannampalayam
              </p>
            </div>
            <ChevronRight className="h-5 w-5 ml-2 flex-shrink-0" />
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
              className="mr-3 mt-1 flex-shrink-0"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <div>
              <h3 className="font-medium">Contact</h3>
              <p className="text-gray-500">Ashwin C S, +91-8248669086</p>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white mx-4 my-4 p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center mb-3">
            <TiDocumentText className="h-5 w-5 mr-2 text-primary" />
            <h3 className="font-medium">Bill Details</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Item Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST & Taxes</span>
              <span>₹{gstAndTaxes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>To Pay</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:static md:border-0 md:p-0 md:mt-4">
          <Link href="/checkout/confirmation" className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-full">
              Place Order
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
