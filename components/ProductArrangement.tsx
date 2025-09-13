"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { getProductThumbnailUrl } from "@/lib/image-utils";

interface Product {
  id: string;
  name: string;
  banner_image: string | null;
  is_veg: boolean;
  weight_options: any;
  piece_options: any;
  selling_type: string;
  show_on_home: boolean;
  categories: { name: string } | null;
}

interface ProductArrangementProps {
  products: Product[];
  onArrangementChange: (productIds: string[]) => void;
}

export default function ProductArrangement({
  products,
  onArrangementChange,
}: ProductArrangementProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [arrangement, setArrangement] = useState<string[]>(
    products.map((p) => p.id)
  );

  const handleDragStart = (e: React.DragEvent, productId: string) => {
    setDraggedItem(productId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetProductId: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === targetProductId) {
      setDraggedItem(null);
      return;
    }

    const newArrangement = [...arrangement];
    const draggedIndex = newArrangement.indexOf(draggedItem);
    const targetIndex = newArrangement.indexOf(targetProductId);

    // Remove dragged item and insert at target position
    newArrangement.splice(draggedIndex, 1);
    newArrangement.splice(targetIndex, 0, draggedItem);

    setArrangement(newArrangement);
    onArrangementChange(newArrangement);
    setDraggedItem(null);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newArrangement = [...arrangement];
    const [movedItem] = newArrangement.splice(fromIndex, 1);
    newArrangement.splice(toIndex, 0, movedItem);

    setArrangement(newArrangement);
    onArrangementChange(newArrangement);
  };

  const moveLeft = (index: number) => {
    if (index > 0) {
      moveItem(index, index - 1);
    }
  };

  const moveRight = (index: number) => {
    if (index < arrangement.length - 1) {
      moveItem(index, index + 1);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {arrangement.map((productId, index) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return null;

        return (
          <Card
            key={productId}
            className={`relative transition-all duration-200 ${
              draggedItem === productId
                ? "opacity-50 scale-95"
                : "hover:shadow-lg hover:scale-105"
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, productId)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, productId)}
          >
            {/* Position Badge */}
            <div className="absolute top-2 left-2 z-10">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold shadow-md">
                {index + 1}
              </div>
            </div>

            {/* Drag Handle */}
            <div className="absolute top-2 right-2 z-10">
              <div className="flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-md cursor-move">
                <GripVertical className="h-4 w-4 text-gray-600" />
              </div>
            </div>

            <CardContent className="p-4">
              {/* Product Image */}
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 mb-4">
                <img
                  src={getProductThumbnailUrl(product)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-base line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {product.categories?.name || "No category"}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1">
                  {product.is_veg && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Veg
                    </span>
                  )}
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                    {product.selling_type}
                  </span>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveLeft(index)}
                    disabled={index === 0}
                    className="flex-1 text-xs"
                  >
                    ← Move Left
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveRight(index)}
                    disabled={index === arrangement.length - 1}
                    className="flex-1 text-xs"
                  >
                    Move Right →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
