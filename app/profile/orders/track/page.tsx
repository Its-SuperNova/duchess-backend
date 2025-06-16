"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, FileText, Package, Truck, Home, X, Send, Phone } from "lucide-react"
import { FaCheck } from "react-icons/fa"
import { useSearchParams } from "next/navigation"

export default function TrackOrderPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id")
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  // Mock order data - in a real app, you would fetch this from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Find the order based on the ID from the URL
      const mockOrder = {
        id: orderId || "BKR45HGJF",
        name: "Almond Chocolate Cake",
        category: "Cake",
        quantity: 1,
        price: 70.0,
        image: "/decadent-chocolate-almond-cake.png",
        expectedDelivery: "19 Dec 2023",
        status: "shipped",
        timeline: [
          {
            status: "Order Placed",
            completed: true,
            time: "19 Dec 2023, 11:25 PM",
            icon: FileText,
          },
          {
            status: "In Progress",
            completed: true,
            time: "19 Dec 2023, 12:25 PM",
            icon: Package,
          },
          {
            status: "Shipped",
            completed: true,
            time: "19 Dec 2023, 01:05 PM",
            icon: Truck,
          },
          {
            status: "Delivered",
            completed: false,
            time: "19 Dec 2023, 06:00 PM",
            icon: Home,
          },
        ],
      }

      setOrder(mockOrder)
      setLoading(false)
    }, 500)
  }, [orderId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send this data to your backend
    console.log("Form submitted:", formData)

    // Show success message and close form
    alert("Your message has been sent to the shop. They will contact you shortly.")
    setIsContactFormOpen(false)

    // Reset form
    setFormData({
      name: "",
      email: "",
      message: "",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B4513]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white p-4 flex items-center shadow-sm">
        <Link href="/profile/orders" className="mr-4">
          <div className="bg-gray-100 p-2 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </div>
        </Link>
        <h1 className="text-xl font-semibold">Track Order</h1>
      </div>

      <div className="p-4 pb-24">
        {/* Product Info */}
        <div className="flex items-center mb-6">
          <div className="relative h-16 w-16 rounded-lg overflow-hidden mr-3">
            <Image src={order.image || "/placeholder.svg"} alt={order.name} fill className="object-cover" />
          </div>
          <div>
            <h2 className="font-medium text-gray-800">{order.name}</h2>
            <p className="text-sm text-gray-500">
              {order.category} | Qty : {order.quantity.toString().padStart(2, "0")} pcs
            </p>
            <p className="font-semibold text-gray-800 mt-1">₹{order.price.toFixed(2)}</p>
          </div>
        </div>

        {/* Order Details */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Order Details</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Expected Delivery Date</span>
              <span className="font-medium">{order.expectedDelivery}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID</span>
              <span className="font-medium">{order.id}</span>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div>
          <h3 className="text-lg font-medium mb-3">Order Status</h3>

          <div className="flex">
            {/* Timeline with status circles and connecting lines */}
            <div className="relative mr-6 flex flex-col items-center">
              {order.timeline.map((item: any, index: number) => {
                const isLast = index === order.timeline.length - 1

                return (
                  <div key={index} className="flex flex-col items-center">
                    {/* Status circle */}
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center z-10 ${
                        item.completed ? "bg-[#8B4513]" : "bg-gray-200"
                      }`}
                    >
                      <FaCheck className={`h-3 w-3 ${item.completed ? "text-white" : "text-gray-400"}`} />
                    </div>

                    {/* Connecting line */}
                    {!isLast && (
                      <div
                        className={`h-[90px] w-1 ${
                          item.completed && order.timeline[index + 1].completed ? "bg-[#8B4513]" : "bg-gray-200"
                        }`}
                      ></div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Status details */}
            <div className="flex-1">
              {order.timeline.map((item: any, index: number) => (
                <div key={index} className="mb-16 last:mb-0">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{item.status}</h4>
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center ${
                        item.completed ? "text-[#8B4513]" : "text-gray-400"
                      }`}
                    >
                      <item.icon className="h-7 w-7" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Contact Shop Button */}
      <div className="fixed bottom-[60px] left-0 right-0 p-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
        <button className="w-full bg-[#8B4513] text-white py-3 rounded-full" onClick={() => setIsContactFormOpen(true)}>
          Contact Shop
        </button>
      </div>

      {/* Contact Form Modal */}
      {isContactFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-xl w-full max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Contact Shop</h2>
              <button onClick={() => setIsContactFormOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4">
              {/* Quick Contact Options */}
              <div className="mb-6">
                <div className="flex justify-between mb-4">
                  <a
                    href="tel:+919876543210"
                    className="flex-1 flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg mr-2"
                  >
                    <Phone className="h-6 w-6 text-[#8B4513] mb-2" />
                    <span className="text-sm">Call Shop</span>
                  </a>
                  <a
                    href="https://wa.me/919876543210"
                    className="flex-1 flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg ml-2"
                  >
                    <svg className="h-6 w-6 text-[#25D366] mb-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span className="text-sm">WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Contact Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                    required
                    placeholder={`Order #${order.id}: I have a question about my order...`}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#8B4513] text-white py-3 rounded-full flex items-center justify-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
