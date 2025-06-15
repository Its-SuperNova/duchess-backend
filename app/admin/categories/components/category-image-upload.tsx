"use client";

import type React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X, ImageIcon, LinkIcon } from "lucide-react";
import { useState } from "react";

interface CategoryImageUploadProps {
  categoryImage: string | null;
  setCategoryImage: (image: string | null) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CategoryImageUpload({
  categoryImage,
  setCategoryImage,
  handleImageUpload,
}: CategoryImageUploadProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      setCategoryImage(imageUrl.trim());
      setImageUrl("");
      setShowUrlInput(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Image</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {categoryImage ? (
                <>
                  <Image
                    src={categoryImage || "/placeholder.svg"}
                    alt="Category Preview"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setCategoryImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="text-center p-6">
                  <ImageIcon className="h-10 w-10 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Upload an image to represent this category
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Label
                htmlFor="category-image"
                className="cursor-pointer inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload from Device
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="h-9 px-4"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Add URL
              </Button>
            </div>

            {showUrlInput && (
              <div className="space-y-2 p-3 border rounded-md bg-muted/50">
                <Label htmlFor="image-url" className="text-sm">
                  Image URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="image-url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleUrlSubmit}
                    disabled={!imageUrl.trim()}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUrlInput(false);
                    setImageUrl("");
                  }}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}

            <input
              type="file"
              id="category-image"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <p className="text-xs text-muted-foreground">
              PNG, JPG or GIF, Max 2MB. Recommended size: 400x300px
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
