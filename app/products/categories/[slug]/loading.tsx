import { ProductSkeletonGrid } from "@/components/ui/product-skeleton";

export default function CategoryLoading() {
  return (
    <div className="w-full px-4 py-8">
      <div className="max-w-[1200px] mx-auto md:px-4">
        <div className="mb-6">
          <div className="h-9 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
        <ProductSkeletonGrid count={8} />
      </div>
    </div>
  );
}
