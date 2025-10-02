"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ArrowLeft, HelpCircle } from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Ordering & Payment (10 questions)
  {
    id: 1,
    question: "How do I place an order?",
    answer:
      "You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. Make sure to provide accurate delivery information and payment details.",
    category: "Ordering & Payment",
  },
  {
    id: 2,
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and digital wallets like PayPal and Apple Pay. All payments are processed securely.",
    category: "Ordering & Payment",
  },
  {
    id: 3,
    question: "Can I modify or cancel my order?",
    answer:
      "Orders can be modified or cancelled within 2 hours of placement. After that, the order goes into production and cannot be changed. Contact our customer service for assistance.",
    category: "Ordering & Payment",
  },
  {
    id: 4,
    question: "Is my payment information secure?",
    answer:
      "Yes, we use industry-standard SSL encryption to protect your payment information. We never store your complete credit card details on our servers.",
    category: "Ordering & Payment",
  },
  {
    id: 5,
    question: "Do you offer installment payments?",
    answer:
      "Yes, we offer installment payment options through our partner providers. You can split your payment into 3, 6, or 12 monthly installments with 0% interest.",
    category: "Ordering & Payment",
  },
  {
    id: 6,
    question: "Can I save my payment information?",
    answer:
      "Yes, you can securely save your payment methods in your account for faster checkout. All saved payment information is encrypted and protected.",
    category: "Ordering & Payment",
  },
  {
    id: 7,
    question: "What if my payment fails?",
    answer:
      "If your payment fails, we'll notify you immediately. You can try again with a different payment method or contact our support team for assistance.",
    category: "Ordering & Payment",
  },
  {
    id: 8,
    question: "Do you accept international payments?",
    answer:
      "Currently, we only accept payments from customers within our delivery area. International payments are not supported at this time.",
    category: "Ordering & Payment",
  },
  {
    id: 9,
    question: "Can I use gift cards or vouchers?",
    answer:
      "Yes, we accept gift cards and promotional vouchers. Enter the code during checkout to apply the discount to your order.",
    category: "Ordering & Payment",
  },
  {
    id: 10,
    question: "What are your refund policies?",
    answer:
      "We offer full refunds for orders cancelled within 2 hours. After that, refunds are processed on a case-by-case basis within 24 hours of delivery.",
    category: "Ordering & Payment",
  },

  // Delivery & Shipping (10 questions)
  {
    id: 11,
    question: "How long does delivery take?",
    answer:
      "Standard delivery takes 2-3 business days. Express delivery (1-2 business days) and same-day delivery are available for select areas. Delivery times may vary during peak seasons.",
    category: "Delivery & Shipping",
  },
  {
    id: 12,
    question: "Do you deliver to my area?",
    answer:
      "We deliver to most areas within a 50-mile radius of our bakery. Enter your zip code during checkout to confirm delivery availability and costs.",
    category: "Delivery & Shipping",
  },
  {
    id: 13,
    question: "Can I track my order?",
    answer:
      "Yes! Once your order is shipped, you'll receive a tracking number via email and SMS. You can also track your order in your account dashboard.",
    category: "Delivery & Shipping",
  },
  {
    id: 14,
    question: "What if I'm not home during delivery?",
    answer:
      "Our delivery team will attempt delivery twice. If you're not available, they'll leave a note with instructions for pickup or rescheduling.",
    category: "Delivery & Shipping",
  },
  {
    id: 15,
    question: "Do you offer same-day delivery?",
    answer:
      "Yes, same-day delivery is available for orders placed before 10 AM in select areas. Additional fees apply for this service.",
    category: "Delivery & Shipping",
  },
  {
    id: 16,
    question: "Can I schedule a specific delivery time?",
    answer:
      "Yes, you can choose from available time slots during checkout. We offer morning (9 AM - 12 PM), afternoon (12 PM - 3 PM), and evening (3 PM - 6 PM) slots.",
    category: "Delivery & Shipping",
  },
  {
    id: 17,
    question: "What are your delivery fees?",
    answer:
      "Standard delivery is $5.99. Express delivery is $9.99. Same-day delivery is $14.99. Free delivery on orders over $50.",
    category: "Delivery & Shipping",
  },
  {
    id: 18,
    question: "Do you deliver on weekends?",
    answer:
      "Yes, we deliver on Saturdays and Sundays. Weekend delivery slots are available but may be limited during peak seasons.",
    category: "Delivery & Shipping",
  },
  {
    id: 19,
    question: "Can I change my delivery address after ordering?",
    answer:
      "You can change your delivery address within 2 hours of placing your order. After that, contact our customer service for assistance.",
    category: "Delivery & Shipping",
  },
  {
    id: 20,
    question: "What if my order arrives damaged?",
    answer:
      "If your order arrives damaged, take photos and contact us immediately. We'll arrange for a replacement or full refund.",
    category: "Delivery & Shipping",
  },

  // Products & Quality (10 questions)
  {
    id: 21,
    question: "Are your products fresh?",
    answer:
      "Absolutely! All our pastries are baked fresh daily using the finest ingredients. We never use frozen or pre-made products.",
    category: "Products & Quality",
  },
  {
    id: 22,
    question: "Do you offer gluten-free options?",
    answer:
      "Yes, we have a selection of gluten-free pastries. Please note that while we take precautions, our kitchen handles gluten-containing ingredients.",
    category: "Products & Quality",
  },
  {
    id: 23,
    question: "Can I request custom decorations?",
    answer:
      "Yes! We offer custom decorations for special occasions. Please place custom orders at least 48 hours in advance and contact us for specific requirements.",
    category: "Products & Quality",
  },
  {
    id: 24,
    question: "What are your ingredients?",
    answer:
      "We use only premium, natural ingredients. Our products contain dairy, eggs, and wheat unless specifically noted as allergen-free. Full ingredient lists are available on request.",
    category: "Products & Quality",
  },
  {
    id: 25,
    question: "Do you use organic ingredients?",
    answer:
      "We source organic ingredients whenever possible, especially for our premium product lines. Look for the organic label on specific products.",
    category: "Products & Quality",
  },
  {
    id: 26,
    question: "How long do your products stay fresh?",
    answer:
      "Our products are best consumed within 2-3 days of delivery. Store them in a cool, dry place or refrigerate for longer shelf life.",
    category: "Products & Quality",
  },
  {
    id: 27,
    question: "Do you offer vegan options?",
    answer:
      "Yes, we have a growing selection of vegan pastries. All vegan products are clearly labeled and prepared separately to avoid cross-contamination.",
    category: "Products & Quality",
  },
  {
    id: 28,
    question: "Can I see nutritional information?",
    answer:
      "Yes, nutritional information is available for all our products. You can find this information on our website or request it from our customer service.",
    category: "Products & Quality",
  },
  {
    id: 29,
    question: "Do you use artificial preservatives?",
    answer:
      "No, we never use artificial preservatives. Our products are made fresh daily and use natural preservation methods.",
    category: "Products & Quality",
  },
  {
    id: 30,
    question: "What if I have food allergies?",
    answer:
      "We take food allergies seriously. Please inform us of any allergies when placing your order. We have detailed allergen information available.",
    category: "Products & Quality",
  },

  // Account & Profile (10 questions)
  {
    id: 31,
    question: "How do I create an account?",
    answer:
      "You can create an account by clicking 'Sign Up' and providing your email, name, and password. You can also sign up using your Google account for convenience.",
    category: "Account & Profile",
  },
  {
    id: 32,
    question: "How do I update my delivery address?",
    answer:
      "Go to your profile page and click on 'Addresses' to add or remove delivery addresses. You can set a default address for quick checkout.",
    category: "Account & Profile",
  },
  {
    id: 33,
    question: "Can I save my favorite items?",
    answer:
      "Yes! Click the heart icon on any product to add it to your favorites. You can view all your saved items in the 'Favorites' section of your profile.",
    category: "Account & Profile",
  },
  {
    id: 34,
    question: "How do I reset my password?",
    answer:
      "Click 'Forgot Password' on the login page and enter your email address. You'll receive a link to reset your password securely.",
    category: "Account & Profile",
  },
  {
    id: 35,
    question: "Can I change my email address?",
    answer:
      "Yes, you can update your email address in your profile settings. You'll need to verify the new email address before the change takes effect.",
    category: "Account & Profile",
  },
  {
    id: 36,
    question: "How do I delete my account?",
    answer:
      "To delete your account, contact our customer service team. We'll process your request within 30 days and delete all your personal data.",
    category: "Account & Profile",
  },
  {
    id: 37,
    question: "Can I have multiple addresses?",
    answer:
      "Yes, you can save multiple delivery addresses in your profile. You can set one as default and choose different addresses for each order.",
    category: "Account & Profile",
  },
  {
    id: 38,
    question: "How do I update my profile picture?",
    answer:
      "You can update your profile picture in your account settings. Click on your current picture and upload a new one from your device.",
    category: "Account & Profile",
  },
  {
    id: 39,
    question: "Can I view my order history?",
    answer:
      "Yes, all your past orders are available in your profile under 'Order History'. You can view details, track current orders, and reorder previous items.",
    category: "Account & Profile",
  },
  {
    id: 40,
    question: "How do I manage my notifications?",
    answer:
      "You can manage your notification preferences in your account settings. Choose which types of notifications you want to receive via email or SMS.",
    category: "Account & Profile",
  },

  // Returns & Refunds (10 questions)
  {
    id: 41,
    question: "What is your return policy?",
    answer:
      "Due to the perishable nature of our products, we cannot accept returns. However, if you're not satisfied with your order, contact us within 24 hours for a refund or replacement.",
    category: "Returns & Refunds",
  },
  {
    id: 42,
    question: "How do I request a refund?",
    answer:
      "Contact our customer service within 24 hours of delivery with your order number and reason for the refund request. We'll process refunds within 3-5 business days.",
    category: "Returns & Refunds",
  },
  {
    id: 43,
    question: "What if my order arrives damaged?",
    answer:
      "If your order arrives damaged, take photos and contact us immediately. We'll arrange for a replacement or full refund.",
    category: "Returns & Refunds",
  },
  {
    id: 44,
    question: "How long do refunds take?",
    answer:
      "Refunds are typically processed within 3-5 business days. The time to appear in your account depends on your bank or payment provider.",
    category: "Returns & Refunds",
  },
  {
    id: 45,
    question: "Can I get a partial refund?",
    answer:
      "Yes, partial refunds are available if only part of your order is unsatisfactory. We'll assess each case individually.",
    category: "Returns & Refunds",
  },
  {
    id: 46,
    question: "What if I received the wrong item?",
    answer:
      "If you received the wrong item, contact us immediately. We'll arrange for the correct item to be delivered and may offer a discount for the inconvenience.",
    category: "Returns & Refunds",
  },
  {
    id: 47,
    question: "Do you offer store credit?",
    answer:
      "Yes, we can issue store credit instead of a refund. Store credit can be used for future orders and never expires.",
    category: "Returns & Refunds",
  },
  {
    id: 48,
    question: "What if I'm allergic to an ingredient?",
    answer:
      "If you have an allergic reaction, contact us immediately. We'll provide a full refund and work to prevent future issues.",
    category: "Returns & Refunds",
  },
  {
    id: 49,
    question: "Can I cancel an order after it's shipped?",
    answer:
      "Once an order is shipped, it cannot be cancelled. However, you can refuse delivery and we'll process a refund upon return.",
    category: "Returns & Refunds",
  },
  {
    id: 50,
    question: "What if my order is late?",
    answer:
      "If your order is significantly late, we may offer a partial refund or discount on your next order. Contact us to discuss options.",
    category: "Returns & Refunds",
  },

  // Special Orders & Events (10 questions)
  {
    id: 51,
    question: "Do you cater for events?",
    answer:
      "Yes! We offer catering services for events, weddings, and corporate functions. Contact us at least 1 week in advance for large orders.",
    category: "Special Orders & Events",
  },
  {
    id: 52,
    question: "Can I order in advance?",
    answer:
      "Absolutely! You can place orders up to 30 days in advance. This is especially recommended for special occasions and large orders.",
    category: "Special Orders & Events",
  },
  {
    id: 53,
    question: "Do you offer wedding cakes?",
    answer:
      "Yes! We specialize in custom wedding cakes. Please contact us at least 2 weeks in advance for consultations and tastings.",
    category: "Special Orders & Events",
  },
  {
    id: 54,
    question: "Can I request custom designs?",
    answer:
      "Yes, we offer custom designs for special occasions. Please provide details and inspiration images at least 1 week in advance.",
    category: "Special Orders & Events",
  },
  {
    id: 55,
    question: "Do you offer corporate catering?",
    answer:
      "Yes, we provide corporate catering for meetings, conferences, and office events. We offer special pricing for corporate clients.",
    category: "Special Orders & Events",
  },
  {
    id: 56,
    question: "Can I schedule a tasting?",
    answer:
      "Yes, we offer tastings for wedding cakes and large orders. Tastings are available by appointment and include 6-8 sample flavors.",
    category: "Special Orders & Events",
  },
  {
    id: 57,
    question: "Do you deliver to event venues?",
    answer:
      "Yes, we deliver to most event venues within our service area. Please provide venue details and delivery instructions in advance.",
    category: "Special Orders & Events",
  },
  {
    id: 58,
    question: "Can I order party favors?",
    answer:
      "Yes, we offer custom party favors and gift boxes. Perfect for weddings, birthdays, and corporate events.",
    category: "Special Orders & Events",
  },
  {
    id: 59,
    question: "Do you offer dietary accommodations for events?",
    answer:
      "Yes, we can accommodate various dietary restrictions for events. Please inform us of any special requirements when placing your order.",
    category: "Special Orders & Events",
  },
  {
    id: 60,
    question: "What's your minimum order for events?",
    answer:
      "Minimum orders vary by event type. For weddings, minimum is $200. For corporate events, minimum is $150. Contact us for specific requirements.",
    category: "Special Orders & Events",
  },
];

