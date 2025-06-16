"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

// Sample address data
const initialAddresses = [
  {
    id: 1,
    type: "Home",
    address: "1901 Thornridge Cir. Shiloh, Hawaii 81063",
    isSelected: true,
  },
  {
    id: 2,
    type: "Office",
    address: "4517 Washington Ave. Manchester, Kentucky 39495",
    isSelected: false,
  },
  {
    id: 3,
    type: "Parent's House",
    address: "8502 Preston Rd. Inglewood, Maine 98380",
    isSelected: false,
  },
  {
    id: 4,
    type: "Friend's House",
    address: "2464 Royal Ln. Mesa, New Jersey 45463",
    isSelected: false,
  },
]

export default function ManageAddressPage() {
  const router = useRouter()
  const [addresses, setAddresses] = useState(initialAddresses)

  const handleSelectAddress = (id: number) => {
    setAddresses(
      addresses.map((address) => ({
        ...address,
        isSelected: address.id === id,
      })),
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F6FB] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white p-4 flex items-center border-b shadow-sm">
        <Link href="/profile" className="mr-4">
          <div className="bg-gray-100 p-2 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </div>
        </Link>
        <h1 className="text-xl font-semibold">Manage Address</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {/* Single Card with All Addresses - Increased border radius */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {addresses.map((address, index) => (
            <div key={address.id}>
              {/* Min-height to ensure all addresses have at least the height of the tallest one */}
              <div
                className="p-4 bg-white min-h-[80px] flex items-center"
                onClick={() => handleSelectAddress(address.id)}
              >
                <div className="flex items-start w-full">
                  {/* Radio button instead of MapPin icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        id={`address-${address.id}`}
                        name="address"
                        checked={address.isSelected}
                        onChange={() => handleSelectAddress(address.id)}
                        className="sr-only" // Hide default radio button
                      />
                      <div
                        className={`h-5 w-5 rounded-full border ${
                          address.isSelected ? "border-[#8B4513] bg-white" : "border-gray-300 bg-white"
                        }`}
                      >
                        {address.isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-[#8B4513]"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="font-medium text-gray-900">{address.type}</h3>
                    <p className="text-gray-500 text-sm">{address.address}</p>
                  </div>
                </div>
              </div>
              {/* Add divider if not the last item */}
              {index < addresses.length - 1 && <div className="h-px bg-gray-200 mx-4"></div>}
            </div>
          ))}
        </div>

        {/* Add New Address Button with explicit margin top - Also increased border radius */}
        <Link href="/profile/addresses/new" className="block mt-8">
          <div className="border border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center text-[#8B4513] bg-white">
            <Plus className="h-5 w-5 mr-2" />
            <span>Add New Shipping Address</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
