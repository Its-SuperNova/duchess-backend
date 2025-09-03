import SearchClient from "./search-client";
import { getCategories } from "@/lib/actions/categories";
import { getThumbnailUrl } from "@/lib/cloudinary-client";

export default async function SearchPage() {
  // Fetch categories from database
  let categories = [];
  try {
    const dbCategories = await getCategories();
    // Filter only active categories and transform the data structure
    categories = dbCategories
      .filter((category: any) => (category as any).is_active)
      .map((category: any) => ({
        name: (category as any).name,
        image: (category as any).image
          ? getThumbnailUrl((category as any).image, 300)
          : "/images/categories/sweets-bowl.png", // fallback image
      }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    // Fallback to a default set if database fetch fails
    categories = [
      { name: "Cup Cake", image: "/images/categories/cupcake.png" },
      { name: "Cookies", image: "/images/categories/cookies.png" },
      { name: "Donuts", image: "/images/categories/pink-donut.png" },
      { name: "Breads", image: "/images/categories/bread.png" },
      { name: "Pastry", image: "/images/categories/croissant.png" },
      { name: "Sweets", image: "/images/categories/sweets-bowl.png" },
      { name: "Chocolate", image: "/images/categories/chocolate-bar.png" },
      { name: "Muffins", image: "/images/categories/muffin.png" },
      { name: "Cake", image: "/images/categories/cake.png" },
      { name: "Brownies", image: "/images/categories/brownie.png" },
    ];
  }

  return <SearchClient categories={categories} />;
}
