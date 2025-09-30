"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Truck } from "lucide-react";

export default function PricingManagementPage() {
  return (
    <div
      className="container min-h-screen mx-auto p-6 space-y-6"
      style={{ backgroundColor: "#f5f5f5" }}
    >
      <div>
        <h1 className="text-3xl font-bold">Pricing Management</h1>
        <p className="text-muted-foreground">
          Manage tax rates and delivery charges for your business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tax Management Card */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Tax Management</CardTitle>
                <CardDescription>
                  Configure tax rates and settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/admin/pricing/tax">Manage Tax Settings</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Delivery Charges Card */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Delivery Charges</CardTitle>
                <CardDescription>
                  Configure delivery fees and zones
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/admin/pricing/delivery">
                Manage Delivery Charges
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
