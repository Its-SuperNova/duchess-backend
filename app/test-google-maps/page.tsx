"use client";

import { useState } from "react";
import { calculateDistanceAndTime } from "@/lib/distance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, Loader2 } from "lucide-react";

export default function TestGoogleMapsPage() {
  const [pincode, setPincode] = useState("641005"); // Singanallur default
  const [area, setArea] = useState("Singanallur");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testDistance = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing Google Maps API with:", { area, pincode });

      const response = await calculateDistanceAndTime(area, pincode);

      console.log("API Response:", response);
      setResult(response);
    } catch (err) {
      console.error("Test failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Google Maps API Distance Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g., Singanallur"
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g., 641005"
              />
            </div>
          </div>

          <Button
            onClick={testDistance}
            disabled={loading || !pincode}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Distance...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Test Google Maps Distance
              </>
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Result</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">{result.distance}km</p>
                      <p className="text-sm text-green-600">Distance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">{result.duration} mins</p>
                      <p className="text-sm text-green-600">Duration</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-sm">
                    <span className="font-medium">Success:</span>{" "}
                    {result.success ? "✅" : "❌"}
                  </p>
                  {result.error && (
                    <p className="text-sm text-red-600">
                      <span className="font-medium">API Error:</span>{" "}
                      {result.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              Test Information
            </h3>
            <div className="text-sm text-blue-600 space-y-1">
              <p>• Shop Location: Keeranatham (11.0311, 77.0469)</p>
              <p>• This test uses the Google Maps Distance Matrix API</p>
              <p>• Expected Singanallur distance: ~18km (not 3.3km)</p>
              <p>• API calls are made server-side via /api/distance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
