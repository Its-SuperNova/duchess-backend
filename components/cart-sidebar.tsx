"use client";

import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
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
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Mobile Cart Sidebar - Overlay */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-[#202028] z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } shadow-xl`}
      >
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              My Cart
            </h2>
            <div className="flex items-center gap-4">
              <span
                className="text-sm px-3 py-1 rounded-full"
                style={{ backgroundColor: "#f5f5f5", color: "#6b7585" }}
              >
                {cart.length} {cart.length === 1 ? "item" : "items"}
              </span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex flex-col flex-1 min-h-0">
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center py-4 border-b border-gray-100 dark:border-gray-700"
                >
                  {/* Product image */}
                  <div className="relative h-16 w-16 rounded-md overflow-hidden mr-3 flex-shrink-0">
                    <Image
                      src={item.image || "/images/red-velvet.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/images/red-velvet.png";
                      }}
                    />
                  </div>

                  {/* Product details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {item.variant}
                    </p>
                    <p className="font-semibold mt-1 text-gray-900 dark:text-white">
                      ₹{item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center ml-2 flex-shrink-0">
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: "#f5f5f5", color: "#6b7585" }}
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="mx-3 text-gray-900 dark:text-white font-medium">
                      {item.quantity}
                    </span>
                    <button
                      className="w-8 h-8 flex items-center justify-center text-white bg-primary rounded-full hover:bg-primary/90"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-full mb-4">
                    <ShoppingCart className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                    Looks like you haven't added any items to your cart yet.
                  </p>
                  <Button
                    onClick={onClose}
                    className="bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/90"
                  >
                    Continue Shopping
                  </Button>
                </div>
              )}
            </div>

            {/* Bottom Payment Section */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#202028] flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                <Link href="/checkout" onClick={onClose}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-full">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Cart Sidebar - Layout Integration */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:top-0 lg:right-0 lg:h-full bg-white dark:bg-[#202028] border-l border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 shadow-xl ${
          isOpen ? "lg:w-96" : "lg:w-0 lg:border-l-0"
        } overflow-hidden`}
      >
        <div
          className={`flex flex-col h-full ${
            isOpen ? "w-96" : "w-0"
          } overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              My Cart
            </h2>
            <div className="flex items-center gap-4">
              <span
                className="text-sm px-3 py-1 rounded-full"
                style={{ backgroundColor: "#f5f5f5", color: "#6b7585" }}
              >
                {cart.length} {cart.length === 1 ? "item" : "items"}
              </span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex flex-col flex-1 min-h-0">
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center py-4 border-b border-gray-100 dark:border-gray-700"
                >
                  {/* Product image */}
                  <div className="relative h-16 w-16 rounded-md overflow-hidden mr-3 flex-shrink-0">
                    <Image
                      src={item.image || "/images/red-velvet.png"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-[16px]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/images/red-velvet.png";
                      }}
                    />
                  </div>

                  {/* Product details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {item.variant}
                    </p>
                    <p className="font-semibold mt-1 text-gray-900 dark:text-white">
                      ₹{item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center ml-2 flex-shrink-0">
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: "#f5f5f5", color: "#6b7585" }}
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="mx-3 text-gray-900 dark:text-white font-medium">
                      {item.quantity}
                    </span>
                    <button
                      className="w-8 h-8 flex items-center justify-center text-white bg-primary rounded-full hover:bg-primary/90"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-full mb-4">
                    <ShoppingCart className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                    Looks like you haven't added any items to your cart yet.
                  </p>
                  <Button
                    onClick={onClose}
                    className="bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/90"
                  >
                    Continue Shopping
                  </Button>
                </div>
              )}
            </div>

            {/* Bottom Payment Section */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#202028] flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                <Link href="/checkout" onClick={onClose}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-full">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
