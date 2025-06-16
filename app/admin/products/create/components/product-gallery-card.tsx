"use client"

import type React from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Upload, X, ImageIcon } from "lucide-react"

interface ProductGalleryCardProps {
  additionalImages: string[]
  setAdditionalImages: (images: string[]) => void
  mediaSlots: number
  setMediaSlots: (slots: number) => void
  urlInputIndex: number
  setUrlInputIndex: (index: number) => void
  mediaUrls: string[]
  setMediaUrls: (urls: string[]) => void
  handleAdditionalImageUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void
  removeAdditionalImage: (index: number) => void
  handleUrlChange: (index: number, url: string) => void
  handleUrlSubmit: (index: number) => void
}

export function ProductGalleryCard({
  additionalImages,
  setAdditionalImages,
  mediaSlots,
  setMediaSlots,
  urlInputIndex,
  setUrlInputIndex,
  mediaUrls,
  setMediaUrls,
  handleAdditionalImageUpload,
  removeAdditionalImage,
  handleUrlChange,
  handleUrlSubmit,
}: ProductGalleryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product Gallery</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={mediaSlots.toString()} onValueChange={(value) => setMediaSlots(Number.parseInt(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="7">7</SelectItem>
              <SelectItem value="8">8</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">slots</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: mediaSlots }, (_, index) => (
            <div key={index} className="space-y-2">
              <div className="border rounded-lg overflow-hidden">
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {additionalImages[index] ? (
                    <>
                      {additionalImages[index].includes(".mp4") || additionalImages[index].includes("video") ? (
                        <video src={additionalImages[index]} className="w-full h-full object-cover" controls muted />
                      ) : (
                        <Image
                          src={additionalImages[index] || "/placeholder.svg"}
                          alt={`Media ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      )}
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeAdditionalImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <ImageIcon className="h-6 w-6 mx-auto text-gray-400" />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Media {index + 1}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-1">
                  <Label
                    htmlFor={`media-${index}`}
                    className="cursor-pointer inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-2 py-1 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground flex-1"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => setUrlInputIndex(urlInputIndex === index ? -1 : index)}
                  >
                    URL
                  </Button>
                </div>

                {urlInputIndex === index && (
                  <div className="space-y-1">
                    <Input
                      placeholder="Enter image/video URL"
                      value={mediaUrls[index] || ""}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      className="text-xs h-8"
                    />
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleUrlSubmit(index)}
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setUrlInputIndex(-1)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <input
                type="file"
                id={`media-${index}`}
                className="hidden"
                accept="image/*,video/*"
                onChange={(e) => handleAdditionalImageUpload(index, e)}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Supports images (PNG, JPG, GIF) and videos (MP4, WebM). Max 10MB per file.
        </p>
      </CardContent>
    </Card>
  )
}
