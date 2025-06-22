import { getActiveProducts } from "@/lib/actions/products";
import ProductCard from "@/components/productcard";
import { notFound } from "next/navigation";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  // Get categoryId from query params
  const categoryId = searchParams?.category;

  // Fetch all active products
  const products = await getActiveProducts();

  // Filter by categoryId if provided
  const filteredProducts = categoryId
    ? products.filter((product) => product.categories?.id === categoryId)
    : products;

  // Optionally, show notFound if category is set but no products found
  if (categoryId && filteredProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-2">No products found</h2>
        <p className="text-gray-500">No products found for this category.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">
        {categoryId ? "Products in this Category" : "All Products"}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}
