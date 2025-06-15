"use client";
import Link from "next/link";
import type React from "react";

import Image from "next/image";
import { ArrowLeft, Search, Clock, X } from "lucide-react";
import { useState } from "react";

interface Category {
  name: string;
  image: string;
}

interface SearchClientProps {
  categories: Category[];
}

export default function SearchClient({ categories }: SearchClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Sample recent searches
  const [recentSearches, setRecentSearches] = useState([
    "Chocolate cake",
    "Red velvet",
    "Birthday cake",
    "Croissant",
  ]);

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
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      // In a real app, you would fetch search results here
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches([searchQuery, ...recentSearches.slice(0, 3)]);
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  const removeRecentSearch = (search: string) => {
    setRecentSearches(recentSearches.filter((item) => item !== search));
  };

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Page Header */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <div className="bg-gray-100 p-2 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </div>
          </Link>
          <h1 className="text-xl font-semibold">Search</h1>
        </div>
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
            <h2 className="text-lg font-medium mb-4">
              Search Results for "{searchQuery}"
            </h2>
            <div className="divide-y">
              {searchResults.map((item) => (
                <Link href={`/products/${item.id}`} key={item.id}>
                  <div className="py-4 flex items-center">
                    {/* Product image */}
                    <div className="relative h-16 w-16 rounded-md overflow-hidden mr-3">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">
                        {item.name}
                      </h3>
                      <div className="flex items-center mt-1">
                        <div
                          className={`w-4 h-4 border ${
                            item.isVeg ? "border-green-600" : "border-red-600"
                          } flex items-center justify-center rounded-sm mr-2`}
                        >
                          <div
                            className={`w-2 h-2 ${
                              item.isVeg ? "bg-green-600" : "bg-red-600"
                            } rounded-full`}
                          ></div>
                        </div>
                        <p className="font-semibold text-[#361C1C]">
                          ₹{item.price}
                        </p>
                      </div>
                    </div>

                    {/* Add button */}
                    <button className="ml-2 bg-[#361C1C] text-white text-xs px-3 py-1 rounded-full">
                      Add
                    </button>
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
                {recentSearches.length > 0 && (
                  <button className="text-[#361C1C] text-sm font-medium">
                    Clear All
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                  >
                    <Clock className="h-3 w-3 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-700">{search}</span>
                    <button
                      onClick={() => removeRecentSearch(search)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">Popular Categories</h2>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category, index) => (
                  <Link
                    href={`/categories/${category.name
                      .toLowerCase()
                      .replace(" ", "-")}`}
                    key={index}
                    className="block"
                  >
                    <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                      <div className="relative h-16 w-16 mx-auto mb-2">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-800">
                        {category.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
