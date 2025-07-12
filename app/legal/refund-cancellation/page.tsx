"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RefundCancellationPage() {
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
                    Refund & Cancellation Policy
                  </h1>
                  <p className="text-lg text-gray-600">
                    Last updated: August 2025
                  </p>
                </div>

                {/* Introduction */}
                <div className="mb-10">
                  <p className="text-gray-700 leading-relaxed">
                    This Refund & Cancellation Policy ("Policy") applies to all
                    orders placed through DuchessPastry.com (including its
                    Progressive Web App). By placing an order with Duchess
                    Pastry, you acknowledge and agree to the terms below.
                  </p>
                </div>

                {/* No Cancellations or Refunds */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    1. No Cancellations or Refunds
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      <strong>Final Sale.</strong> Once an order is placed and
                      payment is successfully processed via Razorpay, the sale
                      is final.
                    </p>
                    <p>
                      <strong>No Cancellations.</strong> Customers may not
                      cancel orders after payment is completed. Any request to
                      cancel will be declined.
                    </p>
                    <div>
                      <p className="mb-2">
                        <strong>No Refunds.</strong> We do not issue partial or
                        full refunds for any reason, including but not limited
                        to:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
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
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    2. Order Modifications
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <p>
                      <strong>Before Payment.</strong> You may modify or cancel
                      your cart contents freely until you complete payment.
                    </p>
                    <p>
                      <strong>After Payment.</strong> No modifications to
                      products, quantities, delivery time, or delivery address
                      will be accepted once payment is processed.
                    </p>
                  </div>
                </div>

                {/* Defective, Damaged, or Incorrect Items */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    3. Defective, Damaged, or Incorrect Items
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      While we do not offer refunds, we stand behind the quality
                      of our products. If your order arrives:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
                      <li>Damaged, defective, or significantly spoiled, or</li>
                      <li>
                        Containing items missing or incorrect compared to your
                        order confirmation,
                      </li>
                    </ul>
                    <p className="mb-4">
                      please follow these steps within 2 hours of delivery:
                    </p>
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          Photographic Proof:
                        </h3>
                        <p>
                          Take clear photos of the issue (e.g., broken
                          packaging, incorrect item).
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          Contact Support:
                        </h3>
                        <p>
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
                          Evaluation & Resolution:
                        </h3>
                        <p>
                          We will review your submission and, at our sole
                          discretion, may offer one of the following remedies:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                          <li>
                            Replacement of the affected item(s) at no extra cost
                            within next 24 hours, or
                          </li>
                          <li>Store Credit valid for future orders</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-sm bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      Any replacement or store credit is issued solely at
                      Duchess Pastry's discretion and does not constitute a
                      monetary refund.
                    </p>
                  </div>
                </div>

                {/* Delivery Failures */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    4. Delivery Failures
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      If a delivery attempt fails due to reasons within our
                      control (e.g., rider unable to locate the address,
                      packaging error):
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
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
                    <p>
                      If the failure is due to reasons outside our control
                      (e.g., customer unavailable, incorrect address),
                      additional delivery attempts may incur extra delivery fees
                      charged to the customer.
                    </p>
                  </div>
                </div>

                {/* Chargebacks & Payment Disputes */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    5. Chargebacks & Payment Disputes
                  </h2>
                  <div className="space-y-4 text-gray-700">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Unjustified Chargebacks:
                      </h3>
                      <p>
                        Any chargebacks or payment disputes initiated without
                        valid cause may lead to suspension of your account.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Dispute Resolution:
                      </h3>
                      <p>
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
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    6. Changes to This Policy
                  </h2>
                  <p className="text-gray-700">
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
                  <p className="text-gray-700 mb-4">
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="space-y-2 text-gray-700">
                      <p>
                        <strong>Address:</strong> Duchess Pastry, 7/68 62-B
                        Vijayalakshmi Nagar, Sivasakthi Gardens, Keeranatham,
                        Saravanampatti, Coimbatore – 641035.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Closing */}
                <div className="text-center pt-8 border-t border-gray-200">
                  <p className="text-lg text-gray-700 font-medium">
                    Thank you for understanding our policy. We strive to
                    maintain the highest quality standards and appreciate your
                    trust in Duchess Pastry.
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
