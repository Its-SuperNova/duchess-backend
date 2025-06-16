"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { FaStar, FaHeart, FaRegHeart, FaShare } from "react-icons/fa"
import { BsArrowLeft } from "react-icons/bs"
import { useParams, useRouter } from "next/navigation"
import type { Product } from "@/context/favorites-context"
import {
  Truck,
  Coffee,
  Apple,
  Egg,
  ChevronRight,
  ShoppingCart,
  Droplet,
  Dumbbell,
  Candy,
  Wheat,
  Shell,
  Package,
  AlertCircle,
} from "lucide-react"
import CakeDeliveryCard from "./cake-delivery-card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useFavorites } from "@/context/favorites-context"
import { useCart } from "@/context/cart-context"

// Enhanced product data with two-paragraph descriptions and stock information
const productData = [
  {
    id: 1,
    name: "Red Velvet Cake",
    rating: 4.8,
    imageUrl: "/red-velvet-cheesecake.png",
    price: 499,
    category: "Cake",
    isVeg: true,
    stock: 15, // Added stock information
    description: {
      para1:
        "Layered with creamy cheesecake, made with cocoa, cream cheese, and vanilla. The perfect balance of sweetness with a hint of cocoa flavor.",
      para2:
        "A classic dessert perfect for any occasion. Our red velvet cake is made with premium ingredients and baked fresh daily to ensure the best taste and texture.",
    },
    seller: {
      name: "Jenny Wilson",
      role: "Baker",
      avatar: "/jenny-wilson.jpg",
    },
    images: [
      "/red-velvet-cheesecake.png",
      "/images/red-velvet.png",
      "/colorful-fruit-tart.png",
      "/vibrant-macarons.png",
      "/classic-glazed.png",
    ],
  },
  {
    id: 2,
    name: "Chocolate Eclair",
    rating: 4.7,
    imageUrl: "/classic-chocolate-eclair.png",
    price: 299,
    category: "Pastry",
    isVeg: true,
    stock: 8,
    description: {
      para1:
        "Crisp choux pastry filled with rich chocolate cream and topped with chocolate glaze. Hand-crafted with premium ingredients.",
      para2:
        "Experience an authentic French pastry that melts in your mouth. Each eclair is carefully prepared by our pastry chefs using traditional techniques.",
    },
    seller: {
      name: "Jenny Wilson",
      role: "Chef",
      avatar: "/jenny-wilson.jpg",
    },
    images: [
      "/classic-chocolate-eclair.png",
      "/classic-glazed.png",
      "/decadent-chocolate-brownie.png",
      "/vibrant-macarons.png",
      "/colorful-fruit-tart.png",
    ],
  },
  {
    id: 3,
    name: "Strawberry Cheesecake",
    rating: 4.9,
    imageUrl: "/classic-strawberry-cheesecake.png",
    price: 549,
    category: "Cake",
    isVeg: true,
    stock: 3,
    description: {
      para1:
        "Creamy cheesecake with a graham cracker crust topped with fresh strawberry compote. Made with premium cream cheese.",
      para2:
        "We use only fresh seasonal strawberries to create the perfect balance of sweet and tangy flavors. Our cheesecake is baked slowly for the perfect texture.",
    },
    seller: {
      name: "Jenny Wilson",
      role: "Pastry Chef",
      avatar: "/jenny-wilson.jpg",
    },
    images: [
      "/classic-strawberry-cheesecake.png",
      "/classic-strawberry-cake.png",
      "/colorful-fruit-tart.png",
      "/layered-strawberry-cream.png",
      "/vibrant-macarons.png",
    ],
  },
  {
    id: 4,
    name: "Lemon Tart",
    rating: 4.6,
    imageUrl: "/bright-lemon-tart.png",
    price: 349,
    category: "Tart",
    isVeg: true,
    stock: 0, // Out of stock
    description: {
      para1:
        "Buttery pastry shell filled with tangy lemon curd and dusted with powdered sugar. The perfect balance of sweet and tart flavors.",
      para2:
        "Each bite delivers a burst of citrus that's both refreshing and indulgent. Our lemon tarts are made fresh daily using organic lemons and free-range eggs.",
    },
    seller: {
      name: "Jenny Wilson",
      role: "Baker",
      avatar: "/jenny-wilson.jpg",
    },
    images: [
      "/bright-lemon-tart.png",
      "/colorful-fruit-tart.png",
      "/classic-apple-pie.png",
      "/vibrant-macarons.png",
      "/golden-butter-croissant.png",
    ],
  },
  {
    id: 5,
    name: "Raspberry Macarons",
    rating: 4.8,
    imageUrl: "/vibrant-raspberry-macarons.png",
    price: 399,
    category: "Macaron",
    isVeg: true,
    stock: 20,
    description: {
      para1:
        "Delicate almond meringue cookies filled with raspberry buttercream. Light, airy cookies with a chewy center and crisp exterior.",
      para2:
        "Made with almond flour and natural raspberry flavor. Our macarons are aged for 24 hours to develop the perfect texture and flavor profile.",
    },
    seller: {
      name: "Jenny Wilson",
      role: "Patissier",
      avatar: "/jenny-wilson.jpg",
    },
    images: [
      "/vibrant-raspberry-macarons.png",
      "/vibrant-macarons.png",
      "/colorful-candy-mix.png",
      "/colorful-fruit-tart.png",
      "/classic-glazed.png",
    ],
  },
  {
    id: 6,
    name: "Chocolate Chip Cookies",
    rating: 4.7,
    imageUrl: "/classic-chocolate-chip-cookies.png",
    price: 249,
    category: "Cookie",
    isVeg: true,
    stock: 25,
    description: {
      para1:
        "Classic cookies loaded with premium chocolate chips and baked to golden perfection. Crisp edges with a soft, chewy center.",
      para2:
        "Made with real butter and premium chocolate. Each batch is carefully monitored to ensure the perfect balance of chewiness and crunch.",
    },
    seller: {
      name: "Jenny Wilson",
      role: "Baker",
      avatar: "/jenny-wilson.jpg",
    },
    images: [
      "/classic-chocolate-chip-cookies.png",
      "/festive-cookie-display.png",
      "/colorful-candy-mix.png",
      "/colorful-fruit-tart.png",
      "/decadent-chocolate-brownie.png",
    ],
  },
  {
    id: 7,
    name: "Vanilla Cake",
    rating: 4.5,
    imageUrl: "/classic-vanilla-cake.png",
    price: 449,
    category: "Cake",
    isVeg: true,
    stock: 12,
    description: {
      para1:
        "Light and fluffy vanilla sponge cake with smooth buttercream frosting. Made with Madagascar vanilla beans for exceptional flavor.",
      para2:
        "Perfect for birthdays and celebrations. Our vanilla cake is a timeless classic that appeals to all ages and can be customized with your favorite decorations.",
    },
    seller: {
      name: "Jenny Wilson",
      role: "Cake Artist",
      avatar: "/jenny-wilson.jpg",
    },
    images: [
      "/classic-vanilla-cake.png",
      "/celebration-cake.png",
      "/classic-strawberry-cake.png",
      "/decadent-chocolate-cake.png",
      "/layered-strawberry-cream.png",
    ],
  },
  {
    id: 8,
    name: "Chocolate Brownie",
    rating: 4.9,
    imageUrl: "/decadent-chocolate-brownie.png",
    price: 299,
    category: "Brownie",
    isVeg: true,
    stock: 18,
    description: {
      para1:
        "Rich, fudgy chocolate brownie with a crackly top and gooey center. Made with premium Belgian chocolate for an intense chocolate experience.",
      para2:
        "Perfect indulgence for chocolate lovers. Our brownies are baked to perfection - not too cakey, not too fudgy, but just right for that ultimate chocolate satisfaction.",
    },
    seller: {
      name: "Jenny Wilson",
      role: "Pastry Chef",
      avatar: "/jenny-wilson.jpg",
    },
    images: [
      "/decadent-chocolate-brownie.png",
      "/decadent-chocolate-cake.png",
      "/decadent-chocolate-almond-cake.png",
      "/decadent-berry-chocolate.png",
      "/mocha-delight.png",
    ],
  },
  {
    id: 9,
    name: "Strawberry Cupcake",
    rating: 4.6,
    imageUrl: "/frosted-strawberry-cupcake.png",
    price: 279,
    category: "Cupcake",
    isVeg: true,
    stock: 9,
    description: {
      para1:
        "Moist vanilla cupcake topped with strawberry buttercream and fresh strawberry. Made with real strawberries for natural flavor and color.",
      para2:
        "A delightful individual treat perfect for any occasion. Each cupcake is topped with a swirl of strawberry buttercream and garnished with a fresh strawberry slice.",
    },
    seller: {
      name: "Jenny Wilson",
      role: "Baker",
      avatar: "/jenny-wilson.jpg",
    },
    images: [
      "/frosted-strawberry-cupcake.png",
      "/swirled-delight.png",
      "/layered-strawberry-cream.png",
      "/classic-strawberry-cake.png",
      "/celebration-cake.png",
    ],
  },
  {
    id: 10,
    name: "Rustic Sourdough",
    rating: 4.7,
    imageUrl: "/rustic-loaf.png",
    price: 349,
    category: "Bread",
    isVeg: true,
    stock: 5,
    description: {
      para1:
        "Artisanal sourdough bread with a crispy crust and chewy interior. Made with a 100-year-old starter for complex flavor.",
      para2:
        "Fermented for 24 hours for improved digestibility. Our sourdough is made using traditional methods with just flour, water, salt, and our signature sourdough culture.",
    },
    seller: {
      name: "Jenny Wilson",
      role: "Baker",
      avatar: "/jenny-wilson.jpg",
    },
    images: [
      "/rustic-loaf.png",
      "/delightful-pastries.png",
      "/golden-butter-croissant.png",
      "/celebration-cake.png",
      "/autumn-treats.png",
    ],
  },
  {
    id: 11,
    name: "Chocolate Almond Cake",
    rating: 4.8,
    imageUrl: "/decadent-chocolate-almond-cake.png",
    price: 599,
    category: "Cake",
    isVeg: true,
    stock: 2, // Low stock
    description: {
      para1:
        "Rich chocolate cake with almond flour, topped with ganache and toasted almonds. Gluten-friendly and incredibly moist.",
      para2:
        "The perfect combination of chocolate and nuts. This cake offers a sophisticated flavor profile that's perfect for special occasions or as an elegant dessert option.",
    },
    seller: {
      name: "Jenny Wilson",
      role: "Chef",
      avatar: "/jenny-wilson.jpg",
    },
    images: [
      "/decadent-chocolate-almond-cake.png",
      "/decadent-chocolate-cake.png",
      "/decadent-berry-chocolate.png",
      "/decadent-chocolate-slice.png",
      "/mocha-delight.png",
    ],
  },
  {
    id: 12,
    name: "Celebration Cake",
    rating: 5.0,
    imageUrl: "/celebration-cake.png",
    price: 799,
    category: "Cake",
    isVeg: true,
    stock: 7,
    description: {
      para1:
        "Festive layered cake with colorful sprinkles, perfect for special occasions. Three layers of vanilla sponge with buttercream frosting.",
      para2:
        "Decorated with rainbow sprinkles for a festive look. This cake is designed to be the centerpiece of your celebration and can be customized with a personalized message.",
    },
    seller: {
      name: "Jenny Wilson",
      role: "Cake Designer",
      avatar: "/jenny-wilson.jpg",
    },
    images: [
      "/celebration-cake.png",
      "/classic-vanilla-cake.png",
      "/classic-strawberry-cake.png",
      "/decadent-chocolate-cake.png",
      "/layered-strawberry-cream.png",
    ],
  },
]

