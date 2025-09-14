"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Grid3X3, ArrowRight, Package } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomeCustomizationPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Home Customization
          </h1>
          <p className="text-muted-foreground">
            Customize your home page layout, content, and appearance
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Management */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => router.push("/admin/category-management")}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Grid3X3 className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Category Management</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Organize and reorder category cards
                </p>
              </div>
              <div className="flex items-center text-primary text-sm font-medium">
                <span>Manage Categories</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Management */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() =>
            router.push("/admin/home-customization/product-management")
          }
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Product Management</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage homepage product visibility
                </p>
              </div>
              <div className="flex items-center text-primary text-sm font-medium">
                <span>Manage Products</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
