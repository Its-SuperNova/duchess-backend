// app/categories/[slug]/page.tsx
import { getProductsByCategorySlug } from "@/lib/actions/products";
import { Suspense } from "react";
import { ProductSkeletonGrid } from "@/components/ui/product-skeleton";
import CategoryClient from "./category-client";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

// Force dynamic rendering to avoid ISR size limits
export const dynamic = "force-dynamic";

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categoryName = slug.replace(/-/g, " ").replace(/\band\b/g, "&");

  return {
    title: `${categoryName} - Duchess Pastries`,
    description: `Explore our delicious selection of ${categoryName.toLowerCase()}. Fresh, handmade with premium ingredients.`,
    openGraph: {
      title: `${categoryName} - Duchess Pastries`,
      description: `Explore our delicious selection of ${categoryName.toLowerCase()}.`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Get category name from slug for display
  const categoryName = slug.replace(/-/g, " ").replace(/\band\b/g, "&");

  // ✅ Prefetch initial products on the server for SEO and fast initial load
  const initialProducts = await getProductsByCategorySlug(slug);

  return (
    <div className="w-full px-4 py-8">
      <div className="max-w-[1200px] mx-auto md:px-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold capitalize">{categoryName}</h1>
          <p className="text-gray-600">
            {initialProducts.length} product
            {initialProducts.length !== 1 ? "s" : ""} loaded
          </p>
        </div>

        <Suspense fallback={<ProductSkeletonGrid count={4} />}>
          <CategoryClient
            categorySlug={slug}
            categoryName={categoryName}
            initialProducts={initialProducts}
          />
        </Suspense>
      </div>
    </div>
  );
}
