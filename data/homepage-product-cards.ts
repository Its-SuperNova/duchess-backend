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
    id: "94065427-4f41-4720-a69b-febc24ddcf3f",
    name: "Chocolate Pistachio Melting Cake (1pc)",
    category: "Cakes",
    price: "₹380",
    veg: false,
    image: "/images/homePage-Product/Chocolate-Pistachio-MeltingCake.jpg",
  },
  {
    id: "6dda8c9d-f5f1-49af-9b42-7f8523b6997f",
    name: "Chocolate Cherry Cake (1pc)",
    category: "Cakes",
    price: "₹290",
    veg: false,
    image: "/images/homePage-Product/Chocolate-CherryCake.jpg",
  },
  {
    id: "a3878b07-e31c-4d95-81cf-3cb17a7ffb05",
    name: "⁠Italian Tiramisu (1pc)",
    category: "Cakes",
    price: "₹350",
    veg: false,
    image: "/images/homePage-Product/ItalianTiramisu.jpg",
  },
  {
    id: "bfdfe079-6592-48bd-8d4d-64b30096ad33",
    name: "Opera (1pc)",
    category: "Cakes",
    price: "₹450",
    veg: false,
    image: "/images/homePage-Product/Opera1.jpg",
  },
  {
    id: "608b0154-31b2-44b5-8794-1d06364c1f4e",
    name: "Chilled Blueberry Cheesecake (1pc)",
    category: "Cakes",
    price: "₹500",
    veg: true,
    image: "/images/homePage-Product/Chilled-Blueberry-Cheesecake.jpg",
  },
  {
    id: "39dbc13b-5080-4162-bd81-f4c594a02078",
    name: "Chilled Mango Cheese cake (1pc)",
    category: "Cakes",
    price: "₹300",
    veg: true,
    image: "/images/homePage-Product/Chilled-Mango-Cheese-Cake.jpg",
  },
  {
    id: "d64cdb0a-f32b-4eb4-82a4-93bb752cb789",
    name: "Chilled Strawberry Cheese cake (1pc)",
    category: "Cakes",
    price: "₹300",
    veg: true,
    image: "/images/homePage-Product/Chilled Strawberry-Cheese-Cake.jpg",
  },
  {
    id: "b0f94ead-12f0-40e4-a15b-435874d5ede5",
    name: "Biscotti (250g)",
    category: "Brownies & Brookies",
    price: "₹265",
    veg: true,
    image: "/images/homePage-Product/Biscotti.jpg",
  },
  {
    id: "f3bcfaa6-7cc2-4940-92ec-a2e974aa1ce3",
    name: "⁠Chocolate Soft Centered Cookies(250g)",
    category: "Cookies",
    price: "₹415",
    veg: true,
    image: "/images/homePage-Product/Chocolate-Soft-Centered-Cookies.jpg",
  },
  {
    id: "2d502f52-d7a3-470f-976d-f49605f8704a",
    name: "⁠Assorted Chocolate Gift Box (200g)",
    category: "Chocolates",
    price: "₹445",
    veg: true,
    image: "/images/homePage-Product/Assorted-Chocolate-Gift-Box.jpg",
  },
  {
    id: "d2f186af-0a38-422a-b9b4-46babc77b87c",
    name: "Butter Diamond cookies(250g)",
    category: "Cakes",
    price: "₹355",
    veg: true,
    image: "/images/homePage-Product/Butter-Diamond-Cookies.jpg",
  },
  {
    id: "709ae633-e634-481f-beb3-13cd72aa40f8",
    name: "Chocolate Chocochip Brookies (1pc)",
    category: "Brownies & Brookies",
    price: "₹150",
    veg: true,
    image: "/images/homePage-Product/Chocolate-Chocochip-Brookies.jpg",
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
