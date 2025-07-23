// app/categories/[slug]/page.tsx
import { getProductsByCategorySlug } from "@/lib/actions/products";
import CategoryClient from "./category-client";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

// ✅ This is an SSG function – categories get prebuilt at build time
//    Change to "force-dynamic" export if you want SSR instead
export const revalidate = 60; // ISR (revalidate every 60 seconds)

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Get category name from slug for display
  const categoryName = slug.replace(/-/g, " ").replace(/\band\b/g, "&");

  // ✅ Prefetch products on the server
  const products = await getProductsByCategorySlug(slug);

  return (
    <CategoryClient
      categorySlug={slug}
      categoryName={categoryName}
      initialProducts={products}
    />
  );
}
