import { getHomepageProducts } from "@/lib/actions/products";
import { processProductForHomepage } from "@/lib/utils";
import HomeClient from "./home-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Duchess Pastries - Premium Cakes & Entremets",
  description:
    "Discover our finest selection of cakes, entremets, and premium pastries from Duchess Pastries. Handcrafted with love and delivered fresh to your doorstep.",
  keywords:
    "cakes, entremets, pastries, bakery, desserts, delivery, Coimbatore",
  openGraph: {
    title: "Duchess Pastries - Premium Cakes & Entremets",
    description:
      "Discover our finest selection of cakes, entremets, and premium pastries from Duchess Pastries. Handcrafted with love and delivered fresh to your doorstep.",
    type: "website",
    locale: "en_IN",
  },
};

export default async function Home() {
  // Server-side prefetch only minimal product data to avoid ISR size issues
  const initial = await getHomepageProducts({ limit: 12, offset: 0 }); // Exactly 12 featured products
  const initialProducts = (initial || []).map(processProductForHomepage);

  return (
    <div>
      <HomeClient initialProducts={initialProducts} />
    </div>
  );
}
