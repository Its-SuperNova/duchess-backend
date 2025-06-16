"use client"
import { FiSearch } from "react-icons/fi"
import { IoFilter } from "react-icons/io5"
import Image from "next/image"
import Link from "next/link"
import ProductCard from "./productcard"

const categories = [
  { name: "Cup Cake", image: "/images/categories/cupcake.png" },
  { name: "Cookies", image: "/images/categories/cookies.png" },
  { name: "cake", image: "/images/categories/cake.png" },
  { name: "Breads", image: "/images/categories/bread.png" },
]

const Hero = () => {
  return (
    <div className="w-full px-3 flex flex-col gap-4 pb-[50px] overflow-x-hidden">
      {/* Search Bar & Filter */}
      <div className="flex justify-between items-center gap-2 w-full">
        <div className="relative flex-1 min-w-0">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#523435] text-xl" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-3 py-2 rounded-[20px] focus:outline-none focus:ring-1 focus:ring-black border border-gray-200"
          />
        </div>
        <div className="bg-white dark:bg-black h-[41px] w-[48px] rounded-lg flex justify-center items-center border border-gray-200 flex-shrink-0">
          <IoFilter className="text-[#523435]" />
        </div>
      </div>

      {/* Categories */}
      <div className="flex w-full justify-between items-center px-1">
        <h2 className="text-lg md:text-xl lg:text-2xl font-medium">Categories</h2>
        <div>
          <Link href="/categories" className="font-medium text-[#d48926de]">
            See All
          </Link>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-4 gap-4 mt-2 w-full">
        {categories.map((category, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-16 h-16 relative">
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <p className="text-sm mt-2 text-center">{category.name}</p>
          </div>
        ))}
      </div>

      <div className="flex w-full justify-between items-center px-1">
        <h2 className="text-lg md:text-xl lg:text-2xl font-medium">Featured Product</h2>
        <div>
          <Link href="/categories" className="font-medium text-[#d48926de]">
            See All
          </Link>
        </div>
      </div>

      <div className="w-full">
        <ProductCard name="Red Velvet CheeseCake" rating={4.0} imageUrl="/images/red-velvet.png" />
      </div>
    </div>
  )
}

export default Hero
