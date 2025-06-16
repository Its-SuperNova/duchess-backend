"use client"

import type React from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Upload, X, ImageIcon } from "lucide-react"

interface ProductCardFormSectionProps {
  formData: any
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectChange: (name: string, value: string) => void
  handleSwitchChange: (name: string, checked: boolean) => void
  bannerImage: string | null
  setBannerImage: (image: string | null) => void
  handleBannerImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ProductCardFormSection({
  formData,
  handleChange,
  handleSelectChange,
  handleSwitchChange,
  bannerImage,
  setBannerImage,
  handleBannerImageUpload,
}: ProductCardFormSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
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
              <div className="pt-2">
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
            )}
            {formData.hasOffer && (
              <div className="pt-2">
                <Label htmlFor="offerUpToPrice">Offer Up To (₹)</Label>
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Banner Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {bannerImage ? (
                  <>
                    <Image src={bannerImage || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => setBannerImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <ImageIcon className="h-10 w-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Upload a high-quality image for the product card
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label
                htmlFor="banner-image"
                className="cursor-pointer inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Banner Image
              </Label>
              <input
                type="file"
                id="banner-image"
                className="hidden"
                accept="image/*"
                onChange={handleBannerImageUpload}
              />
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG or GIF, Max 2MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
