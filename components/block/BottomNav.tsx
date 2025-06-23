"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { RiHomeSmile2Fill } from "react-icons/ri";
import { HiSquares2X2 } from "react-icons/hi2";
import { PiHeartFill } from "react-icons/pi";
import { HiUser } from "react-icons/hi2";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { getProductById } from "@/lib/actions/products";
import { getProductPrice, isProductInStock } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { useProductSelection } from "@/context/product-selection-context";
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

function ProductPageBottomNav({ product }: { product: DatabaseProduct }) {
  const {
    selectedWeightOption,
    selectedPieceOption,
    orderType,
    pieceQuantity,
  } = useProductSelection();
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>();
  const [inStock, setInStock] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    // Compute price and originalPrice based on selected option and orderType
    let price = 0;
    let originalPrice: number | undefined = undefined;
    let inStock = false;
    if (product) {
      if (orderType === "weight" && product.weight_options?.length > 0) {
        const option = product.weight_options[selectedWeightOption];
        if (option && option.isActive) {
          price = parseInt(option.price) || 0;
          inStock = parseInt(option.stock) > 0;
          if (product.has_offer && product.offer_percentage) {
            originalPrice = Math.round(
              price / (1 - product.offer_percentage / 100)
            );
          }
        }
      } else if (orderType === "piece" && product.piece_options?.length > 0) {
        const option = product.piece_options[selectedPieceOption];
        if (option && option.isActive) {
          price = (parseInt(option.price) || 0) * pieceQuantity;
          inStock = parseInt(option.stock) >= pieceQuantity;
          if (product.has_offer && product.offer_percentage) {
            const singleOriginal = Math.round(
              (parseInt(option.price) || 0) /
                (1 - product.offer_percentage / 100)
            );
            originalPrice = singleOriginal * pieceQuantity;
          }
        }
      }
    }
    setPrice(price);
    setOriginalPrice(originalPrice);
    setInStock(inStock);
  }, [
    product,
    orderType,
    selectedWeightOption,
    selectedPieceOption,
    pieceQuantity,
  ]);

  const handleAddToCart = () => {
    if (!product || !inStock) return;
    addToCart({
      id: parseInt(product.id.replace(/\D/g, "")) || 0,
      name: product.name,
      price: price,
      image: product.banner_image || "/placeholder.svg",
      quantity: orderType === "piece" ? pieceQuantity : 1,
      category: product.categories?.name || "Pastry",
      variant:
        orderType === "weight"
          ? product.weight_options[selectedWeightOption]?.weight || "Regular"
          : `${pieceQuantity} Piece${pieceQuantity > 1 ? "s" : ""}`,
    });
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-[61] md:hidden px-4 pb-3">
      <div className="w-[100%] max-w-md rounded-2xl bg-[#7A0000] flex items-center justify-between px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3 text-white">
          <ShoppingCart className="h-6 w-6" />
          <span className="font-medium text-lg">Add To Cart</span>
          {/* Removed weight/piece info */}
        </div>
        <div className="h-8 w-px bg-white ml-[20px]" />
        <div className="flex items-center text-white font-bold text-xl">
          ₹{price}
        </div>
      </div>
    </div>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState(pathname);
  const params = useParams();
  const [product, setProduct] = useState<DatabaseProduct | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  // Detect if on product detail page
  const isProductPage = /^\/products\/[\w-]+$/.test(pathname);
  const productId = isProductPage ? pathname.split("/")[2] : null;

  // Update active tab when pathname changes
  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  useEffect(() => {
    if (isProductPage && productId) {
      setLoadingProduct(true);
      getProductById(productId).then((prod) => {
        setProduct(prod);
        setLoadingProduct(false);
      });
    }
  }, [isProductPage, productId]);

  // Hide bottom nav on login, register, and admin pages
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  const isAuthenticated = status === "authenticated" && session?.user;

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: RiHomeSmile2Fill,
      isReactIcon: true,
      isCartButton: false,
    },
    {
      name: "Categories",
      href: "/categories",
      icon: HiSquares2X2,
      isReactIcon: true,
      isCartButton: false,
    },
    {
      name: "Favorites",
      href: "/favorites",
      icon: PiHeartFill,
      isReactIcon: true,
      isCartButton: false,
    },
    {
      name: isAuthenticated ? "Profile" : "Sign Up",
      href: isAuthenticated ? "/profile" : "/register",
      icon: isAuthenticated ? HiUser : UserPlus,
      isReactIcon: isAuthenticated ? true : false,
      isCartButton: false,
    },
  ];

  // Prevent nav bar flash: hide all nav UI on product page until product is loaded
  if (isProductPage) {
    if (!product) {
      return null;
    }
    // Show only the custom Add to Cart bar on product page, hide default nav
    return <ProductPageBottomNav product={product} />;
  }

  // Show Add to Cart + Price button above nav on product page
  return (
    <>
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[60] md:hidden bottom-nav">
        {/* Animated floating container */}
        <div
          className="bg-white backdrop-blur-md rounded-full shadow-md p-2 transition-all duration-300 ease-in-out border border-gray-100"
          style={{
            boxShadow:
              "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)",
          }}
        >
          {/* Navigation items */}
          <nav className="relative">
            <ul className="flex items-center justify-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;

                return (
                  <li key={item.name} className="relative">
                    <Link
                      href={item.href}
                      className={`flex flex-row items-center justify-center h-12 px-4 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 ${
                        isActive
                          ? "bg-[#7A0000] text-white shadow-md"
                          : "text-black hover:text-gray-800"
                      }`}
                      onClick={() => setActiveTab(item.href)}
                    >
                      {item.isReactIcon ? (
                        <IconComponent
                          size={20}
                          className={`transition-colors duration-200 ${
                            isActive ? "text-white" : "text-black"
                          }`}
                        />
                      ) : (
                        <IconComponent
                          className={`w-[18px] h-[18px] transition-colors duration-200 ${
                            isActive ? "text-white" : "text-black"
                          }`}
                        />
                      )}
                      {isActive && (
                        <span
                          className="text-white ml-2 text-md font-medium whitespace-nowrap animate-fade-in"
                          style={{
                            animation: "fadeIn 200ms ease-in-out",
                          }}
                        >
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
