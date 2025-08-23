"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { TimePicker } from "@/components/block/clockTimePicker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { ChefHatHeart, Scooter, HomeSmile } from "@solar-icons/react";

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
  delivery_person_name?: string;
  delivery_person_contact?: string;
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
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "payment" | "processing" | "delivery" | "delivered";
    title: string;
    description: string;
  } | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [deliveryPersonName, setDeliveryPersonName] = useState("");
  const [deliveryPersonContact, setDeliveryPersonContact] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingContact, setIsUpdatingContact] = useState(false);

  // Function to format timestamp to readable time
  const formatTimeForDisplay = (timestamp: string | null) => {
    if (!timestamp) return "";

    try {
      // Handle both ISO format and local time format
      let date: Date;

      if (timestamp.includes("T") || timestamp.includes("Z")) {
        // ISO format (UTC)
        date = new Date(timestamp);
      } else {
        // Local time format (YYYY-MM-DD HH:MM:SS)
        date = new Date(timestamp + "T00:00:00");
      }

      const hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? "pm" : "am";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");

      return `${displayHours}:${displayMinutes} ${period}`;
    } catch (error) {
      return timestamp; // Return original if parsing fails
    }
  };

  // Function to update order status
  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update order status");
      }

      if (result.success) {
        setOrder({
          ...order,
          orderStatus: newStatus,
        });
        toast({
          title: "Success",
          description: `Order status updated to ${newStatus}`,
        });
      } else {
        throw new Error(result.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to update estimated delivery time
  const updateEstimatedDeliveryTime = async (newTime: string) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      // Convert time string to proper timestamp format
      const convertTimeToTimestamp = (timeStr: string) => {
        // Parse time like "6:30 am" or "2:45 pm"
        const timeMatch = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
        if (!timeMatch) return null;

        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3].toLowerCase();

        // Convert to 24-hour format
        if (period === "pm" && hours !== 12) {
          hours += 12;
        } else if (period === "am" && hours === 12) {
          hours = 0;
        }

        // Create a date object for today with the specified time in local timezone
        const today = new Date();
        today.setHours(hours, minutes, 0, 0);

        // Format as local time string to preserve timezone
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const hour = String(hours).padStart(2, "0");
        const minute = String(minutes).padStart(2, "0");

        // Return in format: "2024-01-15 18:30:00" (local time)
        return `${year}-${month}-${day} ${hour}:${minute}:00`;
      };

      const timestamp = convertTimeToTimestamp(newTime);
      if (!timestamp) {
        throw new Error("Invalid time format");
      }

      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estimated_time_delivery: timestamp }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update delivery time");
      }

      if (result.success) {
        setOrder({
          ...order,
          estimated_time_delivery: newTime,
        });
        toast({
          title: "Success",
          description: `Delivery time updated to ${newTime}`,
        });
      } else {
        throw new Error(result.error || "Failed to update delivery time");
      }
    } catch (error) {
      console.error("Error updating delivery time:", error);
      toast({
        title: "Error",
        description: "Failed to update delivery time",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to update delivery person name
  const updateDeliveryPersonName = async (name: string) => {
    if (!order) return;

    setIsUpdatingName(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ delivery_person_name: name }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to update delivery person name"
        );
      }

      if (result.success) {
        setOrder({
          ...order,
          delivery_person_name: name,
        });
        setDeliveryPersonName(""); // Clear the input field
        toast({
          title: "Success",
          description: `Delivery person name updated to ${name}`,
        });
      } else {
        throw new Error(
          result.error || "Failed to update delivery person name"
        );
      }
    } catch (error) {
      console.error("Error updating delivery person name:", error);
      toast({
        title: "Error",
        description: "Failed to update delivery person name",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingName(false);
    }
  };

  // Function to update delivery person contact
  const updateDeliveryPersonContact = async (contact: string) => {
    if (!order) return;

    setIsUpdatingContact(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ delivery_person_contact: contact }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to update delivery person contact"
        );
      }

      if (result.success) {
        setOrder({
          ...order,
          delivery_person_contact: contact,
        });
        setDeliveryPersonContact(""); // Clear the input field
        toast({
          title: "Success",
          description: `Delivery person contact updated to ${contact}`,
        });
      } else {
        throw new Error(
          result.error || "Failed to update delivery person contact"
        );
      }
    } catch (error) {
      console.error("Error updating delivery person contact:", error);
      toast({
        title: "Error",
        description: "Failed to update delivery person contact",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingContact(false);
    }
  };

  // Function to update payment status
  const updatePaymentStatus = async (newStatus: string) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payment_status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update payment status");
      }

      if (result.success) {
        setOrder({
          ...order,
          paymentStatus: newStatus,
        });
        toast({
          title: "Success",
          description: `Payment status updated to ${newStatus}`,
        });
      } else {
        throw new Error(result.error || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to show confirmation dialog
  const showConfirmation = (action: {
    type: "payment" | "processing" | "delivery" | "delivered";
    title: string;
    description: string;
  }) => {
    setPendingAction(action);
    setShowConfirmDialog(true);
    setConfirmText(""); // Reset confirm text when dialog opens
  };

  // Function to handle confirmation
  const handleConfirm = async () => {
    if (pendingAction) {
      try {
        switch (pendingAction.type) {
          case "payment":
            await updatePaymentStatus("paid");
            break;
          case "processing":
            await updateOrderStatus("preparing");
            break;
          case "delivery":
            await updateOrderStatus("out_for_delivery");
            break;
          case "delivered":
            await updateOrderStatus("delivered");
            break;
        }
      } catch (error) {
        console.error("Error updating order:", error);
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        });
      }
    }
    setShowConfirmDialog(false);
    setPendingAction(null);
    setConfirmText(""); // Reset confirm text when dialog closes
  };

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
    <div className="flex-1 space-y-6 p-6 md:p-8 bg-[#f5f5f5]">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          className="bg-white rounded-[12px]"
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-[20px] sm:text-[20px] font-bold tracking-tight">
            Order #{order.order_number || order.id}
          </h1>
          <p className="text-muted-foreground text-[14px]">
            Order details and customer information
          </p>
        </div>
      </div>

      {/* Order Progress and Delivery Information Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="col-span-2 flex flex-col gap-6">
          {/* Order Progress Bar */}
          <Card className="bg-white rounded-[24px] border-none">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Order Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Track the current status of this order
                </p>
              </div>

              {/* Progress Timeline */}
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
                  <div
                    className={`h-full transition-all duration-500 ${
                      order.orderStatus === "delivered"
                        ? "bg-green-500"
                        : order.orderStatus === "out_for_delivery"
                        ? "bg-blue-500"
                        : order.orderStatus === "preparing"
                        ? "bg-green-500"
                        : order.paymentStatus === "paid"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                    style={{
                      width:
                        order.orderStatus === "delivered"
                          ? "100%"
                          : order.orderStatus === "out_for_delivery"
                          ? "80%"
                          : order.orderStatus === "preparing"
                          ? "60%"
                          : order.paymentStatus === "paid"
                          ? "40%"
                          : "20%",
                    }}
                  />
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between relative z-10">
                  {/* Step 1: Order Confirmed */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-xs mt-2 text-center font-medium">
                      Order Confirmed
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs h-6 px-2"
                      disabled
                    >
                      Completed
                    </Button>
                  </div>

                  {/* Step 2: Payment */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        order.paymentStatus === "paid" ||
                        order.orderStatus === "preparing" ||
                        order.orderStatus === "out_for_delivery" ||
                        order.orderStatus === "delivered"
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs mt-2 text-center font-medium">
                      Payment
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs h-6 px-2"
                      onClick={() => {
                        showConfirmation({
                          type: "payment",
                          title: "Mark Payment as Paid",
                          description:
                            "Are you sure you want to mark the payment as paid? This will allow the order to proceed to the next step.",
                        });
                      }}
                      disabled={
                        order.paymentStatus === "paid" ||
                        order.orderStatus === "preparing" ||
                        order.orderStatus === "out_for_delivery" ||
                        order.orderStatus === "delivered"
                      }
                    >
                      {order.paymentStatus === "paid"
                        ? "Completed"
                        : "Mark Paid"}
                    </Button>
                  </div>

                  {/* Step 3: Preparing */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        order.orderStatus === "preparing" ||
                        order.orderStatus === "out_for_delivery" ||
                        order.orderStatus === "delivered"
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <ChefHatHeart className="w-6 h-6" weight="Broken" />
                    </div>
                    <p className="text-xs mt-2 text-center font-medium">
                      Preparing
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs h-6 px-2"
                      onClick={() => {
                        showConfirmation({
                          type: "processing",
                          title: "Start Order Preparation",
                          description:
                            "Are you sure you want to start preparing this order? This will move the order to the preparation stage.",
                        });
                      }}
                      disabled={
                        order.orderStatus === "preparing" ||
                        order.orderStatus === "out_for_delivery" ||
                        order.orderStatus === "delivered"
                      }
                    >
                      {order.orderStatus === "preparing" ||
                      order.orderStatus === "out_for_delivery" ||
                      order.orderStatus === "delivered"
                        ? "Completed"
                        : "Start Preparing"}
                    </Button>
                  </div>

                  {/* Step 4: Out for Delivery */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        order.orderStatus === "out_for_delivery" ||
                        order.orderStatus === "delivered"
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Scooter className="w-6 h-6" weight="Broken" />
                    </div>
                    <p className="text-xs mt-2 text-center font-medium">
                      Out for Delivery
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs h-6 px-2"
                      onClick={() => {
                        showConfirmation({
                          type: "delivery",
                          title: "Start Order Delivery",
                          description:
                            "Are you sure you want to mark this order as out for delivery? This will notify the customer that their order is on the way.",
                        });
                      }}
                      disabled={
                        order.orderStatus === "out_for_delivery" ||
                        order.orderStatus === "delivered"
                      }
                    >
                      {order.orderStatus === "out_for_delivery" ||
                      order.orderStatus === "delivered"
                        ? "Completed"
                        : "Start Delivery"}
                    </Button>
                  </div>

                  {/* Step 5: Delivered */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        order.orderStatus === "delivered"
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <HomeSmile className="w-6 h-6" weight="Broken" />
                    </div>
                    <p className="text-xs mt-2 text-center font-medium">
                      Delivered
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs h-6 px-2"
                      onClick={() => {
                        showConfirmation({
                          type: "delivered",
                          title: "Mark Order as Delivered",
                          description:
                            "Are you sure you want to mark this order as delivered? This will complete the order process.",
                        });
                      }}
                      disabled={order.orderStatus === "delivered"}
                    >
                      {order.orderStatus === "delivered"
                        ? "Completed"
                        : "Mark Delivered"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col md:flex-row w-full gap-6">
            {/* Customer Information */}
            <Card className="bg-white rounded-[24px] border-none flex-1">
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
                  <div className="flex-1">
                    <p className="font-medium text-lg">{order.customer.name}</p>
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

                {/* Delivery Address */}
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
            {/* Order Summary */}
            <Card className="bg-white rounded-[24px] border-none flex-1">
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
                <Separator />
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Bill Details
                  </div>
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
                      <span className="text-muted-foreground">
                        Delivery Fee:
                      </span>
                      <span>₹{order.delivery_charge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CGST (9%):</span>
                      <span>₹{order.cgst || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SGST (9%):</span>
                      <span>₹{order.sgst || 0}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>To Pay:</span>
                      <span>{order.amount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delivery Information */}
        <Card className="bg-white rounded-[24px] border-none w-full">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                Delivery Information
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage delivery details and personnel
              </p>
            </div>

            {/* Estimated Delivery Time */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Estimated Delivery Time
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Select delivery time"
                    className="flex-1"
                    value={
                      selectedTime ||
                      formatTimeForDisplay(
                        order.estimated_time_delivery || null
                      ) ||
                      ""
                    }
                    readOnly
                    onClick={() => setShowTimePicker(!showTimePicker)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowTimePicker(!showTimePicker)}
                  >
                    {showTimePicker ? "Close" : "Select Time"}
                  </Button>
                </div>

                {showTimePicker && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={(e) =>
                      e.target === e.currentTarget && setShowTimePicker(false)
                    }
                  >
                      <TimePicker
                        onTimeSelect={(time) => {
                          setSelectedTime(time);
                          updateEstimatedDeliveryTime(time);
                          setShowTimePicker(false);
                        }}
                      />
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Delivery Person Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Delivery Person
              </div>

              {/* Delivery Person Name */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Name
                </label>
                {!deliveryPersonName && order.delivery_person_name && (
                  <div className="text-xs text-muted-foreground mb-1">
                    Current: {order.delivery_person_name}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter delivery person name"
                    className="flex-1"
                    value={deliveryPersonName}
                    onChange={(e) => setDeliveryPersonName(e.target.value)}
                    onFocus={() => {
                      if (!deliveryPersonName && order.delivery_person_name) {
                        setDeliveryPersonName(order.delivery_person_name);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateDeliveryPersonName(deliveryPersonName)}
                    disabled={!deliveryPersonName.trim() || isUpdatingName}
                  >
                    {isUpdatingName ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>

              {/* Delivery Person Contact */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Contact Number
                </label>
                {!deliveryPersonContact && order.delivery_person_contact && (
                  <div className="text-xs text-muted-foreground mb-1">
                    Current: {order.delivery_person_contact}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    placeholder="Enter contact number"
                    className="flex-1"
                    value={deliveryPersonContact}
                    onChange={(e) => setDeliveryPersonContact(e.target.value)}
                    onFocus={() => {
                      if (
                        !deliveryPersonContact &&
                        order.delivery_person_contact
                      ) {
                        setDeliveryPersonContact(order.delivery_person_contact);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateDeliveryPersonContact(deliveryPersonContact)
                    }
                    disabled={
                      !deliveryPersonContact.trim() || isUpdatingContact
                    }
                  >
                    {isUpdatingContact ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Current Delivery Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                Current Status
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Delivery Status:</span>
                <Badge
                  className={
                    order.orderStatus === "out_for_delivery"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                      : order.orderStatus === "delivered"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                  }
                  variant="outline"
                >
                  {order.orderStatus === "out_for_delivery"
                    ? "Out for Delivery"
                    : order.orderStatus === "delivered"
                    ? "Delivered"
                    : "Not Assigned"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Order Summary */}

        {/* Delivery Address Details */}
        <Card className="bg-white rounded-[24px] border-none w-full">
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
                        ? `${(order.distance / 10).toFixed(1)} km`
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
        <Card className="border-none w-full col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.products && order.products.length > 0 ? (
                order.products.map((product, index) => (
                  <div
                    key={product.id || index}
                    className="flex items-center justify-between p-4 bg-white rounded-[20px]"
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
      </div>

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

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label htmlFor="confirm-input" className="text-sm font-medium">
                Type "confirm" to proceed:
              </label>
              <Input
                id="confirm-input"
                type="text"
                placeholder="Type 'confirm' here..."
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={confirmText.toLowerCase() !== "confirm" || isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
