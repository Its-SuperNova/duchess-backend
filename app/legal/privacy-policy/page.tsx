"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
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
                    Privacy Policy for Duchess Pastry
                  </h1>
                  <p className="text-lg text-gray-600">
                    Last updated: August 2025
                  </p>
                </div>

                {/* Introduction */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    1. Introduction
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Duchess Pastry ("we," "us," "our") operates the
                    DuchessPastry.com website (and its progressive web app)
                    (collectively, the "Service") to allow customers to order
                    freshly-baked pastries for home delivery. This Privacy
                    Policy describes how we collect, use, disclose, and
                    safeguard your personal data under India's Digital Personal
                    Data Protection Act, 2023.
                  </p>
                </div>

                {/* Data Controller */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    2. Data Controller
                  </h2>
                  <div className="space-y-3 text-gray-700">
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
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    3. Personal Data We Collect
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-3">
                        Account & Profile Data
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>
                          Name, email address, phone number, date of birth,
                          profile image
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-3">
                        Order & Delivery Data
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>
                          Delivery address, alternate phone, payment information
                          (tokenized), order history
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-3">
                        Technical & Usage Data
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
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
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    4. Why We Collect It & Legal Basis
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                            Data Category
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                            Purpose
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                            Legal Basis
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            Account & Profile Data
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            Create and manage your account
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            Performance of contract; Consent
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            Order & Delivery Data
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            Process & fulfill orders, payment, delivery
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            Performance of contract
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            Technical & Usage Data
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            Optimize Service, security, fraud prevention
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            Legitimate interests; Consent (cookies)
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* How We Share Your Data */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    5. How We Share Your Data
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We may share your personal data with:
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Service providers
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
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
                          <strong>Payments:</strong> Razorpay (PCI-compliant)
                        </li>
                        <li>
                          <strong>Analytics & Error Reporting:</strong> Google
                          Analytics, Sentry
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2 text-gray-700">
                      <p>
                        <strong>Legal & Compliance:</strong> Authorities if
                        required by law or to protect rights
                      </p>
                      <p>
                        <strong>Business Transfers:</strong> In connection with
                        merger, sale, or reorganization
                      </p>
                    </div>
                    <p className="text-gray-700 text-sm bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      All third parties act as "processors" under the DPDP Act
                      and are contractually bound to safeguard your data.
                    </p>
                  </div>
                </div>

                {/* Data Retention */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    6. Data Retention
                  </h2>
                  <ul className="list-disc list-inside space-y-3 text-gray-700">
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
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    7. Your Rights & Choices
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Under the DPDP Act, you can:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                    <li>Access your data</li>
                    <li>Rectify inaccuracies</li>
                    <li>
                      Erase data when no longer needed or if consent is
                      withdrawn
                    </li>
                    <li>Port data you've provided</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                  <p className="text-gray-700">
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
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    8. Cookies & Tracking Technologies
                  </h2>
                  <p className="text-gray-700 mb-4">We use:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
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
                  <p className="text-gray-700">
                    You can manage or block cookies via your browser or PWA
                    settings. Blocking may affect functionality.
                  </p>
                </div>

                {/* Security of Your Data */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    9. Security of Your Data
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We employ reasonable technical and organizational
                    safeguards, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>TLS encryption in transit and encryption at rest</li>
                    <li>Access controls and role-based permissions</li>
                    <li>Regular security assessments and patching</li>
                  </ul>
                </div>

                {/* International Data Transfers */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    10. International Data Transfers
                  </h2>
                  <p className="text-gray-700">
                    If we transfer data outside India (e.g. to U.S. servers), we
                    use Standard Contractual Clauses approved under Indian law
                    to ensure adequate protection.
                  </p>
                </div>

                {/* Changes to This Policy */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    11. Changes to This Policy
                  </h2>
                  <p className="text-gray-700">
                    We may update this Privacy Policy over time. We'll post the
                    revised date at the top and, if changes are material, notify
                    you via email or in-app notice.
                  </p>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Questions or Complaints?
                  </h2>
                  <div className="space-y-2 text-gray-700">
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

          {/* Right Sidebar Navigation */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="rounded-lg border border-gray-200 p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">
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
