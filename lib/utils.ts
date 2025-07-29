import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility functions for processing database products
export interface ProcessedProduct {
  id: string;
  name: string;
  rating: number;
  imageUrl: string;
  price: number;
  originalPrice?: number; // For displaying discounts
  isVeg: boolean;
  description: string;
  category: string;
  hasOffer: boolean;
  offerPercentage?: number;
  categories?: {
    id: string;
    name: string;
    description?: string;
  };
}

// Extract the minimum price from piece options first, then weight options
export function getProductPrice(product: any): {
  price: number;
  originalPrice?: number;
} {
  let minPrice = 0;
  let originalPrice: number | undefined;

  // Check piece options first (prioritize piece prices)
  if (product.piece_options && product.piece_options.length > 0) {
    const activePieceOptions = product.piece_options.filter(
      (opt: any) => opt.isActive
    );
    if (activePieceOptions.length > 0) {
      minPrice = Math.min(
        ...activePieceOptions.map((opt: any) => parseInt(opt.price) || 0)
      );
    }
  }

  // Check weight options if no piece options or piece options have no price
  if (
    minPrice === 0 &&
    product.weight_options &&
    product.weight_options.length > 0
  ) {
    const activeWeightOptions = product.weight_options.filter(
      (opt: any) => opt.isActive
    );
    if (activeWeightOptions.length > 0) {
      minPrice = Math.min(
        ...activeWeightOptions.map((opt: any) => parseInt(opt.price) || 0)
      );
    }
  }

  // Calculate original price if there's an offer
  if (product.has_offer && product.offer_percentage && minPrice > 0) {
    originalPrice = Math.round(minPrice / (1 - product.offer_percentage / 100));
  }

  return { price: minPrice, originalPrice };
}

// Generate a random rating for display (since we don't have ratings in the database yet)
export function generateRating(): number {
  // Generate ratings between 4.0 and 5.0 for better appearance
  return Math.round((Math.random() * 1 + 4) * 10) / 10;
}

// Convert database product to ProcessedProduct for homepage display - OPTIMIZED
export function processProductForHomepage(dbProduct: any): ProcessedProduct {
  // Calculate price from weight_options or piece_options since price column doesn't exist
  const { price, originalPrice } = getProductPrice(dbProduct);

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    rating: generateRating(), // TODO: Replace with actual ratings when available
    imageUrl: dbProduct.banner_image || "/placeholder.svg",
    price: price,
    originalPrice: originalPrice,
    isVeg: dbProduct.is_veg,
    description: "Delicious pastry made with premium ingredients", // Default description
    category: dbProduct.categories?.name || "Pastry",
    hasOffer: false, // No offer data in optimized query
    offerPercentage: undefined, // No offer data in optimized query
    categories: dbProduct.categories,
  };
}

// Convert database product to lightweight ProcessedProduct for homepage (no heavy data)
export function processHomepageProduct(dbProduct: any): ProcessedProduct {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    rating: generateRating(), // TODO: Replace with actual ratings when available
    imageUrl: "/placeholder.svg", // Use placeholder to avoid large image URLs in HTML
    price: 0, // Will be fetched client-side
    originalPrice: undefined, // Will be fetched client-side
    isVeg: dbProduct.is_veg,
    description:
      dbProduct.short_description ||
      "Delicious pastry made with premium ingredients",
    category: dbProduct.categories?.name || "Pastry",
    hasOffer: dbProduct.has_offer,
    offerPercentage: dbProduct.offer_percentage,
    categories: dbProduct.categories,
  };
}

// Check if product is in stock
export function isProductInStock(product: any): boolean {
  // Check weight options
  if (product.weight_options && product.weight_options.length > 0) {
    const activeWeightOptions = product.weight_options.filter(
      (opt: any) => opt.isActive
    );
    if (activeWeightOptions.length > 0) {
      return activeWeightOptions.some((opt: any) => parseInt(opt.stock) > 0);
    }
  }

  // Check piece options
  if (product.piece_options && product.piece_options.length > 0) {
    const activePieceOptions = product.piece_options.filter(
      (opt: any) => opt.isActive
    );
    if (activePieceOptions.length > 0) {
      return activePieceOptions.some((opt: any) => parseInt(opt.stock) > 0);
    }
  }

  return false;
}
