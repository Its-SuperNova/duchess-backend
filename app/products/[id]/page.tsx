"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaStar, FaHeart, FaRegHeart, FaShare } from "react-icons/fa";
import { BsArrowLeft } from "react-icons/bs";
import { useParams, useRouter } from "next/navigation";
import type { Product } from "@/context/favorites-context";
import {
  Truck,
  Coffee,
  Apple,
  Egg,
  ChevronRight,
  ShoppingCart,
  Droplet,
  Dumbbell,
  Candy,
  Wheat,
  Shell,
  Package,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import CakeDeliveryCard from "./cake-delivery-card";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useFavorites } from "@/context/favorites-context";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductById } from "@/lib/actions/products";
import { getProductPrice, generateRating, isProductInStock } from "@/lib/utils";
import { toast as sonnerToast } from "sonner";

// Types for database product
interface DatabaseProduct {
  id: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  category_id: string;
  is_veg: boolean;
  has_offer: boolean;
  offer_percentage: number | null;
  offer_up_to_price: number;
  banner_image: string | null;
  additional_images: string[];
  selling_type: "weight" | "piece" | "both";
  weight_options: Array<{
    weight: string;
    price: string;
    stock: string;
    isActive: boolean;
  }>;
  piece_options: Array<{
    quantity: string;
    price: string;
    stock: string;
    isActive: boolean;
  }>;
  calories: number | null;
  net_weight: number | null;
  protein: number | null;
  fats: number | null;
  carbs: number | null;
  sugars: number | null;
  fiber: number | null;
  sodium: number | null;
  add_text_on_cake: boolean;
  add_candles: boolean;
  add_knife: boolean;
  add_message_card: boolean;
  delivery_option: "same-day" | "both";
  highlights: string[];
  ingredients: string[];
  is_active: boolean;
  categories: {
    id: string;
    name: string;
    description: string;
  };
}

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const { toast } = useToast();

  // Product state
  const [product, setProduct] = useState<DatabaseProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [selectedWeightOption, setSelectedWeightOption] = useState<number>(0);
  const [selectedPieceOption, setSelectedPieceOption] = useState<number>(0);
  const [mainImage, setMainImage] = useState<string>("");
  const [isLiked, setIsLiked] = useState(false);
  const [orderType, setOrderType] = useState<"weight" | "piece">("weight");
  const [pieceQuantity, setPieceQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const { addToCart } = useCart();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setIsLoading(true);
        setError(null);

        const productData = await getProductById(productId);
        setProduct(productData);
        setMainImage(productData.banner_image || "/placeholder.svg");

        // Set initial order type based on selling type
        if (productData.selling_type === "piece") {
          setOrderType("piece");
        } else if (productData.selling_type === "weight") {
          setOrderType("weight");
        } else {
          // "both" - default to weight
          setOrderType("weight");
        }

        // Set initial selected options
        if (productData.weight_options?.length > 0) {
          const firstActiveWeight = productData.weight_options.findIndex(
            (opt) => opt.isActive
          );
          setSelectedWeightOption(Math.max(0, firstActiveWeight));
        }

        if (productData.piece_options?.length > 0) {
          const firstActivePiece = productData.piece_options.findIndex(
            (opt) => opt.isActive
          );
          setSelectedPieceOption(Math.max(0, firstActivePiece));
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product details");
        sonnerToast.error("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Update favorites when product loads
  useEffect(() => {
    if (product) {
      const numericId = parseInt(product.id.replace(/\D/g, "")) || 0;
      setIsLiked(isFavorite(numericId));
    }
  }, [product, isFavorite]);

  // Calculate current price and stock
  const getCurrentPriceAndStock = () => {
    if (!product) return { price: 0, stock: 0, originalPrice: undefined };

    if (orderType === "weight" && product.weight_options?.length > 0) {
      const option = product.weight_options[selectedWeightOption];
      if (option && option.isActive) {
        const price = parseInt(option.price) || 0;
        const stock = parseInt(option.stock) || 0;
        let originalPrice: number | undefined;

        if (product.has_offer && product.offer_percentage) {
          originalPrice = Math.round(
            price / (1 - product.offer_percentage / 100)
          );
        }

        return { price, stock, originalPrice };
      }
    }

    if (orderType === "piece" && product.piece_options?.length > 0) {
      const option = product.piece_options[selectedPieceOption];
      if (option && option.isActive) {
        const price = parseInt(option.price) || 0;
        const stock = parseInt(option.stock) || 0;
        let originalPrice: number | undefined;

        if (product.has_offer && product.offer_percentage) {
          originalPrice = Math.round(
            price / (1 - product.offer_percentage / 100)
          );
        }

        return {
          price: price * pieceQuantity,
          stock,
          originalPrice: originalPrice
            ? originalPrice * pieceQuantity
            : undefined,
        };
      }
    }

    return { price: 0, stock: 0, originalPrice: undefined };
  };

  const retryFetch = () => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const productData = await getProductById(productId);
          setProduct(productData);
          setMainImage(productData.banner_image || "/placeholder.svg");
          sonnerToast.success("Product loaded successfully");
        } catch (error) {
          setError("Failed to load product details");
          sonnerToast.error("Failed to load product details");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (!product) return;

    const numericId = parseInt(product.id.replace(/\D/g, "")) || 0;
    const { price } = getCurrentPriceAndStock();

    const productData: Product = {
      id: numericId,
      name: product.name,
      price: price,
      image: product.banner_image || "/placeholder.svg",
      isVeg: product.is_veg,
      description: product.short_description || product.long_description || "",
      rating: generateRating(),
    };

    if (isLiked) {
      removeFromFavorites(numericId);
      setIsLiked(false);
    } else {
      addToFavorites(productData);
      setIsLiked(true);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;

    const { price, stock } = getCurrentPriceAndStock();

    if (stock === 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently unavailable",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const numericId = parseInt(product.id.replace(/\D/g, "")) || 0;
    let variant = "";

    if (orderType === "weight" && product.weight_options?.length > 0) {
      const option = product.weight_options[selectedWeightOption];
      variant = `${option.weight} Kg`;
    } else if (orderType === "piece" && product.piece_options?.length > 0) {
      const option = product.piece_options[selectedPieceOption];
      variant = `${pieceQuantity} Piece${pieceQuantity > 1 ? "s" : ""}`;
    }

    const cartItem = {
      id: numericId,
      name: product.name,
      price:
        orderType === "piece"
          ? parseInt(product.piece_options?.[selectedPieceOption]?.price || "0")
          : price,
      image: product.banner_image || "/placeholder.svg",
      quantity: orderType === "piece" ? pieceQuantity : 1,
      category: product.categories?.name || "Product",
      variant: variant,
    };

    addToCart(cartItem);

    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
      className: "bg-green-50 text-green-800 border-green-300 py-3",
    });
  };

  // Get all images for gallery
  const getAllImages = () => {
    if (!product) return [];
    const images = [product.banner_image].filter(Boolean);
    return [...images, ...product.additional_images];
  };

  // Render stock status
  const renderStockStatus = () => {
    const { stock } = getCurrentPriceAndStock();

    if (stock === 0) {
      return (
        <div className="flex items-center gap-1.5 text-red-600 mt-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Out of Stock</span>
        </div>
      );
    } else if (stock <= 3) {
      return (
        <div className="flex items-center gap-1.5 text-amber-600 mt-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            Only {stock} left in stock - order soon
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5 text-green-600 mt-2">
          <Package className="h-4 w-4" />
          <span className="text-sm font-medium">
            In Stock ({stock} available)
          </span>
        </div>
      );
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-[#f5f5f5] flex flex-col items-center">
        <div className="max-w-[1300px] flex flex-col min-h-screen mb-20 mx-4">
          <div className="flex flex-col md:flex-row md:gap-8 md:p-8 flex-1">
            {/* Left column skeleton */}
            <div className="md:w-2/3 flex flex-col gap-6">
              <div className="relative mt-4 rounded-2xl overflow-hidden">
                <Skeleton className="h-[350px] lg:h-[450px] w-full rounded-2xl" />
              </div>
              <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
            {/* Right column skeleton */}
            <div className="w-full md:w-1/3 flex flex-col gap-5 mt-4">
              <div className="w-full bg-white rounded-3xl p-7 flex flex-col gap-5 h-fit shadow-sm">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="bg-[#f5f5f5] flex flex-col items-center min-h-screen">
        <div className="max-w-[1300px] flex flex-col justify-center items-center h-screen mx-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Product Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              {error ||
                "The product you're looking for doesn't exist or has been removed."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
              <Button onClick={retryFetch} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    price: currentPrice,
    stock: currentStock,
    originalPrice,
  } = getCurrentPriceAndStock();
  const images = getAllImages();

  return (
    <>
      <div className="bg-[#f5f5f5] flex flex-col items-center">
        <div className="max-w-[1300px] flex flex-col min-h-screen mb-20 mx-4">
          {/* Main content: two columns on desktop, one column on mobile */}
          <div className="flex flex-col md:flex-row md:gap-8 md:p-8 flex-1">
            {/* Left column */}
            <div className="md:w-2/3 flex flex-col gap-6">
              {/* Top navigation and Hero Image */}
              <div className="relative mt-4 rounded-2xl overflow-hidden">
                {/* Hero Image */}
                <div className="relative h-[350px] lg:h-[450px] w-full rounded-2xl overflow-hidden">
                  <Image
                    src={mainImage || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover rounded-2xl"
                  />

                  {/* Offer Badge */}
                  {product.has_offer && product.offer_percentage && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-md z-10">
                      {product.offer_percentage}% OFF
                    </div>
                  )}

                  {/* Nav buttons */}
                  <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
                    <button
                      onClick={() => router.back()}
                      className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
                    >
                      <BsArrowLeft className="text-gray-800" size={20} />
                    </button>

                    <div className="flex gap-3">
                      <button
                        onClick={handleFavoriteToggle}
                        className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
                      >
                        {isLiked ? (
                          <FaHeart className="text-red-500" size={20} />
                        ) : (
                          <FaRegHeart className="text-gray-800" size={20} />
                        )}
                      </button>

                      <button className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md">
                        <FaShare className="text-gray-800" size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image thumbnails */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 px-3">
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 px-1">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setMainImage(image)}
                          className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 ${
                            mainImage === image
                              ? "border-[#560000]"
                              : "border-white"
                          }`}
                        >
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info Section */}
              <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
                {/* Category and Rating */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">
                    {product.categories?.name}
                  </span>
                  <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full">
                    <FaStar className="text-amber-500 mr-1.5" />
                    <span className="font-semibold text-amber-800">
                      {generateRating()}
                    </span>
                  </div>
                </div>

                {/* Product Name and Veg Indicator */}
                <div className="flex justify-between items-center mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {product.name}
                  </h1>
                  {product.is_veg && (
                    <div className="w-6 h-6 border-2 border-green-600 flex items-center justify-center rounded-sm">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                {renderStockStatus()}

                {/* Description */}
                <div className="mb-7 mt-4">
                  <h2 className="font-semibold text-lg mb-3 text-gray-800">
                    Description
                  </h2>
                  <div className="space-y-4">
                    {isDescriptionExpanded ? (
                      <>
                        {product.short_description && (
                          <p className="text-gray-700 leading-relaxed">
                            {product.short_description}
                          </p>
                        )}
                        {product.long_description && (
                          <p className="text-gray-700 leading-relaxed">
                            {product.long_description}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-700 leading-relaxed line-clamp-2">
                        {product.short_description ||
                          product.long_description ||
                          "No description available"}
                      </p>
                    )}
                  </div>
                  {(product.short_description || product.long_description) && (
                    <button
                      onClick={() =>
                        setIsDescriptionExpanded(!isDescriptionExpanded)
                      }
                      className="text-sm font-medium text-[#560000] hover:text-[#560000]/80 transition-colors flex items-center mt-3"
                    >
                      {isDescriptionExpanded ? "Read less" : "Read more"}
                      <ChevronRight
                        className={`h-4 w-4 ml-1 transition-transform ${
                          isDescriptionExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Product Highlights */}
                {product.highlights && product.highlights.length > 0 && (
                  <div className="mb-6">
                    <h2 className="font-semibold text-lg mb-3 text-gray-800">
                      Highlights
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {product.highlights.map((highlight, index) => (
                        <span
                          key={index}
                          className="bg-[#560000]/10 text-[#560000] px-4 py-1.5 rounded-full text-sm font-medium"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ingredients */}
                {product.ingredients && product.ingredients.length > 0 && (
                  <div>
                    <h2 className="font-semibold text-lg mb-3 text-gray-800">
                      Ingredients
                    </h2>
                    <div className="flex flex-wrap gap-3 items-center">
                      {product.ingredients
                        .slice(0, 6)
                        .map((ingredient, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 px-3 py-2 rounded-full flex items-center text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            <Coffee className="h-4 w-4 mr-2 text-[#560000]" />
                            {ingredient}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="w-full md:w-1/3 flex flex-col gap-5 mt-4">
              {/* Pricing and Order Card */}
              <div className="w-full bg-white rounded-3xl p-7 flex flex-col gap-5 h-fit shadow-sm">
                {/* Price display */}
                <div className="flex items-baseline gap-3 md:flex">
                  <h2 className="text-3xl font-bold text-black md:block hidden">
                    ₹{currentPrice}
                  </h2>
                  {originalPrice && originalPrice > currentPrice && (
                    <p className="text-gray-400 line-through text-lg md:block hidden">
                      ₹{originalPrice}
                    </p>
                  )}
                </div>

                {/* Stock Status in Card */}
                <div className="hidden md:block">{renderStockStatus()}</div>

                {/* Divider */}
                <div className="h-px bg-gray-100 w-full"></div>

                {/* Order Type Selection */}
                {product.selling_type === "both" && (
                  <div>
                    <h2 className="text-gray-500 text-sm mb-3">Order Type</h2>
                    <div className="flex gap-3 p-1 bg-gray-100 rounded-xl">
                      <button
                        onClick={() => setOrderType("weight")}
                        className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                          orderType === "weight"
                            ? "bg-white text-[#560000] shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        By Weight
                      </button>
                      <button
                        onClick={() => setOrderType("piece")}
                        className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                          orderType === "piece"
                            ? "bg-white text-[#560000] shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        By Piece
                      </button>
                    </div>
                  </div>
                )}

                {/* Weight/Piece Selection */}
                {orderType === "weight" &&
                  product.weight_options &&
                  product.weight_options.length > 0 && (
                    <div>
                      <h2 className="text-gray-500 text-sm mb-3">
                        Select Weight
                      </h2>
                      <div className="grid grid-cols-3 gap-2">
                        {product.weight_options.map(
                          (option, index) =>
                            option.isActive && (
                              <button
                                key={index}
                                onClick={() => setSelectedWeightOption(index)}
                                className={`py-3 rounded-xl text-sm transition-all ${
                                  selectedWeightOption === index
                                    ? "bg-[#560000] text-white font-medium"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {option.weight} Kg
                              </button>
                            )
                        )}
                      </div>
                    </div>
                  )}

                {orderType === "piece" &&
                  product.piece_options &&
                  product.piece_options.length > 0 && (
                    <div>
                      <h2 className="text-gray-500 text-sm mb-3">
                        Select Option
                      </h2>
                      <div className="space-y-2 mb-4">
                        {product.piece_options.map(
                          (option, index) =>
                            option.isActive && (
                              <button
                                key={index}
                                onClick={() => setSelectedPieceOption(index)}
                                className={`w-full py-3 px-4 rounded-xl text-sm transition-all text-left ${
                                  selectedPieceOption === index
                                    ? "bg-[#560000] text-white font-medium"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {option.quantity} - ₹{option.price}
                              </button>
                            )
                        )}
                      </div>
                      <h2 className="text-gray-500 text-sm mb-3">Quantity</h2>
                      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                        <button
                          onClick={() =>
                            setPieceQuantity(Math.max(1, pieceQuantity - 1))
                          }
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
                            pieceQuantity > 1
                              ? "bg-[#560000] text-white shadow-sm"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          disabled={pieceQuantity <= 1}
                        >
                          -
                        </button>
                        <span className="text-xl font-medium text-gray-900">
                          {pieceQuantity}
                        </span>
                        <button
                          onClick={() => setPieceQuantity(pieceQuantity + 1)}
                          className="w-9 h-9 rounded-lg bg-[#560000] text-white flex items-center justify-center text-lg shadow-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                {/* Delivery estimate */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-900 font-medium">
                      {currentStock > 0
                        ? "Delivery Today"
                        : "Extended Delivery"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentStock > 0
                        ? "Estimated delivery in 1-2 hrs"
                        : "Additional time for restocking"}
                    </p>
                  </div>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className={`text-white rounded-xl px-6 py-4 items-center justify-center font-medium text-base transition-all hidden md:flex ${
                    currentStock === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#560000] hover:bg-[#560000]/90"
                  }`}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {currentStock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>

              {/* Nutrition Info */}
              {(product.calories ||
                product.protein ||
                product.fats ||
                product.carbs) && (
                <div className="p-6 bg-white rounded-2xl shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Nutrition Information
                  </h2>
                  <div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Calories</p>
                        <p className="text-3xl font-bold text-gray-800">
                          {product.calories || 0} Cal
                        </p>
                      </div>
                      <div className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-lg">
                        Net wt: {product.net_weight || 100} g
                      </div>
                    </div>
                    <hr className="my-4 border-gray-200" />
                    <div className="space-y-3 text-gray-700">
                      {product.protein && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Dumbbell className="w-5 h-5" />
                            <span>Proteins</span>
                          </div>
                          <span>{product.protein} g</span>
                        </div>
                      )}
                      {product.fats && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Droplet className="w-5 h-5" />
                            <span>Fats</span>
                          </div>
                          <span>{product.fats} g</span>
                        </div>
                      )}
                      {product.carbs && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Wheat className="w-5 h-5" />
                            <span>Carbs</span>
                          </div>
                          <span>{product.carbs} g</span>
                        </div>
                      )}
                      {product.sugars && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Candy className="w-5 h-5" />
                            <span>Sugars</span>
                          </div>
                          <span>{product.sugars} g</span>
                        </div>
                      )}
                      {product.fiber && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Wheat className="w-5 h-5" />
                            <span>Fiber</span>
                          </div>
                          <span>{product.fiber} g</span>
                        </div>
                      )}
                      {product.sodium && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Shell className="w-5 h-5" />
                            <span>Sodium</span>
                          </div>
                          <span>{product.sodium} mg</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <CakeDeliveryCard stock={currentStock} />

          {/* Mobile sticky bottom bar */}
          <div className="fixed bottom-20 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between z-40 md:hidden">
            <div>
              <p className="text-gray-500 text-sm">Total Price</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-900">
                  ₹{currentPrice}
                </p>
                {originalPrice && originalPrice > currentPrice && (
                  <p className="text-sm text-gray-500 line-through">
                    ₹{originalPrice}
                  </p>
                )}
              </div>
              {currentStock === 0 && (
                <p className="text-xs font-medium text-red-600">Out of Stock</p>
              )}
              {currentStock > 0 && currentStock <= 3 && (
                <p className="text-xs font-medium text-amber-600">
                  Only {currentStock} left
                </p>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={currentStock === 0}
              className={`rounded-full px-6 py-3 flex items-center gap-2 ${
                currentStock === 0
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#560000] text-white"
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">
                {currentStock === 0 ? "Out of Stock" : "Add to Cart"}
              </span>
            </button>
          </div>

          {/* Mobile bottom padding */}
          <div className="h-24 md:h-0"></div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
