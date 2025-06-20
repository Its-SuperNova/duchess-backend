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
import type { DistanceResult } from "@/lib/distance-utils";

export default function DistanceTest() {
  const [testAddress, setTestAddress] = useState({
    full_address: "123 Main St",
    city: "New York",
    state: "NY",
    zip_code: "10001",
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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Distance Calculation Debug Test</CardTitle>
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

          <div className="flex gap-2">
            <Button onClick={testEnvironment} disabled={loading}>
              Test Environment
            </Button>
            <Button onClick={testDistanceCalculation} disabled={loading}>
              Test Distance Calculation
            </Button>
          </div>

          {loading && <div className="text-blue-600">Testing...</div>}

          {error && (
            <div className="text-red-600 p-4 bg-red-50 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">{result.type}</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
              {result.status && (
                <div className="mt-2 text-sm">
                  <strong>Status:</strong> {result.status}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
