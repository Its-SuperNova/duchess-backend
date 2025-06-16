"use client"

import { useState } from "react"
import UserSidebar from "@/components/user-sidebar"
import Hero from "@/components/block/hero"
import ProductCard from "@/components/productcard"
import Image from "next/image"
import { NewsletterSubscription } from "@/components/block/NewsletterSubscription"

interface Product {
  id: number
  name: string
  rating: number
  imageUrl: string
  price: number
  isVeg: boolean
  description: string
}

interface HomeClientProps {
  products: Product[]
}

export default function HomeClient({ products }: HomeClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <div className="flex w-full">
      <UserSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`flex-1 transition-all duration-300 ${!isCollapsed ? "lg:ml-64" : "lg:ml-16"}`}>
        <div className="w-full overflow-x-hidden bg-white dark:bg-gray-900">
          {/* Hero Section */}
          <div className="w-full">
            <Hero />
          </div>

          {/* Products Section */}
          <div className="w-full">
            <section className="px-4 py-8 md:px-6 lg:px-8 w-full">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Popular Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    rating={product.rating}
                    imageUrl={product.imageUrl}
                    price={product.price}
                    isVeg={product.isVeg}
                    description={product.description}
                  />
                ))}
              </div>
            </section>

            {/* Why We Are Best Banner - Mobile/Tablet Version */}
            <div className="block lg:hidden px-4 md:px-6 py-6 md:py-8 mb-20 w-full">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Why We Are Best?</h2>
              <img
                src="/why-we-are-best-mobile.png"
                alt="Why we are the best"
                className="w-full rounded-3xl shadow-md"
              />
            </div>

            {/* Why We Are Best Banner - Desktop Version */}
            <div className="hidden lg:block px-4 md:px-6 lg:px-8 py-6 md:py-8 w-full">
              <div className="rounded-3xl overflow-hidden shadow-md w-full">
                <Image
                  src="/images/duchess-pastries-banner.png"
                  alt="Why we are the best - Handcrafted fresh daily, delivered with care, affordable prices, and loved by thousands"
                  width={1280}
                  height={320}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>

            {/* Newsletter Subscription - only on home page - full width */}
            <div className="w-full">
              <NewsletterSubscription />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
