"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DeliveryOptionsCardProps {
  formData: {
    deliveryOption: string
  }
  handleSelectChange: (name: string, value: string) => void
}

export function DeliveryOptionsCard({ formData, handleSelectChange }: DeliveryOptionsCardProps) {
  return (
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
  )
}
