import { memo } from "react";
import ProductCard from "@/components/productcard";
import { Product } from "../types";

interface ProductGridProps {
  products: Product[];
  startIndex?: number;
}

const ProductGridComponent = ({
  products,
  startIndex = 0,
}: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-600 mb-4">
          We couldn't find any products at the moment.
        </p>
        <p className="text-sm text-gray-500">Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product: Product, i) => {
        // Use the pre-calculated price from the API (already calculated server-side)
        const price = product.price || 0;
        const originalPrice = product.originalPrice;
        const globalIndex = startIndex + i;

        return (
          <ProductCard
            key={`${product.id}-${globalIndex}`}
            id={product.id}
            name={product.name}
            rating={4.5}
            imageUrl={product.banner_image || "/images/categories/cake.png"}
            price={price}
            originalPrice={
              originalPrice && originalPrice > price ? originalPrice : undefined
            }
            isVeg={product.is_veg}
            description={product.name}
            category={
              Array.isArray(product.categories)
                ? product.categories[0]?.name
                : product.categories?.name || undefined
            }
            priority={globalIndex < 4} // Only prioritize first 4 images
          />
        );
      })}
    </div>
  );
};

export const ProductGrid = memo(ProductGridComponent);
