"use client";

import type React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X, ImageIcon, LinkIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useImageUpload } from "@/lib/hooks/useImageUpload";

interface CategoryImageUploadProps {
  categoryImage: string | null;
  setCategoryImage: (image: string | null) => void;
}

export function CategoryImageUpload({
  categoryImage,
  setCategoryImage,
}: CategoryImageUploadProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Use the Cloudinary upload hook
  const { uploadImage, isUploading, error } = useImageUpload({
    folder: "categories",
    onSuccess: (url) => {
      setCategoryImage(url);
      console.log("✅ Image uploaded successfully to Cloudinary!");
      console.log("📁 Cloudinary URL:", url);
      console.log("📂 Folder: categories");
      console.log("💾 Image URL stored in component state");
    },
    onError: (error) => {
      console.error("❌ Upload error:", error);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
      // Reset input value
      e.target.value = "";
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      setCategoryImage(imageUrl.trim());
      setImageUrl("");
      setShowUrlInput(false);
    }
  };

  // Check if the image source is valid (not base64)
  const isValidImageSource =
    categoryImage && !categoryImage.startsWith("data:");
  const imageSrc = isValidImageSource ? categoryImage : "/placeholder.svg";

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
                    src={imageSrc}
                    alt="Category Preview"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    onError={() => {
                      console.warn(
                        "⚠️ Invalid image source detected. Please re-upload the image."
                      );
                      setCategoryImage(null);
                    }}
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

          {!isValidImageSource && categoryImage && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ This category has an old image format. Please remove and
                re-upload for better performance.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex gap-2">
              <Label
                htmlFor="category-image"
                className="cursor-pointer inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground flex-1"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? "Uploading..." : "Upload from Device"}
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

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

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
              onChange={handleFileSelect}
            />
            <p className="text-xs text-muted-foreground">
              PNG, JPG or GIF, Max 5MB. Recommended size: 400x300px
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
