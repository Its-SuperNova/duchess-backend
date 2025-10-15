"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { TrashBinTrash, Bill } from "@solar-icons/react";
import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import Lottie to reduce initial bundle size
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => (
    <div className="w-24 h-24 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
    </div>
  ),
});
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/context/cart-context";
import { getUserByEmail } from "@/lib/auth-utils";
import { getDefaultAddress, getUserAddresses } from "@/lib/address-utils";
// Delivery calculation moved to server-side API
import type { Address as DbAddress } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import zeroPurchaseAnimation from "@/public/Lottie/Zero Purchase.json";
import paymentFailedAnimation from "@/public/Lottie/Payment-Failed.json";
import { optimizeCheckoutFlow } from "@/lib/performance-utils";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import CheckoutSuccessOverlay from "@/components/checkout-success-overlay";
import CheckoutSkeleton from "@/components/checkout-skeleton";
import CheckoutExpiryScreen from "@/components/checkout-expiry-screen";
import RazorpayButton from "@/components/RazorpayButton";
import DeliveryFeeDisplay from "@/components/delivery-fee-display";
import FreeDeliveryProgress from "@/components/free-delivery-progress";
import { useDeliveryCalculation } from "@/hooks/use-delivery-calculation";
import React from "react";
import NoteDrawer from "./components/NoteDrawer";
import CouponButton from "./components/CouponButton";
import CustomizationOptionsDrawer from "./components/CustomizationOptionsDrawer";
import DeliveryInfoSection from "./components/DeliveryInfoSection";
import PaymentSection from "./components/PaymentLottieSection";
import ProductListing from "./components/ProductListing";
import BillDetails from "./components/BillDetails";
import PaymentConfirmationDialog from "./components/PaymentConfirmationDialog";

// ============================================================================
// RATE LIMITING - Prevent API abuse and excessive requests
// ============================================================================

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS_PER_MINUTE: 30, // Max 30 requests per minute
  MAX_REQUESTS_PER_SECOND: 5, // Max 5 requests per second
  COOLDOWN_PERIOD: 60000, // 1 minute cooldown after limit hit
  WARNING_THRESHOLD: 0.8, // Warn at 80% of limit
};

// Rate limiter class
class RateLimiter {
  private requestTimestamps: number[] = [];
  private cooldownUntil: number = 0;
  private warningShown: boolean = false;

  // Check if rate limit is exceeded
  isRateLimited(): boolean {
    const now = Date.now();

    // Check if in cooldown period
    if (now < this.cooldownUntil) {
      const remainingTime = Math.ceil((this.cooldownUntil - now) / 1000);
      console.warn(
        `⚠️ Rate limit cooldown active. Try again in ${remainingTime}s`
      );
      return true;
    }

    // Remove timestamps older than 1 minute
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < 60000
    );

    // Check per-minute limit
    if (
      this.requestTimestamps.length >= RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE
    ) {
      console.error("🚫 Rate limit exceeded: Too many requests per minute");
      this.cooldownUntil = now + RATE_LIMIT_CONFIG.COOLDOWN_PERIOD;
      return true;
    }

    // Check per-second limit
    const recentRequests = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < 1000
    );
    if (recentRequests.length >= RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_SECOND) {
      console.warn("⚠️ Rate limit warning: Too many requests per second");
      return true;
    }

    // Show warning at 80% threshold
    const usagePercent =
      this.requestTimestamps.length / RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE;
    if (
      usagePercent >= RATE_LIMIT_CONFIG.WARNING_THRESHOLD &&
      !this.warningShown
    ) {
      console.warn(
        `⚠️ Approaching rate limit: ${this.requestTimestamps.length}/${RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE} requests`
      );
      this.warningShown = true;
    } else if (usagePercent < RATE_LIMIT_CONFIG.WARNING_THRESHOLD) {
      this.warningShown = false;
    }

    return false;
  }

  // Record a request
  recordRequest(): void {
    this.requestTimestamps.push(Date.now());
    console.log(
      `📊 Rate limit: ${this.requestTimestamps.length}/${RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE} requests in last minute`
    );
  }

  // Get current rate limit stats
  getStats() {
    const now = Date.now();
    const activeRequests = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < 60000
    );
    const recentRequests = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < 1000
    );

    return {
      requestsPerMinute: activeRequests.length,
      requestsPerSecond: recentRequests.length,
      limit: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE,
      remainingRequests:
        RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE - activeRequests.length,
      usagePercent: Math.round(
        (activeRequests.length / RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE) *
          100
      ),
      isInCooldown: now < this.cooldownUntil,
      cooldownRemaining: Math.max(
        0,
        Math.ceil((this.cooldownUntil - now) / 1000)
      ),
    };
  }

  // Reset rate limiter
  reset(): void {
    this.requestTimestamps = [];
    this.cooldownUntil = 0;
    this.warningShown = false;
    console.log("🔄 Rate limiter reset");
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

// Rate-limited fetch wrapper
async function rateLimitedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  // Check rate limit before making request
  if (rateLimiter.isRateLimited()) {
    const stats = rateLimiter.getStats();
    throw new Error(
      `Rate limit exceeded. Please wait ${stats.cooldownRemaining}s before trying again.`
    );
  }

  // Record the request
  rateLimiter.recordRequest();

  // Make the actual request
  return fetch(url, options);
}

// ============================================================================
// DEBOUNCE UTILITIES - Optimize frequent operations
// ============================================================================

// Debounce function for optimizing frequent operations
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

// Debounce configuration
const DEBOUNCE_CONFIG = {
  FAST: 150, // 150ms - for UI feedback
  MEDIUM: 300, // 300ms - for text input
  SLOW: 500, // 500ms - for expensive operations
};

// ============================================================================
// ENCRYPTION UTILITIES - Secure localStorage encryption
// ============================================================================

// Encryption key management
const ENCRYPTION_KEY_NAME = "checkout_encryption_key";
const ENCRYPTION_ALGORITHM = "AES-GCM";

