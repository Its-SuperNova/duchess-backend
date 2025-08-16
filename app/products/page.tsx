import { getActiveProducts } from "@/lib/actions/products";
import AllProductsClient from "./all-products-client";

// Force dynamic rendering to avoid ISR size limits
export const dynamic = "force-dynamic";

export default async function AllProductsPage() {
  // ✅ Prefetch products on the server - keep small for ISR
  const products = await getActiveProducts({ limit: 8, offset: 0 });

  return <AllProductsClient initialProducts={products} />;
}
