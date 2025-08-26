"use client";

import { ArrowLeft, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PrivacyPolicyPage() {
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
                  Privacy Policy for Duchess Pastry
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                  Last updated: August 2025
                </p>
              </div>

              {/* Introduction */}
              <div className="mb-8 sm:mb-10">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  At Duchess Pastries, we are committed to protecting your
                  privacy and ensuring the security of your personal
                  information. This Privacy Policy explains how we collect, use,
                  and safeguard your data when you visit our website or use our
                  services.
                </p>
              </div>

              <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                {/* Data Controller */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    1. Data Controller
                  </h2>
                  <div className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
                    <p>
                      <strong>Legal Entity:</strong> Gopalakrishnan Chithrakala,
                      doing business as Duchess Pastry
                    </p>
                    <p>
                      <strong>Address:</strong> 7/68 62-B Vijayalakshmi Nagar,
                      Sivasakthi Gardens, Keeranatham, Saravanampatti,
                      Coimbatore, Tamil Nadu, 641035
                    </p>
                    <p>
                      <strong>Contact for privacy inquiries:</strong>{" "}
                      hello@duchesspastry.com
                    </p>
                  </div>
                </div>

                {/* Personal Data We Collect */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    2. Personal Data We Collect
                  </h2>
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2 sm:mb-3">
                        Account & Profile Data
                      </h3>
                      <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 ml-4 text-sm sm:text-base">
                        <li>
                          Name, email address, phone number, date of birth,
                          profile image
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2 sm:mb-3">
                        Order & Delivery Data
                      </h3>
                      <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 ml-4 text-sm sm:text-base">
                        <li>
                          Delivery address, alternate phone, payment information
                          (tokenized), order history
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2 sm:mb-3">
                        Technical & Usage Data
                      </h3>
                      <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 ml-4 text-sm sm:text-base">
                        <li>
                          IP address, device/browser information, geolocation
                          (for mapping & tracking), cookies and similar
                          technologies
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Why We Collect It & Legal Basis */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    3. Why We Collect It & Legal Basis
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg text-xs sm:text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-900 border-b border-gray-200">
                            Data Category
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-900 border-b border-gray-200">
                            Purpose
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-900 border-b border-gray-200">
                            Legal Basis
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700">
                            Account & Profile Data
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700">
                            Create and manage your account
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700">
                            Performance of contract; Consent
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700">
                            Order & Delivery Data
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700">
                            Process & fulfill orders, payment, delivery
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700">
                            Performance of contract
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700">
                            Technical & Usage Data
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700">
                            Optimize Service, security, fraud prevention
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700">
                            Legitimate interests; Consent (cookies)
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* How We Share Your Data */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    4. How We Share Your Data
                  </h2>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    We may share your personal data with:
                  </p>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Service providers
                      </h3>
                      <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 ml-4 text-sm sm:text-base">
                        <li>
                          <strong>Authentication & Hosting:</strong> Vercel,
                          Auth.js (Google OAuth)
                        </li>
                        <li>
                          <strong>Maps & Tracking:</strong> Google Maps API
                        </li>
                        <li>
                          <strong>Database & Storage:</strong> Supabase
                          (PostgreSQL), Prisma
                        </li>
                        <li>
                          <strong>Payments:</strong> Secure Payment Gateway (PCI-compliant)
                        </li>
                        <li>
                          <strong>Analytics & Error Reporting:</strong> Google
                          Analytics, Sentry
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                      <p>
                        <strong>Legal & Compliance:</strong> Authorities if
                        required by law or to protect rights
                      </p>
                      <p>
                        <strong>Business Transfers:</strong> In connection with
                        merger, sale, or reorganization
                      </p>
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm bg-gray-50 p-3 sm:p-4 rounded-lg border-l-4 border-blue-500">
                      All third parties act as "processors" under the DPDP Act
                      and are contractually bound to safeguard your data.
                    </p>
                  </div>
                </div>

                {/* Data Retention */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    5. Data Retention
                  </h2>
                  <ul className="list-disc list-inside space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
                    <li>
                      <strong>Order & Transaction Records:</strong> 5 years
                      (tax, audit, legal)
                    </li>
                    <li>
                      <strong>Account/Profile Data:</strong> Until account
                      deletion or consent withdrawal
                    </li>
                    <li>
                      <strong>Analytics & Logs:</strong> Raw logs up to 1 year;
                      aggregated/anonymized after 13 months
                    </li>
                  </ul>
                </div>

                {/* Your Rights & Choices */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    6. Your Rights & Choices
                  </h2>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    Under the DPDP Act, you can:
                  </p>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    <li>Access your data</li>
                    <li>Rectify inaccuracies</li>
                    <li>
                      Erase data when no longer needed or if consent is
                      withdrawn
                    </li>
                    <li>Port data you've provided</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                  <p className="text-gray-700 text-sm sm:text-base">
                    To exercise any right, email us at{" "}
                    <a
                      href="mailto:hello@duchesspastry.com"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      hello@duchesspastry.com
                    </a>
                    . We aim to respond within 30 days.
                  </p>
                </div>

                {/* Cookies & Tracking Technologies */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    7. Cookies & Tracking Technologies
                  </h2>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    We use:
                  </p>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    <li>
                      <strong>Essential cookies</strong> for login, cart, and
                      order processing
                    </li>
                    <li>
                      <strong>Performance cookies</strong> (e.g. Google
                      Analytics) to understand usage
                    </li>
                    <li>
                      <strong>Functional cookies</strong> for map integration
                      and real-time order status
                    </li>
                  </ul>
                  <p className="text-gray-700 text-sm sm:text-base">
                    You can manage or block cookies via your browser settings.
                    Blocking may affect functionality.
                  </p>
                </div>

                {/* Security of Your Data */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    8. Security of Your Data
                  </h2>
                  <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                    We employ reasonable technical and organizational
                    safeguards, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                    <li>TLS encryption in transit and encryption at rest</li>
                    <li>Access controls and role-based permissions</li>
                    <li>Regular security assessments and patching</li>
                  </ul>
                </div>

                {/* International Data Transfers */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    9. International Data Transfers
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base">
                    If we transfer data outside India (e.g. to U.S. servers), we
                    use Standard Contractual Clauses approved under Indian law
                    to ensure adequate protection.
                  </p>
                </div>

                {/* Changes to This Policy */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    10. Changes to This Policy
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base">
                    We may update this Privacy Policy over time. We'll post the
                    revised date at the top and, if changes are material, notify
                    you via email or in-app notice.
                  </p>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    Questions or Complaints?
                  </h2>
                  <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                    <p>
                      <strong>Email:</strong>{" "}
                      <a
                        href="mailto:hello@duchesspastry.com"
                        className="text-blue-600 hover:underline"
                      >
                        hello@duchesspastry.com
                      </a>
                    </p>
                    <p>
                      <strong>Address:</strong> Duchess Pastry, 7/68 62-B
                      Vijayalakshmi Nagar, Sivasakthi Gardens, Keeranatham,
                      Saravanampatti, Coimbatore – 641035.
                    </p>
                  </div>
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
                  className="block px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md font-medium"
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
