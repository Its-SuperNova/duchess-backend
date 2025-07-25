import { getActiveProducts } from "@/lib/actions/products";
import { Suspense } from "react";
import { ProductGrid } from "./components/product-grid";
import { ProductSkeletonGrid } from "@/components/ui/product-skeleton";
import { ProductsInfiniteScroll } from "./components/products-infinite-scroll";
import { Product } from "./types";

// Force dynamic rendering to avoid ISR size limits
export const dynamic = "force-dynamic";

// Metadata for SEO
export const metadata = {
  title: "All Products - Duchess Pastries",
  description:
    "Explore our delicious selection of pastries, cakes, and desserts. Fresh, handmade with premium ingredients.",
  openGraph: {
    title: "All Products - Duchess Pastries",
    description:
      "Explore our delicious selection of pastries, cakes, and desserts.",
  },
};

export default async function AllProductsPage() {
  // ✅ Prefetch initial products on the server for SEO and fast initial load
  const initialProducts = await getActiveProducts({ limit: 4, offset: 0 });

  return (
    <div className="w-full px-4 py-8">
      <div className="max-w-[1200px] mx-auto md:px-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">All Products</h1>
          <p className="text-gray-600">
            {initialProducts.length} product
            {initialProducts.length !== 1 ? "s" : ""} loaded
          </p>
        </div>

        <Suspense fallback={<ProductSkeletonGrid count={4} />}>
          <ProductsInfiniteScroll initialProducts={initialProducts} />
        </Suspense>
      </div>
    </div>
  );
}
