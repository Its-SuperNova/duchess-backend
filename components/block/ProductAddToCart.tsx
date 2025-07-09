"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";

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

export default function ProductAddToCart({
  product,
}: {
  product: DatabaseProduct;
}) {
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
  const { toast } = useToast();
  const [addTextOnCake, setAddTextOnCake] = useState(false);
  const [addCandles, setAddCandles] = useState(false);
  const [addKnife, setAddKnife] = useState(false);
  const [addMessageCard, setAddMessageCard] = useState(false);
  const [drawerStep, setDrawerStep] = useState(1);
  const [cakeText, setCakeText] = useState("");
  const [giftCardText, setGiftCardText] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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

  // Validation for text inputs
  const isTextInputValid = () => {
    if (addTextOnCake && orderType !== "piece" && cakeText.trim().length < 4) {
      return false;
    }
    if (addMessageCard && giftCardText.trim().length < 4) {
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!product || !inStock) return;

    // Validate text inputs if they are enabled
    if (!isTextInputValid()) return;

    setIsAddingToCart(true);

    try {
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
    } catch (error) {
      // Silent error handling - no toast notification
    } finally {
      setIsAddingToCart(false);
    }
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
                        {/* Price and Quantity Section */}
                        <div className="flex items-end justify-between mb-4">
                          {/* Total Price - Left Side */}
                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-gray-600 mb-1">
                              Total
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xl text-gray-900">
                                ₹{price}
                              </span>
                              {originalPrice && originalPrice > price && (
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{originalPrice}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantity Counter - Right Side */}
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-3 bg-[#F5F4F7] rounded-full p-1">
                              <button
                                className={`w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 bg-white transition-colors ${
                                  pieceQuantity > 1
                                    ? "hover:bg-gray-50"
                                    : "text-gray-300 cursor-not-allowed"
                                }`}
                                onClick={() =>
                                  handleQuantityChange(
                                    Math.max(1, pieceQuantity - 1)
                                  )
                                }
                                disabled={pieceQuantity <= 1}
                              >
                                <Minus className="h-4 w-4 text-gray-600" />
                              </button>
                              <span className="font-medium text-gray-900 min-w-[20px] text-center text-[14px]">
                                {pieceQuantity.toString().padStart(2, "0")}
                              </span>
                              <button
                                className={`w-7 h-7 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-colors ${
                                  pieceQuantity >=
                                  parseInt(
                                    product.piece_options[selectedPieceOption]
                                      ?.stock || "0"
                                  )
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
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
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
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
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <Input
                              value={cakeText}
                              onChange={(e) => setCakeText(e.target.value)}
                              placeholder="e.g., Happy Birthday John!"
                              maxLength={20}
                              className={`flex-1 ${
                                addTextOnCake &&
                                cakeText.trim().length > 0 &&
                                cakeText.trim().length < 4
                                  ? "border-red-300 focus-visible:ring-red-500"
                                  : ""
                              }`}
                            />
                            <span className="ml-2 text-xs text-gray-500 pt-2">
                              {cakeText.length}/20
                            </span>
                          </div>
                          {addTextOnCake &&
                            cakeText.trim().length > 0 &&
                            cakeText.trim().length < 4 && (
                              <p className="text-xs text-red-500">
                                Minimum 4 characters required
                              </p>
                            )}
                        </div>
                      </div>
                    )}
                    {addMessageCard && (
                      <div className="pt-2">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <Textarea
                              value={giftCardText}
                              onChange={(e) => setGiftCardText(e.target.value)}
                              placeholder="e.g., Wishing you a wonderful birthday filled with happiness and love!"
                              maxLength={100}
                              rows={3}
                              className={`flex-1 resize-none ${
                                addMessageCard &&
                                giftCardText.trim().length > 0 &&
                                giftCardText.trim().length < 4
                                  ? "border-red-300 focus-visible:ring-red-500"
                                  : ""
                              }`}
                            />
                            <span className="ml-2 text-xs text-gray-500 pt-2">
                              {giftCardText.length}/100
                            </span>
                          </div>
                          {addMessageCard &&
                            giftCardText.trim().length > 0 &&
                            giftCardText.trim().length < 4 && (
                              <p className="text-xs text-red-500">
                                Minimum 4 characters required
                              </p>
                            )}
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
                      disabled={
                        !inStock || !isTextInputValid() || isAddingToCart
                      }
                      className="flex-1 h-12 rounded-xl bg-[#7A0000] hover:bg-[#7A0000]/90 text-white disabled:opacity-50"
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          {!inStock
                            ? "Out of Stock"
                            : !isTextInputValid()
                            ? "Check Text Inputs"
                            : "Add to Cart"}
                        </>
                      )}
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
