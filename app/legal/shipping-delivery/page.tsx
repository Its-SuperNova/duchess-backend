"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ShippingDeliveryPage() {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 p-8 lg:p-12">
              <div className="max-w-none">
                {/* Header */}
                <div className="mb-12 pb-8 border-b border-gray-200">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Shipping & Delivery Policy
                  </h1>
                  <p className="text-lg text-gray-600">
                    Last updated: August 2025
                  </p>
                </div>

                {/* Introduction */}
                <div className="mb-10">
                  <p className="text-gray-700 leading-relaxed">
                    This Shipping & Delivery Policy ("Policy") governs how
                    Duchess Pastry processes, ships, and delivers orders placed
                    via our website (DuchessPastry.com), Progressive Web App, or
                    by phone. By placing an order with Duchess Pastry, you agree
                    to the terms below.
                  </p>
                </div>

                {/* Order Channels */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    1. Order Channels
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <p>We accept orders through:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        <strong>Online</strong> – via our website or PWA
                        checkout flow.
                      </li>
                      <li>
                        <strong>On-Call</strong> – by telephone at
                        +91-9080022593 during our operating hours (9 AM to 8 PM
                        IST, Monday–Sunday).
                      </li>
                    </ul>
                    <p>
                      All policies below apply equally to both online and
                      on-call orders.
                    </p>
                  </div>
                </div>

                {/* Service Area & Zones */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    2. Service Area & Zones
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We currently deliver within Coimbatore city limits, covering
                    the following zones:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                            Zone
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                            Distance Range
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                            Delivery Fee (₹)
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                            Estimated ETA (minutes)
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                            Ideal Areas Covered
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            Zone A
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            0–10 km
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            ₹70–₹100
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            20–30 mins
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            Peelamedu, Kalapatti, Vilankurichi, Ganapathy
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            Zone B
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            10–20 km
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            ₹120–₹150
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            30–45 mins
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            RS Puram, Gandhipuram, Saibaba Colony
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            Zone C
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            20–40 km
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            ₹200–₹300
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            45–75 mins
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            Singanallur, Podanur, Periyanaickenpalayam
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            Zone D
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            40–60 km
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            ₹350–₹500
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            75–120 mins
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            Pollachi Road end, Mettupalayam, Sulur, Karamadai
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-gray-700 mt-4">
                    Orders outside these zones will be declined at checkout
                    (online) or by our support team (on-call).
                  </p>
                </div>

                {/* Order Processing */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    3. Order Processing
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Order Confirmation:
                      </h3>
                      <p>
                        Upon placing your order (online or on-call), you will
                        receive an order number and summary via email and SMS
                        (if a mobile number is provided).
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Preparation Time:
                      </h3>
                      <p>
                        Typical kitchen prep time is 30 - 60 minutes, depending
                        on order size.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Status Updates:
                      </h3>
                      <p>
                        You can track your order's progress in your account
                        under "My Orders," which displays each stage:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
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
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    4. Delivery Estimates
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <p>
                      <strong>Online Checkout:</strong> Estimated delivery
                      window appears before payment.
                    </p>
                    <p>
                      <strong>On-Call Orders:</strong> Our representative will
                      provide an ETA when confirming your order.
                    </p>
                    <p>
                      <strong>Variability:</strong> Times are estimates only and
                      may vary due to traffic, weather, or high order volumes.
                    </p>
                  </div>
                </div>

                {/* Delivery Fees & Minimums */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    5. Delivery Fees & Minimums
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <p>
                      <strong>Delivery Fee:</strong> As per your zone (see
                      Section 2).
                    </p>
                    <p>
                      <strong>Minimum Order Value:</strong> ₹150 per order.
                      Orders below this amount will incur a ₹50 small-order
                      surcharge.
                    </p>
                  </div>
                </div>

                {/* Failed or Missed Deliveries */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    6. Failed or Missed Deliveries
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Customer Unreachable:
                      </h3>
                      <p>
                        If the delivery partner cannot reach you, we will call
                        or SMS.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Re-Delivery Attempt:
                      </h3>
                      <p>
                        We will make one additional attempt at no extra charge
                        if the issue is our error (e.g., rider misroute).
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Customer Error:
                      </h3>
                      <p>
                        If none of the contact methods succeed due to customer
                        unavailability or incorrect address, the order is
                        considered delivered. No refunds or re-deliveries will
                        be provided.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Special Instructions & Accessibility */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    7. Special Instructions & Accessibility
                  </h2>
                  <div className="space-y-3 text-gray-700">
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
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    8. COVID-19 & Health Precautions
                  </h2>
                  <div className="space-y-3 text-gray-700">
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
                  <p className="text-gray-700 mb-4">
                    For any delivery issues, ETA inquiries, or special requests,
                    please contact:
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="space-y-2 text-gray-700">
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
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    10. Changes to This Policy
                  </h2>
                  <p className="text-gray-700">
                    We may update this Policy from time to time. The "Last
                    updated" date reflects the most recent changes. Continued
                    use of our Service after updates constitutes acceptance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Navigation */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="rounded-lg border border-gray-200 p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">
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
