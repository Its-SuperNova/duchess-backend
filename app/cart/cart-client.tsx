"use client";

import { ArrowLeft, Plus, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";

export default function CartClient() {
  const { cart, updateQuantity, removeFromCart, getSubtotal } = useCart();
  const subtotal = getSubtotal();

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 h-[64px] flex items-center border-b">
        <Link href="/" className="mr-4">
          <div className="bg-gray-100 p-2 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </div>
        </Link>
        <h1 className="text-xl font-semibold">My Cart</h1>
        <div className="ml-auto text-sm text-gray-500 mr-4">
          {cart.length} {cart.length === 1 ? "item" : "items"}
        </div>
        {/* Profile Picture */}
        <div className="relative h-8 w-8 rounded-full overflow-hidden">
          <Image
            src="/profile-avatar.png"
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Cart Items */}
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center py-4 border-b border-gray-100"
          >
            {/* Product image */}
            <div className="relative h-16 w-16 rounded-md overflow-hidden mr-3">
              <Image
                src={item.image || "/images/red-velvet.png"}
                alt={item.name}
                fill
                className="object-cover"
                onError={(e) => {
                  // If image fails to load, replace with banner image
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop
                  target.src = "/images/red-velvet.png"; // Fallback banner image
                }}
              />
            </div>

            {/* Product details */}
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.category}</p>
              <p className="text-xs text-gray-400">{item.variant}</p>
              <p className="font-semibold mt-1">₹{item.price.toFixed(2)}</p>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center">
              <button
                className="w-8 h-8 flex items-center justify-center text-gray-500 border border-gray-300 rounded-md"
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="mx-3">{item.quantity}</span>
              <button
                className="w-8 h-8 flex items-center justify-center text-white bg-primary rounded-md"
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {cart.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-gray-400"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 text-center mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              href="/products"
              className="bg-primary text-white px-6 py-3 rounded-full text-sm font-medium"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Payment Bar - Positioned above the bottom nav */}
      {cart.length > 0 && (
        <div className="fixed bottom-[80px] left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-bold">₹{subtotal.toFixed(2)}</span>
          </div>
          <Link href="/checkout" className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-full">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
