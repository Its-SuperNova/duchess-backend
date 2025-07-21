import { notFound } from "next/navigation";
import ProductCard from "@/components/productcard";
import { getProductsByCategorySlug } from "@/lib/actions/products";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  try {
    // Fetch products for this category from Supabase
    const categoryProducts = await getProductsByCategorySlug(slug);

    // Get category name from slug for display
    const categoryName = slug.replace(/-/g, " ").replace(/\band\b/g, "&");

    if (categoryProducts.length === 0) {
      // Instead of notFound(), show a helpful message
      return (
        <div className="w-full px-4 py-8">
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found in this category
            </h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any products in the "{categoryName}" category.
            </p>
            <p className="text-sm text-gray-500">
              This might be because the category is empty or there's a mismatch
              in the category name.
            </p>
            <div className="mt-6">
              <a
                href="/categories"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                ← Back to all categories
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Get category name from first product - handle the categories object structure
    const firstProduct = categoryProducts[0] as any;
    const displayCategoryName = firstProduct?.categories?.name || categoryName;

    return (
      <div className="w-full px-4 py-8">
        <h1 className="text-3xl font-bold capitalize mb-6">
          {displayCategoryName}
        </h1>

        <p className="text-gray-600 mb-6">
          {categoryProducts.length} product
          {categoryProducts.length !== 1 ? "s" : ""} found
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoryProducts.map((product: any, i) => {
            // Extract actual price from the database
            let price = 0;
            let originalPrice = 0;
            let priceUnit = "";

            if (
              product.selling_type === "weight" &&
              product.weight_options?.length > 0
            ) {
              // Find the first active weight option
              const activeOption = product.weight_options.find(
                (opt: any) => opt.isActive
              );
              if (activeOption) {
                price = parseFloat(activeOption.price) || 0;
                originalPrice = price;
                priceUnit = `/${activeOption.weight}`;
              }
            } else if (
              product.selling_type === "piece" &&
              product.piece_options?.length > 0
            ) {
              // Find the first active piece option
              const activeOption = product.piece_options.find(
                (opt: any) => opt.isActive
              );
              if (activeOption) {
                price = parseFloat(activeOption.price) || 0;
                originalPrice = price;
                priceUnit = `/${activeOption.quantity}`;
              }
            } else if (
              product.selling_type === "both" &&
              (product.weight_options?.length > 0 ||
                product.piece_options?.length > 0)
            ) {
              // For "both" type, try weight first, then piece
              if (product.weight_options?.length > 0) {
                const activeWeightOption = product.weight_options.find(
                  (opt: any) => opt.isActive
                );
                if (activeWeightOption) {
                  price = parseFloat(activeWeightOption.price) || 0;
                  originalPrice = price;
                  priceUnit = `/${activeWeightOption.weight}`;
                }
              }
              if (price === 0 && product.piece_options?.length > 0) {
                const activePieceOption = product.piece_options.find(
                  (opt: any) => opt.isActive
                );
                if (activePieceOption) {
                  price = parseFloat(activePieceOption.price) || 0;
                  originalPrice = price;
                  priceUnit = `/${activePieceOption.quantity}`;
                }
              }
            }

            // Apply offer if available
            if (product.has_offer && product.offer_percentage && price > 0) {
              originalPrice = price;
              price = price * (1 - product.offer_percentage / 100);
            }

            // If no price found, use a fallback
            if (price <= 0) {
              price = 100; // Fallback price
              priceUnit = "";
            }

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                rating={4.5}
                imageUrl={product.banner_image || "/images/categories/cake.png"}
                price={price}
                originalPrice={
                  originalPrice > price ? originalPrice : undefined
                }
                isVeg={product.is_veg}
                description={product.name}
                category={product.categories?.name}
                hasOffer={product.has_offer}
                offerPercentage={product.offer_percentage}
                priority={i < 4}
              />
            );
          })}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading category page:", error);
    return (
      <div className="w-full px-4 py-8">
        <h1 className="text-3xl font-bold capitalize mb-6">
          {slug.replace("-", " ")}
        </h1>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            Sorry, we encountered an error while loading the products.
          </p>
          <p className="text-sm text-gray-500">
            Please try again later or contact support if the problem persists.
          </p>
          <div className="mt-6">
            <a
              href="/categories"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to all categories
            </a>
          </div>
        </div>
      </div>
    );
  }
}
