"use client"
import { useState, useEffect } from "react"
import { FiSearch } from "react-icons/fi"
import { IoFilter } from "react-icons/io5"
import { Bell, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const categories = [
  { name: "Cup Cake", image: "/images/categories/cupcake.png" },
  { name: "Cookies", image: "/images/categories/cookies.png" },
  { name: "Cake", image: "/images/categories/cake.png" },
  { name: "Breads", image: "/images/categories/bread.png" },
  { name: "Tarts", image: "/images/categories/tart.png" },
  { name: "Macarons", image: "/images/categories/macaron.png" },
  { name: "Croissants", image: "/images/categories/croissant.png" },
  { name: "Donuts", image: "/images/categories/donut.png" },
  { name: "Pies", image: "/images/categories/pie.png" },
  { name: "Muffins", image: "/images/categories/muffin.png" },
  { name: "Brownies", image: "/images/categories/brownie.png" },
  { name: "Pastries", image: "/images/categories/sweets-bowl.png" },
]

// Mobile slider images (keeping existing ones)
const mobileSlides = [
  {
    id: 1,
    image: "/images/image1.png",
    alt: "Delicious pastries and cakes",
  },
  {
    id: 2,
    image: "/images/image2.png",
    alt: "Fresh baked goods",
  },
  {
    id: 3,
    image: "/images/image3.png",
    alt: "Sweet treats and desserts",
  },
]

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-slide functionality for mobile
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mobileSlides.length)
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="w-full">
      {/* Desktop Header - Only visible on lg screens and up */}
      <div className="hidden lg:flex bg-white border-b border-gray-200 h-16 items-center justify-end px-6 gap-4">
        {/* Small Search Bar */}
        <div className="relative w-80">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 text-sm"
          />
        </div>

        {/* Notification Icon */}
        <Link href="/notifications" className="relative hover:opacity-80 transition-opacity">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-[#9e210b] text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center">
            3
          </span>
        </Link>

        {/* Cart Icon */}
        <Link href="/cart" className="relative hover:opacity-80 transition-opacity">
          <ShoppingCart className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-[#9e210b] text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center">
            2
          </span>
        </Link>

        {/* Profile Image */}
        <Link href="/profile" className="flex items-center hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200">
            <Image
              src="/profile-avatar.png"
              alt="Profile"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </div>

      {/* Desktop Single Card - Only visible on lg screens and up */}
      <div className="hidden lg:block w-full mt-6 mb-8 px-4 max-w-full">
        <div className="bg-gradient-to-br from-pink-400 to-pink-600 w-full h-48 rounded-2xl flex items-center justify-center text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Sweet Delights</h2>
            <p className="text-lg opacity-90">Discover our premium collection</p>
          </div>
        </div>
      </div>

      {/* Desktop Categories - Only visible on lg screens and up */}
      <div className="hidden lg:block w-full px-4 mb-8">
        <div className="flex w-full justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Categories</h2>
          <Link href="/categories" className="font-medium text-[#d48926de] hover:underline">
            See All
          </Link>
        </div>

        {/* 1536px and up: Show 12 categories */}
        <div className="hidden 2xl:grid grid-cols-12 gap-6">
          {categories.map((category, index) => (
            <Link href={`/products?category=${category.name.toLowerCase()}`} key={index}>
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="w-20 h-20 relative bg-[#F9F5F0] rounded-full shadow-sm overflow-hidden flex items-center justify-center group-hover:shadow-md transition-shadow">
                  <Image
                    src={category.image || `/placeholder.svg?height=80&width=80&text=${category.name}`}
                    alt={category.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="text-sm font-medium mt-3 text-center group-hover:text-[#d48926de] transition-colors">
                  {category.name}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* 1285px to 1535px: Show 10 categories */}
        <div className="hidden xl:grid 2xl:hidden grid-cols-10 gap-6">
          {categories.slice(0, 10).map((category, index) => (
            <Link href={`/products?category=${category.name.toLowerCase()}`} key={index}>
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="w-20 h-20 relative bg-[#F9F5F0] rounded-full shadow-sm overflow-hidden flex items-center justify-center group-hover:shadow-md transition-shadow">
                  <Image
                    src={category.image || `/placeholder.svg?height=80&width=80&text=${category.name}`}
                    alt={category.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="text-sm font-medium mt-3 text-center group-hover:text-[#d48926de] transition-colors">
                  {category.name}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* 800px to 1284px: Show 8 categories */}
        <div className="hidden lg:grid xl:hidden grid-cols-8 gap-6">
          {categories.slice(0, 8).map((category, index) => (
            <Link href={`/products?category=${category.name.toLowerCase()}`} key={index}>
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="w-20 h-20 relative bg-[#F9F5F0] rounded-full shadow-sm overflow-hidden flex items-center justify-center group-hover:shadow-md transition-shadow">
                  <Image
                    src={category.image || `/placeholder.svg?height=80&width=80&text=${category.name}`}
                    alt={category.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="text-sm font-medium mt-3 text-center group-hover:text-[#d48926de] transition-colors">
                  {category.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile/Tablet Content - Hidden on lg screens and up */}
      <div className="lg:hidden w-full px-3 flex flex-col gap-4 pb-[50px] overflow-x-hidden">
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
          <div className="bg-white h-[41px] w-[48px] rounded-lg flex justify-center items-center border border-gray-200 flex-shrink-0">
            <IoFilter className="text-[#523435]" />
          </div>
        </div>

        {/* Pink Container for Mobile */}
        <div className="w-full h-[200px] mb-4 overflow-hidden rounded-2xl">
          <div className="bg-gradient-to-br from-pink-400 to-pink-600 w-full h-full rounded-2xl flex items-center justify-center text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Sweet Delights</h2>
              <p className="text-base opacity-90">Discover our premium collection</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex w-full justify-between items-center px-1">
          <h2 className="text-lg md:text-xl lg:text-2xl font-medium">Categories</h2>
          <div>
            <Link href="/categories" className="font-medium text-primary">
              See All
            </Link>
          </div>
        </div>

        {/* Categories Grid - Responsive based on specific breakpoints */}
        <div className="w-full mt-2 overflow-x-auto">
          <div className="flex flex-nowrap gap-4 min-w-full">
            {/* Show 7 categories between 800px-1023px */}
            <div className="hidden sm:grid sm:grid-cols-7 md:hidden gap-4 w-full">
              {categories.slice(0, 7).map((category, index) => (
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

            {/* Show 5 categories between 520px-799px */}
            <div className="hidden xs:grid xs:grid-cols-5 sm:hidden gap-4 w-full">
              {categories.slice(0, 5).map((category, index) => (
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

            {/* Show 4 categories below 520px */}
            <div className="grid grid-cols-4 xs:hidden gap-4 w-full">
              {categories.slice(0, 4).map((category, index) => (
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
