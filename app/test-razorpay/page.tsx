import ExampleCheckout from "@/components/ExampleCheckout";

export default function TestRazorpayPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Razorpay Integration Test
            </h1>
            <p className="text-gray-600">
              Test the complete Razorpay payment flow for Duchess Pastry
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <ExampleCheckout />
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Test Instructions
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <h3 className="font-medium text-green-600">
                      ✅ Success Test
                    </h3>
                    <p>
                      Use card: <code>4111 1111 1111 1111</code>
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-red-600">
                      ❌ Failure Test
                    </h3>
                    <p>
                      Use card: <code>4000 0000 0000 0002</code>
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-600">
                      📝 Test Details
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>CVV: Any 3 digits (e.g., 123)</li>
                      <li>Expiry: Any future date (e.g., 12/25)</li>
                      <li>Name: Any name</li>
                      <li>3D Secure OTP: 123456</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">What to Check</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>Payment popup opens correctly</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>Order created in database</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>Payment verification works</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>Success/failure messages show</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>Order status updates correctly</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
                <div className="space-y-2 text-sm font-mono">
                  <div>
                    <span className="text-green-600">POST</span>{" "}
                    /api/razorpay/create-order
                  </div>
                  <div>
                    <span className="text-green-600">POST</span>{" "}
                    /api/razorpay/verify-payment
                  </div>
                  <div>
                    <span className="text-green-600">POST</span>{" "}
                    /api/razorpay/webhook
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
