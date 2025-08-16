import CategoryClient from "./category-client";
import { getProductsByCategorySlugPaginated } from "@/lib/actions/products";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { CategoryErrorBoundary } from "./error-boundary";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = slug.replace(/-/g, " ").replace(/\band\b/g, "&");

  return {
    title: `${categoryName} - Duchess Pastries`,
    description: `Explore our delicious ${categoryName.toLowerCase()} collection. Fresh, handmade pastries and desserts delivered to your doorstep.`,
    openGraph: {
      title: `${categoryName} - Duchess Pastries`,
      description: `Discover our amazing ${categoryName.toLowerCase()} selection. Premium quality pastries made with love.`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Get category name from slug for display
  const categoryName = slug.replace(/-/g, " ").replace(/\band\b/g, "&");

  try {
    // Fetch initial products server-side for SSR with pagination info
    const result = await getProductsByCategorySlugPaginated(slug, 0, 4);

    // If no products found, show 404
    if (result.products.length === 0) {
      notFound();
    }

    return (
      <CategoryErrorBoundary>
        <CategoryClient
          categorySlug={slug}
          categoryName={categoryName}
          initialProducts={result.products}
          initialHasMore={result.hasMore}
          totalCount={result.totalCount}
        />
      </CategoryErrorBoundary>
    );
  } catch (error) {
    console.error("Error loading category page:", error);

    // Return a fallback UI instead of crashing
    return (
      <div className="w-full px-4 py-8">
        <div className="max-w-[1200px] mx-auto md:px-4">
          <h1 className="text-3xl font-bold capitalize mb-6">{categoryName}</h1>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to load products
            </h3>
            <p className="text-gray-600 mb-4">
              We're experiencing technical difficulties. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
}
