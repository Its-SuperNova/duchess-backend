"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface CustomizationOptionsCardProps {
  formData: {
    addTextOnCake: boolean
    addCandles: boolean
    addKnife: boolean
    addMessageCard: boolean
  }
  handleSwitchChange: (name: string, checked: boolean) => void
}

export function CustomizationOptionsCard({ formData, handleSwitchChange }: CustomizationOptionsCardProps) {
  return (
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
  )
}
