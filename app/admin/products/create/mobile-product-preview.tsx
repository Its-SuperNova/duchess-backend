"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Package,
  AlertCircle,
  Clock,
  MapPin,
  Percent,
  Copy,
  Gift,
  Pencil,
  Flame,
  Utensils,
  MessageSquare,
  Check,
  Dumbbell,
  Droplet,
  Candy,
  Wheat,
  Shell,
  HomeIcon,
  SearchIcon,
  HeartIcon,
  UserIcon,
} from "lucide-react"
import { FaStar } from "react-icons/fa"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { format, addDays, startOfToday } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductPreviewProps {
  name: string
  category: string
  description: string
  isVeg: boolean
  bannerImage: string | null
  additionalImages: string[]
  weightOptions: { weight: string; price: string; stock: string; isActive: boolean }[]
  pieceOptions: { quantity: string; price: string; stock: string; isActive: boolean }[]
  price: string
  calories: string
  netWeight: string
  protein: string
  fats: string
  carbs: string
  sugars: string
  fiber: string
  sodium: string
  deliveryOption: string
  addTextOnCake: boolean
  addCandles: boolean
  addKnife: boolean
  addMessageCard: boolean
  highlights: string[]
  ingredients: string[]
  sellingType: string
}

// Helper for the common delivery detail block
const DeliveryDetailBlock = ({ currentStock }: { currentStock: number | null }) => (
  <div
    className={`flex items-center justify-between p-3 rounded-lg border ${
      currentStock === 0 ? "bg-amber-50 border-amber-100" : "bg-green-50 border-green-100"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`${currentStock === 0 ? "bg-amber-600" : "bg-green-600"} text-white p-2 rounded-lg`}>
        <Clock className="h-5 w-5" />
      </div>
      <div>
        <p className={`font-medium ${currentStock === 0 ? "text-amber-800" : "text-green-800"}`}>
          {currentStock === 0 ? "Extended delivery time" : "Same-day delivery available"}
        </p>
        <p className={`text-sm ${currentStock === 0 ? "text-amber-600" : "text-green-600"}`}>
          Product making time, around 2 hrs
        </p>
      </div>
    </div>
    <div className="flex flex-col items-end">
      <span className={`text-sm font-medium ${currentStock === 0 ? "text-amber-800" : "text-amber-800"}`}>
        {currentStock === 0 ? "Today + 4hrs" : "Today"}
      </span>
      <span className={`text-xs ${currentStock === 0 ? "text-amber-600" : "text-green-600"}`}>
        {currentStock === 0 ? "9:00 PM - 11:00 PM" : "5:00 PM - 7:00 PM"}
      </span>
    </div>
  </div>
)

interface ScheduleDatePickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectDateTime: (date: string, time: string) => void // Callback for selected date/time
}

function ScheduleDatePickerDialog({ isOpen, onClose, onSelectDateTime }: ScheduleDatePickerDialogProps) {
  const [selectedDate, setSelectedDate] = useState<string>(format(addDays(startOfToday(), 1), "yyyy-MM-dd"))
  const [selectedTime, setSelectedTime] = useState<string>("10:00 AM - 12:00 PM")

  const handleConfirm = () => {
    onSelectDateTime(selectedDate, selectedTime)
    onClose()
  }

  const timeSlots = [
    "10:00 AM - 12:00 PM",
    "12:00 PM - 02:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
    "06:00 PM - 08:00 PM",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Delivery Date & Time</DialogTitle>
          <DialogDescription>Choose a preferred date and time for your scheduled delivery.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Select Date (Next 5 Days)</Label>
            <RadioGroup value={selectedDate} onValueChange={setSelectedDate} className="grid grid-cols-3 gap-2">
              {Array.from({ length: 5 }, (_, i) => {
                const date = addDays(startOfToday(), i + 1)
                const dateValue = format(date, "yyyy-MM-dd")
                return (
                  <div key={dateValue}>
                    <RadioGroupItem value={dateValue} id={`date-${dateValue}`} className="sr-only" />
                    <Label
                      htmlFor={`date-${dateValue}`}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-blue-600 [&:has([data-state=checked])]:bg-blue-50 [&:has([data-state=checked])]:text-blue-900"
                    >
                      <span className="text-xs text-gray-500">{format(date, "EEE")}</span>
                      <span className="font-medium text-lg">{format(date, "d")}</span>
                      <span className="text-xs text-gray-500">{format(date, "MMM")}</span>
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="time-slot" className="text-base font-semibold">
              Select Time Slot
            </Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger id="time-slot" className="w-full">
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm Selection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function MobileProductPreview({
  name = "Product Name",
  category = "Category",
  description = "Product description goes here.",
  isVeg = true,
  bannerImage = null,
  additionalImages = [],
  weightOptions = [{ weight: "0.5 Kg", price: "499", stock: "15", isActive: true }],
  pieceOptions = [{ quantity: "1 piece", price: "100", stock: "10", isActive: true }],
  price = "499",
  calories = "360",
  netWeight = "100",
  protein = "3.2",
  fats = "18.0",
  carbs = "46.0",
  sugars = "34.0",
  fiber = "0.6",
  sodium = "250",
  deliveryOption = "both",
  addTextOnCake = false,
  addCandles = false,
  addKnife = false,
  addMessageCard = false,
  highlights = [],
  ingredients = [],
  sellingType = "weight",
}: ProductPreviewProps) {
  const [selectedWeight, setSelectedWeight] = useState(0)
  const [mainImage, setMainImage] = useState(bannerImage || additionalImages[0] || "/placeholder.svg")
  const [orderType, setOrderType] = useState<"kg" | "piece">(sellingType === "piece" ? "piece" : "kg")
  const [pieceQuantity, setPieceQuantity] = useState(1)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [activeDeliveryTab, setActiveDeliveryTab] = useState(deliveryOption === "same-day" ? "same-day" : "schedule")
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)

  useEffect(() => {
    if (deliveryOption === "same-day") {
      setActiveDeliveryTab("same-day")
    } else if (deliveryOption === "schedule") {
      setActiveDeliveryTab("schedule")
    } else {
      setActiveDeliveryTab("same-day")
    }
  }, [deliveryOption])

  const activeWeightOptions = weightOptions.filter((option) => option.isActive && option.weight && option.price)
  const activePieceOptions = pieceOptions.filter((option) => option.isActive && option.quantity && option.price)

  useEffect(() => {
    if (activeWeightOptions.length > 0 && selectedWeight === 0) {
      setSelectedWeight(0)
    }
  }, [activeWeightOptions, selectedWeight])

  const calculatePrice = () => {
    if (orderType === "kg" && activeWeightOptions.length > 0) {
      const selectedOption = activeWeightOptions[selectedWeight]
      return selectedOption ? Number(selectedOption.price) || 0 : 0
    } else if (orderType === "piece" && activePieceOptions.length > 0) {
      const selectedOption = activePieceOptions[0]
      return selectedOption ? (Number(selectedOption.price) || 0) * pieceQuantity : 0
    }
    return Number(price) || 499
  }

  const getCurrentStock = () => {
    if (orderType === "kg" && activeWeightOptions.length > 0) {
      const selectedOption = activeWeightOptions[selectedWeight]
      return selectedOption?.stock ? Number(selectedOption.stock) : null
    } else if (orderType === "piece" && activePieceOptions.length > 0) {
      const selectedOption = activePieceOptions[0]
      return selectedOption?.stock ? Number(selectedOption.stock) : null
    }
    return null
  }

  const totalPrice = calculatePrice()
  const currentStock = getCurrentStock()

  const renderStockStatus = (stock: number | null) => {
    if (stock === null) {
      return (
        <div className="flex items-center gap-1.5 text-green-600 mt-2">
          <Package className="h-4 w-4" />
          <span className="text-sm font-medium">Always Available</span>
        </div>
      )
    } else if (stock === 0) {
      return (
        <div className="flex items-center gap-1.5 text-orange-600 mt-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Out of Stock (Can be requested)</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1.5 text-green-600 mt-2">
          <Package className="h-4 w-4" />
          <span className="text-sm font-medium">In Stock ({stock} available)</span>
        </div>
      )
    }
  }

  const handleSelectScheduledDateTime = (date: string, time: string) => {
    console.log("Selected Scheduled Date:", date)
    console.log("Selected Scheduled Time:", time)
  }

  return (
    <div className="bg-[#f5f5f5] flex flex-col items-center w-full max-w-md mx-auto">
      {/* iPhone Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-50"></div>
      <div className="flex flex-col min-h-screen mb-[136px] w-full">
        {/* Hero Image */}
        <div className="relative mt-4 rounded-2xl overflow-hidden mx-4">
          <div className="relative h-[350px] w-full rounded-2xl overflow-hidden">
            <Image src={mainImage || "/placeholder.svg"} alt={name} fill className="object-cover rounded-2xl" />

            {/* Nav buttons */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
              <button
                className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
                onClick={(e) => e.preventDefault()}
              >
                <ChevronLeft className="text-gray-800" size={20} />
              </button>
              <div className="flex gap-3">
                <button
                  className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
                  onClick={(e) => e.preventDefault()}
                >
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
                  onClick={(e) => e.preventDefault()}
                >
                  <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Image thumbnails */}
          <div className="absolute bottom-3 left-0 right-0 px-3">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 px-1">
              {[bannerImage, ...additionalImages].filter(Boolean).map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault()
                    setMainImage(image)
                  }}
                  className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 ${
                    mainImage === image ? "border-[#560000]" : "border-white"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info Section */}
        <Card className="bg-white shadow-sm rounded-2xl overflow-hidden mx-4 mt-4">
          <CardContent className="grid gap-6 p-6">
            {/* Category and Rating */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">{category}</span>
              <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full">
                <FaStar className="text-amber-500 mr-1.5" />
                <span className="font-semibold text-amber-800">4.8</span>
              </div>
            </div>

            {/* Product Name and Veg Indicator */}
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              {isVeg && (
                <div className="w-6 h-6 border-2 border-green-600 flex items-center justify-center rounded-sm">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6 mt-4">
              <h2 className="font-semibold text-lg mb-3 text-gray-800">Description</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed line-clamp-2">{description}...</p>
              </div>
              <button
                className="text-sm font-medium text-[#560000] hover:text-[#560000]/80 transition-colors flex items-center mt-3"
                onClick={(e) => e.preventDefault()}
              >
                Read more
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            {/* Product Highlights */}
            {highlights && highlights.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-lg mb-3 text-gray-800">Highlights</h2>
                <div className="flex flex-wrap gap-2">
                  {highlights.map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#560000]/10 text-[#560000] px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients Preview */}
            {ingredients && ingredients.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-lg mb-3 text-gray-800">Ingredients</h2>
                <div className="flex flex-wrap gap-2 items-center">
                  {ingredients.map((ingredient) => (
                    <span key={ingredient} className="bg-gray-100 px-3 py-2 rounded-full text-sm">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm rounded-2xl overflow-hidden mx-4 my-4">
          <CardContent className="grid gap-6 p-6">
            {/* Order Type */}
            {sellingType === "both" && (
              <div className="mb-6">
                <h2 className="text-gray-500 text-sm mb-3">Order Type</h2>
                <div className="flex gap-3 p-1 bg-gray-100 rounded-xl">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setOrderType("kg")
                    }}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                      orderType === "kg" ? "bg-white text-[#560000] shadow-sm" : "text-gray-500"
                    }`}
                  >
                    By Weight
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setOrderType("piece")
                    }}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                      orderType === "piece" ? "bg-white text-[#560000] shadow-sm" : "text-gray-500"
                    }`}
                  >
                    By Piece
                  </button>
                </div>
              </div>
            )}

            {/* Weight/Quantity Selection */}
            {orderType === "kg" && (sellingType === "weight" || sellingType === "both") ? (
              <div className="mb-6">
                <h2 className="text-gray-500 text-sm mb-3">Select Weight</h2>
                <div className="grid grid-cols-3 gap-2">
                  {activeWeightOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault()
                        setSelectedWeight(index)
                      }}
                      className={`py-3 rounded-xl text-sm transition-all ${
                        selectedWeight === index ? "bg-[#560000] text-white font-medium" : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {option.weight}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h2 className="text-gray-500 text-sm mb-3">Select Quantity</h2>
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setPieceQuantity(Math.max(1, pieceQuantity - 1))
                    }}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
                      pieceQuantity > 1 ? "bg-[#560000] text-white shadow-sm" : "text-gray-300 cursor-not-allowed"
                    }`}
                    disabled={pieceQuantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-xl font-medium text-gray-900">{pieceQuantity}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setPieceQuantity(pieceQuantity + 1)
                    }}
                    className="w-9 h-9 rounded-lg bg-[#560000] text-white flex items-center justify-center text-lg shadow-sm"
                    disabled={currentStock !== null && pieceQuantity >= currentStock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Delivery estimate */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 mb-6">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm text-gray-900 font-medium">Delivery Today</p>
                <p className="text-xs text-gray-500">Estimated delivery in 1 hr</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Options Card for Mobile */}
        <Card className="bg-white shadow-sm rounded-2xl overflow-hidden mx-4 mb-4">
          <CardContent className="grid gap-6 p-6">
            {/* Delivery Options */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800">Delivery Options</h3>

              {deliveryOption === "both" ? (
                <Tabs value={activeDeliveryTab} onValueChange={setActiveDeliveryTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="same-day">Same Day Delivery</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule for Later</TabsTrigger>
                  </TabsList>

                  <TabsContent value="same-day" className="mt-4">
                    <DeliveryDetailBlock currentStock={currentStock} />
                  </TabsContent>

                  <TabsContent value="schedule" className="mt-4">
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        setIsScheduleDialogOpen(true)
                      }}
                      className="w-full"
                    >
                      Select Date & Time
                    </Button>
                    <ScheduleDatePickerDialog
                      isOpen={isScheduleDialogOpen}
                      onClose={() => setIsScheduleDialogOpen(false)}
                      onSelectDateTime={handleSelectScheduledDateTime}
                    />
                  </TabsContent>
                </Tabs>
              ) : deliveryOption === "same-day" ? (
                <div className="mt-2">
                  <DeliveryDetailBlock currentStock={currentStock} />
                </div>
              ) : deliveryOption === "schedule" ? (
                <div className="mt-2">
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      setIsScheduleDialogOpen(true)
                    }}
                    className="w-full"
                  >
                    Select Date & Time
                  </Button>
                  <ScheduleDatePickerDialog
                    isOpen={isScheduleDialogOpen}
                    onClose={() => setIsScheduleDialogOpen(false)}
                    onSelectDateTime={handleSelectScheduledDateTime}
                  />
                </div>
              ) : null}

              {/* Address display - Placeholder */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-[#560000] mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">Delivering to:</span>
                      <span className="text-sm font-medium text-[#560000] mt-0.5">Home</span>
                      <div className="text-sm text-gray-600 mt-0.5">
                        <div>123 Main St</div>
                        <div>New Delhi, 110001</div>
                      </div>
                    </div>
                    <button
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[#560000] font-medium text-sm hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm"
                      onClick={(e) => e.preventDefault()}
                    >
                      <ChevronRight className="h-4 w-4" />
                      Change
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm rounded-2xl overflow-hidden mx-4 mb-4">
          <CardContent className="grid gap-6 p-6">
            {/* Customization - Using props directly */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800">Customization</h3>
              <div className="grid grid-cols-2 gap-2">
                {addTextOnCake && (
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all border-gray-400 bg-gray-100"
                  >
                    <Pencil className="h-4 w-4 text-black" />
                    <span className="text-black truncate">Add text on cake</span>
                    <Check className="h-3.5 w-3.5 ml-auto text-black" />
                  </button>
                )}
                {addCandles && (
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all border-gray-400 bg-gray-100"
                  >
                    <Flame className="h-4 w-4 text-black" />
                    <span className="text-black truncate">Add candles</span>
                    <Check className="h-3.5 w-3.5 ml-auto text-black" />
                  </button>
                )}
                {addKnife && (
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all border-gray-400 bg-gray-100"
                  >
                    <Utensils className="h-4 w-4 text-black" />
                    <span className="text-black truncate">Add knife</span>
                    <Check className="h-3.5 w-3.5 ml-auto text-black" />
                  </button>
                )}
                {addMessageCard && (
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all border-gray-400 bg-gray-100"
                  >
                    <MessageSquare className="h-4 w-4 text-black" />
                    <span className="text-black truncate">Add message card</span>
                    <Check className="h-3.5 w-3.5 ml-auto text-black" />
                  </button>
                )}
                {!(addTextOnCake || addCandles || addKnife || addMessageCard) && (
                  <p className="text-sm text-gray-500 col-span-2">No customizations selected.</p>
                )}
              </div>
              {(addTextOnCake || addCandles || addKnife || addMessageCard) && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    * All customizations will be added to your order when you click "Add to Cart"
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm rounded-2xl overflow-hidden mx-4 mb-4">
          <CardContent className="grid gap-6 p-6">
            {/* Offers section - Minimalist */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800">Offers</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-green-100 bg-green-50">
                  <Percent className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">10% off on orders above ₹1000</p>
                    <p className="text-xs text-green-700">Use code: CAKE10</p>
                  </div>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="text-xs bg-white text-green-700 border border-green-200 rounded-lg px-2 py-1 flex items-center gap-1 hover:bg-green-50 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </button>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-100 bg-blue-50">
                  <Gift className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">Free delivery on your first order</p>
                    <p className="text-xs text-blue-700">Use code: FIRSTCAKE</p>
                  </div>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="text-xs bg-white text-blue-700 border border-blue-200 rounded-lg px-2 py-1 flex items-center gap-1 hover:bg-blue-50 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm rounded-2xl overflow-hidden mx-4 mb-4">
          <CardContent className="grid gap-6 p-6">
            <div className="mb-6">
              {/* This div is now inside CardContent */}
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Macronutrients Breakdown</h2>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Calories</p>
                    <p className="text-2xl font-bold text-gray-800">{calories} Cal</p>
                  </div>
                  <div className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-lg">
                    Net wt: {netWeight} g
                  </div>
                </div>
                <hr className="my-4 border-gray-200" />
                <div className="space-y-3 text-gray-700 text-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4" />
                      <span>Proteins</span>
                    </div>
                    <span>{protein} g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4" />
                      <span>Fats</span>
                    </div>
                    <span>{fats} g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Wheat className="w-4 h-4" />
                      <span>Carbs</span>
                    </div>
                    <span>{carbs} g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Candy className="w-4 h-4" />
                      <span>Sugars</span>
                    </div>
                    <span>{sugars} g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Wheat className="w-4 h-4" />
                      <span>Fiber</span>
                    </div>
                    <span>{fiber} g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Shell className="w-4 h-4" />
                      <span>Sodium</span>
                    </div>
                    <span>{sodium} mg</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex justify-around items-center z-40 h-[64px]">
          <div className="flex flex-col items-center text-xs text-gray-500">
            <HomeIcon className="h-5 w-5" />
            <span>Home</span>
          </div>
          <div className="flex flex-col items-center text-xs text-gray-500">
            <SearchIcon className="h-5 w-5" />
            <span>Search</span>
          </div>
          <div className="flex flex-col items-center text-xs text-gray-500">
            <HeartIcon className="h-5 w-5" />
            <span>Favorites</span>
          </div>
          <div className="flex flex-col items-center text-xs text-gray-500">
            <UserIcon className="h-5 w-5" />
            <span>Profile</span>
          </div>
        </div>

        {/* Sticky bottom cart */}
        <div className="absolute bottom-[64px] left-0 right-0 bg-white p-4 border-t border-gray-200 flex items-center justify-between z-40">
          <div>
            <p className="text-gray-500 text-sm">Total Price</p>
            <p className="text-xl font-bold text-gray-900">₹{Math.round(totalPrice)}</p>
            {/* Mobile Stock Status */}
            {renderStockStatus(currentStock)}
          </div>
          <button
            className={`rounded-full px-6 py-3 flex items-center gap-2 text-white ${
              currentStock === 0 ? "bg-orange-600 hover:bg-orange-700" : "bg-[#560000] hover:bg-[#560000]/90"
            }`}
            onClick={(e) => e.preventDefault()}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0L5.4 5M7 13h10m0 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
              />
            </svg>
            <span className="font-medium">{currentStock === 0 ? "Request Item" : "Add to Cart"}</span>
          </button>
        </div>

        {/* Bottom padding for sticky button */}
        <div className="h-[136px]"></div>
      </div>
    </div>
  )
}
