"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { GalleryMinimalistic } from "@solar-icons/react";
import { useRouter } from "next/navigation";

export default function BannersPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Banners</h1>
      </div>

      {/* Banner Cards Row - Left Aligned */}
      <div className="flex gap-6">
        {/* Hero Slider Card */}
        <Card
          className="shadow-sm w-64 cursor-pointer hover:shadow-md transition-shadow bg-white"
          onClick={() => router.push("/admin/banners/hero-slider")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-center">Hero Slider</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-16 flex items-center justify-center">
              <GalleryMinimalistic weight="Broken" color="black" size={40} />
            </div>
          </CardContent>
        </Card>

        {/* Footer Banner Card */}
        <Card
          className="shadow-sm w-64 cursor-pointer hover:shadow-md transition-shadow bg-white"
          onClick={() => router.push("/admin/banners/footer-banner")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-center">Footer Banner</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-16 flex items-center justify-center">
              <GalleryMinimalistic weight="Broken" color="black" size={40} />
            </div>
          </CardContent>
        </Card>

        {/* Popup Banner Card */}
        <Card
          className="shadow-sm w-64 cursor-pointer hover:shadow-md transition-shadow bg-white"
          onClick={() => router.push("/admin/banners/popup-banner")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-center">Popup Banner</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-16 flex items-center justify-center">
              <GalleryMinimalistic weight="Broken" color="black" size={40} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
