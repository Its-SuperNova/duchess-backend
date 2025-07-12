"use client";

import { ArrowLeft, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RefundCancellationPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const goBack = () => {
    router.back();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-[20px] py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="max-w-none">
              {/* Header */}
              <div className="mb-8 sm:mb-10 lg:mb-12 pb-6 sm:pb-8 border-b border-gray-200">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Refund & Cancellation Policy
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                  Last updated: August 2025
                </p>
              </div>

              {/* Introduction */}
              <div className="mb-8 sm:mb-10">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  This Refund & Cancellation Policy ("Policy") applies to all
                  orders placed through DuchessPastry.com (including its
                  Progressive Web App). By placing an order with Duchess
                  Pastry, you acknowledge and agree to the terms below.
                </p>
              </div>

              <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                {/* No Cancellations or Refunds */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    1. No Cancellations or Refunds
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Final Sale
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Once an order is placed and payment is successfully
                        processed via Razorpay, the sale is final.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        No Cancellations
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Customers may not cancel orders after payment is
                        completed. Any request to cancel will be declined.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        No Refunds
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        We do not issue partial or full refunds for any
                        reason, including but not limited to:
                      </p>
                      <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 ml-4 mt-2 text-sm sm:text-base">
                        <li>Change of mind</li>
                        <li>
                          Incorrect delivery address provided by the customer
                        </li>
                        <li>Late delivery</li>
                        <li>Order preparation issues</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Order Modifications */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    2. Order Modifications
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Before Payment
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        You may modify or cancel your cart contents freely
                        until you complete payment.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        After Payment
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        No modifications to products, quantities, delivery
                        time, or delivery address will be accepted once
                        payment is processed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Defective, Damaged, or Incorrect Items */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    3. Defective, Damaged, or Incorrect Items
                  </h2>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    While we do not offer refunds, we stand behind the quality
                    of our products. If your order arrives:
                  </p>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 ml-4 mb-3 sm:mb-4 text-sm sm:text-base">
                    <li>Damaged, defective, or significantly spoiled, or</li>
                    <li>
                      Containing items missing or incorrect compared to your
                      order confirmation
                    </li>
                  </ul>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    please follow these steps within 2 hours of delivery:
                  </p>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Photographic Proof
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Take clear photos of the issue (e.g., broken
                        packaging, incorrect item).
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Contact Support
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Email{" "}
                        <a
                          href="mailto:hello@duchesspastry.com"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          hello@duchesspastry.com
                        </a>{" "}
                        with your order number, description of the issue, and
                        attachments.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Evaluation & Resolution
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        We will review your submission and, at our sole
                        discretion, may offer one of the following remedies:
                      </p>
                      <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 ml-4 mt-2 text-sm sm:text-base">
                        <li>
                          Replacement of the affected item(s) at no extra cost
                          within next 24 hours, or
                        </li>
                        <li>Store Credit valid for future orders</li>
                      </ul>
                      <p className="text-gray-700 mt-2 text-sm sm:text-base">
                        Any replacement or store credit is issued solely at
                        Duchess Pastry's discretion and does not constitute a
                        monetary refund.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery Failures */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    4. Delivery Failures
                  </h2>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    If a delivery attempt fails due to reasons within our
                    control (e.g., rider unable to locate the address,
                    packaging error):
                  </p>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 ml-4 mb-3 sm:mb-4 text-sm sm:text-base">
                    <li>
                      We will make one additional delivery attempt at no extra
                      charge.
                    </li>
                    <li>
                      If the second attempt also fails, the order is
                      considered delivered, and no refunds or further attempts
                      will be provided.
                    </li>
                  </ul>
                  <p className="text-gray-700 text-sm sm:text-base">
                    If the failure is due to reasons outside our control
                    (e.g., customer unavailable, incorrect address),
                    additional delivery attempts may incur extra delivery fees
                    charged to the customer.
                  </p>
                </div>

                {/* Chargebacks & Payment Disputes */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    5. Chargebacks & Payment Disputes
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Unjustified Chargebacks
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Any chargebacks or payment disputes initiated without
                        valid cause may lead to suspension of your account.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Dispute Resolution
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        If you believe a payment has been processed in error,
                        please contact us immediately at{" "}
                        <a
                          href="mailto:hello@duchesspastry.com"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          hello@duchesspastry.com
                        </a>{" "}
                        before initiating a chargeback. We will work with
                        Razorpay to investigate and resolve the issue.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Changes to This Policy */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    6. Changes to This Policy
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base">
                    We may update this Policy at any time. The "Last updated"
                    date at the top will reflect the most recent revision.
                    Continued use of our Service after any changes constitutes
                    acceptance of the new Policy.
                  </p>
                </div>

                {/* Contact Us */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    7. Contact Us
                  </h2>
                  <p className="text-gray-700 mb-4 text-sm sm:text-base">
                    For questions about this Policy or to report an issue,
                    please email{" "}
                    <a
                      href="mailto:hello@duchesspastry.com"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      hello@duchesspastry.com
                    </a>{" "}
                    or write to:
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                    <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                      <p>
                        <strong>Address:</strong> Duchess Pastry, 7/68 62-B
                        Vijayalakshmi Nagar, Sivasakthi Gardens, Keeranatham,
                        Saravanampatti, Coimbatore – 641035.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Closing */}
                <div className="text-center pt-6 sm:pt-8 border-t border-gray-200">
                  <p className="text-base sm:text-lg text-gray-700 font-medium">
                    Thank you for understanding our policy. We strive to
                    maintain the highest quality standards and appreciate your
                    trust in Duchess Pastry.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleSidebar}
              className="fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
          )}

          {/* Sidebar Navigation */}
          <div
            className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:shadow-none lg:z-auto ${
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            } lg:translate-x-0`}
          >
            <div className="p-4 sm:p-6">
              <div className="lg:hidden flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Legal Policies</h3>
                <button
                  onClick={toggleSidebar}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <h3 className="hidden lg:block font-semibold text-gray-900 mb-4">
                Legal Policies
              </h3>
              <nav className="space-y-2">
                <a
                  href="/legal/privacy-policy"
                  className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="/legal/terms-conditions"
                  className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Terms & Conditions
                </a>
                <a
                  href="/legal/refund-cancellation"
                  className="block px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md font-medium"
                >
                  Refund & Cancellation
                </a>
                <a
                  href="/legal/shipping-delivery"
                  className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Shipping & Delivery
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
