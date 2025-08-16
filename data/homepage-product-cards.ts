// Types for homepage product card data
export interface HomepageProductCard {
  id: string;
  name: string;
  category: string;
  price: string;
  veg: boolean;
  image: string;
}

export const homepageProductCards: HomepageProductCard[] = [
  {
    id: "a3878b07-e31c-4d95-81cf-3cb17a7ffb05",
    name: "Italian Tiramisu",
    category: "Cakes",
    price: "₹350",
    veg: true,
    image: "/images/products/product-2-banner.jpg",
  },
  {
    id: "651a0b1e-49ad-4c40-b96e-385ad427aa04",
    name: "Chocolate Cherry Cake",
    category: "Cakes",
    price: "₹290",
    veg: false,
    image: "/images/products/product-15-banner.jpg",
  },
  {
    id: "ed345fae-0a78-43e6-a59b-52eea843c24a",
    name: "Chocolate Pistachio Melting Cake",
    category: "Cakes",
    price: "₹380",
    veg: false,
    image: "/images/products/product-16-banner.jpg",
  },
  {
    id: "845fe0a9-153d-4eb4-864e-b765793f66be",
    name: "Chocolate Soft Center",
    category: "Cakes",
    price: "₹50",
    veg: false,
    image: "/images/products/product-35-banner.jpg",
  },
  {
    id: "6730b6c8-cd62-4133-bc1c-8a778c69a921",
    name: "Chocolate Pistachios Bar",
    category: "Chocolates",
    price: "₹500",
    veg: true,
    image: "/images/products/product-36-banner.jpg",
  },
  {
    id: "f7b684b5-d65c-4844-b6da-39225a5cd008",
    name: "Granola Bar",
    category: "Snacks",
    price: "₹40",
    veg: true,
    image: "/images/products/granola-bar-banner.jpg",
  },
  {
    id: "f7b684b5-d65c-4844-b6da-39225a5cd010",
    name: "Mandola",
    category: "Traditional Sweets",
    price: "₹15",
    veg: true,
    image: "/images/products/mandola-banner.jpg",
  },
  {
    id: "f7b684b5-d65c-4844-b6da-39225a5cd012",
    name: "Blueberry Chilled Cheese Cake",
    category: "Cakes",
    price: "₹480",
    veg: true,
    image: "/images/products/blueberry-cheesecake-banner.jpg",
  },
  {
    id: "f7b684b5-d65c-4844-b6da-39225a5cd013",
    name: "Tiramisu",
    category: "Cakes",
    price: "₹380",
    veg: true,
    image: "/images/products/tiramisu-banner.jpg",
  },
  {
    id: "e6081571-704a-4cd6-9da0-a88437cf02de",
    name: "Oatmeal Raisin Cookies",
    category: "Cookies",
    price: "₹25",
    veg: true,
    image: "/images/products/oatmeal-raisin-banner.jpg",
  },
  {
    id: "f7b684b5-d65c-4844-b6da-39225a5cd006",
    name: "Strawberry Chilled Cheese Cake",
    category: "Cakes",
    price: "₹450",
    veg: true,
    image: "/images/products/strawberry-cheesecake-banner.jpg",
  },
  {
    id: "f7b684b5-d65c-4844-b6da-39225a5cd007",
    name: "Opera",
    category: "Cakes",
    price: "₹600",
    veg: true,
    image: "/images/products/opera-banner.jpg",
  },
];

// Utility functions for product cards
export const getProductCardById = (
  id: string
): HomepageProductCard | undefined => {
  return homepageProductCards.find((product) => product.id === id);
};

export const getProductCardsByCategory = (
  category: string
): HomepageProductCard[] => {
  return homepageProductCards.filter(
    (product) => product.category === category
  );
};

export const getVegetarianProductCards = (): HomepageProductCard[] => {
  return homepageProductCards.filter((product) => product.veg);
};

export const getProductCardsByPriceRange = (
  minPrice: number,
  maxPrice: number
): HomepageProductCard[] => {
  return homepageProductCards.filter((product) => {
    const price = parseInt(product.price.replace("₹", ""));
    return price >= minPrice && price <= maxPrice;
  });
};

// Get all available categories
export const getAvailableCategories = (): string[] => {
  const categories = homepageProductCards.map((product) => product.category);
  return [...new Set(categories)]; // Remove duplicates
};

// Get products sorted by price (low to high)
export const getProductCardsSortedByPrice = (): HomepageProductCard[] => {
  return [...homepageProductCards].sort((a, b) => {
    const priceA = parseInt(a.price.replace("₹", ""));
    const priceB = parseInt(b.price.replace("₹", ""));
    return priceA - priceB;
  });
};

// Get products sorted by name (A to Z)
export const getProductCardsSortedByName = (): HomepageProductCard[] => {
  return [...homepageProductCards].sort((a, b) => a.name.localeCompare(b.name));
};
