import Link from "next/link"
import { ArrowRight, Instagram } from "lucide-react"
import { FaWhatsapp, FaFacebookF } from "react-icons/fa"
import { AiOutlineYoutube } from "react-icons/ai"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-[#111111] text-gray-800 dark:text-white flex justify-center mb-20 md:mb-0">
      <div className="px-4 md:p-6 w-full max-w-[1200px]">
        {/* Desktop Layout with Sidebar */}
        <div className="hidden md:flex md:gap-12 py-16">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="flex items-center mb-6">
              <span className="text-4xl mr-3" aria-label="Duchess Pastries">
                🧁
              </span>
              <span className="text-2xl font-light text-gray-800 dark:text-white">Duchess Pastries</span>
            </div>
            <p className="text-gray-600 dark:text-zinc-300 mb-6 leading-relaxed">
              Indulge in our handcrafted pastries, made with love and the finest ingredients. From classic favorites to
              innovative creations, every bite is a moment of pure delight.
            </p>

            {/* Newsletter Subscription */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Stay Updated</h3>
              <div className="relative max-w-md">
                <input
                  type="email"
                  placeholder="What's your e-mail?"
                  className="w-full bg-gray-100 dark:bg-white text-gray-800 dark:text-black px-6 py-3 pr-14 rounded-full focus:outline-none border border-gray-300 dark:border-none"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-black dark:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 dark:hover:bg-zinc-800 transition-colors">
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Follow Us</h3>
              <div className="flex gap-4">
                <Link href="#" aria-label="YouTube">
                  <div className="bg-gray-200 dark:bg-zinc-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors">
                    <AiOutlineYoutube className="h-5 w-5 text-black dark:text-white" />
                  </div>
                </Link>
                <Link href="#" aria-label="Instagram">
                  <div className="bg-gray-200 dark:bg-zinc-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors">
                    <Instagram className="h-5 w-5 text-black dark:text-white" />
                  </div>
                </Link>
                <Link href="#" aria-label="Facebook">
                  <div className="bg-gray-200 dark:bg-zinc-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors">
                    <FaFacebookF className="h-5 w-5 text-black dark:text-white" />
                  </div>
                </Link>
                <Link href="#" aria-label="WhatsApp">
                  <div className="bg-gray-200 dark:bg-zinc-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors">
                    <FaWhatsapp className="h-5 w-5 text-black dark:text-white" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 grid grid-cols-3 gap-8">
            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Quick Links</h3>
              <ul className="space-y-2 text-sm text-left">
                <li>
                  <Link
                    href="/"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Search
                  </Link>
                </li>
                <li>
                  <Link
                    href="/favorites"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Favorites
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cart"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Cart
                  </Link>
                </li>
                <li>
                  <Link
                    href="/offers"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Special Offers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    My Account
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Categories</h3>
              <ul className="space-y-2 text-sm text-left">
                <li>
                  <Link
                    href="/categories"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Cakes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Cupcakes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Pastries
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Breads
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Donuts
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Care & Legal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Customer Care</h3>
              <ul className="space-y-2 text-sm text-left">
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/delivery"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Delivery Info
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="md:hidden">
          <div className="grid gap-8 py-16 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Quick Links</h3>
              <ul className="space-y-2 text-sm text-left">
                <li>
                  <Link
                    href="/"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Search
                  </Link>
                </li>
                <li>
                  <Link
                    href="/favorites"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Favorites
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cart"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Cart
                  </Link>
                </li>
                <li>
                  <Link
                    href="/offers"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Special Offers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    My Account
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Categories</h3>
              <ul className="space-y-2 text-sm text-left">
                <li>
                  <Link
                    href="/categories"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Cakes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Cupcakes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Pastries
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Breads
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white hover:underline"
                  >
                    Donuts
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-gray-200 dark:border-zinc-800 border-t">
            <div className="flex flex-col md:flex-row justify-between py-8 gap-8">
              <div className="max-w-md">
                <h2 className="text-3xl font-light mb-3 text-gray-800 dark:text-white">
                  Every Bite Crafted for
                  <br />
                  Sweet Perfection.
                </h2>
                <div className="mt-4">
                  <div className="relative max-w-md">
                    <input
                      type="email"
                      placeholder="What's your e-mail?"
                      className="w-full bg-gray-100 dark:bg-white text-gray-800 dark:text-black px-6 py-3 pr-14 rounded-full focus:outline-none border border-gray-300 dark:border-none"
                    />
                    <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-black dark:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 dark:hover:bg-zinc-800 transition-colors">
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-2" aria-label="Duchess Pastries">
                    🧁
                  </span>
                  <span className="text-2xl font-light text-gray-800 dark:text-white">Duchess Pastries</span>
                </div>
                <div className="flex gap-4 mt-2">
                  <Link href="#" aria-label="YouTube">
                    <div className="bg-gray-200 dark:bg-zinc-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors">
                      <AiOutlineYoutube className="h-5 w-5 text-black dark:text-white" />
                    </div>
                  </Link>
                  <Link href="#" aria-label="Instagram">
                    <div className="bg-gray-200 dark:bg-zinc-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors">
                      <Instagram className="h-5 w-5 text-black dark:text-white" />
                    </div>
                  </Link>
                  <Link href="#" aria-label="Facebook">
                    <div className="bg-gray-200 dark:bg-zinc-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors">
                      <FaFacebookF className="h-5 w-5 text-black dark:text-white" />
                    </div>
                  </Link>
                  <Link href="#" aria-label="WhatsApp">
                    <div className="bg-gray-200 dark:bg-zinc-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors">
                      <FaWhatsapp className="h-5 w-5 text-black dark:text-white" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-zinc-800 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                © Copyright {currentYear} Duchess Pastries. All Rights Reserved.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 md:mt-0">
              <div className="h-8 w-12 bg-gray-800 dark:bg-white rounded-sm p-1 flex items-center justify-center">
                <span className="text-xs font-bold text-white dark:text-black">VISA</span>
              </div>
              <div className="h-8 w-12 bg-gray-800 dark:bg-white rounded-sm p-1 flex items-center justify-center">
                <span className="text-xs font-bold text-white dark:text-black">MC</span>
              </div>
              <div className="h-8 w-12 bg-gray-800 dark:bg-white rounded-sm p-1 flex items-center justify-center">
                <span className="text-xs font-bold text-white dark:text-black">UPI</span>
              </div>
              <div className="h-8 w-12 bg-gray-800 dark:bg-white rounded-sm p-1 flex items-center justify-center">
                <span className="text-xs font-bold text-white dark:text-black">GPay</span>
              </div>
              <div className="h-8 w-12 bg-gray-800 dark:bg-white rounded-sm p-1 flex items-center justify-center">
                <span className="text-xs font-bold text-white dark:text-black">PayPal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
