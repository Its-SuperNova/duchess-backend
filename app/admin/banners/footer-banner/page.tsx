"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
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
import { useState, useEffect } from "react";

export default function FooterBannerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("desktop");
  const [banners, setBanners] = useState({
    desktop: {
      banner1: {
        image: null,
        imageUrl: "",
        isClickable: false,
        redirectUrl: "",
      },
    },
    mobile: {
      banner1: {
        image: null,
        imageUrl: "",
        isClickable: false,
        redirectUrl: "",
      },
    },
  });

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    deviceType: "desktop" | "mobile",
    bannerKey: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBanners((prev) => ({
        ...prev,
        [deviceType]: {
          ...prev[deviceType],
          [bannerKey]: {
            ...prev[deviceType][
              bannerKey as keyof (typeof prev)[typeof deviceType]
            ],
            image: file,
            imageUrl: imageUrl,
          },
        },
      }));
      event.target.value = "";
    }
  };

  const triggerFileUpload = (
    deviceType: "desktop" | "mobile",
    bannerKey: string
  ) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => handleFileUpload(e as any, deviceType, bannerKey);
    input.click();
  };

  const removeImage = (deviceType: "desktop" | "mobile", bannerKey: string) => {
    setBanners((prev) => ({
      ...prev,
      [deviceType]: {
        ...prev[deviceType],
        [bannerKey]: {
          ...prev[deviceType][
            bannerKey as keyof (typeof prev)[typeof deviceType]
          ],
          image: null,
          imageUrl: "",
        },
      },
    }));
  };

  const toggleClickable = (
    deviceType: "desktop" | "mobile",
    bannerKey: string
  ) => {
    setBanners((prev) => ({
      ...prev,
      [deviceType]: {
        ...prev[deviceType],
        [bannerKey]: {
          ...prev[deviceType][
            bannerKey as keyof (typeof prev)[typeof deviceType]
          ],
          isClickable:
            !prev[deviceType][
              bannerKey as keyof (typeof prev)[typeof deviceType]
            ].isClickable,
        },
      },
    }));
  };

  const updateRedirectUrl = (
    deviceType: "desktop" | "mobile",
    bannerKey: string,
    value: string
  ) => {
    setBanners((prev) => ({
      ...prev,
      [deviceType]: {
        ...prev[deviceType],
        [bannerKey]: {
          ...prev[deviceType][
            bannerKey as keyof (typeof prev)[typeof deviceType]
          ],
          redirectUrl: value,
        },
      },
    }));
  };

  const renderBanner = (
    deviceType: "desktop" | "mobile",
    bannerKey: string,
    bannerData: any,
    bannerTitle: string
  ) => {
    // For mobile banners, use a different layout with image on left and options on right
    if (deviceType === "mobile") {
      return (
        <div
          key={bannerKey}
          className="border border-gray-200 rounded-lg p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{bannerTitle}</h3>
          </div>

          <div className="flex gap-6">
            {/* Left side - Image Preview */}
            <div className="flex-shrink-0">
              <Label htmlFor={`${deviceType}-upload-${bannerKey}`}>
                Banner Image
              </Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer w-80 mt-2"
                style={{
                  aspectRatio: "625/1000",
                }}
                onClick={() =>
                  !bannerData.imageUrl &&
                  triggerFileUpload(deviceType, bannerKey)
                }
              >
                {bannerData.imageUrl ? (
                  <div className="w-full h-full relative">
                    <img
                      src={bannerData.imageUrl}
                      alt={`Banner for ${bannerTitle}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage(deviceType, bannerKey)}
                        className="bg-white/80 hover:bg-white text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-2 h-full">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Upload a high-quality image for the banner
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Options */}
            <div className="flex-1 space-y-4">
              {/* Banner URL Input */}
              <div className="space-y-2">
                <Label htmlFor={`${deviceType}-url-${bannerKey}`}>
                  Banner URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id={`${deviceType}-url-${bannerKey}`}
                    placeholder="Enter banner image URL"
                    className="flex-1"
                    value={bannerData.imageUrl}
                    onChange={(e) => {
                      setBanners((prev) => ({
                        ...prev,
                        mobile: {
                          ...prev.mobile,
                          [bannerKey]: {
                            ...prev.mobile[
                              bannerKey as keyof typeof prev.mobile
                            ],
                            imageUrl: e.target.value,
                          },
                        },
                      }));
                    }}
                  />
                  <Button
                    className="bg-[#2664eb] hover:bg-[#1d4ed8] border-[#2664eb] text-white"
                    onClick={() => {
                      console.log(`Adding image from URL for ${bannerTitle}`);
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Upload Button */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => triggerFileUpload(deviceType, bannerKey)}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Banner Image
                </Button>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or GIF, Max 2MB
                </p>
              </div>

              {/* Banner Clickable Toggle */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Label htmlFor={`${deviceType}-clickable-${bannerKey}`}>
                    Banner is Clickable
                  </Label>
                  <button
                    onClick={() => toggleClickable(deviceType, bannerKey)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2664eb] focus:ring-offset-2 ${
                      bannerData.isClickable ? "bg-[#2664eb]" : "bg-gray-200"
                    }`}
                    role="switch"
                    aria-checked={bannerData.isClickable}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        bannerData.isClickable
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enable this if users should be able to click on the banner
                </p>
              </div>

              {/* Product Detail Page URL - Only show if banner is clickable */}
              {bannerData.isClickable && (
                <div className="space-y-2">
                  <Label htmlFor={`${deviceType}-redirect-url-${bannerKey}`}>
                    Product Detail Page URL
                  </Label>
                  <Input
                    id={`${deviceType}-redirect-url-${bannerKey}`}
                    placeholder="Enter URL where clicking the banner should redirect (e.g., /products/cake-name)"
                    className="w-full"
                    value={bannerData.redirectUrl}
                    onChange={(e) =>
                      updateRedirectUrl(deviceType, bannerKey, e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    When users click on this banner, they will be redirected to
                    this page
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // For desktop banners, keep the original vertical layout
    return (
      <div
        key={bannerKey}
        className="border border-gray-200 rounded-lg p-4 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{bannerTitle}</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${deviceType}-upload-${bannerKey}`}>
            Banner Image
          </Label>
          <div
            className={`border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer ${
              deviceType === "desktop" ? "w-full" : "w-80"
            }`}
            style={{
              aspectRatio: deviceType === "desktop" ? "1280/458" : "625/1000",
            }}
            onClick={() =>
              !bannerData.imageUrl && triggerFileUpload(deviceType, bannerKey)
            }
          >
            {bannerData.imageUrl ? (
              <div className="w-full h-full relative">
                <img
                  src={bannerData.imageUrl}
                  alt={`Banner for ${bannerTitle}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(deviceType, bannerKey)}
                    className="bg-white/80 hover:bg-white text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
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
              <Label htmlFor={`${deviceType}-url-${bannerKey}`}>
                Banner URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id={`${deviceType}-url-${bannerKey}`}
                  placeholder="Enter banner image URL"
                  className="flex-1"
                  value={bannerData.imageUrl}
                  onChange={(e) => {
                    if (deviceType === "desktop") {
                      setBanners((prev) => ({
                        ...prev,
                        desktop: {
                          ...prev.desktop,
                          [bannerKey]: {
                            ...prev.desktop[
                              bannerKey as keyof typeof prev.desktop
                            ],
                            imageUrl: e.target.value,
                          },
                        },
                      }));
                    } else {
                      setBanners((prev) => ({
                        ...prev,
                        mobile: {
                          ...prev.mobile,
                          [bannerKey]: {
                            ...prev.mobile[
                              bannerKey as keyof typeof prev.mobile
                            ],
                            imageUrl: e.target.value,
                          },
                        },
                      }));
                    }
                  }}
                />
                <Button
                  className="bg-[#2664eb] hover:bg-[#1d4ed8] border-[#2664eb] text-white"
                  onClick={() => {
                    console.log(`Adding image from URL for ${bannerTitle}`);
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => triggerFileUpload(deviceType, bannerKey)}
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
            <Label htmlFor={`${deviceType}-clickable-${bannerKey}`}>
              Banner is Clickable
            </Label>
            <button
              onClick={() => toggleClickable(deviceType, bannerKey)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2664eb] focus:ring-offset-2 ${
                bannerData.isClickable ? "bg-[#2664eb]" : "bg-gray-200"
              }`}
              role="switch"
              aria-checked={bannerData.isClickable}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  bannerData.isClickable ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enable this if users should be able to click on the banner
          </p>
        </div>

        {/* Product Detail Page URL - Only show if banner is clickable */}
        {bannerData.isClickable && (
          <div className="space-y-2">
            <Label htmlFor={`${deviceType}-redirect-url-${bannerKey}`}>
              Product Detail Page URL
            </Label>
            <Input
              id={`${deviceType}-redirect-url-${bannerKey}`}
              placeholder="Enter URL where clicking the banner should redirect (e.g., /products/cake-name)"
              className="w-full"
              value={bannerData.redirectUrl}
              onChange={(e) =>
                updateRedirectUrl(deviceType, bannerKey, e.target.value)
              }
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

  const saveFooterBanner = async () => {
    try {
      // Prepare banner data for API
      const bannerData = [
        {
          imageUrl:
            activeTab === "desktop"
              ? banners.desktop.banner1.imageUrl
              : banners.mobile.banner1.imageUrl,
          isClickable:
            activeTab === "desktop"
              ? banners.desktop.banner1.isClickable
              : banners.mobile.banner1.isClickable,
          redirectUrl:
            activeTab === "desktop"
              ? banners.desktop.banner1.redirectUrl
              : banners.mobile.banner1.redirectUrl,
          position: 1,
        },
      ];

      const response = await fetch("/api/admin/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "footer",
          deviceType: activeTab,
          banners: bannerData,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Footer banner saved successfully:", result);
        // You can add a success toast notification here
        alert("Footer banner saved successfully!");
      } else {
        console.error("Error saving footer banner:", result);
        alert(`Error saving footer banner: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving footer banner:", error);
      alert("Error saving footer banner. Please try again.");
    }
  };

  const loadFooterBanner = async () => {
    try {
      const response = await fetch(
        `/api/admin/banners?type=footer&deviceType=${activeTab}`
      );
      const result = await response.json();

      if (response.ok && result.banners && result.banners.length > 0) {
        const banner = result.banners[0]; // Footer banners have only one per device type

        setBanners((prev) => ({
          ...prev,
          [activeTab]: {
            banner1: {
              image: null,
              imageUrl: banner.image_url || "",
              isClickable: banner.is_clickable || false,
              redirectUrl: banner.redirect_url || "",
            },
          },
        }));
      }
    } catch (error) {
      console.error("Error loading footer banner:", error);
    }
  };

  // Load banners when component mounts or activeTab changes
  useEffect(() => {
    loadFooterBanner();
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
          <h1 className="text-2xl font-bold tracking-tight">Footer Banner</h1>
        </div>

        {/* Right side with Save button and tabs */}
        <div className="flex items-center gap-4">
          {/* Save Button */}
          <Button
            className="bg-green-600 hover:bg-green-700 border-green-600 text-white"
            onClick={saveFooterBanner}
          >
            Save
          </Button>

          {/* Button Tabs */}
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
            <h2 className="text-lg font-semibold mb-4">Desktop Banner</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Configure footer banner for desktop view
            </p>
          </div>

          {/* Desktop Banner */}
          <div className="space-y-6">
            {renderBanner(
              "desktop",
              "banner1",
              banners.desktop.banner1,
              "Desktop Banner"
            )}
          </div>
        </div>
      )}

      {activeTab === "mobile" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-4">Mobile Banner</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Configure one footer banner for mobile view
            </p>
          </div>

          {/* Mobile Banner */}
          <div className="space-y-6">
            {renderBanner(
              "mobile",
              "banner1",
              banners.mobile.banner1,
              "Mobile Banner"
            )}
          </div>
        </div>
      )}
    </div>
  );
}
