"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ProductInfoCardProps {
  formData: {
    name: string
    shortDescription: string
    category: string
    isVeg: boolean
    hasOffer: boolean
    offerPercentage: string
    offerUpToPrice: string
  }
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectChange: (name: string, value: string) => void
  handleSwitchChange: (name: string, checked: boolean) => void
}

export function ProductInfoCard({
  formData,
  handleChange,
  handleSelectChange,
  handleSwitchChange,
}: ProductInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Card Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Title</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="E.g., Red Velvet Cheesecake"
            className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Textarea
            id="shortDescription"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="1-2 sentences describing the product"
            className="min-h-[80px] focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
            <SelectTrigger className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cakes">Cakes</SelectItem>
              <SelectItem value="Cupcakes">Cupcakes</SelectItem>
              <SelectItem value="Cookies">Cookies</SelectItem>
              <SelectItem value="Pastries">Pastries</SelectItem>
              <SelectItem value="Breads">Breads</SelectItem>
              <SelectItem value="Donuts">Donuts</SelectItem>
              <SelectItem value="Brownies">Brownies</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isVeg">Veg/Non-Veg Indicator</Label>
          <div className="flex items-center space-x-2">
            <RadioGroup
              value={formData.isVeg ? "veg" : "nonveg"}
              onValueChange={(value) => handleSwitchChange("isVeg", value === "veg")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="veg" id="veg" />
                <Label htmlFor="veg" className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-green-600 flex items-center justify-center rounded-sm">
                    <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                  </div>
                  Veg
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nonveg" id="nonveg" />
                <Label htmlFor="nonveg" className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-red-600 flex items-center justify-center rounded-sm">
                    <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
                  </div>
                  Non-Veg
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="hasOffer">Offer</Label>
            <Switch
              id="hasOffer"
              checked={formData.hasOffer}
              onCheckedChange={(checked) => handleSwitchChange("hasOffer", checked)}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
          {formData.hasOffer && (
            <div className="pt-2 space-y-2">
              <div>
                <Label htmlFor="offerPercentage">Offer Percentage</Label>
                <div className="flex items-center mt-1">
                  <Input
                    id="offerPercentage"
                    name="offerPercentage"
                    type="number"
                    min="1"
                    max="99"
                    value={formData.offerPercentage}
                    onChange={handleChange}
                    placeholder="E.g., 10"
                    className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                    required={formData.hasOffer}
                  />
                  <span className="ml-2">%</span>
                </div>
              </div>
              <div>
                <Label htmlFor="offerUpToPrice">Offer Up To Price</Label>
                <div className="flex items-center mt-1">
                  <Input
                    id="offerUpToPrice"
                    name="offerUpToPrice"
                    type="number"
                    min="0"
                    value={formData.offerUpToPrice}
                    onChange={handleChange}
                    placeholder="E.g., 100"
                    className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                    required={formData.hasOffer}
                  />
                  <span className="ml-2">₹</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
