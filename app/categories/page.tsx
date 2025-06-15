import CategoriesClient from "./categories-client";
import { getCategories } from "@/lib/actions/categories";

export default async function CategoriesPage() {
  // Fetch categories from database
  let categories = [];
  try {
    const dbCategories = await getCategories();
    // Filter only active categories and transform the data structure
    categories = dbCategories
      .filter((category) => category.is_active)
      .map((category) => ({
        name: category.name,
        image: category.image || "/images/categories/sweets-bowl.png", // fallback image
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

  return <CategoriesClient categories={categories} />;
}
