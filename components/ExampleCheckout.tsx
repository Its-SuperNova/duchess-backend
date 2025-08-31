"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CheckoutRazorpay from "./CheckoutRazorpay";
import { toast } from "sonner";

export default function ExampleCheckout() {
  const [amount, setAmount] = useState(299.99);
  const [notes, setNotes] = useState("");

  const handlePaymentSuccess = (payload: any) => {
    console.log("Payment successful:", payload);
    // Redirect to order confirmation page or show success message
    toast.success("Order placed successfully!");
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    // Handle payment failure - show error message, retry option, etc.
    toast.error("Payment failed. Please try again.");
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Checkout Example</CardTitle>
          <CardDescription>
            Test the Razorpay payment integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Order Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="299.99"
              step="0.01"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Order Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions, delivery preferences..."
              rows={3}
            />
          </div>

          <div className="pt-4">
            <CheckoutRazorpay
              amountInRupees={amount}
              orderNotes={{
                customer_notes: notes,
                source: "example_checkout",
              }}
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Test Card Numbers:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                <strong>Success:</strong> 4111 1111 1111 1111
              </li>
              <li>
                <strong>Failure:</strong> 4000 0000 0000 0002
              </li>
              <li>
                <strong>CVV:</strong> Any 3 digits
              </li>
              <li>
                <strong>Expiry:</strong> Any future date
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
