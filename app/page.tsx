import HomeClient from "./home-client";
import { getHomepageProducts } from "@/lib/actions/products";
import { processHomepageProduct } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Duchess Pastries - Premium Bakery & Pastry Shop",
  description:
    "Discover delicious pastries, cakes, and baked goods from Duchess Pastries. Fresh, handmade treats delivered to your doorstep.",
  keywords: "pastries, cakes, bakery, desserts, delivery, Coimbatore",
  openGraph: {
    title: "Duchess Pastries - Premium Bakery & Pastry Shop",
    description:
      "Discover delicious pastries, cakes, and baked goods from Duchess Pastries. Fresh, handmade treats delivered to your doorstep.",
    type: "website",
    locale: "en_IN",
  },
};

export default async function Home() {
  // Server-side prefetch only minimal product data to avoid ISR size issues
  const initial = await getHomepageProducts({ limit: 8, offset: 0 });
  const initialProducts = (initial || []).map(processHomepageProduct);

  return (
    <div>
      <HomeClient initialProducts={initialProducts} />
    </div>
  );
}
