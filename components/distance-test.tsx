"use client";

import { useState } from "react";
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
import { MapPin, Clock, Loader2 } from "lucide-react";
import type { DeliveryResult } from "@/lib/distance";

export default function DistanceTest() {
  const [testAddress, setTestAddress] = useState({
    full_address: "123 Main St",
    city: "New York",
    state: "NY",
    zip_code: "10001",
  });
  const [testPincode, setTestPincode] = useState({
    pincode: "641035",
    district: "Coimbatore",
    state: "Tamil Nadu",
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testEnvironment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/distance", {
        method: "GET",
      });

      const data = await response.json();
      setResult({ type: "Environment Test", data });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to test environment"
      );
    } finally {
      setLoading(false);
    }
  };

  const testDistanceCalculation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/distance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: testAddress }),
      });

      const data = await response.json();
      setResult({
        type: "Distance Calculation Test",
        data,
        status: response.status,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to test distance calculation"
      );
    } finally {
      setLoading(false);
    }
  };

  const testPincodeCalculation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/distance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pincode: testPincode.pincode,
          district: testPincode.district,
          state: testPincode.state,
          type: "pincode",
        }),
      });

      const data = await response.json();
      setResult({
        type: "Pincode-based Distance Calculation Test",
        data,
        status: response.status,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to test pincode distance calculation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Address-based Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Address-based Distance Calculation Test</CardTitle>
          <CardDescription>
            Test distance calculation using full address components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Address</Label>
            <Input
              value={testAddress.full_address}
              onChange={(e) =>
                setTestAddress((prev) => ({
                  ...prev,
                  full_address: e.target.value,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={testAddress.city}
                onChange={(e) =>
                  setTestAddress((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={testAddress.state}
                onChange={(e) =>
                  setTestAddress((prev) => ({ ...prev, state: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>ZIP Code</Label>
              <Input
                value={testAddress.zip_code}
                onChange={(e) =>
                  setTestAddress((prev) => ({
                    ...prev,
                    zip_code: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <Button onClick={testDistanceCalculation} disabled={loading}>
            Test Address-based Calculation
          </Button>
        </CardContent>
      </Card>

      {/* Pincode-based Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Pincode-based Distance Calculation Test</CardTitle>
          <CardDescription>
            Test distance calculation using only pincode (most reliable for
            Indian addresses)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>Pincode</Label>
              <Input
                value={testPincode.pincode}
                onChange={(e) =>
                  setTestPincode((prev) => ({
                    ...prev,
                    pincode: e.target.value,
                  }))
                }
                placeholder="641035"
              />
            </div>
            <div className="space-y-2">
              <Label>District</Label>
              <Input
                value={testPincode.district}
                onChange={(e) =>
                  setTestPincode((prev) => ({
                    ...prev,
                    district: e.target.value,
                  }))
                }
                placeholder="Coimbatore"
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={testPincode.state}
                onChange={(e) =>
                  setTestPincode((prev) => ({ ...prev, state: e.target.value }))
                }
                placeholder="Tamil Nadu"
              />
            </div>
          </div>

          <Button onClick={testPincodeCalculation} disabled={loading}>
            Test Pincode-based Calculation
          </Button>
        </CardContent>
      </Card>

      {/* Environment Test */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Test</CardTitle>
          <CardDescription>
            Test if the distance calculation environment is working
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testEnvironment} disabled={loading}>
            Test Environment
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Testing...
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-600 p-4 bg-red-50 rounded">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-2">{result.type}</h3>
            <pre className="text-sm overflow-auto bg-gray-50 p-4 rounded">
              {JSON.stringify(result.data, null, 2)}
            </pre>
            {result.status && (
              <div className="mt-2 text-sm">
                <strong>Status:</strong> {result.status}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