const categories = [
  "Ordering & Payment",
  "Delivery & Shipping",
  "Products & Quality",
  "Account & Profile",
  "Returns & Refunds",
  "Special Orders & Events",
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState("Ordering & Payment");

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter(
    (item) => item.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#18171C] py-8 px-4 lg:pt-24">
      <div className="max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-[#7a0000] dark:bg-[#7a0000] rounded-full p-2">
              <HelpCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#000000] dark:text-white">
                Frequently Asked Questions
              </h1>
              <p className="text-[#858585] dark:text-gray-400 text-sm">
                Find answers to common questions about Duchess Pastries
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Categories - Horizontal Scrollable Row */}
          <div className="lg:hidden">
            <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-4 border border-gray-200 dark:border-transparent">
              <h2 className="text-lg font-semibold text-[#000000] dark:text-white mb-4">
                Categories
              </h2>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 min-w-max">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-3 rounded-xl transition-colors whitespace-nowrap ${
                        selectedCategory === category
                          ? "bg-[#7a0000] dark:bg-[#7a0000] text-white"
                          : "text-[#000000] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <div className="font-medium">{category}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Categories - Left Sidebar */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-4 border border-gray-200 dark:border-transparent">
              <h2 className="text-lg font-semibold text-[#000000] dark:text-white mb-4">
                Categories
              </h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                      selectedCategory === category
                        ? "bg-[#7a0000] dark:bg-[#7a0000] text-white"
                        : "text-[#000000] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="font-medium">{category}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - FAQ Items */}
          <div className="flex-1">
            <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-transparent">
              <div className="space-y-4">
                {filteredFAQs.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-[#000000] dark:text-white pr-4">
                        {item.question}
                      </h3>
                      {openItems.includes(item.id) ? (
                        <ChevronUp className="h-5 w-5 text-[#858585] dark:text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-[#858585] dark:text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {openItems.includes(item.id) && (
                      <div className="px-6 pb-4">
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                          <p className="text-[#000000] dark:text-white leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-transparent text-center">
          <h3 className="text-lg font-semibold text-[#000000] dark:text-white mb-2">
            Still have questions?
          </h3>
          <p className="text-[#858585] dark:text-gray-400 mb-4">
            Can't find what you're looking for? Our customer service team is
            here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact">
              <Button className="bg-[#7a0000] dark:bg-[#7a0000] hover:bg-[#600000] dark:hover:bg-[#600000]">
                Contact Us
              </Button>
            </Link>
            <Link href="tel:+1234567890">
              <Button
                variant="outline"
                className="border-[#7a0000] dark:border-[#7a0000] text-[#7a0000] dark:text-[#7a0000]"
              >
                Call Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
