import { getHomepageSectionsWithProducts } from "@/lib/actions/products";
import { processProductForHomepage } from "@/lib/utils";
import HomeClient from "./home-client";
import { Metadata } from "next";

// Cache this page for 1 hour (3600 seconds)
export const revalidate = 3600;

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
  try {
    // Fetch sections with their products from database
    const sectionsWithProducts = await getHomepageSectionsWithProducts();

    // Process sections and their products to match the expected format
    const processedSections = sectionsWithProducts.map((section) => ({
      ...section,
      products: section.products.map((product) =>
        processProductForHomepage(product)
      ),
    }));

    return <HomeClient sectionsWithProducts={processedSections} />;
  } catch (error) {
    console.error("Error fetching homepage sections:", error);

    // Fallback to empty array if database fetch fails
    return <HomeClient sectionsWithProducts={[]} />;
  }
}
