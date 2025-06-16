"use client"

import type React from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, Upload, X, ImageIcon } from "lucide-react"
import { TagInput } from "@/components/shared/tag-input"
import { Badge } from "@/components/ui/badge"

interface ProductPageFormSectionProps {
  formData: any
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectChange: (name: string, value: string) => void
  handleSwitchChange: (name: string, checked: boolean) => void
  additionalImages: string[]
  setAdditionalImages: (images: string[]) => void
  mediaSlots: number
  setMediaSlots: (slots: number) => void
  urlInputIndex: number
  setUrlInputIndex: (index: number) => void
  mediaUrls: string[]
  setMediaUrls: (urls: string[]) => void
  handleAdditionalImageUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void
  removeAdditionalImage: (index: number) => void
  handleUrlChange: (index: number, url: string) => void
  handleUrlSubmit: (index: number) => void
  addWeightOption: () => void
  updateWeightOption: (index: number, field: string, value: string | boolean) => void
  removeWeightOption: (index: number) => void
  updatePieceOption: (index: number, field: string, value: string | boolean) => void
}

export function ProductPageFormSection({
  formData,
  handleChange,
  handleSelectChange,
  handleSwitchChange,
  additionalImages,
  setAdditionalImages,
  mediaSlots,
  setMediaSlots,
  urlInputIndex,
  setUrlInputIndex,
  mediaUrls,
  setMediaUrls,
  handleAdditionalImageUpload,
  removeAdditionalImage,
  handleUrlChange,
  handleUrlSubmit,
  addWeightOption,
  updateWeightOption,
  removeWeightOption,
  updatePieceOption,
}: ProductPageFormSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left Column - Pricing Options */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Selling Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sellingType">Order Type</Label>
              <Select value={formData.sellingType} onValueChange={(value) => handleSelectChange("sellingType", value)}>
                <SelectTrigger className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0">
                  <SelectValue placeholder="Select selling type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">By Weight</SelectItem>
                  <SelectItem value="piece">By Piece</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Weight Options */}
            {(formData.sellingType === "weight" || formData.sellingType === "both") && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium">Weight Options</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addWeightOption} className="h-8">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Weight
                  </Button>
                </div>
                <div className="space-y-4">
                  {formData.weightOptions.map((option: any, index: number) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start pb-4 border-b last:border-0">
                      <div className="col-span-3">
                        <Label htmlFor={`weight-${index}`} className="text-xs">
                          Weight
                        </Label>
                        <Input
                          id={`weight-${index}`}
                          value={option.weight}
                          onChange={(e) => updateWeightOption(index, "weight", e.target.value)}
                          placeholder="E.g., 0.5 Kg"
                          className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor={`price-${index}`} className="text-xs">
                          Price (₹)
                        </Label>
                        <Input
                          id={`price-${index}`}
                          type="number"
                          min="0"
                          value={option.price}
                          onChange={(e) => updateWeightOption(index, "price", e.target.value)}
                          placeholder="0"
                          className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor={`stock-${index}`} className="text-xs">
                          Stock
                        </Label>
                        <Input
                          id={`stock-${index}`}
                          type="number"
                          min="0"
                          value={option.stock}
                          onChange={(e) => updateWeightOption(index, "stock", e.target.value)}
                          placeholder="0"
                          className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                        />
                      </div>
                      <div className="col-span-1 pt-6">
                        <Switch
                          id={`active-${index}`}
                          checked={option.isActive}
                          onCheckedChange={(checked) => updateWeightOption(index, "isActive", checked)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                      <div className="col-span-2 pt-5">
                        {formData.weightOptions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeWeightOption(index)}
                            className="h-8 w-8 text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  * First weight option will be used as the default price. Leave stock empty if always available.
                </p>
              </div>
            )}

            {/* Piece Options */}
            {(formData.sellingType === "piece" || formData.sellingType === "both") && (
              <div className="pt-4 border-t">
                <div className="mb-4">
                  <h3 className="text-base font-medium">Piece Option</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-4">
                      <Label htmlFor="piece-quantity" className="text-xs">
                        Quantity
                      </Label>
                      <Input
                        id="piece-quantity"
                        value={formData.pieceOptions[0]?.quantity || "1 piece"}
                        onChange={(e) => updatePieceOption(0, "quantity", e.target.value)}
                        placeholder="E.g., 1 piece"
                        className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                        required
                      />
                    </div>
                    <div className="col-span-4">
                      <Label htmlFor="piece-price" className="text-xs">
                        Price (₹)
                      </Label>
                      <Input
                        id="piece-price"
                        type="number"
                        min="0"
                        value={formData.pieceOptions[0]?.price || ""}
                        onChange={(e) => updatePieceOption(0, "price", e.target.value)}
                        placeholder="0"
                        className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                        required
                      />
                    </div>
                    <div className="col-span-4">
                      <Label htmlFor="piece-stock" className="text-xs">
                        Stock
                      </Label>
                      <Input
                        id="piece-stock"
                        type="number"
                        min="0"
                        value={formData.pieceOptions[0]?.stock || ""}
                        onChange={(e) => updatePieceOption(0, "stock", e.target.value)}
                        placeholder="0"
                        className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Leave stock empty if always available.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Product Gallery</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={mediaSlots.toString()} onValueChange={(value) => setMediaSlots(Number.parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="7">7</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">slots</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: mediaSlots }, (_, index) => (
                <div key={index} className="space-y-2">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {additionalImages[index] ? (
                        <>
                          {additionalImages[index].includes(".mp4") || additionalImages[index].includes("video") ? (
                            <video
                              src={additionalImages[index]}
                              className="w-full h-full object-cover"
                              controls
                              muted
                            />
                          ) : (
                            <Image
                              src={additionalImages[index] || "/placeholder.svg"}
                              alt={`Media ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          )}
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => removeAdditionalImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <div className="text-center p-2">
                          <ImageIcon className="h-6 w-6 mx-auto text-gray-400" />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Media {index + 1}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-1">
                      <Label
                        htmlFor={`media-${index}`}
                        className="cursor-pointer inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-2 py-1 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground flex-1"
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Upload
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => setUrlInputIndex(urlInputIndex === index ? -1 : index)}
                      >
                        URL
                      </Button>
                    </div>

                    {urlInputIndex === index && (
                      <div className="space-y-1">
                        <Input
                          placeholder="Enter image/video URL"
                          value={mediaUrls[index] || ""}
                          onChange={(e) => handleUrlChange(index, e.target.value)}
                          className="text-xs h-8"
                        />
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleUrlSubmit(index)}
                          >
                            Add
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setUrlInputIndex(-1)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    id={`media-${index}`}
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={(e) => handleAdditionalImageUpload(index, e)}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Supports images (PNG, JPG, GIF) and videos (MP4, WebM). Max 10MB per file.
            </p>
          </CardContent>
        </Card>

        {/* Delivery Details - New separate card */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryOption">Delivery Availability</Label>
              <Select
                value={formData.deliveryOption}
                onValueChange={(value) => handleSelectChange("deliveryOption", value)}
              >
                <SelectTrigger className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0">
                  <SelectValue placeholder="Select delivery availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="same-day">Only Same Day Delivery</SelectItem>
                  <SelectItem value="both">Both Same Day & Schedule for Later</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Product Details */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="longDescription">Long Description</Label>
              <Textarea
                id="longDescription"
                name="longDescription"
                value={formData.longDescription}
                onChange={handleChange}
                placeholder="Detailed description of the product..."
                className="min-h-[150px] focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-details">Category</Label>
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
                  <SelectItem value="Tarts">Tarts</SelectItem>
                  <SelectItem value="Macarons">Macarons</SelectItem>
                  <SelectItem value="Croissants">Croissants</SelectItem>
                  <SelectItem value="Pies">Pies</SelectItem>
                  <SelectItem value="Muffins">Muffins</SelectItem>
                  <SelectItem value="Sweets">Sweets</SelectItem>
                  <SelectItem value="Chocolates">Chocolates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Highlights Section */}
            <div className="pt-4 border-t">
              <h3 className="text-base font-medium mb-3">Highlights</h3>
              <TagInput
                placeholder="Add product highlights (e.g., Gluten-free, Sugar-free)"
                onTagsChange={(tags) => handleSelectChange("highlights", tags as any)}
              />
              <p className="text-xs text-muted-foreground">Add key features or selling points of the product</p>
            </div>

            {/* Ingredients Section */}
            <div className="pt-4 border-t">
              <h3 className="text-base font-medium mb-3">Ingredients</h3>
              <TagInput
                placeholder="Add ingredients (e.g., Flour, Sugar, Butter)"
                onTagsChange={(tags) => handleSelectChange("ingredients", tags as any)}
              />
              <p className="text-xs text-muted-foreground">List all ingredients used in the product</p>
            </div>
          </CardContent>
        </Card>

        {/* Macronutrients Breakdown - New separate card */}
        <Card>
          <CardHeader>
            <CardTitle>Macronutrients Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calories (kcal)</Label>
                <Input
                  id="calories"
                  name="calories"
                  type="number"
                  min="0"
                  value={formData.calories}
                  onChange={handleChange}
                  placeholder="0"
                  className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="netWeight">Net Weight (g)</Label>
                <Input
                  id="netWeight"
                  name="netWeight"
                  type="number"
                  min="0"
                  value={formData.netWeight}
                  onChange={handleChange}
                  placeholder="0"
                  className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  name="protein"
                  type="number"
                  min="0"
                  value={formData.protein}
                  onChange={handleChange}
                  placeholder="0"
                  className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fats">Fats (g)</Label>
                <Input
                  id="fats"
                  name="fats"
                  type="number"
                  min="0"
                  value={formData.fats}
                  onChange={handleChange}
                  placeholder="0"
                  className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  name="carbs"
                  type="number"
                  min="0"
                  value={formData.carbs}
                  onChange={handleChange}
                  placeholder="0"
                  className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sugars">Sugars (g)</Label>
                <Input
                  id="sugars"
                  name="sugars"
                  type="number"
                  min="0"
                  value={formData.sugars}
                  onChange={handleChange}
                  placeholder="0"
                  className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiber">Fiber (g)</Label>
                <Input
                  id="fiber"
                  name="fiber"
                  type="number"
                  min="0"
                  value={formData.fiber}
                  onChange={handleChange}
                  placeholder="0"
                  className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sodium">Sodium (mg)</Label>
                <Input
                  id="sodium"
                  name="sodium"
                  type="number"
                  min="0"
                  value={formData.sodium}
                  onChange={handleChange}
                  placeholder="0"
                  className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customization Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="addTextOnCake">Add text on cake</Label>
              <Switch
                id="addTextOnCake"
                checked={formData.addTextOnCake}
                onCheckedChange={(checked) => handleSwitchChange("addTextOnCake", checked)}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="addCandles">Add candles</Label>
              <Switch
                id="addCandles"
                checked={formData.addCandles}
                onCheckedChange={(checked) => handleSwitchChange("addCandles", checked)}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="addKnife">Add knife</Label>
              <Switch
                id="addKnife"
                checked={formData.addKnife}
                onCheckedChange={(checked) => handleSwitchChange("addKnife", checked)}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="addMessageCard">Add message card</Label>
              <Switch
                id="addMessageCard"
                checked={formData.addMessageCard}
                onCheckedChange={(checked) => handleSwitchChange("addMessageCard", checked)}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            {(formData.addTextOnCake || formData.addCandles || formData.addKnife || formData.addMessageCard) && (
              <div className="pt-4 border-t">
                <h3 className="font-medium text-sm mb-2">Available Customizations:</h3>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.addTextOnCake && (
                      <Badge variant="outline" className="text-xs">
                        Text on Cake
                      </Badge>
                    )}
                    {formData.addCandles && (
                      <Badge variant="outline" className="text-xs">
                        Candles
                      </Badge>
                    )}
                    {formData.addKnife && (
                      <Badge variant="outline" className="text-xs">
                        Knife
                      </Badge>
                    )}
                    {formData.addMessageCard && (
                      <Badge variant="outline" className="text-xs">
                        Message Card
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
