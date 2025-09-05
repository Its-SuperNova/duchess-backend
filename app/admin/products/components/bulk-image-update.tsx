"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  ImageIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import { getAdminProducts } from "@/lib/actions/products";

interface BulkImageUpdateProps {
  onUpdateComplete?: () => void;
}

interface Product {
  id: string;
  name: string;
  banner_image: string | null;
  categories?: {
    name: string;
  };
}

interface UploadResult {
  productId: string;
  productName: string;
  success: boolean;
  newImageUrl?: string;
  error?: string;
}

export function BulkImageUpdate({ onUpdateComplete }: BulkImageUpdateProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadImage } = useImageUpload({
    folder: "products/banner",
    onSuccess: (url) => {
      console.log("✅ Bulk upload - Image uploaded successfully:", url);
    },
    onError: (error) => {
      console.error("❌ Bulk upload - Upload error:", error);
    },
  });

  // Load all products for selection
  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const result = await getAdminProducts({
        page: 1,
        limit: 1000, // Get all products
        search: "",
        categoryFilter: "all",
        stockFilter: "all",
        orderTypeFilter: "all",
      });

      setSelectedProducts(result.products || []);
      toast.success(`Loaded ${result.products?.length || 0} products`);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (selectedProducts.length === 0) {
      toast.error("Please load products first");
      return;
    }

    if (files.length !== selectedProducts.length) {
      toast.error(
        `Please select exactly ${selectedProducts.length} images (one for each product)`
      );
      return;
    }

    await processBulkUpload(files);

    // Reset input
    e.target.value = "";
  };

  // Process bulk upload
  const processBulkUpload = async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadResults([]);

    const results: UploadResult[] = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const product = selectedProducts[i];

        try {
          console.log(
            `🔄 Uploading image ${i + 1}/${totalFiles} for product: ${
              product.name
            }`
          );

          // Upload image
          const imageUrl = await uploadImage(file);

          if (imageUrl) {
            // Update product in database
            const updateResult = await updateProductImage(product.id, imageUrl);

            if (updateResult.success) {
              results.push({
                productId: product.id,
                productName: product.name,
                success: true,
                newImageUrl: imageUrl,
              });

              console.log(
                `✅ Successfully updated image for product: ${product.name}`
              );
            } else {
              results.push({
                productId: product.id,
                productName: product.name,
                success: false,
                error: updateResult.error || "Failed to update product",
              });

              console.error(
                `❌ Failed to update product: ${product.name}`,
                updateResult.error
              );
            }
          } else {
            results.push({
              productId: product.id,
              productName: product.name,
              success: false,
              error: "Failed to upload image",
            });
          }
        } catch (error) {
          results.push({
            productId: product.id,
            productName: product.name,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          console.error(`❌ Error processing product: ${product.name}`, error);
        }

        // Update progress
        const progress = ((i + 1) / totalFiles) * 100;
        setUploadProgress(progress);
        setUploadResults([...results]);
      }

      // Show final results
      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      console.log(
        `🎉 Bulk upload completed: ${successCount} successful, ${failureCount} failed`
      );

      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} product images`);
      }

      if (failureCount > 0) {
        toast.error(
          `${failureCount} uploads failed. Check console for details.`
        );
      }

      // Call completion callback
      if (onUpdateComplete) {
        onUpdateComplete();
      }
    } catch (error) {
      console.error("Bulk upload failed:", error);
      toast.error("Bulk upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Update product image in database
  const updateProductImage = async (productId: string, imageUrl: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/image`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ banner_image: imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || "Failed to update product",
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const successCount = uploadResults.filter((r) => r.success).length;
  const failureCount = uploadResults.filter((r) => !r.success).length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Bulk Product Image Update
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Load Products Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Step 1: Load Products</h3>
              <p className="text-sm text-muted-foreground">
                Load all products to update their banner images
              </p>
            </div>
            <Button
              onClick={loadProducts}
              disabled={isLoadingProducts}
              variant="outline"
            >
              {isLoadingProducts ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load Products"
              )}
            </Button>
          </div>

          {selectedProducts.length > 0 && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                ✅ Loaded {selectedProducts.length} products ready for image
                update
              </p>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Step 2: Select Images</h3>
            <p className="text-sm text-muted-foreground">
              Select {selectedProducts.length} images (one for each product) in
              the same order as the products
            </p>
          </div>

          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading || selectedProducts.length === 0}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || selectedProducts.length === 0}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Select Images"}
            </Button>

            {selectedProducts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Please load products first
              </p>
            )}
          </div>
        </div>

        {/* Progress Section */}
        {isUploading && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Upload Progress</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </div>
        )}

        {/* Results Section */}
        {uploadResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h3 className="font-medium">Upload Results</h3>
              <div className="flex gap-2">
                {successCount > 0 && (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {successCount} Success
                  </Badge>
                )}
                {failureCount > 0 && (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    {failureCount} Failed
                  </Badge>
                )}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {uploadResults.map((result, index) => (
                <div
                  key={result.productId}
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    result.success
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {result.productName}
                      </p>
                      {result.error && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={result.success ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {result.success ? "Updated" : "Failed"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Important Instructions:
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>
                  Load products first to see how many images you need to select
                </li>
                <li>
                  Select images in the same order as the products appear in the
                  list
                </li>
                <li>
                  Each image will be uploaded to Cloudinary and update the
                  corresponding product
                </li>
                <li>Check the console for detailed upload logs</li>
                <li>
                  All uploads are processed sequentially to avoid overwhelming
                  the server
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
