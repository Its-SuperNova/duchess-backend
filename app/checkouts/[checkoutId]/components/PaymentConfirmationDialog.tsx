"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RazorpayGateway from "./RazorpayGateway";

interface PaymentConfirmationDialogProps {
  isOpen: boolean;
  paymentStatus: string;
  total: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  checkoutData?: any;
  selectedAddressId?: string | null;
  isFreeDelivery: boolean;
  cgstAmount: number;
  sgstAmount: number;
  taxSettings?: any;
  addressText: string;
  contactInfo: {
    name: string;
    phone: string;
  };
  selectedCoupon?: string | null;
  checkoutId: string;
  session?: any;
  isPaymentInProgress: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: () => void;
  onPaymentFailure: () => void;
  onPaymentClose: () => void;
  onModalOpening: () => void;
  onPaymentVerifying: () => void;
  onRetryPayment: () => void;
  onCancelPayment: () => void;
}

export default function PaymentConfirmationDialog({
  isOpen,
  paymentStatus,
  total,
  subtotal,
  discount,
  deliveryCharge,
  checkoutData,
  selectedAddressId,
  isFreeDelivery,
  cgstAmount,
  sgstAmount,
  taxSettings,
  addressText,
  contactInfo,
  selectedCoupon,
  checkoutId,
  session,
  isPaymentInProgress,
  onOpenChange,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentClose,
  onModalOpening,
  onPaymentVerifying,
  onRetryPayment,
  onCancelPayment,
}: PaymentConfirmationDialogProps) {
  const handleOpenChange = (open: boolean) => {
    // Only allow closing if payment is not in progress
    if (!open && paymentStatus !== "idle" && paymentStatus !== "failed") {
      return; // Prevent closing during payment process
    }
    onOpenChange(open);
  };

  return (
    <Dialog
      open={isOpen && paymentStatus !== "success"}
      onOpenChange={handleOpenChange}
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
                {paymentStatus === "opening" && "Opening Payment Gateway..."}
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
                  <span>CGST ({taxSettings?.cgst_rate}%):</span>
                  <span>₹{cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST ({taxSettings?.sgst_rate}%):</span>
                  <span>₹{sgstAmount.toFixed(2)}</span>
                </div>
                {/* Delivery Fee - Only show when address is selected */}
                {(selectedAddressId || checkoutData?.selectedAddressId) && (
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
            <RazorpayGateway
              amount={total}
              currency="INR"
              checkoutId={checkoutId}
              userDetails={{
                name: contactInfo.name,
                email: session?.user?.email || "guest@example.com",
                phone: contactInfo.phone,
              }}
              onSuccess={onPaymentSuccess}
              onFailure={onPaymentFailure}
              onClose={onPaymentClose}
              onModalOpening={onModalOpening}
              onPaymentVerifying={onPaymentVerifying}
              disabled={isPaymentInProgress}
              className="w-full"
              buttonText="Pay Now"
            />
          )}
          {paymentStatus === "failed" && (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={onRetryPayment}
                className="flex-1 rounded-[18px] h-[48px] text-[16px] font-medium"
              >
                Try Again
              </Button>
              <Button
                onClick={onCancelPayment}
                className="flex-1 bg-primary hover:bg-primary/90 rounded-[18px] h-[48px] text-[16px] font-medium"
              >
                Cancel
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
