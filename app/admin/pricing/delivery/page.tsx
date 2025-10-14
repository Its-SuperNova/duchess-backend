"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Trash2 } from "lucide-react";

interface DeliveryCharge {
  id: number;
  type: "order_value" | "distance";
  order_value_threshold?: number;
  delivery_type?: "free" | "fixed";
  fixed_price?: number;
  start_km?: number;
  end_km?: number;
  price?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function DeliveryChargesPage() {
  const [deliveryCharges, setDeliveryCharges] = useState<DeliveryCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    startKm: "",
    endKm: "",
    price: "",
  });
  const [orderValueData, setOrderValueData] = useState({
    orderValue: "",
  });
  const [isFreeDeliveryEnabled, setIsFreeDeliveryEnabled] = useState(false);
  const [hasOrderValueChanged, setHasOrderValueChanged] = useState(false);
  const [isOrderValueSaving, setIsOrderValueSaving] = useState(false);
  const [showOrderValueSaved, setShowOrderValueSaved] = useState(false);

  // Fetch delivery charges from database
  const fetchDeliveryCharges = async () => {
    try {
      const response = await fetch("/api/delivery-charges");
      const result = await response.json();

      if (response.ok) {
        setDeliveryCharges(result.data);

        // Set order value data if exists
        const orderValueCharge = result.data.find(
          (charge: DeliveryCharge) => charge.type === "order_value"
        );
        if (orderValueCharge) {
          setOrderValueData({
            orderValue:
              orderValueCharge.order_value_threshold?.toString() || "",
          });
          setIsFreeDeliveryEnabled(true);
          setHasOrderValueChanged(false); // Reset change tracking
        } else {
          setHasOrderValueChanged(false); // Reset change tracking
        }
      }
    } catch (error) {
      console.error("Error fetching delivery charges:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryCharges();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOrderValueChange = (field: string, value: string) => {
    setOrderValueData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasOrderValueChanged(true); // Mark as changed
  };

  const handleAddPricing = async () => {
    if (formData.startKm && formData.endKm && formData.price) {
      try {
        const response = await fetch("/api/delivery-charges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "distance",
            start_km: parseFloat(formData.startKm),
            end_km: parseFloat(formData.endKm),
            price: parseFloat(formData.price),
          }),
        });

        if (response.ok) {
          setFormData({ startKm: "", endKm: "", price: "" });
          fetchDeliveryCharges(); // Refresh data
        }
      } catch (error) {
        console.error("Error adding pricing:", error);
      }
    }
  };

  const handleSaveDistancePricing = async () => {
    if (formData.startKm && formData.endKm && formData.price) {
      try {
        const response = await fetch("/api/delivery-charges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "distance",
            start_km: parseFloat(formData.startKm),
            end_km: parseFloat(formData.endKm),
            price: parseFloat(formData.price),
          }),
        });

        if (response.ok) {
          setFormData({ startKm: "", endKm: "", price: "" });
          fetchDeliveryCharges(); // Refresh data
        }
      } catch (error) {
        console.error("Error saving distance pricing:", error);
      }
    }
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      const response = await fetch(`/api/delivery-charges/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchDeliveryCharges(); // Refresh data
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const handleSaveOrderValue = async () => {
    try {
      if (!isFreeDeliveryEnabled || !orderValueData.orderValue) {
        return;
      }

      setIsOrderValueSaving(true);

      // Check if there's an existing order_value record
      const existingOrderValue = deliveryCharges.find(
        (charge) => charge.type === "order_value"
      );

      if (existingOrderValue) {
        // Update existing record
        const response = await fetch(
          `/api/delivery-charges/${existingOrderValue.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_value_threshold: parseFloat(orderValueData.orderValue),
              delivery_type: "free",
              fixed_price: null,
              is_active: true,
            }),
          }
        );

        if (response.ok) {
          fetchDeliveryCharges(); // Refresh data
          setHasOrderValueChanged(false); // Reset change tracking
          setShowOrderValueSaved(true); // Show saved feedback
          setTimeout(() => setShowOrderValueSaved(false), 2000); // Hide after 2 seconds
        }
      } else {
        // Create new record if none exists
        const response = await fetch("/api/delivery-charges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "order_value",
            order_value_threshold: parseFloat(orderValueData.orderValue),
            delivery_type: "free",
            fixed_price: null,
            is_active: true,
          }),
        });

        if (response.ok) {
          fetchDeliveryCharges(); // Refresh data
          setHasOrderValueChanged(false); // Reset change tracking
          setShowOrderValueSaved(true); // Show saved feedback
          setTimeout(() => setShowOrderValueSaved(false), 2000); // Hide after 2 seconds
        }
      }
    } catch (error) {
      console.error("Error saving order value:", error);
    } finally {
      setIsOrderValueSaving(false);
    }
  };

  const handleToggleChange = async (enabled: boolean) => {
    setIsFreeDeliveryEnabled(enabled);
    setHasOrderValueChanged(true); // Mark as changed when toggle changes

    if (!enabled) {
      // If toggle is turned off, delete the existing order value rule
      const existingOrderValue = deliveryCharges.find(
        (charge) => charge.type === "order_value"
      );

      if (existingOrderValue) {
        try {
          await fetch(`/api/delivery-charges/${existingOrderValue.id}`, {
            method: "DELETE",
          });
          fetchDeliveryCharges(); // Refresh data
          setHasOrderValueChanged(false); // Reset after successful deletion
        } catch (error) {
          console.error("Error deleting order value rule:", error);
        }
      }
    }
  };

  return (
    <div
      className="container min-h-screen mx-auto p-6 space-y-6"
      style={{ backgroundColor: "#f5f5f5" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white rounded-lg"
            asChild
          >
            <Link href="/admin/pricing">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Delivery Charges</h1>
            <p className="text-muted-foreground">
              Configure delivery fees and zones for your business
            </p>
          </div>
        </div>
      </div>

      {/* Free Delivery on Orders Above Price - Separate Section */}
      <div className="w-full bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Free Delivery on Orders Above Price
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="free-delivery-toggle"
                  checked={isFreeDeliveryEnabled}
                  onCheckedChange={handleToggleChange}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label htmlFor="free-delivery-toggle" className="text-sm">
                  Enable Free Delivery
                </Label>
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveOrderValue}
                disabled={
                  !isFreeDeliveryEnabled ||
                  !orderValueData.orderValue ||
                  !hasOrderValueChanged ||
                  isOrderValueSaving
                }
              >
                {isOrderValueSaving
                  ? "Saving..."
                  : showOrderValueSaved
                  ? "Saved!"
                  : "Save"}
              </Button>
            </div>
          </div>

          {isFreeDeliveryEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderValue">Order Value Above (₹)</Label>
                <Input
                  id="orderValue"
                  type="number"
                  placeholder="Enter minimum order value"
                  step="0.01"
                  className="max-w-sm"
                  value={orderValueData.orderValue}
                  onChange={(e) =>
                    handleOrderValueChange("orderValue", e.target.value)
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Distance Based Delivery - Combined Section */}
      <div className="w-full bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-6">
          {/* Add New Distance Based Pricing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Distance Based Delivery</h3>
              <div className="flex items-center space-x-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddPricing}
                >
                  Add Pricing
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSaveDistancePricing}
                  disabled={
                    !formData.startKm || !formData.endKm || !formData.price
                  }
                >
                  Save
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startKm">Start KM</Label>
                <Input
                  id="startKm"
                  type="number"
                  placeholder="Enter start KM"
                  step="0.1"
                  className="max-w-sm"
                  value={formData.startKm}
                  onChange={(e) => handleInputChange("startKm", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endKm">End KM</Label>
                <Input
                  id="endKm"
                  type="number"
                  placeholder="Enter end KM"
                  step="0.1"
                  className="max-w-sm"
                  value={formData.endKm}
                  onChange={(e) => handleInputChange("endKm", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  step="0.01"
                  className="max-w-sm"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Display existing distance based pricing entries */}
          {!loading &&
            deliveryCharges.filter((charge) => charge.type === "distance")
              .length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Distance Based Pricing
                </h3>
                <div className="space-y-3">
                  {deliveryCharges
                    .filter((charge) => charge.type === "distance")
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-6">
                          <span className="font-medium">
                            Start:{" "}
                            <span className="text-green-600">
                              {entry.start_km} KM
                            </span>
                          </span>
                          <span className="font-medium">
                            End:{" "}
                            <span className="text-green-600">
                              {entry.end_km} KM
                            </span>
                          </span>
                          <span className="font-medium text-blue-600">
                            ₹{entry.price}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="w-full bg-white p-6 rounded-lg shadow-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Loading delivery charges...</p>
          </div>
        </div>
      )}
    </div>
  );
}