// Generate or retrieve encryption key
async function getEncryptionKey(): Promise<CryptoKey> {
  try {
    // Try to get existing key from sessionStorage (per-session key)
    const storedKey = sessionStorage.getItem(ENCRYPTION_KEY_NAME);

    if (storedKey) {
      // Import existing key
      const keyData = JSON.parse(storedKey);
      return await crypto.subtle.importKey(
        "jwk",
        keyData,
        { name: ENCRYPTION_ALGORITHM, length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
    }

    // Generate new key if not exists
    const key = await crypto.subtle.generateKey(
      { name: ENCRYPTION_ALGORITHM, length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    // Export and store key for session
    const exportedKey = await crypto.subtle.exportKey("jwk", key);
    sessionStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(exportedKey));

    return key;
  } catch (error) {
    console.error("Error managing encryption key:", error);
    // Fallback: generate temporary key
    return await crypto.subtle.generateKey(
      { name: ENCRYPTION_ALGORITHM, length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }
}

// Encrypt data
async function encryptData(data: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Generate random IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt data
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Encryption error:", error);
    // Fallback: return original data (logged for security audit)
    console.warn(
      "⚠️ SECURITY WARNING: Data stored unencrypted due to encryption failure"
    );
    return data;
  }
}

// Decrypt data
async function decryptData(encryptedData: string): Promise<string | null> {
  try {
    const key = await getEncryptionKey();

    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0)
    );

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encryptedBuffer = combined.slice(12);

    // Decrypt data
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      encryptedBuffer
    );

    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption error:", error);
    // Try to return original data if it's not encrypted
    try {
      // Check if it's valid JSON (unencrypted)
      JSON.parse(encryptedData);
      console.warn(
        "⚠️ Data appears to be unencrypted, migrating to encrypted storage"
      );
      return encryptedData;
    } catch {
      return null;
    }
  }
}

// Secure localStorage wrapper
class SecureStorage {
  // Set encrypted item
  async setItem(key: string, value: any): Promise<void> {
    try {
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);
      const encrypted = await encryptData(stringValue);
      localStorage.setItem(key, encrypted);
      console.log(`🔒 Encrypted and stored: ${key}`);
    } catch (error) {
      console.error(`Error storing encrypted item ${key}:`, error);
      // Fallback to unencrypted storage with warning
      localStorage.setItem(
        key,
        typeof value === "string" ? value : JSON.stringify(value)
      );
    }
  }

  // Get and decrypt item
  async getItem(key: string): Promise<any | null> {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      const decrypted = await decryptData(encrypted);
      if (!decrypted) return null;

      // Try to parse as JSON
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      console.error(`Error retrieving encrypted item ${key}:`, error);
      return null;
    }
  }

  // Remove item
  removeItem(key: string): void {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed: ${key}`);
  }

  // Clear all
  clear(): void {
    localStorage.clear();
    sessionStorage.removeItem(ENCRYPTION_KEY_NAME);
    console.log(`🗑️ Cleared all storage and encryption keys`);
  }
}

// Global secure storage instance
const secureStorage = new SecureStorage();

// ============================================================================
// CACHING LAYER - Multi-level cache for optimal performance
// ============================================================================

// Cache configuration
const CACHE_CONFIG = {
  SHORT_TTL: 5000, // 5 seconds - for volatile data
  MEDIUM_TTL: 30000, // 30 seconds - for semi-static data
  LONG_TTL: 300000, // 5 minutes - for static data
};

// Interface for cached data
interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Multi-level cache storage
class CacheManager {
  private memoryCache = new Map<string, CachedData<any>>();
  private requestCache = new Map<string, Promise<any>>();

  // Get data from memory cache
  get<T>(key: string): T | null {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() > cached.expiresAt) {
      console.log(`⏰ Cache expired for: ${key}`);
      this.memoryCache.delete(key);
      return null;
    }

    console.log(`✅ Cache hit for: ${key}`);
    return cached.data as T;
  }

  // Set data in memory cache
  set<T>(key: string, data: T, ttl: number): void {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };
    this.memoryCache.set(key, cached);
    console.log(`💾 Cached data for: ${key} (TTL: ${ttl}ms)`);
  }

  // Check if key exists in cache
  has(key: string): boolean {
    const cached = this.memoryCache.get(key);
    if (!cached) return false;

    if (Date.now() > cached.expiresAt) {
      this.memoryCache.delete(key);
      return false;
    }

    return true;
  }

  // Invalidate specific cache entry
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    this.requestCache.delete(key);
    console.log(`🗑️ Invalidated cache for: ${key}`);
  }

  // Clear all cache
  clearAll(): void {
    this.memoryCache.clear();
    this.requestCache.clear();
    console.log(`🗑️ All cache cleared`);
  }

  // Get cache stats
  getStats() {
    return {
      memoryCacheSize: this.memoryCache.size,
      requestCacheSize: this.requestCache.size,
      entries: Array.from(this.memoryCache.keys()),
    };
  }

  // Deduplicated fetch with caching
  async fetchWithCache<T>(
    url: string,
    options?: RequestInit,
    ttl: number = CACHE_CONFIG.SHORT_TTL
  ): Promise<T> {
    const cacheKey = `${url}-${JSON.stringify(options)}`;

    // Check memory cache first
    const cachedData = this.get<T>(cacheKey);
    if (cachedData !== null) {
      return cachedData;
    }

    // Check if request is already in flight
    if (this.requestCache.has(cacheKey)) {
      console.log(`🔄 Reusing in-flight request for: ${url}`);
      return this.requestCache.get(cacheKey);
    }

    // Create new request with rate limiting and cache it
    const requestPromise = rateLimitedFetch(url, options)
      .then(async (response) => {
        const data = await response.json();

        // Cache successful responses
        if (response.ok) {
          this.set(cacheKey, data, ttl);
        }

        // Remove from request cache after completion
        setTimeout(() => this.requestCache.delete(cacheKey), 1000);

        return data;
      })
      .catch((error) => {
        // Remove from cache on error
        this.requestCache.delete(cacheKey);

        // Check if it's a rate limit error
        if (error.message?.includes("Rate limit exceeded")) {
          console.error("🚫 Rate limit error:", error.message);
          // Don't throw, let caller handle
        }

        throw error;
      });

    this.requestCache.set(cacheKey, requestPromise);
    console.log(`✅ New cached request created for: ${url}`);
    return requestPromise;
  }
}

// Global cache instance
const cacheManager = new CacheManager();

// Legacy deduplicated fetch function (now uses cache manager)
const deduplicatedFetch = async (url: string, options?: RequestInit) => {
  return cacheManager.fetchWithCache(url, options, CACHE_CONFIG.SHORT_TTL);
};

export default function CheckoutClient() {
  // Get checkoutId from URL params
  const params = useParams();
  const checkoutId = params.checkoutId as string;

  // Get cart items and functions from cart context (for fallback/editing)
  const {
    cart,
    getSubtotal,
    updateQuantity,
    removeFromCart,
    updateCartItemCustomization,
    clearCart,
    isLoading: cartLoading,
  } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Checkout session data
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(true);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Fetch checkout session data with parallel API calls for better performance
  useEffect(() => {
    if (!checkoutId) {
      setCheckoutError("Invalid checkout session");
      setCheckoutLoading(false);
      return;
    }

    const fetchCheckoutData = async () => {
      try {
        setCheckoutLoading(true);

        // Performance tracking
        const startTime = performance.now();
        console.log("⏱️ Starting parallel API calls...");

        // Parallel API calls with smart caching - Execute all independent requests simultaneously
        const [data, taxResult, categoriesResult] = await Promise.all([
          cacheManager.fetchWithCache<any>(
            `/api/checkout/${checkoutId}`,
            undefined,
            CACHE_CONFIG.SHORT_TTL
          ),
          cacheManager.fetchWithCache<any>(
            "/api/tax-settings",
            undefined,
            CACHE_CONFIG.LONG_TTL
          ), // Tax settings are static
          cacheManager.fetchWithCache<any>(
            "/api/categories",
            undefined,
            CACHE_CONFIG.LONG_TTL
          ), // Categories are relatively static
        ]);

        const parallelTime = performance.now() - startTime;
        console.log(
          `✅ Parallel API calls completed in ${parallelTime.toFixed(2)}ms`
        );

        // Check for errors in the data
        if (data.error) {
          // Check if the error is due to session expiry
          if (data.error === "Checkout session not found or expired") {
            setIsSessionExpired(true);
            setCheckoutError(data.error);
          } else {
            throw new Error(data.error || "Failed to fetch checkout data");
          }
          return;
        }

        // Handle different session statuses for better UX
        if (data.status === "expired") {
          setIsSessionExpired(true);
          setCheckoutError(
            "Checkout session has expired. Please start a new checkout."
          );
          return;
        } else if (data.status === "completed") {
          // Redirect to confirmation page if order is already completed
          if (data.checkout.databaseOrderId) {
            router.push(
              `/confirmation?orderId=${data.checkout.databaseOrderId}`
            );
            return;
          }
        } else if (data.status === "failed") {
          setCheckoutError("Previous payment failed. Please try again.");
          return;
        }

        setCheckoutData(data.checkout);

        // Set categories from API response
        if (categoriesResult.success && categoriesResult.categories) {
          setCategories(categoriesResult.categories);
        }

        // Set selected address ID from checkout data
        if (data.checkout.selectedAddressId) {
          setSelectedAddressId(data.checkout.selectedAddressId);
        }

        // Log comprehensive delivery fee data from checkout session
        console.log("📦 Checkout session data fetched with delivery details:", {
          checkoutId,
          deliveryFee: data.checkout.deliveryFee,
          totalAmount: data.checkout.totalAmount,
          addressText: data.checkout.addressText,
          selectedAddressId: data.checkout.selectedAddressId,
          distance: data.checkout.distance,
          duration: data.checkout.duration,
          items: data.checkout.items?.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total_price: item.total_price,
          })),
          financialBreakdown: {
            subtotal: data.checkout.subtotal,
            discount: data.checkout.discount,
            deliveryFee: data.checkout.deliveryFee,
            cgstAmount: data.checkout.cgstAmount,
            sgstAmount: data.checkout.sgstAmount,
            totalAmount: data.checkout.totalAmount,
          },
          orderValue:
            data.checkout.items?.reduce(
              (total: number, item: any) =>
                total + (item.total_price || item.price * item.quantity),
              0
            ) || 0,
        });

        // Populate form fields from checkout data
        console.log("🔄 Loading form fields from checkout session:", {
          notes: data.checkout.notes,
          note: data.checkout.note, // Check both field names
          messageCardText: data.checkout.messageCardText,
          cakeText: data.checkout.cakeText,
          customizationOptions: data.checkout.customizationOptions,
          contactInfo: data.checkout.contactInfo,
        });

        if (data.checkout.notes) {
          console.log(
            "✅ Loading notes from checkout session:",
            data.checkout.notes
          );
          setNote(data.checkout.notes);
        }
        if (data.checkout.couponCode)
          setSelectedCoupon(data.checkout.couponCode);
        if (data.checkout.cakeText) setCakeText(data.checkout.cakeText);
        if (data.checkout.messageCardText) {
          console.log(
            "✅ Loading messageCardText from checkout session:",
            data.checkout.messageCardText
          );
          setMessageCardText(data.checkout.messageCardText);
        }
        if (data.checkout.contactInfo)
          setContactInfo(data.checkout.contactInfo);
        if (data.checkout.addressText) {
          setAddressText(data.checkout.addressText);
          // Find the address ID that matches the address text
          if (data.addresses && data.addresses.length > 0) {
            const matchingAddress = data.addresses.find(
              (addr: any) => addr.full_address === data.checkout.addressText
            );
            if (matchingAddress) {
              setSelectedAddressId(matchingAddress.id);
            }
          }
        }
        if (data.checkout.customizationOptions)
          setCustomizationOptions(data.checkout.customizationOptions);

        // Calculate delivery fee if we have address and distance data
        if (
          data.checkout.addressText &&
          data.checkout.distance &&
          data.checkout.items
        ) {
          const orderValue = data.checkout.items.reduce(
            (total: number, item: any) => total + (item.total_price || 0),
            0
          );

          console.log("🚚 Auto-calculating delivery fee on checkout load:", {
            addressText: data.checkout.addressText,
            distance: data.checkout.distance,
            orderValue,
            checkoutId,
          });

          // Calculate delivery fee using distance from checkout session
          await calculateDelivery({
            addressId: data.checkout.selectedAddressId,
            orderValue,
            addressText: data.checkout.addressText,
            distance: data.checkout.distance,
          });

          // Check if delivery calculation failed and show error
          if (
            (!data.checkout.deliveryFee || data.checkout.deliveryFee === 0) &&
            data.checkout.distance
          ) {
            console.error(
              "❌ Delivery calculation failed - no delivery fee available"
            );
            toast({
              title: "Delivery Calculation Error",
              description:
                "Unable to calculate delivery fee. Please try again later or contact support.",
              variant: "destructive",
            });
            setCheckoutError(
              "Delivery calculation failed. Please try again later."
            );
            return;
          }

          // Update checkout session with calculated delivery fee
          try {
            // Check if order qualifies for free delivery
            const qualifiesForFreeDelivery =
              freeDeliveryThreshold && orderValue >= freeDeliveryThreshold;

            // Use 0 delivery fee if order qualifies for free delivery
            const finalDeliveryFee = qualifiesForFreeDelivery
              ? 0
              : deliveryCharge;
            const finalTotalAmount = orderValue + finalDeliveryFee;

            const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                deliveryFee: finalDeliveryFee,
                totalAmount: finalTotalAmount,
              }),
            });

            if (updateResponse.ok) {
              // Invalidate checkout cache after update
              cacheManager.invalidate(`/api/checkout/${checkoutId}-undefined`);

              console.log(
                "✅ Checkout session updated with calculated delivery fee:",
                {
                  deliveryFee: finalDeliveryFee,
                  totalAmount: finalTotalAmount,
                  qualifiesForFreeDelivery,
                  originalDeliveryFee: deliveryCharge,
                }
              );

              // Update local checkout data state
              setCheckoutData((prev: any) => ({
                ...prev,
                deliveryFee: finalDeliveryFee,
                totalAmount: finalTotalAmount,
              }));
            }
          } catch (updateError) {
            console.error("❌ Error updating checkout session:", updateError);
          }
        }

        // Process tax settings response (cached for 5 minutes)
        if (taxResult && taxResult.data) {
          console.log("✅ Tax settings loaded (cached):", taxResult.data);
          setTaxSettings({
            cgst_rate: taxResult.data.cgst_rate,
            sgst_rate: taxResult.data.sgst_rate,
          });
        } else {
          console.log("No tax settings found, using defaults");
          setTaxSettings({ cgst_rate: 0.0, sgst_rate: 0.0 });
        }

        // Fetch free delivery threshold
        try {
          const deliveryResponse = await fetch("/api/delivery-charges");
          const deliveryData = await deliveryResponse.json();

          if (deliveryResponse.ok && deliveryData.data) {
            const orderValueCharge = deliveryData.data.find(
              (charge: any) => charge.type === "order_value" && charge.is_active
            );

            if (orderValueCharge && orderValueCharge.delivery_type === "free") {
              setFreeDeliveryThreshold(orderValueCharge.order_value_threshold);
              console.log(
                "✅ Free delivery threshold loaded:",
                orderValueCharge.order_value_threshold
              );
            } else {
              setFreeDeliveryThreshold(undefined);
              console.log("No free delivery threshold found");
            }
          }
        } catch (error) {
          console.error("Error fetching free delivery threshold:", error);
          setFreeDeliveryThreshold(undefined);
        }
      } catch (err) {
        console.error("Error fetching checkout data:", err);
        setCheckoutError(
          err instanceof Error ? err.message : "Failed to load checkout data"
        );
        // Set default tax settings on error
        setTaxSettings({ cgst_rate: 0.0, sgst_rate: 0.0 });
      } finally {
        setCheckoutLoading(false);
        // Mark checkout data and tax settings as loaded
        setLoadingStates((prev) => ({
          ...prev,
          checkoutData: false,
          taxSettings: false,
        }));
      }
    };

    fetchCheckoutData();
  }, [checkoutId]);

  // Load applied coupon code to show update/view UI (with encryption)
  useEffect(() => {
    const loadCoupon = async () => {
      try {
        if (typeof window !== "undefined") {
          const c = await secureStorage.getItem("appliedCoupon");
          if (c) {
            // Only set selectedCoupon if the coupon is valid
            if (c?.code && isCouponValid(c)) {
              setSelectedCoupon(c.code);
            } else {
              // Remove invalid coupon from encrypted storage
              secureStorage.removeItem("appliedCoupon");
              setSelectedCoupon(null);
            }
          } else {
            setSelectedCoupon(null);
          }
        }
      } catch {
        setSelectedCoupon(null);
      }
    };
    loadCoupon();
  }, [getSubtotal]);

  // Function to check if a coupon is valid for the current order
  const isCouponValid = (coupon: any) => {
    if (!coupon) return false;

    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);
    const currentSubtotal = getSubtotal();

    return (
      coupon.is_active &&
      now >= validFrom &&
      now <= validUntil &&
      currentSubtotal >= coupon.min_order_amount
    );
  };

  // OPTIMIZED: Combined data loading with context loading (single mount effect)
  useEffect(() => {
    const loadAllCheckoutData = async () => {
      if (typeof window !== "undefined") {
        try {
          // Load all encrypted checkout data in parallel
          const [
            savedNote,
            savedCustomization,
            savedCakeText,
            savedMessageCardText,
            savedContext,
          ] = await Promise.all([
            secureStorage.getItem("checkoutNote"),
            secureStorage.getItem("checkoutCustomization"),
            secureStorage.getItem("checkoutCakeText"),
            secureStorage.getItem("checkoutMessageCardText"),
            secureStorage.getItem("checkoutContext"),
          ]);

          // Set all loaded data
          if (savedNote) setNote(savedNote);
          if (savedCustomization) setCustomizationOptions(savedCustomization);
          if (savedCakeText) setCakeText(savedCakeText);
          if (savedMessageCardText) setMessageCardText(savedMessageCardText);
          if (savedContext?.contactInfo) {
            setContactInfo(savedContext.contactInfo);
            setTempContactInfo(savedContext.contactInfo);
          }

          console.log("✅ All encrypted checkout data loaded in parallel");
        } catch (error) {
          console.error("Error loading encrypted checkout data:", error);
        } finally {
          // Mark localStorage data as loaded
          setLoadingStates((prev) => ({
            ...prev,
            localStorage: false,
          }));
        }
      }
    };
    loadAllCheckoutData();
  }, []);

  // Address change drawer state and address text
  const [addressText, setAddressText] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<DbAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);
  const [taxSettings, setTaxSettings] = useState<{
    cgst_rate: number;
    sgst_rate: number;
  } | null>(null);

  // Free delivery threshold state
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<
    number | undefined
  >(undefined);

  // OPTIMIZED: Comprehensive loading state for all critical data
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    checkoutData: true,
    taxSettings: true,
    addresses: true,
    localStorage: true,
  });

  // Check if all critical data is loaded and log progress
  useEffect(() => {
    const loadedCount = Object.values(loadingStates).filter(
      (state) => !state
    ).length;
    const totalCount = Object.keys(loadingStates).length;
    const allLoaded = loadedCount === totalCount;

    console.log(`📊 Loading Progress: ${loadedCount}/${totalCount}`, {
      checkoutData: loadingStates.checkoutData ? "⏳ Loading..." : "✅ Loaded",
      taxSettings: loadingStates.taxSettings ? "⏳ Loading..." : "✅ Loaded",
      addresses: loadingStates.addresses ? "⏳ Loading..." : "✅ Loaded",
      localStorage: loadingStates.localStorage ? "⏳ Loading..." : "✅ Loaded",
    });

    if (allLoaded && isInitializing) {
      console.log("✅ All critical data loaded - hiding skeleton");
      setIsInitializing(false);
    }
  }, [loadingStates, isInitializing]);

  // Customization options state
  const [customizationOptions, setCustomizationOptions] = useState({
    addTextOnCake: false,
    addCandles: false,
    addKnife: false,
    addMessageCard: false,
  });

  // Text input states for customization options
  const [cakeText, setCakeText] = useState("");
  const [messageCardText, setMessageCardText] = useState("");
  const [isCakeTextDrawerOpen, setIsCakeTextDrawerOpen] = useState(false);

  // Contact information state
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    alternatePhone: "",
  });
  const [tempContactInfo, setTempContactInfo] = useState(contactInfo);

  // OPTIMIZED: Combined debug logging to reduce useEffect overhead
  useEffect(() => {
    console.log("🔍 Contact info states changed:", {
      contactInfo,
      tempContactInfo,
    });
  }, [contactInfo, tempContactInfo]);

  // Payment dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "opening" | "verifying" | "success" | "failed"
  >("idle");
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showFailureOverlay, setShowFailureOverlay] = useState(false);
  const [failureCountdown, setFailureCountdown] = useState(0);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  // Delivery calculation
  const {
    calculateDelivery,
    isCalculating: isCalculatingDelivery,
    deliveryData,
    deliveryCharge,
    isFreeDelivery,
    totalWithDelivery,
    error: deliveryError,
  } = useDeliveryCalculation({ checkoutId });

  // REMOVED: Duplicate context loading - now handled in combined data loading effect (line 708)

  // Update tempContactInfo when contactInfo changes
  useEffect(() => {
    setTempContactInfo(contactInfo);
  }, [contactInfo]);

  // OPTIMIZED: Debounced localStorage saves - waits 300ms after last change before saving
  useEffect(() => {
    const saveAllCheckoutData = async () => {
      if (typeof window !== "undefined") {
        try {
          // Save note
          if (note) {
            await secureStorage.setItem("checkoutNote", note);
          } else {
            secureStorage.removeItem("checkoutNote");
          }

          // Save customization options
          if (Object.values(customizationOptions).some(Boolean)) {
            await secureStorage.setItem(
              "checkoutCustomization",
              customizationOptions
            );
          } else {
            secureStorage.removeItem("checkoutCustomization");
          }

          // Save cake text
          if (cakeText) {
            await secureStorage.setItem("checkoutCakeText", cakeText);
          } else {
            secureStorage.removeItem("checkoutCakeText");
          }

          // Save message card text
          if (messageCardText) {
            await secureStorage.setItem(
              "checkoutMessageCardText",
              messageCardText
            );
          } else {
            secureStorage.removeItem("checkoutMessageCardText");
          }

          console.log("💾 Debounced save completed for checkout data");
        } catch (error) {
          console.error("Error saving encrypted checkout data:", error);
        }
      }
    };

    // Debounce the save operation (300ms delay)
    const debouncedSave = debounce(saveAllCheckoutData, DEBOUNCE_CONFIG.MEDIUM);
    debouncedSave();

    // Cleanup timeout on unmount
    return () => {
      // No explicit cleanup needed, debounce handles it
    };
  }, [note, customizationOptions, cakeText, messageCardText]);

  // OPTIMIZED: Memoized clear function to prevent recreation on every render
  const clearCheckoutContext = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        secureStorage.removeItem("checkoutContext");
        secureStorage.removeItem("checkoutNote");
        secureStorage.removeItem("checkoutCustomization");
        secureStorage.removeItem("checkoutCakeText");
        secureStorage.removeItem("checkoutMessageCardText");
      } catch (error) {
        console.error("Error clearing encrypted checkout context:", error);
      }
    }
  }, []);

  // OPTIMIZED: Combined cleanup logic for context and event listeners
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear checkout context when user leaves the page
      clearCheckoutContext();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
      // Context is kept encrypted in storage
      // It will be cleared after order completion or manually via clearCheckoutContext()
    };
  }, []);

  // Sync customization options from cart items
  useEffect(() => {
    if (cart.length > 0) {
      // Check if any cart item has customization options enabled
      const hasCustomizations = cart.some(
        (item) =>
          item.addTextOnCake ||
          item.addCandles ||
          item.addKnife ||
          item.addMessageCard
      );

      if (hasCustomizations) {
        // Aggregate customization options from all cart items
        const aggregatedOptions = {
          addTextOnCake: cart.some((item) => item.addTextOnCake),
          addCandles: cart.some((item) => item.addCandles),
          addKnife: cart.some((item) => item.addKnife),
          addMessageCard: cart.some((item) => item.addMessageCard),
        };

        setCustomizationOptions(aggregatedOptions);
      }
    }
  }, [cart]);

  // OPTIMIZED: Memoized function to update all cart items with new customization options
  const updateAllCartItemsCustomization = useCallback(
    (newOptions: typeof customizationOptions) => {
      cart.forEach((item) => {
        if (item.uniqueId) {
          updateCartItemCustomization(item.uniqueId, newOptions);
        }
      });
    },
    [cart, updateCartItemCustomization]
  );

  // Load addresses from database
  useEffect(() => {
    const load = async () => {
      if (!session?.user?.email) return;
      try {
        setLoadingAddresses(true);

        // Check for new address data from sessionStorage first
        const newAddressData = sessionStorage.getItem("newAddressData");
        if (newAddressData) {
          try {
            const { address, timestamp } = JSON.parse(newAddressData);
            const now = Date.now();

            // Only use data that's less than 5 minutes old
            if (now - timestamp < 5 * 60 * 1000) {
              // Auto-fill the address with the newly created one
              setAddressText(address.full_address);
              setSelectedAddressId(address.id);

              // Clear the sessionStorage data
              sessionStorage.removeItem("newAddressData");

              // Update the addresses list to include the new address
              const user = await getUserByEmail(session.user.email);
              if (user) {
                const list = await getUserAddresses(user.id);
                setAddresses(list || []);
              }

              return; // Don't proceed with the full refresh since we already have the data
            } else {
              // Data is too old, remove it
              sessionStorage.removeItem("newAddressData");
            }
          } catch (parseError) {
            console.error("Error parsing new address data:", parseError);
            sessionStorage.removeItem("newAddressData");
          }
        }

        const user = await getUserByEmail(session.user.email);
        if (!user) return;
        const list = await getUserAddresses(user.id);
        setAddresses(list || []);

        console.log(
          "🏠 Addresses loaded:",
          list?.map((addr) => ({
            id: addr.id,
            full_address: addr.full_address,
            distance: addr.distance,
            duration: addr.duration,
            area: addr.area,
          }))
        );

        // Set contact info from user profile only if no contact info exists in checkout session
        if (!contactInfo.name && !contactInfo.phone) {
          const autoFilledContactInfo = {
            name: user.name || "",
            phone: user.phone_number || "",
            alternatePhone: "",
          };

          setContactInfo(autoFilledContactInfo);

          // Auto-save contact info to checkout session if we have valid data
          if (autoFilledContactInfo.name && autoFilledContactInfo.phone) {
            try {
              console.log("🔄 Auto-saving contact info to checkout session:", {
                checkoutId,
                contactInfo: autoFilledContactInfo,
              });

              const updateResponse = await fetch(
                `/api/checkout/${checkoutId}`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    contactInfo: autoFilledContactInfo,
                  }),
                }
              );

              if (updateResponse.ok) {
                const responseData = await updateResponse.json();
                console.log(
                  "✅ Contact info auto-saved to checkout session:",
                  responseData
                );
              } else {
                console.error(
                  "❌ Failed to auto-save contact info:",
                  await updateResponse.text()
                );
              }
            } catch (error) {
              console.error("❌ Error auto-saving contact info:", error);
            }
          }
        }

        // Only set address text if we don't already have it from new address data or checkout session
        if (!addressText || addressText.trim() === "") {
          console.log(
            "🔄 Auto-filling default address - no address currently set"
          );
          const def = await getDefaultAddress(user.id);
          let selectedAddress = null;

          if (def?.full_address) {
            setAddressText(def.full_address);
            setSelectedAddressId(def.id);
            selectedAddress = def;
          } else if (list?.[0]?.full_address) {
            setAddressText(list[0].full_address);
            setSelectedAddressId(list[0].id);
            selectedAddress = list[0];
          }

          // Auto-save address info to checkout session if we have a selected address
          if (selectedAddress) {
            try {
              console.log("🔄 Auto-saving address info to checkout session:", {
                checkoutId,
                addressText: selectedAddress.full_address,
                selectedAddressId: selectedAddress.id,
                distance: selectedAddress.distance,
                duration: selectedAddress.duration,
              });

              const updateResponse = await fetch(
                `/api/checkout/${checkoutId}`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    addressText: selectedAddress.full_address,
                    selectedAddressId: selectedAddress.id,
                    distance: selectedAddress.distance,
                    duration: selectedAddress.duration,
                  }),
                }
              );

              if (updateResponse.ok) {
                const responseData = await updateResponse.json();
                console.log(
                  "✅ Address info auto-saved to checkout session:",
                  responseData
                );
              } else {
                console.error(
                  "❌ Failed to auto-save address info:",
                  await updateResponse.text()
                );
              }
            } catch (error) {
              console.error("❌ Error auto-saving address info:", error);
            }
          }
        }
      } finally {
        setLoadingAddresses(false);
        // Mark addresses as loaded
        setLoadingStates((prev) => ({
          ...prev,
          addresses: false,
        }));
      }
    };
    load();
  }, [session]);

  // Auto-refresh data when returning from address creation
  useEffect(() => {
    const handleFocus = async () => {
      // Check if we're returning from address creation by looking at the URL
      if (window.location.pathname === "/checkout" && session?.user?.email) {
        try {
          // Check for new address data from sessionStorage
          const newAddressData = sessionStorage.getItem("newAddressData");
          if (newAddressData) {
            try {
              const { address, timestamp } = JSON.parse(newAddressData);
              const now = Date.now();

              // Only use data that's less than 5 minutes old
              if (now - timestamp < 5 * 60 * 1000) {
                // Auto-fill the address with the newly created one
                setAddressText(address.full_address);

                // Clear the sessionStorage data
                sessionStorage.removeItem("newAddressData");

                // Update the addresses list to include the new address
                const user = await getUserByEmail(session.user.email);
                if (user) {
                  const list = await getUserAddresses(user.id);
                  setAddresses(list || []);
                }

                return; // Don't proceed with the full refresh since we already have the data
              } else {
                // Data is too old, remove it
                sessionStorage.removeItem("newAddressData");
              }
            } catch (parseError) {
              console.error("Error parsing new address data:", parseError);
              sessionStorage.removeItem("newAddressData");
            }
          }

          // Regular refresh if no new address data
          const user = await getUserByEmail(session.user.email);
          if (user) {
            const list = await getUserAddresses(user.id);
            setAddresses(list || []);

            // Contact info is handled by the main checkout data loading useEffect

            // Update address if we have new addresses and no address is currently set
            if (
              list &&
              list.length > 0 &&
              (!addressText || addressText.trim() === "")
            ) {
              console.log(
                "🔄 Auto-filling default address in refresh - no address currently set"
              );
              const def = await getDefaultAddress(user.id);
              if (def?.full_address) {
                setAddressText(def.full_address);
              } else if (list[0]?.full_address) {
                setAddressText(list[0].full_address);
              }
            }
          }
        } catch (error) {
          console.error("Error refreshing data:", error);
        }
      }
    };

    // Listen for when the page becomes visible (user returns from another page)
    document.addEventListener("visibilitychange", handleFocus);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("focus", handleFocus);
    };
  }, [session]);

  // OPTIMIZED: Memoized subtotal calculation to prevent recalculation on every render
  const subtotal = useMemo(() => {
    if (checkoutData) {
      return checkoutData.items.reduce(
        (total: number, item: any) => total + item.unit_price * item.quantity,
        0
      );
    }
    return getSubtotal();
  }, [checkoutData, getSubtotal]);
  // GST & Taxes removed from calculation per request
  const gstAndTaxes = 0;
  // Load applied coupon (if any) from localStorage and compute discount strictly from coupon
  let discount = 0;
  try {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("appliedCoupon")
        : null;
    if (raw) {
      const c = JSON.parse(raw);
      const now = new Date();
      const validFrom = new Date(c.valid_from);
      const validUntil = new Date(c.valid_until);
      const meetsMin = subtotal >= (c.min_order_amount || 0);
      const inWindow = now >= validFrom && now <= validUntil;
      if (meetsMin && inWindow) {
        if (c.type === "percentage") {
          const pct = (subtotal * c.value) / 100;
          discount = Math.min(pct, c.max_discount_cap ?? Infinity);
        } else if (c.type === "flat") {
          discount = c.value || 0;
        }
      }
    }
  } catch {}

  // Tax settings are now fetched in parallel with checkout data (lines 97-310)
  // This eliminates the sequential API call and improves performance

  // State for calculated tax amounts
  const [calculatedCgstAmount, setCalculatedCgstAmount] = useState(0);
  const [calculatedSgstAmount, setCalculatedSgstAmount] = useState(0);

  // Calculate taxes when tax settings, subtotal, or discount change
  useEffect(() => {
    const taxableAmount = subtotal - discount;

    // Always calculate taxes dynamically based on current subtotal
    // Use tax rates from database only
    const cgstRate = taxSettings?.cgst_rate;
    const sgstRate = taxSettings?.sgst_rate;

    const cgstAmount = cgstRate ? (taxableAmount * cgstRate) / 100 : 0;
    const sgstAmount = sgstRate ? (taxableAmount * sgstRate) / 100 : 0;

    // Ensure minimum tax calculation
    const finalCgstAmount = cgstAmount > 0 ? cgstAmount : 0;
    const finalSgstAmount = sgstAmount > 0 ? sgstAmount : 0;

    console.log("Tax calculation (frontend - correct method):", {
      taxableAmount,
      cgstRate,
      sgstRate,
      cgstAmount,
      sgstAmount,
      finalCgstAmount,
      finalSgstAmount,
      taxSettings,
      subtotal,
      discount,
    });

    setCalculatedCgstAmount(finalCgstAmount);
    setCalculatedSgstAmount(finalSgstAmount);
  }, [taxSettings, subtotal, discount]);

  // Auto-update checkout session with tax values when they change
  useEffect(() => {
    if (checkoutId && (calculatedCgstAmount > 0 || calculatedSgstAmount > 0)) {
      const updateTaxesInCheckoutSession = async () => {
        try {
          console.log("🔄 Auto-updating tax values in checkout session:", {
            checkoutId,
            cgstAmount: calculatedCgstAmount,
            sgstAmount: calculatedSgstAmount,
            subtotal,
            discount,
          });

          const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cgstAmount: calculatedCgstAmount,
              sgstAmount: calculatedSgstAmount,
              subtotal: subtotal,
              discount: discount,
              totalAmount:
                subtotal -
                discount +
                calculatedCgstAmount +
                calculatedSgstAmount +
                (checkoutData?.deliveryFee || deliveryCharge || 0),
            }),
          });

          if (updateResponse.ok) {
            const responseData = await updateResponse.json();
            console.log(
              "✅ Tax values auto-updated in checkout session:",
              responseData
            );
          } else {
            console.error(
              "❌ Failed to auto-update tax values:",
              await updateResponse.text()
            );
          }
        } catch (error) {
          console.error("❌ Error auto-updating tax values:", error);
        }
      };

      // OPTIMIZED: Debounce the update to avoid too many API calls (500ms)
      const debouncedTaxUpdate = debounce(
        updateTaxesInCheckoutSession,
        DEBOUNCE_CONFIG.SLOW
      );
      debouncedTaxUpdate();

      return () => {
        // Debounce cleanup handled automatically
      };
    }
  }, [
    checkoutId,
    calculatedCgstAmount,
    calculatedSgstAmount,
    subtotal,
    discount,
    deliveryCharge,
  ]);

  // Recalculate delivery fee when checkout data changes
  useEffect(() => {
    if (
      checkoutData?.addressText &&
      checkoutData?.distance &&
      checkoutData?.items
    ) {
      const orderValue = checkoutData.items.reduce(
        (total: number, item: any) => total + (item.total_price || 0),
        0
      );

      // Only recalculate if we don't already have delivery data, if the order value changed, or if delivery fee is not set
      if (
        (!deliveryData || deliveryData.orderValue !== orderValue) &&
        (!checkoutData?.deliveryFee || checkoutData.deliveryFee === 0)
      ) {
        console.log(
          "🔄 Recalculating delivery fee due to checkout data change:",
          {
            addressText: checkoutData.addressText,
            distance: checkoutData.distance,
            duration: checkoutData.duration,
            selectedAddressId: checkoutData.selectedAddressId,
            orderValue,
            checkoutId,
            currentDeliveryFee: checkoutData.deliveryFee,
            currentTotalAmount: checkoutData.totalAmount,
            items: checkoutData.items?.map((item: any) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              total_price: item.total_price,
            })),
          }
        );

        calculateDelivery({
          addressId: checkoutData.selectedAddressId,
          orderValue,
          addressText: checkoutData.addressText,
          distance: checkoutData.distance,
        });
      }
    }
  }, [
    checkoutData?.addressText,
    checkoutData?.distance,
    checkoutData?.items,
    calculateDelivery,
    deliveryData,
  ]);

  const cgstAmount = calculatedCgstAmount;
  const sgstAmount = calculatedSgstAmount;

  // OPTIMIZED: Memoized total calculation to prevent recalculation on every render
  const total = useMemo(() => {
    const baseTotal = subtotal - discount + cgstAmount + sgstAmount;
    // Only add delivery fee if address is selected
    const hasAddress = selectedAddressId || checkoutData?.selectedAddressId;

    // Check if order qualifies for free delivery
    const qualifiesForFreeDelivery =
      freeDeliveryThreshold && subtotal >= freeDeliveryThreshold;

    const deliveryFee = hasAddress
      ? qualifiesForFreeDelivery
        ? 0 // Free delivery when order qualifies
        : checkoutData?.deliveryFee || deliveryCharge || 0
      : 0;

    console.log("🧮 Total calculation:", {
      subtotal,
      discount,
      cgstAmount,
      sgstAmount,
      baseTotal,
      qualifiesForFreeDelivery,
      freeDeliveryThreshold,
      checkoutDataDeliveryFee: checkoutData?.deliveryFee,
      deliveryCharge,
      finalDeliveryFee: deliveryFee,
      total: baseTotal + deliveryFee,
    });

    return baseTotal + deliveryFee;
  }, [
    subtotal,
    discount,
    cgstAmount,
    sgstAmount,
    selectedAddressId,
    checkoutData?.selectedAddressId,
    checkoutData?.deliveryFee,
    deliveryCharge,
    freeDeliveryThreshold, // Add freeDeliveryThreshold to dependencies
  ]);

  // Auto-calculate delivery fee when address is automatically selected
  useEffect(() => {
    const calculateDeliveryForAutoSelectedAddress = async () => {
      if (!selectedAddressId || !addresses.length || !checkoutData?.items)
        return;

      // Don't recalculate if delivery fee is already set and not 0
      if (checkoutData?.deliveryFee && checkoutData.deliveryFee > 0) {
        console.log(
          "🚫 Skipping auto-calculation - delivery fee already set:",
          checkoutData.deliveryFee
        );
        return;
      }

      const selectedAddress = addresses.find(
        (addr) => addr.id === selectedAddressId
      );
      if (!selectedAddress) return;

      console.log("🚚 Auto-calculating delivery for selected address:", {
        addressId: selectedAddressId,
        addressText: selectedAddress.full_address,
        distance: selectedAddress.distance,
        duration: selectedAddress.duration,
        zone: selectedAddress.area || "Zone A",
      });

      // Calculate order value
      const orderValue = checkoutData.items.reduce(
        (total: number, item: any) => total + (item.total_price || 0),
        0
      );

      // Calculate delivery fee using server-side API
      let calculatedDeliveryFee = 0;
      if (selectedAddress.distance) {
        try {
          const distanceInKm = selectedAddress.distance; // Distance is already in km
          console.log("🔍 Client-side distance before API call:", {
            originalDistance: selectedAddress.distance,
            distanceInKm: distanceInKm,
            type: typeof distanceInKm,
          });
          const response = await fetch("/api/calculate-delivery", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              addressId: selectedAddress.id,
              addressText: selectedAddress.full_address,
              checkoutId: checkoutId,
              distance: distanceInKm,
              orderValue: orderValue,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            calculatedDeliveryFee = result.deliveryCharge;
          } else {
            throw new Error("Failed to calculate delivery fee");
          }
        } catch (error) {
          console.error("Error calculating delivery fee:", error);
          // Show error instead of fallback calculation
          toast({
            title: "Delivery Calculation Error",
            description:
              "Unable to calculate delivery fee for this address. Please try again later or contact support.",
            variant: "destructive",
          });
          setCheckoutError(
            "Delivery calculation failed. Please try again later."
          );
          return;
        }
      }

      // Check if order qualifies for free delivery
      const qualifiesForFreeDelivery =
        freeDeliveryThreshold && orderValue >= freeDeliveryThreshold;

      // Use 0 delivery fee if order qualifies for free delivery
      const finalDeliveryFee = qualifiesForFreeDelivery
        ? 0
        : calculatedDeliveryFee;

      const newTotal =
        orderValue +
        finalDeliveryFee +
        calculatedCgstAmount +
        calculatedSgstAmount;

      // Update checkout session with delivery information
      try {
        const updateData = {
          addressText: selectedAddress.full_address,
          selectedAddressId: selectedAddress.id,
          distance: selectedAddress.distance,
          duration: selectedAddress.duration,
          deliveryFee: finalDeliveryFee,
          totalAmount: newTotal,
        };

        const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (updateResponse.ok) {
          console.log("✅ Checkout session auto-updated with delivery info:", {
            deliveryFee: finalDeliveryFee,
            totalAmount: newTotal,
            addressText: selectedAddress.full_address,
            distance: selectedAddress.distance,
            duration: selectedAddress.duration,
            qualifiesForFreeDelivery,
            originalDeliveryFee: calculatedDeliveryFee,
          });

          // Update local checkout data state to reflect the changes
          setCheckoutData((prev: any) => ({
            ...prev,
            deliveryFee: finalDeliveryFee,
            totalAmount: newTotal,
            addressText: selectedAddress.full_address,
            selectedAddressId: selectedAddress.id,
            distance: selectedAddress.distance,
            duration: selectedAddress.duration,
          }));
        } else {
          console.error("❌ Failed to auto-update checkout session");
        }
      } catch (error) {
        console.error("❌ Error auto-updating checkout session:", error);
      }
    };

    calculateDeliveryForAutoSelectedAddress();
  }, [selectedAddressId, addresses, checkoutData?.items, checkoutId]);

  // Optimize checkout flow performance and log cache + rate limit stats
  useEffect(() => {
    // Optimize checkout flow performance
    optimizeCheckoutFlow();
    console.log("Checkout flow optimization initiated");

    // Log cache and rate limit stats periodically (every 30 seconds)
    const statsInterval = setInterval(() => {
      const cacheStats = cacheManager.getStats();
      const rateLimitStats = rateLimiter.getStats();

      console.log("📊 Performance Statistics:", {
        cache: {
          ...cacheStats,
          hitRate: cacheStats.memoryCacheSize > 0 ? "Active" : "Empty",
        },
        rateLimit: {
          ...rateLimitStats,
          status: rateLimitStats.isInCooldown ? "🚫 Cooldown" : "✅ Active",
        },
        timestamp: new Date().toISOString(),
      });
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(statsInterval);
  }, []);

  // OPTIMIZED: Memoized performance metrics handler
  const handlePerformanceMetrics = useCallback((metrics: any) => {
    console.log("Checkout Performance Metrics:", metrics);
    // You can send these metrics to your analytics service
    // or use them for optimization insights
  }, []);

  // Payment processing function - Updated with server-side validation
  const handlePaymentConfirm = async () => {
    if (isPaymentInProgress) return; // Prevent multiple payment attempts

    try {
      setIsPaymentInProgress(true);
      setPaymentStatus("processing");

      // Find the complete address object based on the selected address text
      const selectedAddressObj = addresses.find(
        (addr) => addr.full_address === addressText
      );

      if (!selectedAddressObj) {
        toast({
          title: "Error",
          description: "Address not found. Please select a valid address.",
          variant: "destructive",
        });
        return;
      }

      // ============================================================================
      // SERVER-SIDE VALIDATION - Validate all data before payment
      // ============================================================================
      console.log("🔍 Initiating server-side validation...");

      const validationResponse = await fetch("/api/validate-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkoutId,
          items: checkoutData ? checkoutData.items : cart,
          addressId: selectedAddressObj.id,
          addressText: selectedAddressObj.full_address,
          distance: selectedAddressObj.distance,
          couponCode: selectedCoupon,
          customizationOptions,
          contactInfo,
          clientTotal: total, // Send client total for cross-validation
        }),
      });

      const validationResult = await validationResponse.json();

      if (!validationResponse.ok || !validationResult.success) {
        console.error("❌ Server-side validation failed:", validationResult);
        toast({
          title: "Validation Error",
          description:
            validationResult.error || "Please refresh the page and try again.",
          variant: "destructive",
        });
        setPaymentStatus("failed");
        setIsPaymentInProgress(false);
        return;
      }

      console.log(
        "✅ Server-side validation passed:",
        validationResult.validated
      );

      // Use server-validated values for payment (prevents client-side manipulation)
      const validated = validationResult.validated;

      // Update checkout session with SERVER-VALIDATED financial data
      const updateData = {
        note,
        addressText,
        selectedAddressId: selectedAddressObj.id,
        couponCode: selectedCoupon,
        customizationOptions,
        cakeText,
        messageCardText,
        contactInfo,
        deliveryTiming: "same_day",
        deliveryDate: new Date().toISOString().split("T")[0],
        deliveryTimeSlot: "evening",
        estimatedDeliveryTime: null,
        distance: selectedAddressObj.distance,
        duration: selectedAddressObj.duration,
        // SERVER-VALIDATED Financial data (not client-calculated)
        items: validated.items,
        subtotal: validated.subtotal,
        discount: validated.discount,
        deliveryFee: validated.deliveryFee,
        freeDeliveryQualified: validated.freeDeliveryQualified,
        cgstAmount: validated.cgstAmount,
        sgstAmount: validated.sgstAmount,
        totalAmount: validated.total,
        validatedAt: validationResult.metadata.validatedAt,
      };

      // Debug: Log discount fields in validated items
      console.log(
        "🔍 CHECKOUT: Validated items with discount info:",
        validated.items.map((item: any) => ({
          product_id: item.product_id,
          unit_price: item.unit_price,
          original_price: item.original_price,
          discount_amount: item.discount_amount,
          coupon_applied: item.coupon_applied,
        }))
      );

      // Debug: Log SERVER-VALIDATED financial data being sent to checkout session
      console.log(
        "💳 SERVER-VALIDATED financial data being sent to checkout session:",
        {
          clientValues: {
            subtotal,
            discount,
            deliveryFee: deliveryCharge,
            cgstAmount,
            sgstAmount,
            total,
          },
          validatedValues: {
            subtotal: validated.subtotal,
            discount: validated.discount,
            deliveryFee: validated.deliveryFee,
            freeDeliveryQualified: validated.freeDeliveryQualified,
            cgstAmount: validated.cgstAmount,
            sgstAmount: validated.sgstAmount,
            total: validated.total,
          },
          match: Math.abs(total - validated.total) <= 1,
          addressText,
          selectedAddressObj: selectedAddressObj?.id,
        }
      );

      // Update the checkout session with payment status in single call (optimized)
      console.log("🔄 Updating checkout session:");
      const updateDataWithStatus = {
        ...updateData,
        paymentStatus: "processing",
      };

      const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateDataWithStatus),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update checkout session");
      }

      // Keep dialog open for payment
      setPaymentStatus("processing");

      console.log("Checkout session updated:", updateData);
    } catch (err) {
      console.error("Error in payment flow:", err);
      toast({
        title: "Error",
        description: "Payment preparation failed. Please try again.",
        variant: "destructive",
      });
      setPaymentStatus("failed");
    } finally {
      setIsPaymentInProgress(false);
    }
  };

  // Razorpay payment success handler
  const handleRazorpayPaymentSuccess = async (paymentData: any) => {
    console.log("🎉 Razorpay payment success handler called");
    console.log("📦 Payment Data Received:", {
      hasPaymentData: !!paymentData,
      orderId: paymentData?.orderId,
      paymentId: paymentData?.paymentId,
      signature: paymentData?.signature,
      fullData: paymentData,
    });

    try {
      // Validate that we have orderId
      if (!paymentData || !paymentData.orderId) {
        console.error("❌ ERROR: Payment successful but orderId is missing!", {
          paymentData,
          typeOfPaymentData: typeof paymentData,
        });

        toast({
          title: "Order ID Missing",
          description:
            "Payment was successful but order details are missing. Please check your orders page or contact support.",
          variant: "destructive",
        });

        // Still try to redirect to orders page
        setTimeout(() => {
          router.push("/orders");
        }, 2000);
        return;
      }

      console.log("✅ Valid orderId found:", paymentData.orderId);

      // Close main payment dialog
      setIsPaymentDialogOpen(false);
      setPaymentStatus("success");

      // Clear cart and show success overlay
      clearCart();
      setShowSuccessOverlay(true);
      setSuccessOrderId(paymentData.orderId);

      toast({
        title: "Payment Successful!",
        description: "Your order has been placed successfully.",
        variant: "default",
      });

      // Redirect to confirmation page with orderId
      console.log(
        `🔄 Redirecting to: /confirmation?orderId=${paymentData.orderId}`
      );
      setTimeout(() => {
        router.push(`/confirmation?orderId=${paymentData.orderId}`);
      }, 1000);
    } catch (error) {
      console.error("Error handling payment success:", error);
      handleRazorpayPaymentFailure("Payment processing error");
    }
  };

  // OPTIMIZED: Memoized Razorpay payment handlers to prevent recreation
  const handleRazorpayPaymentFailure = useCallback(
    async (error: any) => {
      console.error("Razorpay payment failed:", error);
      setIsPaymentDialogOpen(false);
      setPaymentStatus("failed");

      toast({
        title: "Payment Failed",
        description:
          "Payment failed. Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    },
    [toast]
  );

  const handleRazorpayPaymentClose = useCallback(async () => {
    setIsPaymentDialogOpen(false);
    setIsPaymentInProgress(false);
    setPaymentStatus("idle");
  }, []);

  const handleRazorpayModalOpening = useCallback(() => {
    console.log("Razorpay modal is opening...");
    setPaymentStatus("opening");
  }, []);

  const handleRazorpayPaymentVerifying = useCallback(() => {
    console.log("Verifying Razorpay payment...");
    setPaymentStatus("verifying");
  }, []);

  // Handle animation completion
  const handleAnimationComplete = useCallback(() => {
    console.log("=== ANIMATION COMPLETION CALLBACK TRIGGERED ===");
    console.log("Animation completed, redirecting to confirmation page");
    console.log("Success overlay state:", {
      showSuccessOverlay,
      successOrderId,
    });

    // Redirect to confirmation page with order ID
    if (successOrderId) {
      // Use redirectUrl from API response if available, otherwise construct it
      const redirectUrl = `/confirmation?orderId=${successOrderId}`;
      router.push(redirectUrl);
    }
  }, [
    showSuccessOverlay,
    successOrderId,
    checkoutId,
    checkoutData,
    total,
    cart,
    addressText,
    contactInfo,
    router,
  ]);

  // Handle failure animation completion
  const handleFailureAnimationComplete = useCallback(() => {
    console.log("=== FAILURE ANIMATION COMPLETION CALLBACK TRIGGERED ===");
    console.log("Failure animation completed, starting 5-second countdown");

    // Start 5-second countdown before returning to checkout page
    setFailureCountdown(5);
    const countdownInterval = setInterval(() => {
      setFailureCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowFailureOverlay(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // OPTIMIZED: Debounced checkout context persistence (encrypted) - waits 500ms after last change
  useEffect(() => {
    const saveContext = async () => {
      try {
        // Find the complete address object based on the selected address text
        const selectedAddressObj = addresses.find(
          (addr) => addr.full_address === addressText
        );

        const ctx = {
          subtotal,
          discount,
          note,
          addressText,
          selectedAddress: selectedAddressObj || null, // Store the complete address object
          couponCode: selectedCoupon,
          customizationOptions,
          cakeText,
          messageCardText,
          contactInfo,
        };
        if (typeof window !== "undefined") {
          await secureStorage.setItem("checkoutContext", ctx);
          console.log("💾 Debounced context save completed");
        }
      } catch (error) {
        console.error("Error saving checkout context:", error);
      }
    };

    // Debounce the context save operation (500ms delay for expensive operation)
    const debouncedContextSave = debounce(saveContext, DEBOUNCE_CONFIG.SLOW);
    debouncedContextSave();

    return () => {
      // No explicit cleanup needed, debounce handles it
    };
  }, [
    subtotal,
    discount,
    note,
    addressText,
    addresses,
    selectedCoupon,
    customizationOptions,
    cakeText,
    messageCardText,
    contactInfo,
  ]);

  // OPTIMIZED: Show skeleton loader until ALL critical data is loaded
  if (cartLoading || checkoutLoading || isInitializing) {
    return <CheckoutSkeleton />;
  }

  // Show expiry screen if session is expired
  if (isSessionExpired) {
    return <CheckoutExpiryScreen checkoutId={checkoutId} />;
  }

  // Show error if checkout failed to load (non-expiry errors)
  if (checkoutError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FB]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Checkout Session Not Found
          </h2>
          <p className="text-gray-600 mb-6">{checkoutError}</p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/cart")}
              className="w-full bg-[#523435] hover:bg-[#402627]"
            >
              Back to Cart
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/products")}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to home if cart is empty (only after loading is complete)
  // BUT don't redirect if we're showing the success or failure overlay
  if (
    (checkoutData ? checkoutData.items.length === 0 : cart.length === 0) &&
    !showSuccessOverlay &&
    !showFailureOverlay
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FB]">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-[400px] h-[300px] md:h-[400px] md:w-[500px]">
              <Lottie
                animationData={zeroPurchaseAnimation}
                loop={true}
                autoplay={true}
              />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some items to your cart to proceed with checkout.
          </p>
          <Link href="/products">
            <Button className="bg-primary hover:bg-primary/90">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FB] pb-28">
      <PerformanceMonitor onMetrics={handlePerformanceMetrics} />

      {/* Show success overlay if payment was successful */}
      {showSuccessOverlay && successOrderId && (
        <CheckoutSuccessOverlay
          key={`success-${successOrderId}`}
          orderId={successOrderId}
          isVisible={showSuccessOverlay}
          onAnimationComplete={handleAnimationComplete}
        />
      )}

      {/* Show failure overlay if payment failed */}
      {showFailureOverlay && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-[400px] h-[300px] mx-auto mb-6">
              <Lottie
                animationData={paymentFailedAnimation}
                loop={false}
                autoplay={true}
                onComplete={handleFailureAnimationComplete}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-4">
              Your payment could not be processed. Please try again.
            </p>
            {failureCountdown > 0 && (
              <p className="text-sm text-gray-500 mb-6">
                Redirecting to checkout page in {failureCountdown} seconds...
              </p>
            )}
            <Button
              onClick={() => setShowFailureOverlay(false)}
              className="bg-[#523435] hover:bg-[#4a2a2a] text-white px-8 py-3 rounded-lg"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Main checkout content - hidden when showing success or failure overlay */}
      <div
        style={{
          display: showSuccessOverlay || showFailureOverlay ? "none" : "block",
        }}
      >
        {/* Header */}
        <div className="bg-[#F5F6FB]">
          <div className="max-w-[1200px] mx-auto px-4 py-4">
            <div className="flex items-center justify-between md:justify-start md:gap-4">
              <Link
                href="/"
                onClick={() => {
                  // Clear checkout context when going back to home
                  clearCheckoutContext();
                }}
              >
                <div className="bg-white p-3 md:p-2 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                  <IoIosArrowBack className="h-5 w-5 text-gray-700" />
                </div>
              </Link>
              <h1 className="text-xl font-semibold absolute left-1/2 transform -translate-x-1/2 md:relative md:left-auto md:transform-none">
                Checkout
              </h1>
              <div className="w-9 md:hidden"></div>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content (below on mobile, left on desktop) */}
            <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
              {/* Note Section (moves below Order Summary on mobile) */}
              <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
                {/* Note Drawer (all screens, full-width) */}
                <div>
                  <NoteDrawer
                    checkoutId={checkoutId}
                    initialNote={note}
                    onNoteChange={setNote}
                  />
                </div>
              </div>
              {/* Coupons Section */}
              <CouponButton
                checkoutId={checkoutId}
                selectedCoupon={selectedCoupon}
                onCouponApplied={setAppliedCoupon}
                onCheckoutDataUpdate={setCheckoutData}
                checkoutData={checkoutData}
              />

              <CustomizationOptionsDrawer
                checkoutId={checkoutId}
                cart={cart}
                customizationOptions={customizationOptions}
                messageCardText={messageCardText}
                onCustomizationChange={setCustomizationOptions}
                onMessageCardTextChange={setMessageCardText}
                updateAllCartItemsCustomization={
                  updateAllCartItemsCustomization
                }
              />

              <DeliveryInfoSection
                checkoutId={checkoutId}
                addresses={addresses}
                addressText={addressText}
                selectedAddressId={selectedAddressId}
                checkoutData={checkoutData}
                contactInfo={contactInfo}
                session={session}
                onAddressTextChange={setAddressText}
                onSelectedAddressIdChange={setSelectedAddressId}
                onCheckoutDataChange={setCheckoutData}
                onContactInfoChange={setContactInfo}
              />

              <PaymentSection className="hidden lg:block mx-4 mt-4" />
            </div>

            {/* Right Column - Order Summary (top on mobile, right on desktop) */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="space-y-4">
                <div className="bg-white mx-4 p-3 rounded-[22px] border border-gray-200 dark:border-gray-600 overflow-hidden">
                  <ProductListing
                    items={checkoutData ? checkoutData.items : cart}
                    checkoutData={checkoutData}
                    onRemoveItem={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                    onUpdateCheckoutData={setCheckoutData}
                    appliedCoupon={appliedCoupon}
                    categories={categories}
                  />

                  {/* Place Order Button moved to fixed bottom bar */}
                </div>

                <BillDetails
                  subtotal={subtotal}
                  discount={discount}
                  deliveryCharge={deliveryCharge}
                  checkoutData={checkoutData}
                  selectedAddressId={selectedAddressId}
                  isFreeDelivery={isFreeDelivery}
                  isCalculatingDelivery={isCalculatingDelivery}
                  cgstAmount={cgstAmount}
                  sgstAmount={sgstAmount}
                  total={total}
                  taxSettings={taxSettings}
                  addressText={addressText}
                  contactInfo={contactInfo}
                  onPaymentClick={() => setIsPaymentDialogOpen(true)}
                  className="hidden lg:block"
                  freeDeliveryThreshold={freeDeliveryThreshold}
                />
              </div>
            </div>
          </div>
          {/* Mobile Bill Details and Payment Sections - At bottom */}
          <div className="lg:hidden space-y-4 mt-6">
            <BillDetails
              subtotal={subtotal}
              discount={discount}
              deliveryCharge={deliveryCharge}
              checkoutData={checkoutData}
              selectedAddressId={selectedAddressId}
              isFreeDelivery={isFreeDelivery}
              isCalculatingDelivery={isCalculatingDelivery}
              cgstAmount={cgstAmount}
              sgstAmount={sgstAmount}
              total={total}
              taxSettings={taxSettings}
              addressText={addressText}
              contactInfo={contactInfo}
              onPaymentClick={() => setIsPaymentDialogOpen(true)}
              className="lg:hidden"
              freeDeliveryThreshold={freeDeliveryThreshold}
            />

            <PaymentSection className="mx-4 pb-6" />

            {/* Cancellation Policy - Mobile (moved below Payment) */}
            <div className="mx-4 px-4 text-[#9AA3C7]">
              <h4 className="uppercase tracking-wide font-semibold text-[14px]">
                Cancellation Policy
              </h4>
              <p className="mt-2 text-sm">
                Once your order is placed, it cannot be cancelled or modified.
                We do not offer refunds for cancelled orders under any
                circumstances.
              </p>
            </div>
          </div>

          {/* Fixed bottom Place Order bar (mobile only) */}
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-gray-200 lg:hidden">
            <div className="mx-auto px-4 py-3 w-full max-w-[1200px]">
              <Button
                onClick={() => setIsPaymentDialogOpen(true)}
                disabled={
                  !addressText ||
                  addressText === "2nd street, Barathipuram, Kannampalayam" ||
                  !contactInfo.name ||
                  !contactInfo.phone ||
                  isCalculatingDelivery
                }
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-[18px] h-[48px] text-[16px] font-medium"
              >
                Proceed to Payment
              </Button>
            </div>
          </div>

          <PaymentConfirmationDialog
            isOpen={isPaymentDialogOpen}
            paymentStatus={paymentStatus}
            total={total}
            subtotal={subtotal}
            discount={discount}
            deliveryCharge={deliveryCharge}
            checkoutData={checkoutData}
            selectedAddressId={selectedAddressId}
            isFreeDelivery={isFreeDelivery}
            cgstAmount={cgstAmount}
            sgstAmount={sgstAmount}
            taxSettings={taxSettings}
            addressText={addressText}
            contactInfo={contactInfo}
            selectedCoupon={selectedCoupon}
            checkoutId={checkoutId}
            session={session}
            isPaymentInProgress={isPaymentInProgress}
            onOpenChange={setIsPaymentDialogOpen}
            onPaymentSuccess={handleRazorpayPaymentSuccess}
            onPaymentFailure={handleRazorpayPaymentFailure}
            onPaymentClose={handleRazorpayPaymentClose}
            onModalOpening={handleRazorpayModalOpening}
            onPaymentVerifying={handleRazorpayPaymentVerifying}
            onRetryPayment={() => {
              setPaymentStatus("idle");
              setIsPaymentInProgress(false);
            }}
            onCancelPayment={() => {
              setIsPaymentDialogOpen(false);
              setPaymentStatus("idle");
              setIsPaymentInProgress(false);
            }}
            freeDeliveryThreshold={freeDeliveryThreshold}
          />
        </div>
      </div>
    </div>
  );
}
