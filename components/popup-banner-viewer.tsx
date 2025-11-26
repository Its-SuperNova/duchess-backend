"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChefHat, Copy } from "@solar-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

type DeviceType = "desktop" | "mobile";

interface PopupBannerData {
  id: string;
  deviceType: DeviceType;
  backgroundImageUrl: string;
  buttonUrl: string;
  couponCode: string;
  showPrimaryButton: boolean;
  showCouponButton: boolean;
  enableBackdrop: boolean;
  delaySeconds: number;
}

const initialState: Record<DeviceType, PopupBannerData | null> = {
  desktop: null,
  mobile: null,
};

export default function PopupBannerViewer() {
  const [banners, setBanners] =
    useState<Record<DeviceType, PopupBannerData | null>>(initialState);
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchBanner = async () => {
      try {
        const response = await fetch("/api/popup-banner", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load popup banner");
        }

        const result = await response.json();
        const popupBanners = result?.popupBanners;

        setBanners({
          desktop: popupBanners?.desktop || null,
          mobile: popupBanners?.mobile || null,
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Error fetching popup banner:", error);
        }
      }
    };

    fetchBanner();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const determineDevice = () =>
      setDeviceType(window.innerWidth < 768 ? "mobile" : "desktop");

    determineDevice();
    window.addEventListener("resize", determineDevice);
    return () => window.removeEventListener("resize", determineDevice);
  }, []);

  const activeBanner = useMemo(() => {
    return banners[deviceType] || banners.desktop || banners.mobile;
  }, [banners, deviceType]);

  useEffect(() => {
    if (!activeBanner) {
      setIsOpen(false);
      return;
    }

    setCopied(false);
    setIsOpen(false);

    const delay =
      typeof activeBanner.delaySeconds === "number"
        ? Math.max(0, activeBanner.delaySeconds)
        : 0;

    const timer = setTimeout(() => setIsOpen(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [activeBanner?.id, deviceType]);

  if (!activeBanner) {
    return null;
  }

  const hasButtons =
    activeBanner.showPrimaryButton || activeBanner.showCouponButton;

  // Match admin preview dimensions:
  // Desktop: width ~500px, height 320px
  // Mobile: width ~360px, height 400px
  const containerWidth =
    deviceType === "desktop" ? "max-w-[500px]" : "max-w-[360px]";
  const bannerHeight = deviceType === "desktop" ? "h-[320px]" : "h-[420px]";

  const handleCopy = async () => {
    if (!activeBanner.couponCode) return;
    try {
      await navigator.clipboard?.writeText(activeBanner.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Ignore clipboard errors silently
    }
  };

  const handlePrimaryAction = () => {
    if (!activeBanner.buttonUrl) return;
    window.open(activeBanner.buttonUrl, "_self");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        >
          {activeBanner.enableBackdrop && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          )}
          <motion.div
            className={`relative z-10 w-full ${containerWidth}`}
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative rounded-2xl border bg-white shadow-2xl">
              <div
                className={`relative overflow-hidden p-2 bg-white ${
                  hasButtons ? "rounded-t-2xl" : "rounded-2xl"
                }`}
              >
                {activeBanner.backgroundImageUrl ? (
                  <img
                    src={activeBanner.backgroundImageUrl}
                    alt={`${activeBanner.deviceType} popup banner`}
                    className={`${bannerHeight} w-full object-cover rounded-2xl`}
                  />
                ) : (
                  <div
                    className={`${bannerHeight} w-full bg-gradient-to-r from-rose-200 via-amber-100 to-rose-50`}
                  />
                )}
              </div>
              {hasButtons && (
                <div className="space-y-4 p-4 text-center">
                  <div className="flex flex-row flex-wrap gap-3">
                    {activeBanner.showPrimaryButton && (
                      <Button
                        type="button"
                        className="rounded-full flex-1 min-w-[140px]"
                        disabled={!activeBanner.buttonUrl}
                        onClick={handlePrimaryAction}
                      >
                        <ChefHat className="h-4 w-4" weight="Broken" />
                        View Details
                      </Button>
                    )}
                    {activeBanner.showCouponButton && (
                      <Button
                        type="button"
                        variant="outline"
                        className={`rounded-full flex-1 min-w-[140px] border-gray-300 transition-colors ${
                          copied
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : "text-primary hover:bg-accent"
                        }`}
                        disabled={!activeBanner.couponCode}
                        onClick={handleCopy}
                      >
                        {copied ? (
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
              <button
                type="button"
                className="absolute right-4 top-4 rounded-full bg-white/70 p-2 text-slate-700 shadow backdrop-blur transition hover:bg-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close popup</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
