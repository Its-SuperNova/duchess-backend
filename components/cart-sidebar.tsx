"use client";

import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Clock,
  Home,
  Ticket,
  FileText,
} from "lucide-react";

import { TiDocumentText } from "react-icons/ti";
import { IoIosArrowBack } from "react-icons/io";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Lottie from "lottie-react";
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
import { useIsMobile } from "@/hooks/use-mobile";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    getSubtotal,
    isCheckoutMode,
    setCheckoutMode,
  } = useCart();
  const [note, setNote] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);
  const subtotal = getSubtotal();
  const isMobile = useIsMobile();

  // Animation data - using a simple shopping cart animation
  const [animationData, setAnimationData] = useState(null);

  // Load animation data
  useEffect(() => {
    // Using a simple empty cart animation
    const loadAnimation = async () => {
      try {
        const response = await fetch(
          "https://d1jj76g3lut4fe.cloudfront.net/saved_colors/98652/0M71xqBxut5tSYdp.json"
        );
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error("Failed to load animation:", error);
      }
    };

    loadAnimation();
  }, []);

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
  const gstAndTaxes = subtotal * 0.05;
  const discount = subtotal > 0 ? 100 : 0;
  const deliveryFee = subtotal > 0 ? 49 : 0;
  const total = subtotal + gstAndTaxes - discount + deliveryFee;

  // Render cart items component
  const renderCartItems = () => (
    <>
      {cart.map((item) => (
        <div
          key={item.uniqueId || item.id}
          className="flex h-[124px] items-start gap-4 py-3 px-3 bg-white rounded-[20px]"
        >
          {/* Product image */}
          <div className="relative h-[100px] w-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
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

          <div className="flex-1 flex flex-col justify-between h-full">
            {/* Product details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight ">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500 font-medium dark:text-gray-400  leading-relaxed inline-block">
                {item.variant.includes("Piece")
                  ? "Premium quality piece"
                  : item.variant}
              </p>
            </div>

            <div className="flex items-center justify-between">
              {/* price */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-500 line-through">
                  ₹{(item.price * 1.2).toFixed(0)}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ₹{item.price.toFixed(0)}
                </span>
              </div>
              {/* Quantity controls */}
              <div className="flex items-center gap-3 bg-[#F5F4F7] rounded-full p-1 flex-shrink-0">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white transition-colors"
                  onClick={() =>
                    handleUpdateQuantity(
                      item.uniqueId || `${item.id}-${item.variant}`,
                      item.quantity - 1
                    )
                  }
                >
                  <Minus className="h-4 w-4 text-gray-600" />
                </button>
                <span className="font-medium text-gray-900 dark:text-white min-w-[24px] text-center">
                  {item.quantity.toString().padStart(2, "0")}
                </span>
                <button
                  className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                  onClick={() =>
                    handleUpdateQuantity(
                      item.uniqueId || `${item.id}-${item.variant}`,
                      item.quantity + 1
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Empty state with Lottie animation */}
      {cart.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="mb-4 flex justify-center">
            {animationData && (
              <Lottie
                animationData={animationData}
                loop={true}
                style={{
                  width: isMobile ? "320px" : "320px",
                  height: "auto",
                }}
              />
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500 dark:text-gray-400  text-center mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
        </div>
      )}
    </>
  );

  // Render checkout content
  const renderCheckoutContent = (variant = "desktop") => {
    const containerClasses =
      variant === "mobile"
        ? "bg-white mx-4 p-4 rounded-2xl"
        : "bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600";

    return (
      <div className="space-y-4">
        {/* Cart Items Summary */}
        <div className={containerClasses}>
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
        <div className={containerClasses}>
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
        <div className={containerClasses}>
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
        <div className={containerClasses}>
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
        <div className={containerClasses}>
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
    );
  };

  const handleUpdateQuantity = (uniqueId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      // Remove item when quantity reaches 0
      removeFromCart(uniqueId);
    } else {
      // Update quantity (optimistic update for instant feedback)
      updateQuantity(uniqueId, newQuantity);
    }
  };

  const handleProceedToCheckout = () => {
    setCheckoutMode(true);
  };

  const handleBackToCart = () => {
    setCheckoutMode(false);
  };

  const handleClose = () => {
    setCheckoutMode(false);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[70] transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Mobile Cart Sidebar - Overlay */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-full sm:w-96 bg-[#F4F4F7] dark:bg-[#202028] z-[70] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } shadow-xl`}
      >
        {/* Note Drawer Backdrop */}
        {isNoteDrawerOpen && (
          <div
            className="absolute inset-0 bg-black bg-opacity-50 z-[80]"
            onClick={() => setIsNoteDrawerOpen(false)}
          />
        )}
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-16 flex-shrink-0">
            <button
              onClick={isCheckoutMode ? handleBackToCart : handleClose}
              className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-colors shadow-sm"
            >
              <IoIosArrowBack className="h-5 w-5 text-gray-700" />
            </button>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isCheckoutMode ? "Checkout" : "My Cart"}
            </h2>

            <div className="flex items-center">
              {!isCheckoutMode && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {cart.length} {cart.length === 1 ? "Item" : "Items"}
                </span>
              )}
              {isCheckoutMode && (
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>
          </div>

          {/* Cart/Checkout Content */}
          <div className="flex flex-col flex-1 min-h-0">
            {!isCheckoutMode ? (
              /* Cart Items */
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {renderCartItems()}
              </div>
            ) : (
              /* Checkout Content */
              <div className="flex-1 overflow-y-auto py-4 scrollbar-hide bg-[#f5f5f7]">
                {renderCheckoutContent("mobile")}
              </div>
            )}
          </div>

          {/* Fixed Bottom Payment Section */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 pb-8 bg-white dark:bg-[#202028] flex-shrink-0 space-y-4 rounded-t-2xl">
              {!isCheckoutMode ? (
                <>
                  <div className="flex flex-col gap-4">
                    {/* Discount Code Section */}
                    <div className="relative">
                      <Input
                        placeholder="Enter Discount Code"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        className="w-full bg-gray-50 border-gray-200 rounded-full px-6 py-7 pr-20 focus:border-gray-200 focus:ring-0 focus:outline-none"
                      />
                      <Button
                        onClick={() => {
                          if (couponCode) {
                            setSelectedCoupon(couponCode);
                            setCouponCode("");
                          }
                        }}
                        disabled={!couponCode.trim()}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                          couponCode.trim()
                            ? "bg-primary hover:bg-primary/90 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Apply
                      </Button>
                    </div>

                    {/* Total Cost */}
                    <div className="flex justify-between items-center px-2">
                      <span className="text-black dark:text-white font-medium text-[16px]">
                        Total Cost
                      </span>
                      <span className="font-bold text-[18px] text-black dark:text-white">
                        ₹{subtotal.toFixed(0)}
                      </span>
                    </div>

                    {/* Check out Button */}
                    <Button
                      onClick={handleProceedToCheckout}
                      className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-full text-lg font-medium"
                    >
                      Check out
                    </Button>
                  </div>
                </>
              ) : (
                <Link href="/checkout/confirmation" onClick={handleClose}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-full text-lg font-medium">
                    Place Order • ₹{subtotal.toFixed(0)}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Cart Sidebar - Layout Integration */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:top-0 lg:right-0 lg:h-full bg-[#F4F4F7] dark:bg-[#202028] border-l border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 shadow-xl ${
          isOpen ? "lg:w-96" : "lg:w-0 lg:border-l-0"
        } overflow-hidden`}
      >
        <div
          className={`flex flex-col h-full ${
            isOpen ? "w-96" : "w-0"
          } overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-16 flex-shrink-0">
            <button
              onClick={isCheckoutMode ? handleBackToCart : handleClose}
              className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-colors shadow-sm"
            >
              <IoIosArrowBack className="h-5 w-5 text-gray-700" />
            </button>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isCheckoutMode ? "Checkout" : "My Cart"}
            </h2>

            <div className="flex items-center">
              {!isCheckoutMode && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {cart.length} {cart.length === 1 ? "Item" : "Items"}
                </span>
              )}
              {isCheckoutMode && (
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>
          </div>

          {/* Cart/Checkout Content */}
          <div className="flex flex-col flex-1 min-h-0">
            {!isCheckoutMode ? (
              /* Cart Items */
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {renderCartItems()}
              </div>
            ) : (
              /* Checkout Content */
              <div className="flex-1 overflow-y-auto py-4 scrollbar-hide bg-[#f5f5f7]">
                {renderCheckoutContent("desktop")}
              </div>
            )}
          </div>

          {/* Fixed Bottom Payment Section */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#202028] flex-shrink-0 space-y-4">
              {!isCheckoutMode ? (
                <>
                  {/* Discount Code Section */}
                  <div className="relative">
                    <Input
                      placeholder="Enter Discount Code"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      className="w-full bg-gray-50 border-gray-200 rounded-full px-6 py-7 pr-20 focus:border-gray-200 focus:ring-0 focus:outline-none"
                    />
                    <Button
                      onClick={() => {
                        if (couponCode) {
                          setSelectedCoupon(couponCode);
                          setCouponCode("");
                        }
                      }}
                      disabled={!couponCode.trim()}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                        couponCode.trim()
                          ? "bg-primary hover:bg-primary/90 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Apply
                    </Button>
                  </div>

                  {/* Total Cost */}
                  <div className="flex justify-between items-center">
                    <span className="text-black dark:text-white font-semibold text-lg">
                      Total Cost
                    </span>
                    <span className="font-bold text-xl text-black dark:text-white">
                      ₹{subtotal.toFixed(0)}
                    </span>
                  </div>

                  {/* Check out Button */}
                  <Button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-full text-lg font-medium"
                  >
                    Check out
                  </Button>
                </>
              ) : (
                <Link href="/checkout/confirmation" onClick={handleClose}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-full text-lg font-medium">
                    Place Order • ₹{subtotal.toFixed(0)}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
