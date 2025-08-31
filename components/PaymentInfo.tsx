"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface PaymentData {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_refund_id?: string;
  amount: number;
  currency: string;
  payment_status: "pending" | "captured" | "failed" | "refunded";
  payment_method: string;
  receipt?: string;
  signature_verified: boolean;
  webhook_received: boolean;
  notes?: any;
  created_at: string;
  updated_at: string;
}

interface PaymentInfoProps {
  orderId: string;
  className?: string;
}

export default function PaymentInfo({ orderId, className = "" }: PaymentInfoProps) {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/payments/${orderId}`);
      const data = await response.json();
      
      if (response.ok) {
        setPayments(data.payments || []);
      } else {
        setError(data.error || "Failed to fetch payment information");
      }
    } catch (err) {
      setError("Failed to fetch payment information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchPayments();
    }
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "captured":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "captured":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading payment information...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchPayments} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No payment information found for this order.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {payments.map((payment) => (
          <div key={payment.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(payment.payment_status)}
                <Badge className={getStatusColor(payment.payment_status)}>
                  {payment.payment_status.toUpperCase()}
                </Badge>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  ₹{payment.amount.toFixed(2)} {payment.currency}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(payment.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Razorpay Order ID:</span>
                <div className="text-gray-600 font-mono text-xs break-all">
                  {payment.razorpay_order_id}
                </div>
              </div>
              
              {payment.razorpay_payment_id && (
                <div>
                  <span className="font-medium">Payment ID:</span>
                  <div className="text-gray-600 font-mono text-xs break-all">
                    {payment.razorpay_payment_id}
                  </div>
                </div>
              )}

              {payment.receipt && (
                <div>
                  <span className="font-medium">Receipt:</span>
                  <div className="text-gray-600 font-mono text-xs">
                    {payment.receipt}
                  </div>
                </div>
              )}

              <div>
                <span className="font-medium">Payment Method:</span>
                <div className="text-gray-600 capitalize">
                  {payment.payment_method}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                {payment.signature_verified ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-600" />
                )}
                <span>Signature Verified</span>
              </div>
              
              <div className="flex items-center space-x-1">
                {payment.webhook_received ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-600" />
                )}
                <span>Webhook Received</span>
              </div>
            </div>

            {payment.razorpay_refund_id && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <div className="text-sm font-medium text-yellow-800">
                  Refund Processed
                </div>
                <div className="text-xs text-yellow-600 font-mono break-all">
                  Refund ID: {payment.razorpay_refund_id}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

