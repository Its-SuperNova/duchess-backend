"use client";

import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ShippingDeliveryPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const goBack = () => {
    router.back();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none; /* Internet Explorer 10+ */
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>
      {/* Content */}
      <div className="w-full">
        <div className="lg:max-w-[1200px] lg:mx-auto lg:flex lg:gap-8">
          {/* Main Content */}
          <div className="flex-1 px-[20px] py-8 lg:px-0 min-w-0">
            <div className="max-w-none">
              {/* Header */}
              <div className="mb-8 sm:mb-10 lg:mb-12 pb-6 sm:pb-8 border-b border-gray-200">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Shipping & Delivery Policy
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                  Last updated: August 2025
                </p>
              </div>

              {/* Introduction */}
              <div className="mb-8 sm:mb-10">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  This Shipping & Delivery Policy ("Policy") governs how Duchess
                  Pastry processes, ships, and delivers orders placed via our
                  website (DuchessPastry.com), Progressive Web App, or by phone.
                  By placing an order with Duchess Pastry, you agree to the
                  terms below.
                </p>
              </div>

              <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                {/* Order Channels */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    1. Order Channels
                  </h2>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    We accept orders through:
                  </p>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 ml-4 text-sm sm:text-base">
                    <li>
                      <strong>Online</strong> – via our website or PWA checkout
                      flow.
                    </li>
                    <li>
                      <strong>On-Call</strong> – by telephone at
                      +91-[9080022593] during our operating hours (9 AM to 8 PM
                      IST, Monday–Sunday).
                    </li>
                  </ul>
                  <p className="text-gray-700 text-sm sm:text-base">
                    All policies below apply equally to both online and on-call
                    orders.
                  </p>
                </div>

                {/* Service Area & Zones */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    2. Service Area & Zones
                  </h2>
                  <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm scrollbar-hide mb-4">
                    {/* Mobile scroll hint */}
                    <div className="sm:hidden text-xs text-gray-500 p-2 bg-gray-50 border-b border-gray-200">
                      ← Scroll horizontally to view all columns →
                    </div>
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            Zone
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            Distance Range
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            Delivery Fee (&#8377;)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                            Estimated ETA (minutes)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Zone A
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            0–5 km
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            &#8377;40
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            20–30 mins
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Zone B
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            5–10 km
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            &#8377;60
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            25–35 mins
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Zone C
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            10–15 km
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            &#8377;80
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            30–40 mins
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Zone D
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            15–20 km
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            &#8377;100
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            35–50 mins
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Zone E
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            20–25 km
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            &#8377;130
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            40–60 mins
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Zone F
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            25–30 km
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            &#8377;160
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            50–70 mins
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Zone G
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            30–35 km
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            &#8377;200
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            60–80 mins
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Zone H
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            35–40 km
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            &#8377;240
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            70–90 mins
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Zone I
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            40–45 km
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            &#8377;280
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            80–100 mins
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Zone J
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            45–50 km
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            &#8377;320
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            90–120 mins
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-gray-700 mt-3 sm:mt-4 text-sm sm:text-base">
                    Orders beyond 50 km will be declined at checkout (online) or
                    by our support team (on-call).
                  </p>
                </div>

                {/* Order Processing */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    3. Order Processing
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Order Confirmation
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Upon placing your order (online or on-call), you will
                        receive an order number and summary via email and SMS
                        (if a mobile number is provided).
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Preparation Time
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Typical kitchen prep time is 30 - 60 minutes, depending
                        on order size.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Status Updates
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        You can track your order's progress in your account
                        under "My Orders," which displays each stage:
                      </p>
                      <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 ml-4 mt-2 text-sm sm:text-base">
                        <li>
                          <strong>Received</strong> – We have your order and are
                          preparing your items.
                        </li>
                        <li>
                          <strong>Preparing</strong> – Kitchen is assembling and
                          baking your pastries.
                        </li>
                        <li>
                          <strong>Dispatched</strong> – Order has left our
                          kitchen and is with the delivery partner.
                        </li>
                        <li>
                          <strong>Delivered</strong> – Order has arrived at the
                          delivery address.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Delivery Estimates */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    4. Delivery Estimates
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Online Checkout
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Estimated delivery window appears before payment.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        On-Call Orders
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Our representative will provide an ETA when confirming
                        your order.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Variability
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Times are estimates only and may vary due to traffic,
                        weather, or high order volumes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery Fees & Minimums */}
                <div id="delivery-fees">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    5. Delivery Fees & Minimums
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Delivery Fee
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        As per your zone (see Section 2).
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Minimum Order Value
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        &#8377;150 per order. Orders below this amount will
                        incur a &#8377;50 small-order surcharge.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Failed or Missed Deliveries */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    6. Failed or Missed Deliveries
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Customer Unreachable
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        If the delivery partner cannot reach you, we will call
                        or SMS.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Re-Delivery Attempt
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        We will make one additional attempt at no extra charge
                        if the issue is our error (e.g., rider misroute).
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Customer Error
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        If none of the contact methods succeed due to customer
                        unavailability or incorrect address, the order is
                        considered delivered. No refunds or re-deliveries will
                        be provided.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Special Instructions & Accessibility */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    7. Special Instructions & Accessibility
                  </h2>
                  <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                    <p>
                      You may add delivery notes (e.g., "Call on arrival,"
                      "Leave at gate") during online checkout or share them with
                      our agent for on-call orders.
                    </p>
                    <p>
                      Please ensure someone is available to receive the order.
                      Deliveries are handed off in a contact-free or
                      face-to-face manner, per your preference.
                    </p>
                  </div>
                </div>

                {/* COVID-19 & Health Precautions */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    8. COVID-19 & Health Precautions
                  </h2>
                  <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                    <p>
                      All delivery partners follow strict hygiene protocols,
                      including mask use, hand sanitization, and contact-free
                      drop-offs if requested.
                    </p>
                    <p>
                      You may specify "Contact-Free Delivery" in your order
                      notes or to our support agent.
                    </p>
                  </div>
                </div>

                {/* Questions & Support */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    9. Questions & Support
                  </h2>
                  <p className="text-gray-700 mb-4 text-sm sm:text-base">
                    For any delivery issues, ETA inquiries, or special requests,
                    please contact:
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                    <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                      <p>
                        <strong>Email:</strong>{" "}
                        <a
                          href="mailto:hello@duchesspastry.com"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          hello@duchesspastry.com
                        </a>
                      </p>
                      <p>
                        <strong>Phone:</strong> +91-9080022593 (9 AM – 8 PM IST,
                        Mon – Sun)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Changes to This Policy */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    10. Changes to This Policy
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base">
                    We may update this Policy from time to time. The "Last
                    updated" date reflects the most recent changes. Continued
                    use of our Service after updates constitutes acceptance.
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
            className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:shadow-none lg:z-auto lg:w-80 lg:flex-shrink-0 ${
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
                  className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Refund & Cancellation
                </a>
                <a
                  href="/legal/shipping-delivery"
                  className="block px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md font-medium"
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
