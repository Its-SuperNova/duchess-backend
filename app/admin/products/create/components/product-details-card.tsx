"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/shared/tag-input";

interface ProductDetailsCardProps {
  formData: {
    longDescription: string;
    category: string;
    offer: string;
    isVeg: boolean;
    highlights: string[];
    ingredients: string[];
  };
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSelectChange: (name: string, value: string | string[]) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
  categories: any[];
}

export function ProductDetailsCard({
  formData,
  handleChange,
  handleSelectChange,
  handleSwitchChange,
  categories,
}: ProductDetailsCardProps) {
  return (
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
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange("category", value)}
          >
            <SelectTrigger className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Highlights Section */}
        <div className="pt-4 border-t">
          <h3 className="text-base font-medium mb-3">Highlights</h3>
          <TagInput
            placeholder="Add product highlights (e.g., Gluten-free, Sugar-free)"
            onTagsChange={(tags) => handleSelectChange("highlights", tags)}
            initialTags={formData.highlights}
          />
          <p className="text-xs text-muted-foreground">
            Add key features or selling points of the product
          </p>
        </div>

        {/* Ingredients Section */}
        <div className="pt-4 border-t">
          <h3 className="text-base font-medium mb-3">Ingredients</h3>
          <TagInput
            placeholder="Add ingredients (e.g., Flour, Sugar, Butter)"
            onTagsChange={(tags) => handleSelectChange("ingredients", tags)}
            initialTags={formData.ingredients}
          />
          <p className="text-xs text-muted-foreground">
            List all ingredients used in the product
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
