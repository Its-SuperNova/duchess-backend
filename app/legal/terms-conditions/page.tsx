"use client";

import { ArrowLeft, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TermsConditionsPage() {
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
                  Terms & Conditions for Duchess Pastry
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                  Last updated: August 2025
                </p>
              </div>

              {/* Introduction */}
              <div className="mb-8 sm:mb-10">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  Welcome to DuchessPastry.com ("Service"), operated by
                  Gopalakrishnan Chithrakala (doing business as Duchess Pastry).
                  By accessing or using our Service, you agree to be bound by
                  these Terms & Conditions ("Terms"). If you do not agree,
                  please do not use the Service.
                </p>
              </div>

              <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                {/* Definitions */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    1. Definitions
                  </h2>
                  <div className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
                    <p>
                      <strong>"Customer," "you," "your"</strong> refers to
                      anyone using our Service to browse or order pastries.
                    </p>
                    <p>
                      <strong>"We," "us," "our"</strong> refers to Duchess
                      Pastry.
                    </p>
                    <p>
                      <strong>"Order"</strong> means the request you submit via
                      our website for purchase and delivery of pastries.
                    </p>
                  </div>
                </div>

                {/* Acceptance of Terms */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    2. Acceptance of Terms
                  </h2>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    By placing an Order or accessing any part of the Service,
                    you affirm that you:
                  </p>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 ml-4 text-sm sm:text-base">
                    <li>Are at least 18 years old.</li>
                    <li>
                      Have the legal capacity to enter into a binding contract.
                    </li>
                    <li>Agree to these Terms and our Privacy Policy.</li>
                  </ul>
                </div>

                {/* Account Registration */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    3. Account Registration
                  </h2>
                  <ul className="list-disc list-inside space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
                    <li>
                      To place an Order, you must create an account or sign in
                      via Google OAuth.
                    </li>
                    <li>
                      You are responsible for maintaining the confidentiality of
                      your login credentials and for all activities under your
                      account.
                    </li>
                    <li>
                      Notify us immediately of any unauthorized use or security
                      breach.
                    </li>
                  </ul>
                </div>

                {/* Ordering & Payment */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    4. Ordering & Payment
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Order Submission:
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        All Orders are subject to product availability and
                        acceptance by us. We reserve the right to refuse or
                        cancel any Order prior to payment.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Payment Processing:
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        We process payments exclusively via Razorpay. Payment
                        must be made in full at the time of Order placement.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Pricing & Fees:
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        On order, prices will be updated with applicable taxes.
                        Delivery fees may apply and will be displayed in the
                        checkout flow.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Promotions & Coupons:
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Coupon codes are subject to their own terms (expiry,
                        one-time use, first-order only, etc.). We may modify or
                        discontinue promotions at any time.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    5. Delivery
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Delivery Windows:
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Estimated delivery times are provided at checkout but
                        are not guaranteed.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Order Status & Step-Tracking:
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        Once your Order is placed, you can view its status in
                        defined stages (e.g., Received, Preparing, Out for
                        Delivery, Delivered) via your account, no live-map
                        interface is provided.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Failed Deliveries:
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base">
                        If we cannot reach the delivery address, we will contact
                        you. Additional delivery fees may apply for re-delivery.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cancellations & Refunds */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    6. Cancellations & Refunds
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base">
                    <strong>No Cancellations or Refunds:</strong> Once you place
                    an Order and complete payment via Razorpay, the Order is
                    final. We do not accept cancellations or issue refunds under
                    any circumstances.
                  </p>
                </div>

                {/* Intellectual Property */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    7. Intellectual Property
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base">
                    All content on the Service—logos, text, graphics, images,
                    and software—is our property or that of our licensors and is
                    protected by copyright, trademark, and other laws. You may
                    not reproduce, modify, distribute, or create derivative
                    works without our prior written consent.
                  </p>
                </div>

                {/* User Conduct */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    8. User Conduct
                  </h2>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    When using the Service, you agree not to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 ml-4 text-sm sm:text-base">
                    <li>Violate any applicable law or regulation.</li>
                    <li>
                      Impersonate any person or entity or falsely state your
                      affiliation.
                    </li>
                    <li>Use the Service to transmit harmful code or spam.</li>
                    <li>
                      Interfere with or disrupt the security or performance of
                      the Service.
                    </li>
                  </ul>
                </div>

                {/* Disclaimers & Limitation of Liability */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    9. Disclaimers & Limitation of Liability
                  </h2>
                  <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        "As Is" Service:
                      </h3>
                      <p>
                        We provide the Service on an "as is" and "as available"
                        basis without warranties of any kind.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        No Guarantee:
                      </h3>
                      <p>
                        We do not guarantee uninterrupted or error-free
                        operation.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Limitation of Liability:
                      </h3>
                      <p>
                        To the fullest extent permitted under applicable law,
                        Duchess Pastry and its affiliates shall not be liable
                        for any indirect, incidental, special, or consequential
                        damages arising out of or in connection with your use of
                        the Service.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Indemnification */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    10. Indemnification
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base">
                    You agree to indemnify, defend, and hold harmless Duchess
                    Pastry and its officers, directors, employees, and agents
                    from any claims, liabilities, losses, damages, costs, or
                    expenses (including reasonable attorneys' fees) arising from
                    your breach of these Terms or your use of the Service.
                  </p>
                </div>

                {/* Termination */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    11. Termination
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base">
                    We may suspend or terminate your access to the Service at
                    any time, with or without cause or notice. All provisions
                    that by their nature should survive termination will remain
                    in effect (e.g., intellectual property, disclaimers,
                    indemnification, limitation of liability).
                  </p>
                </div>

                {/* Governing Law & Dispute Resolution */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    12. Governing Law & Dispute Resolution
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base">
                    These Terms are governed by the laws of India. Any disputes
                    arising under or in connection with these Terms shall be
                    submitted to the exclusive jurisdiction of the courts in
                    Coimbatore, Tamil Nadu.
                  </p>
                </div>

                {/* Changes to Terms */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    13. Changes to Terms
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base">
                    We may update these Terms from time to time. We'll post the
                    new "Last updated" date here and, if changes are material,
                    notify you via email or in-app notification. Continued use
                    of the Service after changes constitutes your acceptance.
                  </p>
                </div>

                {/* Contact Us */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    14. Contact Us
                  </h2>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    For questions about these Terms, please contact:
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
                      <div>
                        <p className="font-medium">Address:</p>
                        <p className="ml-4 mt-2">
                          Duchess Pastry, 7/68 62-B Vijayalakshmi Nagar,
                          Sivasakthi Gardens, Keeranatham, Saravanampatti,
                          Coimbatore – 641035.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Closing */}
                <div className="text-center pt-6 sm:pt-8 border-t border-gray-200">
                  <p className="text-base sm:text-lg text-gray-700 font-medium">
                    Thank you for choosing Duchess Pastry!
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
                  className="block px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md font-medium"
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
