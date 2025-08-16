import { ProductSkeletonGrid } from "@/components/ui/product-skeleton";

export default function AllProductsLoading() {
  return (
    <div className="w-full px-4 py-8">
      <div className="max-w-[1200px] mx-auto md:px-4">
        <div className="mb-6">
          <div className="h-9 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <ProductSkeletonGrid count={8} />
      </div>
    </div>
  );
}
