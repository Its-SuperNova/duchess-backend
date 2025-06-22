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
        id: category.id,
        name: category.name,
        image: category.image || "/images/categories/sweets-bowl.png", // fallback image
      }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    // Fallback to a default set if database fetch fails
    categories = [
      {
        id: "cup-cake",
        name: "Cup Cake",
        image: "/images/categories/cupcake.png",
      },
      {
        id: "cookies",
        name: "Cookies",
        image: "/images/categories/cookies.png",
      },
      {
        id: "donuts",
        name: "Donuts",
        image: "/images/categories/pink-donut.png",
      },
      { id: "breads", name: "Breads", image: "/images/categories/bread.png" },
      {
        id: "pastry",
        name: "Pastry",
        image: "/images/categories/croissant.png",
      },
      {
        id: "sweets",
        name: "Sweets",
        image: "/images/categories/sweets-bowl.png",
      },
      {
        id: "chocolate",
        name: "Chocolate",
        image: "/images/categories/chocolate-bar.png",
      },
      {
        id: "muffins",
        name: "Muffins",
        image: "/images/categories/muffin.png",
      },
      { id: "cake", name: "Cake", image: "/images/categories/cake.png" },
      {
        id: "brownies",
        name: "Brownies",
        image: "/images/categories/brownie.png",
      },
    ];
  }

  return <CategoriesClient categories={categories} />;
}
