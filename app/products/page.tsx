import { getActiveProducts } from "@/lib/actions/products";
import AllProductsClient from "./all-products-client";

// ✅ This is an SSG function – products get prebuilt at build time
//    Change to "force-dynamic" export if you want SSR instead
export const revalidate = 60; // ISR (revalidate every 60 seconds)

export default async function AllProductsPage() {
  // ✅ Prefetch products on the server - get more initial products
  const products = await getActiveProducts({ limit: 24, offset: 0 });

  return <AllProductsClient initialProducts={products} />;
}
