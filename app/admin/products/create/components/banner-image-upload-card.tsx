"use client"

import type React from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon } from "lucide-react"

interface BannerImageUploadCardProps {
  bannerImage: string | null
  setBannerImage: (image: string | null) => void
  handleBannerImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function BannerImageUploadCard({
  bannerImage,
  setBannerImage,
  handleBannerImageUpload,
}: BannerImageUploadCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Banner Image</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {bannerImage ? (
                <>
                  <Image src={bannerImage || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setBannerImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="text-center p-6">
                  <ImageIcon className="h-10 w-10 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Upload a high-quality image for the product card
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label
              htmlFor="banner-image"
              className="cursor-pointer inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Banner Image
            </Label>
            <input
              type="file"
              id="banner-image"
              className="hidden"
              accept="image/*"
              onChange={handleBannerImageUpload}
            />
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG or GIF, Max 2MB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
