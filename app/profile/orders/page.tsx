"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("active")
  const router = useRouter()

  // Sample active orders data
  const activeOrders = [
    {
      id: 1,
      name: "Strawberry Cup Cake",
      category: "Cup Cake",
      quantity: 2,
      price: 50.0,
      image: "/frosted-strawberry-cupcake.png",
    },
    {
      id: 2,
      name: "Vanilla Cake",
      category: "Cake",
      quantity: 1,
      price: 80.0,
      image: "/classic-vanilla-cake.png",
    },
    {
      id: 3,
      name: "Strawberry Cake",
      category: "Cake",
      quantity: 2,
      price: 88.0,
      image: "/classic-strawberry-cake.png",
    },
    {
      id: 4,
      name: "Almond Chocolate Cake",
      category: "Cake",
      quantity: 1,
      price: 70.0,
      image: "/decadent-chocolate-almond-cake.png",
    },
    {
      id: 5,
      name: "Chocolate Vanilla",
      category: "Cake",
      quantity: 2,
      price: 60.0,
      image: "/swirled-delight.png",
    },
    {
      id: 6,
      name: "Chocolate Cake",
      category: "Cake",
      quantity: 1,
      price: 65.0,
      image: "/decadent-chocolate-cake.png",
    },
  ]

  // Sample completed orders data
  const completedOrders = [
    {
      id: 7,
      name: "Chocolate Chip Cookies",
      category: "Cookies",
      quantity: 1,
      price: 24.0,
      image: "/classic-chocolate-chip-cookies.png",
    },
    {
      id: 8,
      name: "Elegance Bread",
      category: "Bread",
      quantity: 2,
      price: 80.0,
      image: "/rustic-loaf.png",
    },
    {
      id: 9,
      name: "Coffee Chocolate",
      category: "Chocolate",
      quantity: 2,
      price: 20.0,
      image: "/mocha-delight.png",
    },
    {
      id: 10,
      name: "Pastry Combo",
      category: "Pastry",
      quantity: 1,
      price: 54.0,
      image: "/delightful-pastries.png",
    },
    {
      id: 11,
      name: "Mix Sweets",
      category: "Sweets",
      quantity: 1,
      price: 56.0,
      image: "/colorful-candy-mix.png",
    },
    {
      id: 12,
      name: "Strawberry Cream",
      category: "Cream",
      quantity: 1,
      price: 45.0,
      image: "/layered-strawberry-cream.png",
    },
  ]

  const handleTrackOrder = (orderId: number) => {
    router.push(`/profile/orders/track?id=${orderId}`)
  }

  return (
    <div className="min-h-screen bg-[#F5F6FB] dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-4 flex items-center shadow-sm">
        <Link href="/profile" className="mr-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
            <ArrowLeft className="h-5 w-5 dark:text-gray-300" />
          </div>
        </Link>
        <h1 className="text-xl font-semibold dark:text-white">My Orders</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 px-4 pt-4">
        <div className="flex w-full border-b">
          <button
            className={`pb-2 w-1/2 text-base font-medium text-center ${
              activeTab === "active" ? "text-[#8B4513] border-b-2 border-[#8B4513]" : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active
          </button>
          <button
            className={`pb-2 w-1/2 text-base font-medium text-center ${
              activeTab === "completed"
                ? "text-[#8B4513] border-b-2 border-[#8B4513]"
                : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Order Lists */}
      <div className="bg-white dark:bg-gray-800">
        {activeTab === "active" && (
          <div className="divide-y">
            {activeOrders.map((order) => (
              <div key={order.id} className="flex p-4">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden mr-3">
                  <Image src={order.image || "/placeholder.svg"} alt={order.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium dark:text-white">{order.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.category} | Qty : {order.quantity.toString().padStart(2, "0")} pcs
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="font-semibold dark:text-white">₹{order.price.toFixed(2)}</p>
                    <button
                      className="bg-[#8B4513] text-white px-4 py-1 rounded-full text-sm"
                      onClick={() => handleTrackOrder(order.id)}
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "completed" && (
          <div className="divide-y">
            {completedOrders.map((order) => (
              <div key={order.id} className="flex p-4">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden mr-3">
                  <Image src={order.image || "/placeholder.svg"} alt={order.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium dark:text-white">{order.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.category} | Qty : {order.quantity.toString().padStart(2, "0")} pcs
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="font-semibold dark:text-white">₹{order.price.toFixed(2)}</p>
                    <button className="bg-[#8B4513] text-white px-4 py-1 rounded-full text-sm">Leave Review</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
