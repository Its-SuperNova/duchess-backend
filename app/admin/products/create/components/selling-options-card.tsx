"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

interface SellingOptionsCardProps {
  formData: {
    sellingType: string
    weightOptions: { weight: string; price: string; stock: string; isActive: boolean }[]
    pieceOptions: { quantity: string; price: string; stock: string; isActive: boolean }[]
  }
  handleSelectChange: (name: string, value: string) => void
  addWeightOption: () => void
  updateWeightOption: (index: number, field: string, value: string | boolean) => void
  removeWeightOption: (index: number) => void
  updatePieceOption: (index: number, field: string, value: string | boolean) => void
}

export function SellingOptionsCard({
  formData,
  handleSelectChange,
  addWeightOption,
  updateWeightOption,
  removeWeightOption,
  updatePieceOption,
}: SellingOptionsCardProps) {
  return (
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
              {formData.weightOptions.map((option, index) => (
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
  )
}
