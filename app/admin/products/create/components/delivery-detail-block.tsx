"use client"

import { Clock } from "lucide-react"

interface DeliveryDetailBlockProps {
  currentStock: number | null
}

export function DeliveryDetailBlock({ currentStock }: DeliveryDetailBlockProps) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-green-100 bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-green-800">Same-day delivery available</span>
              <span className="text-xs text-green-700 mt-0.5">Product making time, around 2 hrs</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-green-800">Today</span>
            <span className="text-xs text-green-700">5:00 PM - 7:00 PM</span>
          </div>
        </div>
      </div>
      {currentStock !== null && currentStock <= 0 && (
        <div className="flex items-center gap-2 text-orange-600 text-sm">
          <span className="font-medium">Currently out of stock for same-day delivery.</span>
        </div>
      )}
    </div>
  )
}
