"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NewAddressPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    addressName: "",
    fullAddress: "",
    city: "",
    state: "",
    zipCode: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the address to your backend
    // For now, we'll just navigate back
    router.push("/profile/addresses")
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white p-4 flex items-center border-b shadow-sm">
        <Link href="/profile/addresses" className="mr-4">
          <div className="bg-gray-100 p-2 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </div>
        </Link>
        <h1 className="text-xl font-semibold">Add New Address</h1>
      </div>

      {/* Form */}
      <div className="flex-1 p-4 pb-24">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="addressName" className="block text-sm font-medium text-gray-700 mb-1">
              Address Name
            </label>
            <input
              type="text"
              id="addressName"
              name="addressName"
              value={formData.addressName}
              onChange={handleChange}
              className="w-full p-3 pl-5 bg-[#F0F4F8] rounded-full border-none focus:outline-none focus:ring-1 focus:ring-[#361C1C] placeholder:text-sm"
              placeholder="Home, Office, etc."
              required
            />
          </div>

          <div>
            <label htmlFor="fullAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              id="fullAddress"
              name="fullAddress"
              value={formData.fullAddress}
              onChange={handleChange}
              className="w-full p-3 pl-5 bg-[#F0F4F8] rounded-full border-none focus:outline-none focus:ring-1 focus:ring-[#361C1C] placeholder:text-sm"
              placeholder="Enter your street address"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-3 pl-5 bg-[#F0F4F8] rounded-full border-none focus:outline-none focus:ring-1 focus:ring-[#361C1C] placeholder:text-sm"
                placeholder="City"
                required
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full p-3 pl-5 bg-[#F0F4F8] rounded-full border-none focus:outline-none focus:ring-1 focus:ring-[#361C1C] placeholder:text-sm"
                placeholder="State"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className="w-full p-3 pl-5 bg-[#F0F4F8] rounded-full border-none focus:outline-none focus:ring-1 focus:ring-[#361C1C] placeholder:text-sm"
              placeholder="ZIP Code"
              required
            />
          </div>
        </form>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-[60px] left-0 right-0 p-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
        <button onClick={handleSubmit} className="w-full py-3 bg-[#8B4513] text-white rounded-full font-medium">
          Save Address
        </button>
      </div>
    </div>
  )
}
