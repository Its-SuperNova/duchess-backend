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
  const calculatePrice = (product: Product) => {
    let price = 0;
    let originalPrice = 0;

    if (
      product.selling_type === "weight" &&
      product.weight_options?.length > 0
    ) {
      const activeOption = product.weight_options.find(
        (opt: any) => opt.isActive
      );
      if (activeOption) {
        price = parseFloat(activeOption.price) || 0;
        originalPrice = price;
      }
    } else if (
      product.selling_type === "piece" &&
      product.piece_options?.length > 0
    ) {
      const activeOption = product.piece_options.find(
        (opt: any) => opt.isActive
      );
      if (activeOption) {
        price = parseFloat(activeOption.price) || 0;
        originalPrice = price;
      }
    } else if (product.selling_type === "both") {
      if (product.weight_options?.length > 0) {
        const activeWeightOption = product.weight_options.find(
          (opt: any) => opt.isActive
        );
        if (activeWeightOption) {
          price = parseFloat(activeWeightOption.price) || 0;
          originalPrice = price;
        }
      }
      if (price === 0 && product.piece_options?.length > 0) {
        const activePieceOption = product.piece_options.find(
          (opt: any) => opt.isActive
        );
        if (activePieceOption) {
          price = parseFloat(activePieceOption.price) || 0;
          originalPrice = price;
        }
      }
    }

    if (product.has_offer && product.offer_percentage && price > 0) {
      originalPrice = price;
      price = price * (1 - product.offer_percentage / 100);
    }

    if (price <= 0) {
      price = 100;
    }

    return { price, originalPrice };
  };

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
        const { price, originalPrice } = calculatePrice(product);
        const globalIndex = startIndex + i;

        return (
          <ProductCard
            key={`${product.id}-${globalIndex}`}
            id={product.id}
            name={product.name}
            rating={4.5}
            imageUrl={product.banner_image || "/images/categories/cake.png"}
            price={price}
            originalPrice={originalPrice > price ? originalPrice : undefined}
            isVeg={product.is_veg}
            description={product.name}
            category={product.categories?.name}
            hasOffer={product.has_offer}
            offerPercentage={product.offer_percentage}
            priority={globalIndex < 4} // Only prioritize first 4 images
          />
        );
      })}
    </div>
  );
};

export const ProductGrid = memo(ProductGridComponent);
