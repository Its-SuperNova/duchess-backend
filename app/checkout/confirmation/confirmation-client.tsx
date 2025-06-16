"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ConfirmationClient() {
  // Sample order details
  const order = {
    id: "ORD-12345",
    date: "April 13, 2025",
    estimatedDelivery: "Today, 5:30 PM - 6:00 PM",
    total: 67.99,
    items: [
      {
        id: 1,
        name: "Chocolate Cake",
        price: 50.0,
        quantity: 1,
        image: "/images/red-velvet.png",
      },
      {
        id: 2,
        name: "Divine Cupcake Delights",
        price: 12.0,
        quantity: 1,
        image: "/images/categories/cupcake.png",
      },
    ],
    deliveryAddress: "123 Main Street, Apt 4B, New York, NY 10001",
    paymentMethod: "Razorpay",
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Simple Header */}
      <div className="p-4 flex items-center">
        <Link href="/checkout" className="mr-4">
          <div className="bg-gray-100 p-2 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </div>
        </Link>
        <h1 className="text-xl font-semibold">Order Confirmation</h1>
      </div>

      <div className="container mx-auto px-4 py-4">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Order Confirmed!
              </h1>
              <p className="text-gray-600">
                Thank you for your order. Your order has been received and is
                being prepared.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-medium">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{order.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estimated Delivery</p>
                  <p className="font-medium">{order.estimatedDelivery}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{order.paymentMethod}</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Order Details</h2>

            <div className="space-y-4 mb-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${(order.total - 5.99).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>$5.99</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-8">
              <h3 className="font-medium mb-2">Delivery Address</h3>
              <p className="text-gray-600">{order.deliveryAddress}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/products">Continue Shopping</Link>
              </Button>
              <Button asChild className="bg-[#361C1C] hover:bg-[#4a2a2a]">
                <Link href="/profile/orders">View All Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
