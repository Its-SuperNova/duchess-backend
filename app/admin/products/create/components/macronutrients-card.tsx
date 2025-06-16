"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MacronutrientsCardProps {
  formData: {
    calories: string
    netWeight: string
    protein: string
    fats: string
    carbs: string
    sugars: string
    fiber: string
    sodium: string
  }
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function MacronutrientsCard({ formData, handleChange }: MacronutrientsCardProps) {
  return (
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
  )
}
