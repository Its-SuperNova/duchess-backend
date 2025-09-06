"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, RefreshCw, Eye, GripVertical } from "lucide-react";
import { BsGridFill } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { getThumbnailUrl } from "@/lib/cloudinary-client";
import {
  useMotionValue,
  Reorder,
  useDragControls,
  motion,
  MotionValue,
  animate,
  DragControls,
} from "motion/react";

interface Category {
  id: string;
  name: string;
  image: string;
  is_active: boolean;
  order?: number; // Local order for drag and drop
}

// Helper functions for motion
const inactiveShadow = "0px 0px 0px rgba(0,0,0,0.8)";

function useRaisedShadow(value: MotionValue<number>) {
  const boxShadow = useMotionValue(inactiveShadow);

  useEffect(() => {
    let isActive = false;
    value.onChange((latest) => {
      const wasActive = isActive;
      if (latest !== 0) {
        isActive = true;
        if (isActive !== wasActive) {
          animate(boxShadow, "5px 5px 10px rgba(0,0,0,0.3)");
        }
      } else {
        isActive = false;
        if (isActive !== wasActive) {
          animate(boxShadow, inactiveShadow);
        }
      }
    });
  }, [value, boxShadow]);

  return boxShadow;
}

interface ReorderIconProps {
  dragControls: DragControls;
}

function ReorderIcon({ dragControls }: ReorderIconProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.85 }}
      onPointerDown={(e) => {
        e.preventDefault();
        dragControls.start(e);
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 39 39"
        width="24"
        height="24"
        className="fill-white cursor-grab active:cursor-grabbing"
      >
        <path d="M 5 0 C 7.761 0 10 2.239 10 5 C 10 7.761 7.761 10 5 10 C 2.239 10 0 7.761 0 5 C 0 2.239 2.239 0 5 0 Z"></path>
        <path d="M 19 0 C 21.761 0 24 2.239 24 5 C 24 7.761 21.761 10 19 10 C 16.239 10 14 7.761 14 5 C 14 2.239 16.239 0 19 0 Z"></path>
        <path d="M 33 0 C 35.761 0 38 2.239 38 5 C 38 7.761 35.761 10 33 10 C 30.239 10 28 7.761 28 5 C 28 2.239 30.239 0 33 0 Z"></path>
        <path d="M 33 14 C 35.761 14 38 16.239 38 19 C 38 21.761 35.761 24 33 24 C 30.239 24 28 21.761 28 19 C 28 16.239 30.239 14 33 14 Z"></path>
        <path d="M 19 14 C 21.761 14 24 16.239 24 19 C 24 21.761 21.761 24 19 24 C 16.239 24 14 21.761 14 19 C 14 16.239 16.239 14 19 14 Z"></path>
        <path d="M 5 14 C 7.761 14 10 16.239 10 19 C 10 21.761 7.761 24 5 24 C 2.239 24 0 21.761 0 19 C 0 16.239 2.239 14 5 14 Z"></path>
        <path d="M 5 28 C 7.761 28 10 30.239 10 33 C 10 35.761 7.761 38 5 38 C 2.239 38 0 35.761 0 33 C 0 30.239 2.239 28 5 28 Z"></path>
        <path d="M 19 28 C 21.761 28 24 30.239 24 33 C 24 35.761 21.761 38 19 38 C 16.239 38 14 35.761 14 33 C 14 30.239 16.239 28 19 28 Z"></path>
        <path d="M 33 28 C 35.761 28 38 30.239 38 33 C 38 35.761 35.761 38 33 38 C 30.239 38 28 35.761 28 33 C 28 30.239 30.239 28 33 28 Z"></path>
      </svg>
    </motion.div>
  );
}

export default function CategoryManagementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsFetching(true);
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (data.success) {
          // Add order for drag and drop functionality
          const categoriesWithOrder = data.categories.map(
            (cat: Category, index: number) => ({
              ...cat,
              order: index + 1,
            })
          );
          setCategories(categoriesWithOrder);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const categoryOrders = categories.map((cat, index) => ({
        id: cat.id,
        order: index + 1,
      }));

      const response = await fetch("/api/categories/order", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryOrders }),
      });

      const data = await response.json();
      if (data.success) {
        setHasChanges(false);
        // Update local state with new order
        setCategories((prev) =>
          prev.map((cat, index) => ({
            ...cat,
            order: index + 1,
          }))
        );
      } else {
        throw new Error(data.error || "Failed to save category order");
      }
    } catch (error) {
      console.error("Error saving categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = (newCategories: Category[]) => {
    setCategories(newCategories);
    setHasChanges(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BsGridFill className="h-8 w-8" />
              Category Management
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GripVertical className="h-4 w-4" />
            <span>
              Drag and drop categories to reorder them. The order here
              determines how they appear on the home page.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Categories Section - Motion-based Drag and Drop */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Categories</h2>
        {isFetching ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex-shrink-0">
                <div className="w-32 h-32 relative group rounded-lg overflow-hidden bg-white animate-pulse">
                  <div className="relative w-full h-full flex flex-col">
                    {/* Image skeleton */}
                    <div className="w-full h-20 rounded-lg bg-gray-100"></div>
                    {/* Name skeleton */}
                    <div className="p-2 rounded-b-lg flex items-center justify-center bg-white">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                    {/* Order badge skeleton */}
                    <div className="absolute top-1 right-1">
                      <div className="w-6 h-4 bg-gray-100 rounded-full border border-gray-200"></div>
                    </div>
                    {/* Drag handle skeleton */}
                    <div className="absolute top-1 left-1">
                      <div className="w-6 h-6 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Reorder.Group
            axis="x"
            values={categories}
            onReorder={handleReorder}
            className="flex gap-4 overflow-x-auto pb-4"
          >
            {categories.map((category, index) => (
              <CategoryItem
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}

// Category Item Component for Motion Drag and Drop
const CategoryItem = ({
  category,
  index,
}: {
  category: Category;
  index: number;
}) => {
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y);
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={category}
      style={{ boxShadow, y }}
      dragListener={false}
      dragControls={dragControls}
      className={`flex-shrink-0 ${!category.is_active ? "opacity-60" : ""}`}
    >
      <div className="w-32 h-32 relative group rounded-lg overflow-hidden bg-white">
        <div className="relative w-full h-full flex flex-col">
          {/* Category Image */}
          <div className="w-full h-20 rounded-lg overflow-hidden">
            <img
              src={
                category.image
                  ? getThumbnailUrl(category.image, 200)
                  : "/images/categories/sweets-bowl.png"
              }
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Category Name */}
          <div className="p-2 rounded-b-lg flex items-center justify-center">
            <p className="text-sm font-medium text-center text-gray-800 truncate">
              {category.name}
            </p>
          </div>

          {/* Order Badge */}
          <div className="absolute top-1 right-1">
            <Badge variant="outline" className="text-xs bg-white/90">
              #{index + 1}
            </Badge>
          </div>

          {/* Drag Handle */}
          <div className="absolute top-1 left-1">
            <ReorderIcon dragControls={dragControls} />
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
};
