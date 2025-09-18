"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface DummyPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (error: string) => void;
}

export default function DummyPaymentDialog({
  isOpen,
  onClose,
  amount,
  currency = "INR",
  onSuccess,
  onFailure,
}: DummyPaymentDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<
    "success" | "failed" | null
  >(null);

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, Mastercard, RuPay",
    },
    {
      id: "upi",
      name: "UPI",
      icon: Smartphone,
      description: "Google Pay, PhonePe, Paytm",
    },
    {
      id: "netbanking",
      name: "Net Banking",
      icon: Building2,
      description: "All major banks",
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      onFailure("Please select a payment method");
      return;
    }

    setIsProcessing(true);
    setPaymentResult(null);

    // Simulate payment processing (faster for testing)
    setTimeout(() => {
      setIsProcessing(false);

      // Simulate random success/failure (90% success rate for testing)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        setPaymentResult("success");
        const paymentId = `dummy_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        setTimeout(() => {
          onSuccess(paymentId);
          handleClose();
        }, 1000); // Reduced from 2000ms to 1000ms
      } else {
        setPaymentResult("failed");
        setTimeout(() => {
          onFailure("Payment failed. Please try again.");
          handleClose();
        }, 1000); // Reduced from 2000ms to 1000ms
      }
    }, 1500); // Reduced from 3000ms to 1500ms
  };

  const handleClose = () => {
    setSelectedMethod("");
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setCardName("");
    setPhoneNumber("");
    setIsProcessing(false);
    setPaymentResult(null);
    onClose();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount / 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Gateway
          </DialogTitle>
          <DialogDescription>
            Complete your payment of {formatAmount(amount)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Methods */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Payment Method</Label>
            <div className="grid gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? "ring-2 ring-primary border-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {method.description}
                          </div>
                        </div>
                        {selectedMethod === method.id && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Payment Form */}
          {selectedMethod && (
            <div className="space-y-4">
              {selectedMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === "upi" && (
                <div>
                  <Label htmlFor="phoneNumber">UPI ID or Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="9876543210@paytm or 9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              )}

              {selectedMethod === "netbanking" && (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    You will be redirected to your bank's secure payment page
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Payment Status */}
          {isProcessing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">
                Processing payment...
              </p>
            </div>
          )}

          {paymentResult === "success" && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-sm text-green-600 font-medium">
                Payment Successful!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Redirecting to confirmation...
              </p>
            </div>
          )}

          {paymentResult === "failed" && (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <p className="text-sm text-red-600 font-medium">Payment Failed</p>
              <p className="text-xs text-muted-foreground mt-1">
                Please try again with a different method
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isProcessing && !paymentResult && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!selectedMethod}
                className="flex-1"
              >
                Pay {formatAmount(amount)}
              </Button>
            </div>
          )}

          {/* Demo Notice */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                DEMO
              </Badge>
              <span className="text-xs font-medium">Test Payment Gateway</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This is a dummy payment gateway for testing purposes. Fast
              processing with 90% success rate for easy testing.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
