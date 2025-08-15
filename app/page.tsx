import HomeClient from "./home-client";
import { getActiveProducts } from "@/lib/actions/products";
import { processProductForHomepage } from "@/lib/utils";

export default async function Home() {
  // Server-side prefetch the first page of products to speed up first paint
  const initial = await getActiveProducts({ limit: 12, offset: 0 });
  const initialProducts = (initial || []).map(processProductForHomepage);
  return (
    <div>
      <HomeClient initialProducts={initialProducts} />
    </div>
  );
}
