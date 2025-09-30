"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function TaxManagementPage() {
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
            <h1 className="text-3xl font-bold">Tax Management</h1>
            <p className="text-muted-foreground">
              Configure tax rates and settings for your business
            </p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
      </div>

      <div className="w-full  bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cgst">CGST (%)</Label>
            <Input
              id="cgst"
              type="number"
              placeholder="Enter CGST  percentage"
              step="0.01"
              className="max-w-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sgst">SGST (%)</Label>
            <Input
              id="sgst"
              type="number"
              placeholder="Enter SGST percentage"
              step="0.01"
              className="max-w-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
