"use client"
import Link from "next/link"
import type React from "react"

import Image from "next/image"
import { ArrowLeft, Search, Clock, X } from "lucide-react"
import { useState } from "react"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Sample recent searches
  const [recentSearches, setRecentSearches] = useState(["Chocolate cake", "Red velvet", "Birthday cake", "Croissant"])

  // Popular categories with images - updated to include brownies
  const popularCategories = [
    { name: "Cup Cake", image: "/images/categories/cupcake.png" },
    { name: "Cookies", image: "/images/categories/cookies.png" },
    { name: "Donuts", image: "/images/categories/pink-donut.png" },
    { name: "Breads", image: "/images/categories/bread.png" },
    { name: "Pastry", image: "/images/categories/croissant.png" },
    { name: "Sweets", image: "/images/categories/sweets-bowl.png" },
    { name: "Chocolate", image: "/images/categories/chocolate-bar.png" },
    { name: "Muffins", image: "/images/categories/muffin.png" },
    { name: "Cake", image: "/images/categories/cake.png" },
    { name: "Brownies", image: "/images/categories/brownie.png" },
  ]

  // Sample search results
  const searchResults = [
    {
      id: 1,
      name: "Red Velvet Cheesecake",
      price: 499,
      image: "/images/red-velvet.png",
      isVeg: false,
    },
    {
      id: 2,
      name: "Chocolate Éclair",
      price: 649,
      image: "/images/chocolate-eclair.jpg",
      isVeg: true,
    },
    {
      id: 3,
      name: "Strawberry Tart",
      price: 399,
      image: "/images/strawberry-tart.jpg",
      isVeg: true,
    },
    {
      id: 4,
      name: "Blueberry Muffin",
      price: 249,
      image: "/images/blueberry-muffin.jpg",
      isVeg: true,
    },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearching(true)
      // In a real app, you would fetch search results here
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches([searchQuery, ...recentSearches.slice(0, 3)])
      }
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setIsSearching(false)
  }

  const removeRecentSearch = (search: string) => {
    setRecentSearches(recentSearches.filter((item) => item !== search))
  }

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 h-[64px] flex items-center justify-between border-b shadow-sm">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <div className="bg-gray-100 p-2 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </div>
          </Link>
          <h1 className="text-xl font-semibold">Search</h1>
        </div>

        {/* Profile image on the right */}
        <Link href="/profile">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-300">
            <Image src="/profile-avatar.png" alt="Profile" width={32} height={32} className="object-cover" />
          </div>
        </Link>
      </div>

      {/* Search Input */}
      <div className="px-4 py-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for pastries, cakes, etc."
            className="w-full pl-10 pr-10 py-3 rounded-full bg-[#F0F4F8] border-none focus:outline-none focus:ring-1 focus:ring-[#361C1C]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </form>
      </div>

      {/* Content */}
      <div className="px-4">
        {isSearching ? (
          // Search Results
          <>
            <h2 className="text-lg font-medium mb-4">Search Results for "{searchQuery}"</h2>
            <div className="divide-y">
              {searchResults.map((item) => (
                <Link href={`/products/${item.id}`} key={item.id}>
                  <div className="py-4 flex items-center">
                    {/* Product image */}
                    <div className="relative h-16 w-16 rounded-md overflow-hidden mr-3">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>

                    {/* Product details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
                      <div className="flex items-center mt-1">
                        <div
                          className={`w-4 h-4 border ${
                            item.isVeg ? "border-green-600" : "border-red-600"
                          } flex items-center justify-center rounded-sm mr-2`}
                        >
                          <div className={`w-2 h-2 ${item.isVeg ? "bg-green-600" : "bg-red-600"} rounded-full`}></div>
                        </div>
                        <p className="font-semibold text-[#361C1C]">₹{item.price}</p>
                      </div>
                    </div>

                    {/* Add button */}
                    <button className="ml-2 bg-[#361C1C] text-white text-xs px-3 py-1 rounded-full">Add</button>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          // Recent Searches and Popular Categories
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium">Recent Searches</h2>
                {recentSearches.length > 0 && <button className="text-[#361C1C] text-sm font-medium">Clear All</button>}
              </div>

              {recentSearches.length > 0 ? (
                <div className="space-y-3">
                  {recentSearches.map((search, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{search}</span>
                      </div>
                      <button onClick={() => removeRecentSearch(search)}>
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-500">No recent searches</p>
                </div>
              )}
            </div>

            {/* Popular Categories */}
            <div>
              <h2 className="text-lg font-medium mb-3">Popular Categories</h2>
              <div className="grid grid-cols-4 gap-4">
                {popularCategories.map((category, index) => (
                  <Link href={`/products?category=${category.name.toLowerCase()}`} key={index}>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 relative bg-[#F9F5F0] rounded-full overflow-hidden flex items-center justify-center">
                        <Image
                          src={category.image || `/placeholder.svg?height=64&width=64&text=${category.name}`}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs font-medium mt-2 text-center">{category.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
