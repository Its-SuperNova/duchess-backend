"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Upload,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { ChefHat, Copy } from "@solar-icons/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeviceType = "desktop" | "mobile";

interface PopupBannerConfig {
  buttonUrl: string;
  couponCode: string;
  showPrimaryButton: boolean;
  showCouponButton: boolean;
  backgroundImageUrl: string;
  backgroundPublicId?: string;
  enableBackdrop: boolean;
  delaySeconds: number;
}

const createDefaultConfig = (): PopupBannerConfig => ({
  buttonUrl: "",
  couponCode: "",
  showPrimaryButton: true,
  showCouponButton: true,
  backgroundImageUrl: "",
  backgroundPublicId: "",
  enableBackdrop: true,
  delaySeconds: 2,
});

export default function PopupBannerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DeviceType>("desktop");
  const [configs, setConfigs] = useState<Record<DeviceType, PopupBannerConfig>>(
    {
      desktop: createDefaultConfig(),
      mobile: createDefaultConfig(),
    }
  );
  const [saving, setSaving] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [couponCopied, setCouponCopied] = useState<Record<DeviceType, boolean>>(
    {
      desktop: false,
      mobile: false,
    }
  );
  const [uploadingDevice, setUploadingDevice] = useState<DeviceType | null>(
    null
  );
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [popupEnabled, setPopupEnabled] = useState(true);

  useEffect(() => {
    const fetchExistingBanners = async () => {
      try {
        const response = await fetch("/api/popup-banner?includeInactive=1");
        if (!response.ok) {
          throw new Error("Failed to load popup banner settings");
        }
        const result = await response.json();
        const popupBanners = result?.popupBanners;
        if (popupBanners) {
          const defaults = createDefaultConfig();
          setConfigs((prev) => {
            const updated = { ...prev };
            (["desktop", "mobile"] as DeviceType[]).forEach((device) => {
              const data = popupBanners[device];
              if (data) {
                updated[device] = {
                  ...updated[device],
                  buttonUrl: data.buttonUrl || "",
                  couponCode: data.couponCode || "",
                  showPrimaryButton:
                    data.showPrimaryButton ?? defaults.showPrimaryButton,
                  showCouponButton:
                    data.showCouponButton ?? defaults.showCouponButton,
                  backgroundImageUrl: data.backgroundImageUrl || "",
                  backgroundPublicId: data.backgroundPublicId || "",
                  enableBackdrop:
                    data.enableBackdrop ?? defaults.enableBackdrop,
                  delaySeconds: data.delaySeconds ?? defaults.delaySeconds,
                };
              }
            });
            return updated;
          });

          const desktopActive = popupBanners.desktop?.isActive;
          const mobileActive = popupBanners.mobile?.isActive;
          if (desktopActive !== undefined || mobileActive !== undefined) {
            setPopupEnabled(Boolean(desktopActive ?? mobileActive));
          }
        }
      } catch (error) {
        console.error("Error loading popup banners:", error);
      } finally {
        setLoadingConfigs(false);
      }
    };

    fetchExistingBanners();
  }, []);

  const updateConfig = <K extends keyof PopupBannerConfig>(
    device: DeviceType,
    field: K,
    value: PopupBannerConfig[K]
  ) => {
    setConfigs((prev) => ({
      ...prev,
      [device]: {
        ...prev[device],
        [field]: value,
      },
    }));
  };

  const updateConfigPatch = (
    device: DeviceType,
    patch: Partial<PopupBannerConfig>
  ) => {
    setConfigs((prev) => ({
      ...prev,
      [device]: {
        ...prev[device],
        ...patch,
      },
    }));
  };

  const uploadImageToCloudinary = async (
    file: File,
    device: DeviceType
  ): Promise<void> => {
    setUploadingDevice(device);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `duchess-pastries/banners/popup/${device}`);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Image upload failed");
      }

      updateConfigPatch(device, {
        backgroundImageUrl: result.imageUrl,
        backgroundPublicId: result.publicId,
      });
    } catch (error) {
      console.error("Error uploading popup banner image:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to upload image. Please try again."
      );
    } finally {
      setUploadingDevice(null);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    device: DeviceType
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    const maxSize = 8 * 1024 * 1024; // 8MB
    if (file.size > maxSize) {
      alert("Image must be smaller than 8MB.");
      return;
    }

    await uploadImageToCloudinary(file, device);
    event.target.value = "";
  };

  const triggerFileUpload = (device: DeviceType) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => handleFileUpload(e as any, device);
    input.click();
  };

  const removeBackgroundImage = (device: DeviceType) => {
    updateConfigPatch(device, {
      backgroundImageUrl: "",
      backgroundPublicId: "",
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const payload = (["desktop", "mobile"] as DeviceType[]).map((device) => ({
        deviceType: device,
        buttonUrl: configs[device].buttonUrl,
        couponCode: configs[device].couponCode,
        showPrimaryButton: configs[device].showPrimaryButton,
        showCouponButton: configs[device].showCouponButton,
        backgroundImageUrl: configs[device].backgroundImageUrl,
        backgroundPublicId: configs[device].backgroundPublicId,
        enableBackdrop: configs[device].enableBackdrop,
        delaySeconds: configs[device].delaySeconds,
        isActive: popupEnabled,
      }));

      const response = await fetch("/api/popup-banner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ banners: payload }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to save popup banner");
      }

      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error saving popup banner:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to save popup banner"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCoupon = async (device: DeviceType) => {
    const coupon = configs[device].couponCode.trim();
    if (!coupon) return;

    try {
      await navigator.clipboard?.writeText(coupon);
    } catch {
      // Ignore clipboard errors (e.g., insecure context)
    }

    setCouponCopied((prev) => ({ ...prev, [device]: true }));
    setTimeout(() => {
      setCouponCopied((prev) => ({ ...prev, [device]: false }));
    }, 3000);
  };

  const currentConfig = configs[activeTab];
  const previewWidth = activeTab === "desktop" ? "w-[500px]" : "w-[360px]";
  const previewHeight = activeTab === "desktop" ? "h-[320px]" : "h-[420px]";
  const hasButtons =
    currentConfig.showPrimaryButton || currentConfig.showCouponButton;
  const previewImageRadius = hasButtons ? "rounded-t-2xl" : "rounded-2xl";

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="h-10 w-10 rounded-xl border border-gray-200 bg-white text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/admin/banners")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Popup Banner</h1>
            <p className="text-sm text-muted-foreground">
              Design the marketing popup that greets visitors across devices.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Visibility</span>
            <Switch
              className="data-[state=checked]:bg-blue-500"
              checked={popupEnabled}
              onCheckedChange={(value) => setPopupEnabled(Boolean(value))}
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
            onClick={handleSave}
            disabled={saving || loadingConfigs}
          >
            {saving ? "Saving..." : "Save popup"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Preview */}
        <Card className="shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>Live preview</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className={
                    activeTab === "desktop"
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-blue-100 text-blue-600 hover:bg-blue-50"
                  }
                  onClick={() => setActiveTab("desktop")}
                >
                  <Monitor className="h-4 w-4" />
                  Desktop
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={
                    activeTab === "mobile"
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-blue-100 text-blue-600 hover:bg-blue-50"
                  }
                  onClick={() => setActiveTab("mobile")}
                >
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </Button>
              </div>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Adjust text and imagery to see instant results.
            </p>
          </CardHeader>
          <CardContent className="flex justify-center pb-10">
            <div className={`relative ${previewWidth}`}>
              <div className="relative rounded-2xl border bg-white shadow-2xl">
                <div
                  className={`relative overflow-hidden ${previewImageRadius} p-2 bg-white`}
                >
                  {currentConfig.backgroundImageUrl ? (
                    <img
                      src={currentConfig.backgroundImageUrl}
                      alt={`${activeTab} popup background`}
                      className={`${previewHeight} w-full object-cover rounded-2xl`}
                    />
                  ) : (
                    <div
                      className={`${previewHeight} w-full bg-gradient-to-r from-rose-200 via-amber-100 to-rose-50`}
                    />
                  )}
                </div>
                {hasButtons && (
                  <div className="space-y-4 p-4 text-center">
                    <div className="flex flex-row gap-3">
                      {currentConfig.showPrimaryButton && (
                        <Button type="button" className="rounded-full flex-1">
                          <ChefHat className="h-4 w-4" weight="Broken" />
                          View Details
                        </Button>
                      )}
                      {currentConfig.showCouponButton && (
                        <Button
                          type="button"
                          variant="outline"
                          className={`rounded-full flex-1 border-gray-300 transition-colors ${
                            couponCopied[activeTab]
                              ? "bg-emerald-500 text-white hover:bg-emerald-600"
                              : "text-primary hover:bg-accent"
                          }`}
                          disabled={!currentConfig.couponCode}
                          onClick={() => handleCopyCoupon(activeTab)}
                        >
                          {couponCopied[activeTab] ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" weight="Broken" />
                              Copy Coupon
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                <div className="absolute right-4 top-4 rounded-full bg-white/70 p-2 text-slate-700 shadow backdrop-blur">
                  <X className="h-4 w-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Popup settings</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure copy, timing, and imagery for the {activeTab} view.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="buttonUrl">Button link</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="buttonUrl"
                  value={currentConfig.buttonUrl}
                  onChange={(event) =>
                    updateConfig(activeTab, "buttonUrl", event.target.value)
                  }
                  placeholder="https://"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Visibility
                  </span>
                  <Switch
                    className="data-[state=checked]:bg-blue-500"
                    checked={currentConfig.showPrimaryButton}
                    onCheckedChange={(value) =>
                      updateConfig(activeTab, "showPrimaryButton", value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="couponCode">Coupon to copy</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="couponCode"
                  value={currentConfig.couponCode}
                  onChange={(event) =>
                    updateConfig(activeTab, "couponCode", event.target.value)
                  }
                  placeholder="E.g. SWEET15"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Visibility
                  </span>
                  <Switch
                    className="data-[state=checked]:bg-blue-500"
                    checked={currentConfig.showCouponButton}
                    onCheckedChange={(value) =>
                      updateConfig(activeTab, "showCouponButton", value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Background artwork</Label>
              <div className="space-y-4">
                {(["desktop", "mobile"] as DeviceType[]).map((device) => {
                  const deviceConfig = configs[device];
                  const title =
                    device === "desktop" ? "Desktop image" : "Mobile image";
                  return (
                    <div
                      key={device}
                      className="space-y-2 rounded-lg border p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{title}</p>
                        <div className="flex gap-2">
                          {deviceConfig.backgroundImageUrl && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeBackgroundImage(device)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={uploadingDevice === device}
                            onClick={() => triggerFileUpload(device)}
                          >
                            <Upload className="h-4 w-4" />
                            {uploadingDevice === device
                              ? "Uploading..."
                              : "Upload"}
                          </Button>
                        </div>
                      </div>
                      {deviceConfig.backgroundImageUrl ? (
                        <img
                          src={deviceConfig.backgroundImageUrl}
                          alt={`${device} popup artwork`}
                          className="h-40 w-full rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed border-gray-200 text-xs text-muted-foreground">
                          No image uploaded
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delay">Delay (seconds)</Label>
              <Input
                id="delay"
                type="number"
                min={0}
                value={currentConfig.delaySeconds}
                onChange={(event) =>
                  updateConfig(
                    activeTab,
                    "delaySeconds",
                    Number(event.target.value) || 0
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                Choose when the popup appears after page load.
              </p>
            </div>

            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Popup saved</DialogTitle>
            <DialogDescription>
              The popup banner configuration has been saved and will be
              reflected on the storefront experience.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
