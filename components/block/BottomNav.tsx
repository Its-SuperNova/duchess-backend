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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
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
    setSelectedWeightOption,
    selectedPieceOption,
    setSelectedPieceOption,
    orderType,
    setOrderType,
    pieceQuantity,
    setPieceQuantity,
  } = useProductSelection();
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>();
  const [inStock, setInStock] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { addToCart } = useCart();
  const [addTextOnCake, setAddTextOnCake] = useState(false);
  const [addCandles, setAddCandles] = useState(false);
  const [addKnife, setAddKnife] = useState(false);
  const [addMessageCard, setAddMessageCard] = useState(false);
  const [drawerStep, setDrawerStep] = useState(1);
  const [cakeText, setCakeText] = useState("");
  const [giftCardText, setGiftCardText] = useState("");

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

  // Reset to step 1 whenever the drawer is opened
  useEffect(() => {
    if (isDrawerOpen) setDrawerStep(1);
  }, [isDrawerOpen]);

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
      addTextOnCake,
      addCandles,
      addKnife,
      addMessageCard,
      cakeText: addTextOnCake ? cakeText : undefined,
      giftCardText: addMessageCard ? giftCardText : undefined,
      uniqueId: `${Date.now()}-${Math.random()}`,
    });
    setIsDrawerOpen(false);
  };
  const handleWeightOptionChange = (index: number) => {
    setSelectedWeightOption(index);
    setOrderType("weight");
  };

  const handlePieceOptionChange = (index: number) => {
    setSelectedPieceOption(index);
    setOrderType("piece");
  };

  const handleQuantityChange = (quantity: number) => {
    setPieceQuantity(quantity);
  };

  return (
    <>
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-[61] md:hidden px-4 pb-3">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <div className="w-[100%] max-w-md rounded-2xl bg-[#7A0000] flex items-center justify-between px-6 py-4 shadow-lg cursor-pointer">
              <div className="flex items-center gap-3 text-white">
                <ShoppingCart className="h-6 w-6" />
                <span className="font-medium text-lg">Add To Cart</span>
              </div>
              <div className="h-8 w-px bg-white ml-[20px]" />
              <div className="flex items-center text-white font-bold text-xl">
                ₹{price}
              </div>
            </div>
          </DrawerTrigger>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader className="text-left">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-lg font-semibold">
                  {drawerStep === 1
                    ? "Select the option"
                    : "Customization option"}
                </DrawerTitle>
                {drawerStep === 2 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDrawerStep(1)}
                    className="ml-2 h-10 w-10 rounded-full border-gray-300 hover:bg-gray-50"
                  >
                    {/* You can use a left arrow icon here if you have one, or just 'Back' */}
                    <span className="sr-only">Back</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                      />
                    </svg>
                  </Button>
                )}
              </div>
            </DrawerHeader>
            <div className="px-4 pb-4 space-y-6">
              {/* Restore Weight/Piece tab switcher for products that support both, only in step 1 */}
              {drawerStep === 1 &&
                product.selling_type === "both" &&
                product.weight_options &&
                product.weight_options.length > 0 &&
                product.piece_options &&
                product.piece_options.length > 0 && (
                  <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                    <button
                      onClick={() => setOrderType("weight")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        orderType === "weight"
                          ? "bg-white text-[#7A0000] shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Weight
                    </button>
                    <button
                      onClick={() => setOrderType("piece")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        orderType === "piece"
                          ? "bg-white text-[#7A0000] shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Piece
                    </button>
                  </div>
                )}
              {/* Step 1: Quantity/Weight selection */}
              {drawerStep === 1 && (
                <>
                  {orderType === "piece" &&
                    product.piece_options &&
                    product.piece_options.length > 0 && (
                      <div className="space-y-3">
                        {/* Price Section Styled Like Screenshot */}
                        <div className="flex items-center justify-between border border-[#7A0000] bg-[#7A0000]/5 rounded-xl px-6 py-4 mb-2">
                          <span className="font-medium text-lg">Total</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-2xl text-gray-900">
                              ₹{price}
                            </span>
                            {originalPrice && originalPrice > price && (
                              <span className="text-base text-gray-500 line-through">
                                ₹{originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center w-full justify-between">
                          <Button
                            className="bg-[#7A0000] text-white w-10 h-10 rounded-[14px] text-lg shadow-sm"
                            onClick={() =>
                              handleQuantityChange(
                                Math.max(1, pieceQuantity - 1)
                              )
                            }
                            disabled={pieceQuantity <= 1}
                          >
                            -
                          </Button>
                          <span className="font-medium text-lg min-w-[3rem] text-center">
                            {pieceQuantity.toString().padStart(2, "0")}
                          </span>
                          <Button
                            className="bg-[#7A0000] text-white w-10 h-10 rounded-[14px] text-lg shadow-sm"
                            onClick={() =>
                              handleQuantityChange(pieceQuantity + 1)
                            }
                            disabled={
                              pieceQuantity >=
                              parseInt(
                                product.piece_options[selectedPieceOption]
                                  ?.stock || "0"
                              )
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    )}
                  {orderType === "weight" &&
                    product.weight_options &&
                    product.weight_options.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">
                          Weight Options
                        </h3>
                        <RadioGroup
                          value={selectedWeightOption.toString()}
                          onValueChange={(value) =>
                            handleWeightOptionChange(parseInt(value))
                          }
                        >
                          {product.weight_options.map((option, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3"
                            >
                              <RadioGroupItem
                                value={index.toString()}
                                id={`weight-${index}`}
                                disabled={
                                  !option.isActive ||
                                  parseInt(option.stock) === 0
                                }
                              />
                              <Label
                                htmlFor={`weight-${index}`}
                                className={`flex-1 flex items-center justify-between p-3 rounded-lg border ${
                                  selectedWeightOption === index
                                    ? "border-[#7A0000] bg-[#7A0000]/5"
                                    : "border-gray-200"
                                } ${
                                  !option.isActive ||
                                  parseInt(option.stock) === 0
                                    ? "opacity-50"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">
                                    {option.weight}
                                  </span>
                                  {parseInt(option.stock) <= 3 &&
                                    parseInt(option.stock) > 0 && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Only {option.stock} left
                                      </Badge>
                                    )}
                                  {parseInt(option.stock) === 0 && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      Out of Stock
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-gray-900">
                                    ₹{parseInt(option.price)}
                                  </div>
                                  {product.has_offer &&
                                    product.offer_percentage && (
                                      <div className="text-sm text-gray-500 line-through">
                                        ₹
                                        {Math.round(
                                          parseInt(option.price) /
                                            (1 - product.offer_percentage / 100)
                                        )}
                                      </div>
                                    )}
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}
                  {/* Next Button */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex-1 h-12 rounded-xl border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setDrawerStep(2)}
                      className="flex-1 h-12 rounded-xl bg-[#7A0000] hover:bg-[#7A0000]/90 text-white"
                    >
                      Next
                    </Button>
                  </div>
                </>
              )}
              {/* Step 2: Customization options and Add to Cart */}
              {drawerStep === 2 && (
                <>
                  <div className="space-y-2 pt-2">
                    {orderType !== "piece" && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Add text on cake</span>
                        <Switch
                          checked={addTextOnCake}
                          onCheckedChange={setAddTextOnCake}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Add candles</span>
                      <Switch
                        checked={addCandles}
                        onCheckedChange={setAddCandles}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Add knife</span>
                      <Switch
                        checked={addKnife}
                        onCheckedChange={setAddKnife}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Add message card</span>
                      <Switch
                        checked={addMessageCard}
                        onCheckedChange={setAddMessageCard}
                      />
                    </div>
                    {addTextOnCake && orderType !== "piece" && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between">
                          <Input
                            value={cakeText}
                            onChange={(e) => setCakeText(e.target.value)}
                            placeholder="Enter text for cake..."
                            maxLength={20}
                            className="flex-1"
                          />
                          <span className="ml-2 text-xs text-gray-500">
                            {cakeText.length}/20
                          </span>
                        </div>
                      </div>
                    )}
                    {addMessageCard && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between">
                          <Input
                            value={giftCardText}
                            onChange={(e) => setGiftCardText(e.target.value)}
                            placeholder="Enter message for gift card..."
                            maxLength={100}
                            className="flex-1"
                          />
                          <span className="ml-2 text-xs text-gray-500">
                            {giftCardText.length}/100
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Add to Cart Button */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex-1 h-12 rounded-xl border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddToCart}
                      disabled={!inStock}
                      className="flex-1 h-12 rounded-xl bg-[#7A0000] hover:bg-[#7A0000]/90 text-white"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
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
