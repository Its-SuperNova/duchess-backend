/**
 * Utility functions for handling image URLs
 */

import { getOptimizedImageUrl } from "./cloudinary-client";

/**
 * Get the proper image URL for display
 * @param imageUrl - The image URL from database (could be relative path or full URL)
 * @param fallback - Fallback image path (default: "/placeholder.svg")
 * @returns Proper image URL for display
 */
export function getImageUrl(
  imageUrl: string | null | undefined,
  fallback: string = "/placeholder.svg"
): string {
  if (!imageUrl) {
    return fallback;
  }

  // If it's a Cloudinary URL, optimize it for display
  if (imageUrl.includes("cloudinary.com")) {
    return getOptimizedImageUrl(imageUrl, "w_auto,f_auto,q_auto");
  }

  // If it's already a full URL (http/https), return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // If it's a relative path, try to construct the proper path
  // Check if it's in the images directory
  if (imageUrl.startsWith("images/") || imageUrl.includes("/images/")) {
    return `/${imageUrl}`;
  }

  // If it's just a filename, assume it's in the images directory
  if (!imageUrl.startsWith("/") && !imageUrl.includes("/")) {
    return `/images/${imageUrl}`;
  }

  // If it starts with /, return as is
  if (imageUrl.startsWith("/")) {
    return imageUrl;
  }

  // Default fallback
  return fallback;
}

/**
 * Check if an image URL is valid (not base64 or data URL)
 * @param imageUrl - The image URL to check
 * @returns true if the URL is valid for display
 */
export function isValidImageUrl(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return false;

  // Don't display base64 or data URLs
  if (imageUrl.startsWith("data:")) return false;

  // Cloudinary URLs are always valid
  if (imageUrl.includes("cloudinary.com")) return true;

  // Other valid URL patterns
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
    return true;
  if (imageUrl.startsWith("/")) return true;

  return true;
}

/**
 * Get product image URL with proper fallback and optimization
 * @param product - Product object with banner_image field
 * @param size - Image size transformation (default: "w_auto,f_auto,q_auto")
 * @returns Proper image URL for the product
 */
export function getProductImageUrl(
  product: { banner_image?: string | null },
  size: string = "w_auto,f_auto,q_auto"
): string {
  if (!isValidImageUrl(product.banner_image)) {
    return "/placeholder.svg";
  }

  // If it's a Cloudinary URL, apply specific optimizations for products
  if (product.banner_image && product.banner_image.includes("cloudinary.com")) {
    return getOptimizedImageUrl(product.banner_image, size);
  }

  return getImageUrl(product.banner_image, "/placeholder.svg");
}

/**
 * Get thumbnail image URL for product lists
 * @param product - Product object with banner_image field
 * @returns Optimized thumbnail URL
 */
export function getProductThumbnailUrl(product: {
  banner_image?: string | null;
}): string {
  return getProductImageUrl(product, "w_300,h_300,c_fill,f_auto,q_auto");
}

/**
 * Get full-size product image URL
 * @param product - Product object with banner_image field
 * @returns Full-size optimized URL
 */
export function getProductFullImageUrl(product: {
  banner_image?: string | null;
}): string {
  return getProductImageUrl(product, "w_auto,f_auto,q_auto");
}
