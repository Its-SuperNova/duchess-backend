"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Star, BadgePercent } from "lucide-react" // Changed BiSolidOffer to BadgePercent

interface AdminProductCardPreviewProps {
  name?: string
  description?: string
  isVeg?: boolean
  hasOffer?: boolean
  offerPercentage?: string
  offerUpToPrice?: string
  image?: string | null
  rating?: string
  price?: string // This prop is not used in the current preview, but kept for consistency if needed elsewhere.
}

export default function AdminProductCardPreview({
  name = "Product Name",
  description = "Layered with creamy cheesecake, made with cocoa, cream cheese, a...",
  isVeg = false, // Changed default to false to match image
  hasOffer = true, // Changed default to true to match image
  offerPercentage = "10",
  offerUpToPrice = "60", // Added default for offerUpToPrice
  image = "/images/red-velvet-cake.png", // Changed default image to match provided image
  rating = "4.8", // Changed default rating to match image
  price = "100",
}: AdminProductCardPreviewProps) {
  return (
    <Card className="w-full max-w-sm rounded-[24px] overflow-hidden shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
        <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full flex items-center shadow-md">
          <Star className="text-amber-500 mr-1.5" size={14} fill="currentColor" />{" "}
          {/* Changed FaStar to Star, added fill */}
          <span className="font-semibold text-sm text-gray-800">{rating}</span>
        </div>
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
          <Heart className="text-gray-500" size={18} />
        </button>
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-gray-900">{name}</CardTitle>
          {isVeg ? (
            <div className="w-5 h-5 border-2 border-green-600 flex items-center justify-center rounded-sm flex-shrink-0">
              <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
            </div>
          ) : (
            <div className="w-5 h-5 border-2 border-red-600 flex items-center justify-center rounded-sm flex-shrink-0">
              <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        {hasOffer && (
          <>
            <div className="border-t border-dashed border-gray-300 my-4" />
            <div className="flex items-center gap-2 text-blue-600">
              <BadgePercent className="h-4 w-4" /> {/* Changed BiSolidOffer to BadgePercent */}
              <span className="text-sm font-medium">
                {offerPercentage}% OFF {offerUpToPrice && `up to ₹${offerUpToPrice}`}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
