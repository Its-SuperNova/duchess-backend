"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  ArrowLeft,
  Upload,
  Monitor,
  Smartphone,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";

interface Slide {
  id: number;
  title: string;
  desktopImage: File | null;
  desktopImageUrl: string;
  mobileImage: File | null;
  mobileImageUrl: string;
  isClickable: boolean;
  redirectUrl: string;
}

export default function HeroSliderPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("desktop");
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 1,
      title: "Slide 1",
      desktopImage: null,
      desktopImageUrl: "",
      mobileImage: null,
      mobileImageUrl: "",
      isClickable: false,
      redirectUrl: "",
    },
  ]);

  const addSlide = () => {
    const newSlideId = slides.length + 1;
    setSlides([
      {
        id: newSlideId,
        title: `Slide ${newSlideId}`,
        desktopImage: null,
        desktopImageUrl: "",
        mobileImage: null,
        mobileImageUrl: "",
        isClickable: false,
        redirectUrl: "",
      },
      ...slides,
    ]);
  };

  const removeSlide = (slideId: number) => {
    if (slides.length > 1) {
      setSlides(slides.filter((slide) => slide.id !== slideId));
    }
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    slideId: number,
    deviceType: "desktop" | "mobile"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a preview URL for the image
      const imageUrl = URL.createObjectURL(file);

      // Update the slide with the image data for the specific device type
      setSlides(
        slides.map((slide) =>
          slide.id === slideId
            ? deviceType === "desktop"
              ? { ...slide, desktopImage: file, desktopImageUrl: imageUrl }
              : { ...slide, mobileImage: file, mobileImageUrl: imageUrl }
            : slide
        )
      );

      // Reset the input value so the same file can be selected again
      event.target.value = "";
    }
  };

  const triggerFileUpload = (
    slideId: number,
    deviceType: "desktop" | "mobile"
  ) => {
    // Create a temporary file input for this specific slide and device type
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => handleFileUpload(e as any, slideId, deviceType);
    input.click();
  };

  const getCurrentImageData = (slide: Slide) => {
    if (activeTab === "desktop") {
      return {
        image: slide.desktopImage,
        imageUrl: slide.desktopImageUrl,
      };
    } else {
      return {
        image: slide.mobileImage,
        imageUrl: slide.mobileImageUrl,
      };
    }
  };

  const removeImage = (slideId: number, deviceType: "desktop" | "mobile") => {
    setSlides(
      slides.map((s) =>
        s.id === slideId
          ? deviceType === "desktop"
            ? { ...s, desktopImage: null, desktopImageUrl: "" }
            : { ...s, mobileImage: null, mobileImageUrl: "" }
          : s
      )
    );
  };

  const toggleClickable = (slideId: number) => {
    setSlides(
      slides.map((s) =>
        s.id === slideId ? { ...s, isClickable: !s.isClickable } : s
      )
    );
  };

  const renderSlide = (slide: {
    id: number;
    title: string;
    desktopImage: File | null;
    desktopImageUrl: string;
    mobileImage: File | null;
    mobileImageUrl: string;
    isClickable: boolean;
    redirectUrl: string;
  }) => {
    const currentImageData = getCurrentImageData(slide);

    return (
      <div
        key={slide.id}
        className="border border-gray-200 rounded-lg p-4 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{slide.title}</h3>
          {slides.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeSlide(slide.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${activeTab}-upload-${slide.id}`}>
            Banner Image
          </Label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer w-full"
            style={{
              aspectRatio: activeTab === "desktop" ? "1168/250" : "450/220",
            }}
            onClick={() =>
              !currentImageData.imageUrl &&
              triggerFileUpload(slide.id, activeTab as "desktop" | "mobile")
            }
          >
            {currentImageData.imageUrl ? (
              // Show uploaded image preview
              <div className="w-full h-full relative">
                <img
                  src={currentImageData.imageUrl}
                  alt={`Banner for ${slide.title}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      removeImage(slide.id, activeTab as "desktop" | "mobile")
                    }
                    className="bg-white/80 hover:bg-white text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              // Show upload placeholder
              <div className="flex flex-col items-center justify-center text-center space-y-2 h-full">
                <ImageIcon className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Upload a high-quality image for the banner
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor={`${activeTab}-url-${slide.id}`}>Banner URL</Label>
              <div className="flex gap-2">
                <Input
                  id={`${activeTab}-url-${slide.id}`}
                  placeholder="Enter banner image URL"
                  className="flex-1"
                  value={currentImageData.imageUrl}
                  onChange={(e) => {
                    setSlides(
                      slides.map((s) =>
                        s.id === slide.id
                          ? activeTab === "desktop"
                            ? { ...s, desktopImageUrl: e.target.value }
                            : { ...s, mobileImageUrl: e.target.value }
                          : s
                      )
                    );
                  }}
                />
                <Button
                  className="bg-[#2664eb] hover:bg-[#1d4ed8] border-[#2664eb] text-white"
                  onClick={() => {
                    console.log(`Adding image from URL for ${slide.title}`);
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                triggerFileUpload(slide.id, activeTab as "desktop" | "mobile")
              }
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Banner Image
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            PNG, JPG or GIF, Max 2MB
          </p>
        </div>

        {/* Banner Clickable Toggle */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Label htmlFor={`${activeTab}-clickable-${slide.id}`}>
              Banner is Clickable
            </Label>
            <button
              onClick={() => toggleClickable(slide.id)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2664eb] focus:ring-offset-2 ${
                slide.isClickable ? "bg-[#2664eb]" : "bg-gray-200"
              }`}
              role="switch"
              aria-checked={slide.isClickable}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  slide.isClickable ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enable this if users should be able to click on the banner
          </p>
        </div>

        {/* Product Detail Page URL - Only show if banner is clickable */}
        {slide.isClickable && (
          <div className="space-y-2">
            <Label htmlFor={`${activeTab}-redirect-url-${slide.id}`}>
              Product Detail Page URL
            </Label>
            <Input
              id={`${activeTab}-redirect-url-${slide.id}`}
              placeholder="Enter URL where clicking the banner should redirect (e.g., /products/cake-name)"
              className="w-full"
              value={slide.redirectUrl}
              onChange={(e) => {
                setSlides(
                  slides.map((s) =>
                    s.id === slide.id
                      ? { ...s, redirectUrl: e.target.value }
                      : s
                  )
                );
              }}
            />
            <p className="text-xs text-muted-foreground">
              When users click on this banner, they will be redirected to this
              page
            </p>
          </div>
        )}
      </div>
    );
  };

  const saveHeroSlider = async () => {
    try {
      // Prepare banner data for API
      const bannerData = slides.map((slide) => ({
        imageUrl:
          activeTab === "desktop"
            ? slide.desktopImageUrl
            : slide.mobileImageUrl,
        isClickable: slide.isClickable,
        redirectUrl: slide.redirectUrl,
        position: slide.id,
      }));

      const response = await fetch("/api/admin/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "hero",
          deviceType: activeTab,
          banners: bannerData,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Hero slider saved successfully:", result);
        // You can add a success toast notification here
        alert("Hero slider saved successfully!");
      } else {
        console.error("Error saving hero slider:", result);
        alert(`Error saving hero slider: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving hero slider:", error);
      alert("Error saving hero slider. Please try again.");
    }
  };

  const loadHeroSlider = async () => {
    try {
      const response = await fetch(
        `/api/admin/banners?type=hero&deviceType=${activeTab}`
      );
      const result = await response.json();

      if (response.ok && result.banners) {
        // Convert database banners to slides format
        const loadedSlides: Slide[] = result.banners.map((banner: any) => ({
          id: banner.position,
          title: `Slide ${banner.position}`,
          desktopImage: null,
          desktopImageUrl:
            banner.device_type === "desktop" ? banner.image_url : "",
          mobileImage: null,
          mobileImageUrl:
            banner.device_type === "mobile" ? banner.image_url : "",
          isClickable: banner.is_clickable,
          redirectUrl: banner.redirect_url || "",
        }));

        // Merge with existing slides or replace if loading
        if (loadedSlides.length > 0) {
          setSlides(loadedSlides);
        }
      }
    } catch (error) {
      console.error("Error loading hero slider:", error);
    }
  };

  // Load banners when component mounts or activeTab changes
  useEffect(() => {
    loadHeroSlider();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Hero Slider</h1>
        </div>

        {/* Right side with Save, Add button and tabs */}
        <div className="flex items-center gap-4">
          {/* Save Button */}
          <Button
            className="bg-green-600 hover:bg-green-700 border-green-600 text-white"
            onClick={saveHeroSlider}
          >
            Save
          </Button>

          {/* Add Slide Button */}
          <Button
            className="bg-[#2664eb] hover:bg-[#1d4ed8] border-[#2664eb] text-white"
            onClick={addSlide}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Slide
          </Button>

          {/* Button Tabs - Updated to match image design */}
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab("desktop")}
              className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                activeTab === "desktop"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Monitor className="h-4 w-4" />
              Desktop
            </button>
            <button
              onClick={() => setActiveTab("mobile")}
              className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                activeTab === "mobile"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              Mobile
            </button>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "desktop" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-4">Desktop Banners</h2>
          </div>

          {/* Slides */}
          <div className="space-y-6">{slides.map(renderSlide)}</div>
        </div>
      )}

      {activeTab === "mobile" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-4">Mobile Banners</h2>
          </div>

          {/* Slides */}
          <div className="space-y-6">{slides.map(renderSlide)}</div>
        </div>
      )}
    </div>
  );
}
