"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Loader2,
  ShoppingBag,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Package,
  Phone,
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    alternatePhone?: string;
    avatar: string;
  };
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  amount: string;
  paymentStatus: string;
  orderStatus: string;
  date: string;
  fullDate: string;
  total_amount: number;
  paid_amount: number;
  item_total: number;
  discount_amount: number;
  delivery_charge: number;
  cgst: number;
  sgst: number;
  delivery_address?: {
    id: string;
    name: string;
    full_address: string;
    city: string;
    state: string;
    zip_code: string;
    alternate_phone?: string;
    additional_details?: string;
  };
  coupon?: {
    id: string;
    code: string;
    type: string;
    value: number;
    min_order_amount?: number;
    max_discount_cap?: number;
  };
  is_coupon: boolean;
  estimated_time_delivery?: string;
  distance?: number;
  duration?: number;
  delivery_zone?: string;
  payment_method: string;
  notes?: string;
  // Legacy fields for backward compatibility
  address_text?: string;
  note?: string;
  coupon_code?: string;
  created_at: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/orders/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await response.json();
        console.log("Order data received:", data.order);
        console.log("Customer data:", data.order?.customer);
        setOrder(data.order);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 space-y-6 p-6 md:p-8">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-900 dark:text-red-400">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Error loading order</h3>
            <p className="mt-2 max-w-sm text-center text-muted-foreground">
              {error || "Order not found"}
            </p>
            <Button className="mt-6" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "out for delivery":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Order #{order.order_number || order.id}
          </h1>
          <p className="text-muted-foreground">
            Order details and customer information
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Date:</span>
              <span className="font-medium">{order.fullDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Status:</span>
              <Badge
                className={getOrderStatusColor(order.orderStatus)}
                variant="outline"
              >
                {order.orderStatus}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Status:</span>
              <Badge
                className={getPaymentStatusColor(order.paymentStatus)}
                variant="outline"
              >
                {order.paymentStatus}
              </Badge>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item Total:</span>
                <span>₹{order.item_total || order.total_amount}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="text-green-600">
                    -₹{order.discount_amount}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Charge:</span>
                <span>₹{order.delivery_charge}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>{order.amount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${order.customer.name}`}
                  alt={order.customer.name}
                />
                <AvatarFallback>
                  {order.customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{order.customer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.email}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            {(order.customer.phone || order.customer.alternatePhone) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </div>
                {order.customer.phone && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Phone:
                    </span>
                    <span className="text-sm font-medium">
                      {order.customer.phone}
                    </span>
                  </div>
                )}
                {order.customer.alternatePhone && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Alternate:
                    </span>
                    <span className="text-sm font-medium">
                      {order.customer.alternatePhone}
                    </span>
                  </div>
                )}
              </div>
            )}
            {order.address_text && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </div>
                <p className="text-sm">{order.address_text}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Address Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.delivery_address ? (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address Name:</span>
                    <span className="font-medium">
                      {order.delivery_address.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Address:</span>
                    <span className="font-medium text-right max-w-[200px]">
                      {order.delivery_address.full_address}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">City:</span>
                    <span className="font-medium">
                      {order.delivery_address.city}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">State:</span>
                    <span className="font-medium">
                      {order.delivery_address.state}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pincode:</span>
                    <span className="font-medium">
                      {order.delivery_address.zip_code}
                    </span>
                  </div>
                  {order.delivery_address.alternate_phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Alternate Phone:
                      </span>
                      <span className="font-medium">
                        {order.delivery_address.alternate_phone}
                      </span>
                    </div>
                  )}
                  {order.delivery_address.additional_details && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Additional Details:
                      </span>
                      <span className="font-medium text-right max-w-[200px]">
                        {order.delivery_address.additional_details}
                      </span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-medium">
                      {order.distance
                        ? `${order.distance} km`
                        : "Not available"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {order.duration
                        ? `${order.duration} mins`
                        : "Not available"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Delivery Zone:
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700"
                    >
                      {order.delivery_zone || "Not calculated"}
                    </Badge>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No delivery address selected
                </p>
                {order.address_text && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <p className="font-medium">Fallback Address:</p>
                    <p>{order.address_text}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Update Status
            </Button>
            <Button className="w-full" variant="outline">
              Print Invoice
            </Button>
            <Button className="w-full" variant="outline">
              Send Email
            </Button>
            <Button className="w-full" variant="destructive">
              Cancel Order
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.products && order.products.length > 0 ? (
              order.products.map((product, index) => (
                <div
                  key={product.id || index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {product.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{product.price}</p>
                    <p className="text-sm text-muted-foreground">
                      Total: ₹{product.price * product.quantity}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No items found in this order
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      {(order.note || order.coupon_code) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.note && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Order Note:
                </p>
                <p className="text-sm">{order.note}</p>
              </div>
            )}
            {order.coupon_code && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Coupon Applied:
                </p>
                <Badge variant="secondary">{order.coupon_code}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
