import { homepageProductCards } from "@/data/homepage-product-cards";
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
  // Convert homepage product cards to ProcessedProduct format
  const initialProducts = homepageProductCards.map((product) => ({
    id: product.id,
    name: product.name,
    rating: 4.5, // Default rating
    imageUrl: product.image,
    price: parseInt(product.price.replace("₹", "")),
    originalPrice: undefined,
    isVeg: product.veg,
    description: `Delicious ${product.name.toLowerCase()} made with premium ingredients`,
    category: product.category,
    hasOffer: false,
    offerPercentage: undefined,
    categories: {
      id: product.id,
      name: product.category,
    },
  }));

  return <HomeClient initialProducts={initialProducts} />;
}
