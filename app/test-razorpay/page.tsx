"use client";

import RazorpayButton from "@/components/RazorpayButton";

export default function TestRazorpayPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          Test Razorpay Integration
        </h1>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Test Payment Amount</p>
            <p className="text-3xl font-bold text-green-600">₹500.00</p>
          </div>

          <div className="border-t pt-4">
            <RazorpayButton
              amount={500}
              currency="INR"
              userDetails={{
                name: "Test User",
                email: "test@example.com",
                phone: "9876543210",
              }}
              onSuccess={(paymentData) => {
                console.log("Payment successful:", paymentData);
                alert("Payment successful! Check console for details.");
              }}
              onFailure={(error) => {
                console.error("Payment failed:", error);
                alert("Payment failed! Check console for details.");
              }}
              className="w-full"
            />
          </div>

          <div className="text-xs text-gray-500 text-center mt-4">
            <p>This is a test page for Razorpay integration.</p>
            <p>Make sure to add your Razorpay keys to .env.local</p>
          </div>
        </div>
      </div>
    </div>
  );
}



















