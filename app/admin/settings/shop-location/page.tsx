"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ShopLocationPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "Duchess Pastries",
    address:
      "Door No : 7/68-62-B, Street 1, Vijayalakshmi Nagar, Sivasakthi Gardens, Keeranatham, Coimbatore",
    latitude: "11.1061944",
    longitude: "77.0015000",
  });

  useEffect(() => {
    loadShopLocation();
  }, []);

  const loadShopLocation = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/distance");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.shopLocation) {
          setFormData({
            name: data.shopLocation.name,
            address: data.shopLocation.address,
            latitude: data.shopLocation.coordinates.latitude.toString(),
            longitude: data.shopLocation.coordinates.longitude.toString(),
          });
        }
      }
    } catch (error) {
      console.error("Error loading shop location:", error);
      toast({
        title: "Error",
        description: "Failed to load shop location",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate coordinates
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        toast({
          title: "Invalid coordinates",
          description: "Please enter valid latitude and longitude values",
          variant: "destructive",
        });
        return;
      }

      if (lat < -90 || lat > 90) {
        toast({
          title: "Invalid latitude",
          description: "Latitude must be between -90 and 90",
          variant: "destructive",
        });
        return;
      }

      if (lng < -180 || lng > 180) {
        toast({
          title: "Invalid longitude",
          description: "Longitude must be between -180 and 180",
          variant: "destructive",
        });
        return;
      }

      // In a real application, you would save this to your database
      // For now, we'll just show a success message
      toast({
        title: "Success",
        description: "Shop location updated successfully",
      });

      // You can add API call here to save to database
      // await fetch("/api/admin/shop-location", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });
    } catch (error) {
      console.error("Error saving shop location:", error);
      toast({
        title: "Error",
        description: "Failed to save shop location",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin/settings">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <ArrowLeft className="h-5 w-5" />
              </div>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Shop Location</h1>
              <p className="text-gray-600">Configure your shop's location</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/settings">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <ArrowLeft className="h-5 w-5" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Shop Location</h1>
            <p className="text-gray-600">
              Configure your shop's location for distance calculations
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shop Location Settings
            </CardTitle>
            <CardDescription>
              Set your shop's exact location to enable accurate distance
              calculations for delivery estimates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Shop Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your shop name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Shop Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your complete shop address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 28.6139"
                    required
                  />
                  <p className="text-xs text-gray-500">Range: -90 to 90</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 77.2090"
                    required
                  />
                  <p className="text-xs text-gray-500">Range: -180 to 180</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  How to get coordinates:
                </h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>
                    1. Go to{" "}
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Google Maps
                    </a>
                  </li>
                  <li>2. Search for your shop location</li>
                  <li>3. Right-click on the exact location</li>
                  <li>4. Click on the coordinates that appear</li>
                  <li>5. Copy the latitude and longitude values</li>
                </ol>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Shop Location
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
