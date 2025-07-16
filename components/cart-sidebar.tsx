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
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
  const subtotal = getSubtotal();

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
            {/* Customization details */}
            {(item.addTextOnCake ||
              item.addCandles ||
              item.addKnife ||
              item.addMessageCard) && (
              <div className="mt-2 space-y-1">
                <div className="flex flex-wrap gap-1">
                  {item.addTextOnCake && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Text on Cake
                    </span>
                  )}
                  {item.addCandles && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      Candles
                    </span>
                  )}
                  {item.addKnife && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Knife
                    </span>
                  )}
                  {item.addMessageCard && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Message Card
                    </span>
                  )}
                </div>
                {item.cakeText && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Cake text: "{item.cakeText}"
                  </p>
                )}
                {item.giftCardText && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Gift card: "{item.giftCardText}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quantity controls */}
          <div className="flex items-center ml-2 flex-shrink-0">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
              style={{ backgroundColor: "#f5f5f5", color: "#6b7585" }}
              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="mx-3 text-gray-900 dark:text-white font-medium">
              {item.quantity}
            </span>
            <button
              className="w-8 h-8 flex items-center justify-center text-white bg-primary rounded-full hover:bg-primary/90"
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
            onClick={handleClose}
            className="bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/90"
          >
            Continue Shopping
          </Button>
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
              key={item.id}
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
                  {/* Customization details in checkout */}
                  {(item.addTextOnCake ||
                    item.addCandles ||
                    item.addKnife ||
                    item.addMessageCard) && (
                    <div className="mt-1">
                      <div className="flex flex-wrap gap-1">
                        {item.addTextOnCake && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Text
                          </span>
                        )}
                        {item.addCandles && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            Candles
                          </span>
                        )}
                        {item.addKnife && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Knife
                          </span>
                        )}
                        {item.addMessageCard && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Card
                          </span>
                        )}
                      </div>
                      {(item.cakeText || item.giftCardText) && (
                        <div className="mt-1 space-y-0.5">
                          {item.cakeText && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Cake: "{item.cakeText}"
                            </p>
                          )}
                          {item.giftCardText && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Card: "{item.giftCardText}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
          <Drawer modal={false}>
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

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
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
        className={`lg:hidden fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-[#202028] z-[70] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } shadow-xl`}
      >
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center">
              {isCheckoutMode && (
                <button
                  onClick={handleBackToCart}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors mr-2"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              )}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isCheckoutMode ? "Checkout" : "My Cart"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              {!isCheckoutMode && (
                <span
                  className="text-sm px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#f5f5f5", color: "#6b7585" }}
                >
                  {cart.length} {cart.length === 1 ? "item" : "items"}
                </span>
              )}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Cart/Checkout Content */}
          <div className="flex flex-col flex-1 min-h-0 mb-2">
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

            {/* Bottom Payment Section */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#202028] flex-shrink-0">
                {!isCheckoutMode ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        Subtotal
                      </span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">
                        ₹{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      onClick={handleProceedToCheckout}
                      className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-full"
                    >
                      Proceed to Checkout
                    </Button>
                  </>
                ) : (
                  <Link href="/checkout/confirmation" onClick={handleClose}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-full">
                      Place Order • ₹{total.toFixed(2)}
                    </Button>
                  </Link>
                )}
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
            <div className="flex items-center">
              {isCheckoutMode && (
                <button
                  onClick={handleBackToCart}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors mr-2"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              )}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isCheckoutMode ? "Checkout" : "My Cart"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              {!isCheckoutMode && (
                <span
                  className="text-sm px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#f5f5f5", color: "#6b7585" }}
                >
                  {cart.length} {cart.length === 1 ? "item" : "items"}
                </span>
              )}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
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

            {/* Bottom Payment Section */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#202028] flex-shrink-0">
                {!isCheckoutMode ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        Subtotal
                      </span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">
                        ₹{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      onClick={handleProceedToCheckout}
                      className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-full"
                    >
                      Proceed to Checkout
                    </Button>
                  </>
                ) : (
                  <Link href="/checkout/confirmation" onClick={handleClose}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-full">
                      Place Order • ₹{total.toFixed(2)}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
