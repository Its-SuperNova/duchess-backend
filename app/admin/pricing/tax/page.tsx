"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaxSettings {
  id: number;
  cgst_rate: number;
  sgst_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function TaxManagementPage() {
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);
  const [cgstRate, setCgstRate] = useState<string>("");
  const [sgstRate, setSgstRate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Fetch tax settings on component mount
  useEffect(() => {
    fetchTaxSettings();
  }, []);

  const fetchTaxSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tax-settings");
      const result = await response.json();

      if (response.ok && result.data) {
        setTaxSettings(result.data);
        setCgstRate(result.data.cgst_rate.toString());
        setSgstRate(result.data.sgst_rate.toString());
      } else {
        // Set default values if no settings found
        setCgstRate("9.00");
        setSgstRate("9.00");
      }
    } catch (error) {
      console.error("Error fetching tax settings:", error);
      toast({
        title: "Error",
        description: "Failed to load tax settings",
        variant: "destructive",
      });
      // Set default values on error
      setCgstRate("9.00");
      setSgstRate("9.00");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate inputs
      const cgst = parseFloat(cgstRate);
      const sgst = parseFloat(sgstRate);

      if (isNaN(cgst) || isNaN(sgst)) {
        toast({
          title: "Invalid Input",
          description: "Please enter valid numbers for tax rates",
          variant: "destructive",
        });
        return;
      }

      if (cgst < 0 || cgst > 100 || sgst < 0 || sgst > 100) {
        toast({
          title: "Invalid Range",
          description: "Tax rates must be between 0 and 100",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/tax-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cgst_rate: cgst,
          sgst_rate: sgst,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Tax settings updated successfully",
        });
        // Refresh the data
        await fetchTaxSettings();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update tax settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving tax settings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="container min-h-screen mx-auto p-6 space-y-6"
        style={{ backgroundColor: "#f5f5f5" }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading tax settings...</span>
          </div>
        </div>
      </div>
    );
  }

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
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="w-full bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cgst">CGST (%)</Label>
            <Input
              id="cgst"
              type="number"
              placeholder="Enter CGST percentage"
              step="0.01"
              min="0"
              max="100"
              value={cgstRate}
              onChange={(e) => setCgstRate(e.target.value)}
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
              min="0"
              max="100"
              value={sgstRate}
              onChange={(e) => setSgstRate(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {taxSettings && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Last updated:{" "}
                {new Date(taxSettings.updated_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
