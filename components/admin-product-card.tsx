"use client";

import { useState, useEffect, memo } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { getProductThumbnailUrl } from "@/lib/image-utils";
import { getProductPrice } from "@/lib/utils";

interface AdminProductCardProps {
  product: {
    id: string;
    name: string;
    banner_image: string | null;
    is_veg: boolean;
    weight_options: any;
    piece_options: any;
    categories?: { name: string } | null;
    is_active: boolean;
  };
  section?: {
    id: string;
    title: string;
  } | null;
  onToggleHomepage: (product: any) => void;
  onRemoveFromHomepage: (productId: string) => void;
  showSectionBadge?: boolean;
}

const AdminProductCard = memo(function AdminProductCard({
  product,
  section,
  onToggleHomepage,
  onRemoveFromHomepage,
  showSectionBadge = true,
}: AdminProductCardProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate price from product options
  const { price } = getProductPrice(product);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[24px] shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Product Image */}
      <div className="relative">
        <div className="relative h-48 w-full rounded-[28px] overflow-hidden group">
          <Image
            src={getProductThumbnailUrl(product)}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        {/* Section Badge */}
        {section && showSectionBadge && (
          <div className="absolute top-2 right-2">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {section.title}
            </Badge>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Category and Product Name */}
        <div className="flex justify-between items-end mb-3">
          <div className="flex-1 min-w-0">
            {/* Category */}
            {product.categories?.name && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {product.categories.name}
              </p>
            )}

            {/* Product Name */}
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate mb-2">
              {product.name}
            </h3>
          </div>

          {/* Veg/Non-veg indicator */}
          <div className="flex justify-end mb-2 flex-shrink-0 ml-2">
            <div className="flex items-center">
              <div
                className={`w-6 h-6 border-[2px] rounded-lg flex items-center justify-center ${
                  product.is_veg ? "border-green-500" : "border-red-500"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    product.is_veg ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold text-lg text-gray-900 dark:text-white">
            ₹{price}
          </p>
          {section ? (
            <Button
              className="border-red-500 text-red-500 hover:bg-red-50"
              variant="outline"
              size="sm"
              onClick={() => onRemoveFromHomepage(product.id)}
              title={`Remove from ${section.title}`}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Remove
            </Button>
          ) : (
            <Button
              className="border-blue-500 text-blue-500 hover:bg-blue-50"
              variant="outline"
              size="sm"
              onClick={() => onToggleHomepage(product)}
              title="Add to Homepage"
            >
              <Eye className="h-4 w-4 mr-2" />
              Add to Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

export default AdminProductCard;