// Weight options
const weightOptions = [
  { value: 0.5, label: "0.5 Kg" },
  { value: 1, label: "1 Kg" },
  { value: 1.5, label: "1.5 Kg" },
  { value: 2, label: "2 Kg" },
  { value: 4, label: "4 Kg" },
]

export default function ProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = Number(params?.id) || 1 // Default to product ID 1 if no ID is provided
  const { toast } = useToast()

  // Find the product
  const product = productData.find((p) => p.id === productId) || productData[0]

  const { addToCart } = useCart()
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()

  // State for selected weight and main image
  const [selectedWeight, setSelectedWeight] = useState<number>(1)
  const [mainImage, setMainImage] = useState(product.imageUrl)
  const [isLiked, setIsLiked] = useState(isFavorite(product.id))

  // Add state for order type and piece quantity
  const [orderType, setOrderType] = useState<"kg" | "piece">("kg")
  const [pieceQuantity, setPieceQuantity] = useState(1)

  // Add state for description expansion
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  useEffect(() => {
    setIsLiked(isFavorite(product.id))
  }, [isFavorite, product.id])

  // Calculate price based on weight
  const piecePrice = 100 // Fixed price of 100 rupees per piece
  const totalPrice = orderType === "kg" ? product.price * selectedWeight : piecePrice * pieceQuantity

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    const productData: Product = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      isVeg: product.isVeg,
      description: product.description.para1 + " " + product.description.para2,
      rating: product.rating,
    }

    if (isLiked) {
      removeFromFavorites(product.id)
      setIsLiked(false)
    } else {
      addToFavorites(productData)
      setIsLiked(true)
    }
  }

  // Handle add to cart
  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently unavailable",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: orderType === "kg" ? product.price : piecePrice,
      image: product.imageUrl,
      quantity: orderType === "kg" ? selectedWeight : pieceQuantity,
      category: product.category,
      variant: orderType === "kg" ? `${selectedWeight} Kg` : `${pieceQuantity} Piece${pieceQuantity > 1 ? "s" : ""}`,
    }

    addToCart(cartItem)

    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
      className: "bg-green-50 text-green-800 border-green-300 py-3",
    })
  }

  // Function to render stock status
  const renderStockStatus = () => {
    if (product.stock === 0) {
      return (
        <div className="flex items-center gap-1.5 text-red-600 mt-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Out of Stock</span>
        </div>
      )
    } else if (product.stock <= 3) {
      return (
        <div className="flex items-center gap-1.5 text-amber-600 mt-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Only {product.stock} left in stock - order soon</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1.5 text-green-600 mt-2">
          <Package className="h-4 w-4" />
          <span className="text-sm font-medium">In Stock ({product.stock} available)</span>
        </div>
      )
    }
  }

  // Function to calculate delivery time based on stock status
  const calculateDeliveryTime = () => {
    // Base delivery times for different areas (in minutes)
    const baseDeliveryTimes = {
      "New Delhi": 60,
      Mumbai: 90,
      Bangalore: 75,
      Pune: 80,
    }

    // Get delivery time for selected address
    const addresses = [
      { label: "Home", address: "123 Main St, New Delhi, 110001" },
      { label: "Work", address: "456 Park Ave, Mumbai, 400001" },
      { label: "Parents", address: "789 Lake Rd, Bangalore, 560001" },
      { label: "Other", address: "101 Hilltop, Pune, 411001" },
    ]

    // Default to first address if none selected
    const selectedAddress = addresses[0]

    // Determine city from address
    const city = selectedAddress.address.split(",")[1]?.trim() || "New Delhi"
    // Get base delivery time for the city
    const baseTime = city in baseDeliveryTimes ? baseDeliveryTimes[city as keyof typeof baseDeliveryTimes] : 60 // Default to 60 minutes if city not found

    // Add 4 hours (240 minutes) if product is out of stock
    const additionalTime = product.stock === 0 ? 240 : 0

    // Total delivery time in minutes
    const totalMinutes = baseTime + additionalTime

    // Convert to hours and minutes
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    // Format the time string
    let timeString = ""
    if (hours > 0) {
      timeString += `${hours} hr${hours > 1 ? "s" : ""}`
    }
    if (minutes > 0) {
      timeString += `${hours > 0 ? " " : ""}${minutes} min${minutes > 1 ? "s" : ""}`
    }

    return {
      totalMinutes,
      timeString,
      isDelayed: product.stock === 0,
    }
  }

  return (
    <>
      <div className="bg-[#f5f5f5] flex flex-col items-center">
        <div className="max-w-[1300px] flex flex-col min-h-screen mb-20 mx-4">
          {/* Main content: two columns on desktop, one column on mobile */}
          <div className="flex flex-col md:flex-row md:gap-8 md:p-8 flex-1">
            {/* Left column */}
            <div className="md:w-2/3 flex flex-col gap-6">
              {/* Top navigation and Hero Image */}
              <div className="relative mt-4 rounded-2xl overflow-hidden">
                {/* Hero Image */}
                <div className="relative h-[350px] lg:h-[450px] w-full rounded-2xl overflow-hidden">
                  <Image
                    src={
                      mainImage ||
                      "/placeholder.svg?height=450&width=800&query=red velvet cake" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={product.name}
                    fill
                    priority
                    className="object-cover rounded-2xl"
                  />

                  {/* Nav buttons */}
                  <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
                    <button
                      onClick={() => router.back()}
                      className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
                    >
                      <BsArrowLeft className="text-gray-800" size={20} />
                    </button>

                    <div className="flex gap-3">
                      <button
                        onClick={handleFavoriteToggle}
                        className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
                      >
                        {isLiked ? (
                          <FaHeart className="text-red-500" size={20} />
                        ) : (
                          <FaRegHeart className="text-gray-800" size={20} />
                        )}
                      </button>

                      <button className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md">
                        <FaShare className="text-gray-800" size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image thumbnails */}
                <div className="absolute bottom-3 left-0 right-0 px-3">
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 px-1">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setMainImage(image)}
                        className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 ${
                          mainImage === image ? "border-[#560000]" : "border-white"
                        }`}
                      >
                        <Image
                          src={
                            image ||
                            "/placeholder.svg?height=64&width=64&query=cake thumbnail" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={`${product.name} thumbnail ${index + 1}`}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Info Section - Enhanced */}
              <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
                {/* Category and Rating */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">{product.category}</span>
                  <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full">
                    <FaStar className="text-amber-500 mr-1.5" />
                    <span className="font-semibold text-amber-800">{product.rating}</span>
                  </div>
                </div>

                {/* Product Name and Veg Indicator */}
                <div className="flex justify-between items-center mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                  {product.isVeg && (
                    <div className="w-6 h-6 border-2 border-green-600 flex items-center justify-center rounded-sm">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                {renderStockStatus()}

                {/* Description - Modified to show two paragraphs with initial truncation */}
                <div className="mb-7 mt-4">
                  <h2 className="font-semibold text-lg mb-3 text-gray-800">Description</h2>
                  <div className="space-y-4">
                    {isDescriptionExpanded ? (
                      <>
                        <p className="text-gray-700 leading-relaxed">{product.description.para1}</p>
                        <p className="text-gray-700 leading-relaxed">{product.description.para2}</p>
                      </>
                    ) : (
                      <p className="text-gray-700 leading-relaxed line-clamp-2">{product.description.para1}...</p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-sm font-medium text-[#560000] hover:text-[#560000]/80 transition-colors flex items-center mt-3"
                  >
                    {isDescriptionExpanded ? "Read less" : "Read more"}
                    <ChevronRight
                      className={`h-4 w-4 ml-1 transition-transform ${isDescriptionExpanded ? "rotate-90" : ""}`}
                    />
                  </button>
                </div>

                {/* Product Highlights / Tags */}
                <div className="mb-6">
                  <h2 className="font-semibold text-lg mb-3 text-gray-800">Highlights</h2>
                  <div className="flex flex-wrap gap-2">
                    {["Bestseller", "Eggless Option", "100% Veg", "No Preservatives"].map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#560000]/10 text-[#560000] px-4 py-1.5 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ingredients Preview */}
                <div>
                  <h2 className="font-semibold text-lg mb-3 text-gray-800">Ingredients</h2>
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="bg-gray-100 px-3 py-2 rounded-full flex items-center text-sm hover:bg-gray-200 transition-colors cursor-pointer">
                      <Coffee className="h-4 w-4 mr-2 text-[#560000]" />
                      Cocoa
                    </span>
                    <span className="bg-gray-100 px-3 py-2 rounded-full flex items-center text-sm hover:bg-gray-200 transition-colors cursor-pointer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 text-[#560000]"
                      >
                        <path d="M10.5 2.5a8 8 0 0 0-7 7L2 22l20-5.5V9.5a8 8 0 0 0-7-7Z" />
                        <path d="M8.5 15 7 22" />
                        <path d="M14 13l-1 9" />
                        <path d="M20 11.5 19 16" />
                      </svg>
                      Cheese
                    </span>
                    <span className="bg-gray-100 px-3 py-2 rounded-full flex items-center text-sm hover:bg-gray-200 transition-colors cursor-pointer">
                      <Apple className="h-4 w-4 mr-2 text-[#560000]" />
                      Strawberry
                    </span>
                    <span className="bg-gray-100 px-3 py-2 rounded-full flex items-center text-sm hover:bg-gray-200 transition-colors cursor-pointer">
                      <Egg className="h-4 w-4 mr-2 text-[#560000]" />
                      Eggless
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column (Weight, Price, Add to Cart) - only on md and up */}
            <div className="w-full md:w-1/3 flex flex-col gap-5 mt-4">
              {/* Card 1: Order Type, Select Weight/Quantity, Price, Add to Cart */}
              <div className="w-full bg-white rounded-3xl p-7 flex flex-col gap-5 h-fit shadow-sm">
                {/* Price display */}
                <div className="flex items-baseline gap-3 md:flex">
                  <h2 className="text-3xl font-bold text-black md:block hidden">₹{Math.round(totalPrice)}</h2>
                  {totalPrice > 500 && (
                    <p className="text-gray-400 line-through text-lg md:block hidden">
                      ₹{Math.round(totalPrice * 1.1)}
                    </p>
                  )}
                </div>

                {/* Stock Status in Card */}
                <div className="hidden md:block">{renderStockStatus()}</div>

                {/* Divider */}
                <div className="h-px bg-gray-100 w-full"></div>

                {/* Order Type */}
                <div>
                  <h2 className="text-gray-500 text-sm mb-3">Order Type</h2>
                  <div className="flex gap-3 p-1 bg-gray-100 rounded-xl">
                    <button
                      onClick={() => setOrderType("kg")}
                      className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                        orderType === "kg" ? "bg-white text-[#560000] shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      By Weight
                    </button>
                    <button
                      onClick={() => setOrderType("piece")}
                      className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                        orderType === "piece"
                          ? "bg-white text-[#560000] shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      By Piece
                    </button>
                  </div>
                </div>

                {/* Weight/Quantity Selection */}
                {orderType === "kg" ? (
                  <div>
                    <h2 className="text-gray-500 text-sm mb-3">Select Weight</h2>
                    <div className="grid grid-cols-3 gap-2">
                      {weightOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSelectedWeight(option.value)}
                          className={`py-3 rounded-xl text-sm transition-all ${
                            selectedWeight === option.value
                              ? "bg-[#560000] text-white font-medium"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-gray-500 text-sm mb-3">Select Quantity</h2>
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                      <button
                        onClick={() => setPieceQuantity(Math.max(1, pieceQuantity - 1))}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
                          pieceQuantity > 1 ? "bg-[#560000] text-white shadow-sm" : "text-gray-300 cursor-not-allowed"
                        }`}
                        disabled={pieceQuantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="text-xl font-medium text-gray-900">{pieceQuantity}</span>
                      <button
                        onClick={() => setPieceQuantity(pieceQuantity + 1)}
                        className="w-9 h-9 rounded-lg bg-[#560000] text-white flex items-center justify-center text-lg shadow-sm"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Delivery estimate */}
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl ${
                    calculateDeliveryTime().isDelayed ? "bg-amber-50" : "bg-gray-50"
                  }`}
                >
                  <Truck
                    className={`h-5 w-5 ${calculateDeliveryTime().isDelayed ? "text-amber-500" : "text-gray-400"}`}
                  />
                  <div>
                    <p className="text-sm text-gray-900 font-medium">
                      {calculateDeliveryTime().isDelayed ? "Extended Delivery Time" : "Delivery Today"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {calculateDeliveryTime().isDelayed
                        ? `Estimated delivery in ${
                            calculateDeliveryTime().timeString
                          } (additional 4 hrs for restocking)`
                        : `Estimated delivery in ${calculateDeliveryTime().timeString}`}
                    </p>
                  </div>
                </div>

                {/* Add to Cart button (hide on mobile) */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`text-white rounded-xl px-6 py-4 items-center justify-center font-medium text-base transition-all hidden md:flex ${
                    product.stock === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-[#560000] hover:bg-[#560000]/90"
                  }`}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>

              {/* Card 2: Nutrition Info (move to right section on desktop) */}
              <div className="p-6 bg-white rounded-2xl shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Macronutrients Breakdown</h2>
                <div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Calories</p>
                      <p className="text-3xl font-bold text-gray-800">360 Cal</p>
                    </div>
                    <div className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-lg">
                      Net wt: 100 g
                    </div>
                  </div>
                  <hr className="my-4 border-gray-200" />
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-5 h-5" />
                        <span>Proteins</span>
                      </div>
                      <span>3.2 g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-5 h-5" />
                        <span>Fats</span>
                      </div>
                      <span>18.0 g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Image src="/svg/food/bread.svg" alt="Carbs" width={20} height={20} className="w-5 h-5" />
                        <span>Carbs</span>
                      </div>
                      <span>46.0 g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Candy className="w-5 h-5" />
                        <span>Sugars</span>
                      </div>
                      <span>34.0 g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Wheat className="w-5 h-5" />
                        <span>Fiber</span>
                      </div>
                      <span>0.6 g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Shell className="w-5 h-5" />
                        <span>Sodium</span>
                      </div>
                      <span>250 mg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CakeDeliveryCard stock={product.stock} />
          {/* Price and Add to Cart - Sticky at bottom for screens < 767px */}
          <div className="fixed bottom-20 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between z-40 md:hidden">
            <div>
              <p className="text-gray-500 text-sm">Total Price</p>
              <p className="text-xl font-bold text-gray-900">₹{Math.round(totalPrice)}</p>
              {/* Mobile Stock Status */}
              {product.stock === 0 && <p className="text-xs font-medium text-red-600">Out of Stock</p>}
              {product.stock > 0 && product.stock <= 3 && (
                <p className="text-xs font-medium text-amber-600">Only {product.stock} left</p>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`rounded-full px-6 py-3 flex items-center gap-2 ${
                product.stock === 0 ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#560000] text-white"
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">{product.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
            </button>
          </div>
          {/* Add padding at the bottom to account for the sticky button on mobile only */}
          <div className="h-24 md:h-0"></div>
        </div>
      </div>
      <Toaster />
    </>
  )
}
