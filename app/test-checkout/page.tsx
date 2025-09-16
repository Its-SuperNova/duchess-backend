"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function TestCheckoutPage() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const testCheckoutFlow = async () => {
    setIsCreating(true);

    try {
      // Create a test checkout session
      const testData = {
        items: [
          {
            product_id: "test-1",
            product_name: "Test Cake",
            product_image: "/placeholder.svg",
            product_description: "A delicious test cake",
            category: "Cakes",
            quantity: 1,
            unit_price: 500,
            total_price: 500,
            variant: "Chocolate",
            customization_options: {},
            cake_text: "Happy Birthday!",
            cake_flavor: "Chocolate",
            cake_size: "Medium",
            cake_weight: "1kg",
            item_has_knife: true,
            item_has_candle: true,
            item_has_message_card: true,
            item_message_card_text: "Best wishes!",
          },
        ],
        subtotal: 500,
        discount: 0,
        deliveryFee: 50,
        totalAmount: 550,
        userId: "test-user",
        userEmail: "test@example.com",
        addressText: "123 Test Street, Test City, 123456",
        contactInfo: {
          name: "Test User",
          phone: "9876543210",
          alternatePhone: "9876543211",
        },
        notes: "Test order for checkout flow",
        deliveryTiming: "same_day",
        deliveryDate: new Date().toISOString().split("T")[0],
        deliveryTimeSlot: "evening",
        estimatedDeliveryTime: "2-3 hours",
        distance: 5.2,
        duration: 15,
        deliveryZone: "Zone A",
      };

      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { checkoutId } = await response.json();

      toast({
        title: "Success!",
        description: `Checkout session created: ${checkoutId}`,
        variant: "default",
      });

      // Redirect to checkout page
      window.location.href = `/checkouts/${checkoutId}`;
    } catch (error) {
      console.error("Error creating test checkout:", error);
      toast({
        title: "Error",
        description: "Failed to create test checkout session",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FB] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Test Checkout Flow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            This page tests the checkout session creation and flow. Click the
            button below to create a test checkout session.
          </p>

          <Button
            onClick={testCheckoutFlow}
            disabled={isCreating}
            className="w-full bg-[#523435] hover:bg-[#402627]"
          >
            {isCreating ? "Creating Test Checkout..." : "Create Test Checkout"}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p>This will:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Create a test checkout session</li>
              <li>Generate a unique checkout ID</li>
              <li>Redirect to the checkout page</li>
              <li>Display the checkout details</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
