"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { IoIosArrowForward } from "react-icons/io";
import { FaCakeCandles } from "react-icons/fa6";
import { RiKnifeFill } from "react-icons/ri";
import { WidgetAdd, ListCheckMinimalistic, Card } from "@solar-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface CustomizationOptions {
  addTextOnCake: boolean;
  addCandles: boolean;
  addKnife: boolean;
  addMessageCard: boolean;
}

interface CustomizationOptionsDrawerProps {
  checkoutId: string;
  cart: any[];
  customizationOptions: CustomizationOptions;
  messageCardText: string;
  onCustomizationChange: (options: CustomizationOptions) => void;
  onMessageCardTextChange: (text: string) => void;
  updateAllCartItemsCustomization: (options: CustomizationOptions) => void;
}

export default function CustomizationOptionsDrawer({
  checkoutId,
  cart,
  customizationOptions,
  messageCardText,
  onCustomizationChange,
  onMessageCardTextChange,
  updateAllCartItemsCustomization,
}: CustomizationOptionsDrawerProps) {
  const [isCustomizationDrawerOpen, setIsCustomizationDrawerOpen] =
    useState(false);
  const [isMessageCardDrawerOpen, setIsMessageCardDrawerOpen] = useState(false);

  const handleSaveCustomization = async () => {
    try {
      console.log("🔄 Saving customization options to checkout session:", {
        checkoutId,
        customizationOptions: customizationOptions,
      });

      const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customizationOptions: customizationOptions,
        }),
      });

      if (updateResponse.ok) {
        const responseData = await updateResponse.json();
        console.log(
          "✅ Customization options saved to checkout session:",
          responseData
        );
      } else {
        console.error(
          "❌ Failed to save customization options:",
          await updateResponse.text()
        );
      }
    } catch (error) {
      console.error("❌ Error saving customization options:", error);
    }
  };

  const handleClearCustomization = async () => {
    const clearedOptions = {
      addTextOnCake: false,
      addCandles: false,
      addKnife: false,
      addMessageCard: false,
    };
    onCustomizationChange(clearedOptions);
    updateAllCartItemsCustomization(clearedOptions);

    try {
      const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customizationOptions: clearedOptions,
        }),
      });

      if (updateResponse.ok) {
        console.log("✅ Customization options cleared from checkout session");
      }
    } catch (error) {
      console.error("❌ Error clearing customization options:", error);
    }
  };

  const handleSaveMessageCard = async () => {
    try {
      console.log("🔄 Saving message card text to checkout session:", {
        checkoutId,
        messageCardText: messageCardText,
      });

      const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageCardText: messageCardText,
        }),
      });

      if (updateResponse.ok) {
        const responseData = await updateResponse.json();
        console.log(
          "✅ Message card text saved to checkout session:",
          responseData
        );
      } else {
        console.error(
          "❌ Failed to save message card text:",
          await updateResponse.text()
        );
      }
    } catch (error) {
      console.error("❌ Error saving message card text:", error);
    }
  };

  const handleClearMessageCard = async () => {
    onMessageCardTextChange("");
    try {
      const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageCardText: "",
        }),
      });

      if (updateResponse.ok) {
        console.log("✅ Message card text cleared from checkout session");
      }
    } catch (error) {
      console.error("❌ Error clearing message card text:", error);
    }
  };

  return (
    <>
      {/* Main Customization Options Drawer */}
      <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
        <Drawer
          modal={true}
          open={isCustomizationDrawerOpen}
          onOpenChange={setIsCustomizationDrawerOpen}
        >
          <DrawerTrigger asChild>
            <div className="w-full flex items-center justify-between text-left cursor-pointer rounded-lg">
              <div className="flex items-center">
                {Object.values(customizationOptions).some((opt) => opt) ? (
                  <ListCheckMinimalistic className="h-5 w-5 mr-3 text-black" />
                ) : (
                  <WidgetAdd className="h-5 w-5 mr-3 text-black" />
                )}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Customization options
                </span>
              </div>
              <div className="flex items-center gap-2">
                {Object.values(customizationOptions).some((opt) => opt) && (
                  <button
                    className="text-[#2664eb] hover:text-[#1d4ed8] transition-colors p-1 rounded-full hover:bg-blue-50 text-sm font-medium"
                    onClick={() => {
                      setIsCustomizationDrawerOpen(true);
                    }}
                  >
                    Edit
                  </button>
                )}
                <IoIosArrowForward className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </DrawerTrigger>

          <DrawerContent className="h-[600px] md:h-[550px] rounded-t-2xl bg-[#F5F6FB] flex flex-col">
            <DrawerHeader className="text-left lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <DrawerTitle className="text-[20px]">
                  Customization Options
                </DrawerTitle>
                <DrawerClose asChild>
                  <button
                    aria-label="Close"
                    className="h-[36px] w-[36px] rounded-full bg-white hover:bg-gray-50 flex items-center justify-center"
                  >
                    <X className="h-5 w-5 text-gray-700" />
                  </button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
              <div className="space-y-4 pb-4">
                {/* Add Candles - Only show if cart has cake products */}
                {cart.some(
                  (item) => item.category?.toLowerCase() === "cake"
                ) && (
                  <div className="bg-white rounded-[18px] p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaCakeCandles className="h-5 w-5 text-[#570000]" />
                        <div>
                          <h3 className="font-medium text-gray-800">
                            Add Candles
                          </h3>
                          <p className="text-sm text-gray-500">
                            Include birthday candles for celebration
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={customizationOptions.addCandles}
                        onCheckedChange={(checked) => {
                          const newOptions = {
                            ...customizationOptions,
                            addCandles: checked,
                          };
                          onCustomizationChange(newOptions);
                          updateAllCartItemsCustomization(newOptions);
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Add Knife - Only show if cart has cake products */}
                {cart.some(
                  (item) => item.category?.toLowerCase() === "cake"
                ) && (
                  <div className="bg-white rounded-[18px] p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RiKnifeFill className="h-5 w-5 text-[#570000]" />
                        <div>
                          <h3 className="font-medium text-gray-800">
                            Add Knife
                          </h3>
                          <p className="text-sm text-gray-500">
                            Include a cake cutting knife
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={customizationOptions.addKnife}
                        onCheckedChange={(checked) => {
                          const newOptions = {
                            ...customizationOptions,
                            addKnife: checked,
                          };
                          onCustomizationChange(newOptions);
                          updateAllCartItemsCustomization(newOptions);
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Add Message Card */}
                <div className="bg-white rounded-[18px] p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Card
                        weight="Broken"
                        className="h-5 w-5 text-[#570000]"
                      />
                      <div>
                        <h3 className="font-medium text-gray-800">
                          Add Message Card
                        </h3>
                        <p className="text-sm text-gray-500">
                          Include a personalized message card
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={customizationOptions.addMessageCard}
                      onCheckedChange={(checked) => {
                        const newOptions = {
                          ...customizationOptions,
                          addMessageCard: checked,
                        };
                        onCustomizationChange(newOptions);
                        updateAllCartItemsCustomization(newOptions);
                      }}
                    />
                  </div>
                  {customizationOptions.addMessageCard && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => setIsMessageCardDrawerOpen(true)}
                        className="w-full text-left p-3 bg-gray-50 rounded-[12px] hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {messageCardText
                              ? messageCardText
                              : "Click to add message card text"}
                          </span>
                          <Card
                            weight="Broken"
                            className="h-4 w-4 text-gray-400"
                          />
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 px-4 text-[#9AA3C7]">
                <h4 className="uppercase tracking-wide font-semibold text-[14px]">
                  Additional Customization
                </h4>
                <p className="mt-2 text-sm">
                  For more customization options on your order, please contact
                  the kitchen after order confirmation or try our call order
                  service.
                </p>
              </div>
            </div>

            {/* Fixed bottom action buttons */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-[#F5F6FB] px-4 py-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
              {/* Desktop action row */}
              <div className="hidden lg:flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCustomization}
                  className="h-9 px-5 rounded-[12px]"
                >
                  Clear All
                </Button>
                <DrawerClose asChild>
                  <Button
                    size="sm"
                    className="h-9 px-5 rounded-[12px]"
                    onClick={handleSaveCustomization}
                  >
                    Save
                  </Button>
                </DrawerClose>
              </div>
              {/* Mobile action row */}
              <div className="lg:hidden flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleClearCustomization}
                  className="flex-1 rounded-[20px] text-[16px]"
                >
                  Clear All
                </Button>
                <DrawerClose asChild>
                  <Button
                    size="lg"
                    className="flex-1 py-5 rounded-[20px] text-[16px]"
                    onClick={handleSaveCustomization}
                  >
                    Save
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Message Card Text Input Drawer */}
      <Drawer
        modal={true}
        open={isMessageCardDrawerOpen}
        onOpenChange={setIsMessageCardDrawerOpen}
      >
        <DrawerContent className="h-[600px] md:h-[550px] rounded-t-2xl bg-[#F5F6FB] overflow-y-auto scrollbar-hide">
          <DrawerHeader className="text-left lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
            <div className="flex items-center justify-between w-full">
              <DrawerTitle className="text-[20px]">
                Add Message Card Text
              </DrawerTitle>
              <DrawerClose asChild>
                <button
                  aria-label="Close"
                  className="h-[36px] w-[36px] rounded-full bg-white hover:bg-gray-50 flex items-center justify-center"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="px-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
            <Textarea
              placeholder="E.g., Wishing you a wonderful birthday filled with joy and laughter!, May your special day be as amazing as you are!, etc."
              value={messageCardText}
              onChange={(e) => onMessageCardTextChange(e.target.value)}
              maxLength={100}
              className="min-h-[150px] rounded-[18px] placeholder:text-[#C0C0C0] placeholder:font-normal"
            />
            <div className="flex justify-end mt-2">
              <span
                className={`text-sm ${
                  messageCardText.length >= 100
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {messageCardText.length}/100 characters
              </span>
            </div>
          </div>
          {/* Desktop action row */}
          <div className="hidden lg:flex justify-end gap-2 px-4 pt-3 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearMessageCard}
              className="h-9 px-5 rounded-[12px]"
            >
              Clear
            </Button>
            <DrawerClose asChild>
              <Button
                size="sm"
                className="h-9 px-5 rounded-[12px]"
                onClick={handleSaveMessageCard}
              >
                Save
              </Button>
            </DrawerClose>
          </div>
          <DrawerFooter className="pt-2 pb-6 lg:hidden">
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleClearMessageCard}
                className="flex-1 rounded-[20px] text-[16px]"
              >
                Clear
              </Button>
              <DrawerClose asChild>
                <Button
                  size="lg"
                  className="flex-1 py-5 rounded-[20px] text-[16px]"
                  onClick={handleSaveMessageCard}
                >
                  Save
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
