// Types for product data
export interface WeightOption {
  price: string;
  stock: string;
  weight: string;
  isActive: boolean;
}

export interface PieceOption {
  price: string;
  stock: string;
  isActive: boolean;
  quantity: string;
}

export interface Product {
  id: string;
  name: string;
  short_description: string;
  long_description: string;
  category_id: string;
  is_veg: boolean;
  has_offer: boolean;
  offer_percentage: number | null;
  offer_up_to_price: string;
  banner_image: string;
  additional_images: string[];
  selling_type: string;
  weight_options: WeightOption[];
  piece_options: PieceOption[];
  calories: number;
  net_weight: number;
  protein: string;
  fats: string;
  carbs: string;
  sugars: string;
  fiber: string;
  sodium: number;
  add_text_on_cake: boolean;
  add_candles: boolean;
  add_knife: boolean;
  add_message_card: boolean;
  delivery_option: string;
  highlights: string[];
  ingredients: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  show_on_home: boolean;
}

// Homepage products data (products with show_on_home=true)
export const homepageProducts: Product[] = [
  {
    id: "a3878b07-e31c-4d95-81cf-3cb17a7ffb05",
    name: "Italian Tiramisu",
    short_description:
      "Indulge in Italy's most beloved dessert—our authentic Tiramisu, crafted with layers of delicate ladyfinger biscuits, luxuriously soaked in freshly brewed espresso. Between each layer rests a cloud of silky mascarpone cream, whipped to perfection and kissed with a hint of rich cocoa.",
    long_description:
      "Every bite offers a harmonious dance of bold coffee, creamy sweetness, and airy lightness. Finished with a generous dusting of premium dark cocoa, this classic creation is a timeless ode to elegance and indulgence best enjoyed slowly, with a smile.",
    category_id: "f7b684b5-d65c-4844-b6da-39225a5cd005",
    is_veg: true,
    has_offer: false,
    offer_percentage: null,
    offer_up_to_price: "0.00",
    banner_image: "/images/products/product-2-banner.jpg",
    additional_images: ["/images/products/product-2-1.jpg"],
    selling_type: "piece",
    weight_options: [],
    piece_options: [
      {
        price: "350",
        stock: "10",
        isActive: true,
        quantity: "1 piece",
      },
    ],
    calories: 570,
    net_weight: 200,
    protein: "10.00",
    fats: "36.00",
    carbs: "50.00",
    sugars: "32.00",
    fiber: "2.00",
    sodium: 100,
    add_text_on_cake: false,
    add_candles: false,
    add_knife: false,
    add_message_card: true,
    delivery_option: "both",
    highlights: [
      "Authentic Italian Recipe",
      "Premium Espresso Soak",
      "Luxurious Mascarpone Cream",
      "No-Bake Indulgence",
      "Elegant Cocoa Finish",
      "Perfect for Any Occasion",
    ],
    ingredients: [
      "Italian Savoiardi Ladyfinger Biscuits",
      "Freshly Brewed Premium Espresso",
      "Mascarpone Cheese",
      "Organic Free-Range Egg Yolks",
      "Pure Vanilla Extract",
      "Dark Cocoa Powder",
    ],
    is_active: true,
    created_at: "2025-08-09 09:40:04.459194+00",
    updated_at: "2025-08-15 04:58:01.145616+00",
    show_on_home: true,
  },
  {
    id: "e6081571-704a-4cd6-9da0-a88437cf02de",
    name: "Oatmeal Raisin Cookies",
    short_description:
      "Classic comfort cookies with chewy oats and plump raisins, perfect for a wholesome treat.",
    long_description:
      "Our Oatmeal Raisin Cookies are a timeless favorite that combines the wholesome goodness of oats with the natural sweetness of plump raisins. Each cookie is baked to perfection with a soft, chewy center and slightly crisp edges. Made with real butter and pure vanilla extract, these cookies offer a comforting taste that's perfect for any time of day.",
    category_id: "9a4724f3-01a7-4087-8f57-161cca83504d",
    is_veg: true,
    has_offer: false,
    offer_percentage: null,
    offer_up_to_price: "0.00",
    banner_image: "/images/products/oatmeal-raisin-banner.jpg",
    additional_images: [
      "/images/products/oatmeal-raisin-1.jpg",
      "/images/products/oatmeal-raisin-2.jpg",
    ],
    selling_type: "both",
    weight_options: [
      {
        price: "300",
        stock: "15",
        weight: "250g",
        isActive: true,
      },
      {
        price: "550",
        stock: "10",
        weight: "500g",
        isActive: true,
      },
    ],
    piece_options: [
      {
        price: "25",
        stock: "50",
        isActive: true,
        quantity: "1 piece",
      },
    ],
    calories: 420,
    net_weight: 80,
    protein: "6.00",
    fats: "18.00",
    carbs: "65.00",
    sugars: "28.00",
    fiber: "4.00",
    sodium: 250,
    add_text_on_cake: false,
    add_candles: false,
    add_knife: false,
    add_message_card: true,
    delivery_option: "both",
    highlights: [
      "Wholesome Oat Base",
      "Plump Raisins",
      "Chewy Texture",
      "Perfect with Tea or Coffee",
    ],
    ingredients: [
      "Rolled Oats",
      "Raisins",
      "Butter",
      "Brown Sugar",
      "Vanilla Extract",
      "Cinnamon",
    ],
    is_active: true,
    created_at: "2025-07-15 10:00:00.000000+00",
    updated_at: "2025-08-10 14:30:00.000000+00",
    show_on_home: true,
  },
  {
    id: "f7b684b5-d65c-4844-b6da-39225a5cd006",
    name: "Strawberry Chilled Cheese Cake",
    short_description:
      "Creamy cheesecake topped with fresh strawberries, perfect for a refreshing dessert.",
    long_description:
      "Our Strawberry Chilled Cheese Cake is a delightful combination of smooth, creamy cheesecake and fresh, juicy strawberries. The base is made with crushed graham crackers and butter, topped with a rich cream cheese filling that's light and fluffy. Fresh strawberries are arranged on top, creating a beautiful and delicious dessert that's perfect for any occasion.",
    category_id: "f7b684b5-d65c-4844-b6da-39225a5cd005",
    is_veg: true,
    has_offer: false,
    offer_percentage: null,
    offer_up_to_price: "0.00",
    banner_image: "/images/products/strawberry-cheesecake-banner.jpg",
    additional_images: [
      "/images/products/strawberry-cheesecake-1.jpg",
      "/images/products/strawberry-cheesecake-2.jpg",
    ],
    selling_type: "piece",
    weight_options: [],
    piece_options: [
      {
        price: "450",
        stock: "8",
        isActive: true,
        quantity: "1 piece",
      },
    ],
    calories: 380,
    net_weight: 150,
    protein: "8.00",
    fats: "28.00",
    carbs: "32.00",
    sugars: "25.00",
    fiber: "1.00",
    sodium: 180,
    add_text_on_cake: false,
    add_candles: false,
    add_knife: true,
    add_message_card: true,
    delivery_option: "both",
    highlights: [
      "Creamy Texture",
      "Fresh Strawberries",
      "Graham Cracker Base",
      "Perfect for Parties",
    ],
    ingredients: [
      "Cream Cheese",
      "Fresh Strawberries",
      "Graham Crackers",
      "Sugar",
      "Vanilla Extract",
      "Heavy Cream",
    ],
    is_active: true,
    created_at: "2025-07-20 11:00:00.000000+00",
    updated_at: "2025-08-12 16:00:00.000000+00",
    show_on_home: true,
  },
  {
    id: "f7b684b5-d65c-4844-b6da-39225a5cd007",
    name: "Opera",
    short_description:
      "Classic French Opera cake with layers of almond sponge, coffee buttercream, and chocolate ganache.",
    long_description:
      "The Opera cake is a sophisticated French dessert that combines delicate almond sponge layers with rich coffee buttercream and smooth chocolate ganache. Each layer is carefully crafted to create a perfect balance of flavors and textures. This elegant cake is finished with a chocolate glaze and gold leaf decoration, making it a stunning centerpiece for any special occasion.",
    category_id: "f7b684b5-d65c-4844-b6da-39225a5cd005",
    is_veg: true,
    has_offer: false,
    offer_percentage: null,
    offer_up_to_price: "0.00",
    banner_image: "/images/products/opera-banner.jpg",
    additional_images: [
      "/images/products/opera-1.jpg",
      "/images/products/opera-2.jpg",
    ],
    selling_type: "piece",
    weight_options: [],
    piece_options: [
      {
        price: "600",
        stock: "6",
        isActive: true,
        quantity: "1 piece",
      },
    ],
    calories: 520,
    net_weight: 180,
    protein: "12.00",
    fats: "32.00",
    carbs: "48.00",
    sugars: "35.00",
    fiber: "2.00",
    sodium: 120,
    add_text_on_cake: false,
    add_candles: false,
    add_knife: true,
    add_message_card: true,
    delivery_option: "both",
    highlights: [
      "French Classic",
      "Almond Sponge",
      "Coffee Buttercream",
      "Chocolate Ganache",
    ],
    ingredients: [
      "Almond Flour",
      "Coffee Extract",
      "Dark Chocolate",
      "Butter",
      "Eggs",
      "Sugar",
    ],
    is_active: true,
    created_at: "2025-07-25 12:00:00.000000+00",
    updated_at: "2025-08-14 17:00:00.000000+00",
    show_on_home: true,
  },
  {
    id: "f7b684b5-d65c-4844-b6da-39225a5cd008",
    name: "Granola Bar",
    short_description:
      "Nutritious granola bars packed with oats, nuts, and dried fruits for a healthy snack.",
    long_description:
      "Our Granola Bars are a perfect blend of wholesome ingredients including rolled oats, mixed nuts, and dried fruits. These bars are naturally sweetened with honey and provide a great source of fiber and protein. Perfect for breakfast on the go, post-workout fuel, or a healthy afternoon snack. Each bar is individually wrapped for freshness and convenience.",
    category_id: "9a4724f3-01a7-4087-8f57-161cca83504d",
    is_veg: true,
    has_offer: false,
    offer_percentage: null,
    offer_up_to_price: "0.00",
    banner_image: "/images/products/granola-bar-banner.jpg",
    additional_images: [
      "/images/products/granola-bar-1.jpg",
      "/images/products/granola-bar-2.jpg",
    ],
    selling_type: "both",
    weight_options: [
      {
        price: "200",
        stock: "20",
        weight: "100g",
        isActive: true,
      },
    ],
    piece_options: [
      {
        price: "40",
        stock: "30",
        isActive: true,
        quantity: "1 piece",
      },
    ],
    calories: 280,
    net_weight: 60,
    protein: "8.00",
    fats: "12.00",
    carbs: "42.00",
    sugars: "18.00",
    fiber: "5.00",
    sodium: 80,
    add_text_on_cake: false,
    add_candles: false,
    add_knife: false,
    add_message_card: true,
    delivery_option: "both",
    highlights: [
      "High in Fiber",
      "Natural Sweeteners",
      "Mixed Nuts",
      "Perfect for Snacking",
    ],
    ingredients: [
      "Rolled Oats",
      "Mixed Nuts",
      "Dried Fruits",
      "Honey",
      "Coconut Oil",
      "Vanilla Extract",
    ],
    is_active: true,
    created_at: "2025-07-30 13:00:00.000000+00",
    updated_at: "2025-08-16 18:00:00.000000+00",
    show_on_home: true,
  },
  {
    id: "f7b684b5-d65c-4844-b6da-39225a5cd009",
    name: "Chocolate Pistachios Bar",
    short_description:
      "Rich chocolate bars studded with crunchy pistachios for a luxurious treat.",
    long_description:
      "Our Chocolate Pistachios Bars are a decadent combination of premium dark chocolate and crunchy pistachios. The smooth, rich chocolate perfectly complements the nutty flavor and satisfying crunch of the pistachios. These bars are perfect for chocolate lovers who appreciate the sophisticated combination of flavors and textures.",
    category_id: "9a4724f3-01a7-4087-8f57-161cca83504d",
    is_veg: true,
    has_offer: false,
    offer_percentage: null,
    offer_up_to_price: "0.00",
    banner_image: "/images/products/chocolate-pistachios-banner.jpg",
    additional_images: [
      "/images/products/chocolate-pistachios-1.jpg",
      "/images/products/chocolate-pistachios-2.jpg",
    ],
    selling_type: "both",
    weight_options: [
      {
        price: "350",
        stock: "12",
        weight: "150g",
        isActive: true,
      },
    ],
    piece_options: [
      {
        price: "80",
        stock: "25",
        isActive: true,
        quantity: "1 piece",
      },
    ],
    calories: 450,
    net_weight: 100,
    protein: "6.00",
    fats: "28.00",
    carbs: "48.00",
    sugars: "38.00",
    fiber: "3.00",
    sodium: 60,
    add_text_on_cake: false,
    add_candles: false,
    add_knife: false,
    add_message_card: true,
    delivery_option: "both",
    highlights: [
      "Premium Dark Chocolate",
      "Crunchy Pistachios",
      "Rich Flavor",
      "Perfect Gift",
    ],
    ingredients: [
      "Dark Chocolate",
      "Pistachios",
      "Cocoa Butter",
      "Sugar",
      "Vanilla Extract",
    ],
    is_active: true,
    created_at: "2025-08-01 14:00:00.000000+00",
    updated_at: "2025-08-18 19:00:00.000000+00",
    show_on_home: true,
  },
  {
    id: "f7b684b5-d65c-4844-b6da-39225a5cd010",
    name: "Mandola",
    short_description:
      "Traditional Indian sweet made with gram flour and sugar, perfect for festive occasions.",
    long_description:
      "Mandola is a traditional Indian sweet that combines the nutty flavor of gram flour with the sweetness of sugar syrup. These bite-sized treats are deep-fried to perfection and then soaked in sugar syrup, creating a delightful combination of crispy texture and sweet flavor. Perfect for Diwali, Holi, or any festive celebration.",
    category_id: "9a4724f3-01a7-4087-8f57-161cca83504d",
    is_veg: true,
    has_offer: false,
    offer_percentage: null,
    offer_up_to_price: "0.00",
    banner_image: "/images/products/mandola-banner.jpg",
    additional_images: [
      "/images/products/mandola-1.jpg",
      "/images/products/mandola-2.jpg",
    ],
    selling_type: "both",
    weight_options: [
      {
        price: "250",
        stock: "18",
        weight: "200g",
        isActive: true,
      },
    ],
    piece_options: [
      {
        price: "15",
        stock: "40",
        isActive: true,
        quantity: "1 piece",
      },
    ],
    calories: 320,
    net_weight: 80,
    protein: "4.00",
    fats: "15.00",
    carbs: "52.00",
    sugars: "42.00",
    fiber: "2.00",
    sodium: 45,
    add_text_on_cake: false,
    add_candles: false,
    add_knife: false,
    add_message_card: true,
    delivery_option: "both",
    highlights: [
      "Traditional Recipe",
      "Gram Flour Base",
      "Sugar Syrup Soaked",
      "Festive Favorite",
    ],
    ingredients: [
      "Gram Flour",
      "Sugar",
      "Ghee",
      "Cardamom",
      "Saffron",
      "Water",
    ],
    is_active: true,
    created_at: "2025-08-05 15:00:00.000000+00",
    updated_at: "2025-08-20 20:00:00.000000+00",
    show_on_home: true,
  },
  {
    id: "f7b684b5-d65c-4844-b6da-39225a5cd011",
    name: "Chocolate Soft Center",
    short_description:
      "Chocolate truffles with a soft, melt-in-your-mouth center and rich cocoa coating.",
    long_description:
      "Our Chocolate Soft Center truffles are a luxurious treat featuring a velvety smooth chocolate ganache center coated in rich cocoa powder. Each truffle melts in your mouth, releasing layers of chocolate flavor. These elegant confections are perfect for special occasions, gifts, or as an indulgent treat for chocolate connoisseurs.",
    category_id: "9a4724f3-01a7-4087-8f57-161cca83504d",
    is_veg: true,
    has_offer: false,
    offer_percentage: null,
    offer_up_to_price: "0.00",
    banner_image: "/images/products/chocolate-soft-center-banner.jpg",
    additional_images: [
      "/images/products/chocolate-soft-center-1.jpg",
      "/images/products/chocolate-soft-center-2.jpg",
    ],
    selling_type: "piece",
    weight_options: [],
    piece_options: [
      {
        price: "25",
        stock: "60",
        isActive: true,
        quantity: "1 piece",
      },
    ],
    calories: 180,
    net_weight: 30,
    protein: "2.00",
    fats: "12.00",
    carbs: "18.00",
    sugars: "15.00",
    fiber: "1.00",
    sodium: 25,
    add_text_on_cake: false,
    add_candles: false,
    add_knife: false,
    add_message_card: true,
    delivery_option: "both",
    highlights: [
      "Velvety Texture",
      "Rich Cocoa Coating",
      "Melt-in-Mouth",
      "Premium Quality",
    ],
    ingredients: [
      "Dark Chocolate",
      "Heavy Cream",
      "Cocoa Powder",
      "Vanilla Extract",
      "Butter",
    ],
    is_active: true,
    created_at: "2025-08-08 16:00:00.000000+00",
    updated_at: "2025-08-22 21:00:00.000000+00",
    show_on_home: true,
  },
  {
    id: "f7b684b5-d65c-4844-b6da-39225a5cd012",
    name: "Blueberry Chilled Cheese Cake",
    short_description:
      "Creamy cheesecake topped with fresh blueberries and a sweet blueberry compote.",
    long_description:
      "Our Blueberry Chilled Cheese Cake features a smooth, creamy cheesecake base topped with fresh blueberries and a homemade blueberry compote. The combination of tangy cream cheese and sweet blueberries creates a perfect balance of flavors. This chilled dessert is refreshing and perfect for warm weather or any time you crave a light, fruity treat.",
    category_id: "f7b684b5-d65c-4844-b6da-39225a5cd005",
    is_veg: true,
    has_offer: false,
    offer_percentage: null,
    offer_up_to_price: "0.00",
    banner_image: "/images/products/blueberry-cheesecake-banner.jpg",
    additional_images: [
      "/images/products/blueberry-cheesecake-1.jpg",
      "/images/products/blueberry-cheesecake-2.jpg",
    ],
    selling_type: "piece",
    weight_options: [],
    piece_options: [
      {
        price: "480",
        stock: "7",
        isActive: true,
        quantity: "1 piece",
      },
    ],
    calories: 420,
    net_weight: 160,
    protein: "9.00",
    fats: "30.00",
    carbs: "35.00",
    sugars: "28.00",
    fiber: "2.00",
    sodium: 200,
    add_text_on_cake: false,
    add_candles: false,
    add_knife: true,
    add_message_card: true,
    delivery_option: "both",
    highlights: [
      "Fresh Blueberries",
      "Creamy Texture",
      "Blueberry Compote",
      "Refreshing Dessert",
    ],
    ingredients: [
      "Cream Cheese",
      "Fresh Blueberries",
      "Graham Crackers",
      "Sugar",
      "Vanilla Extract",
      "Heavy Cream",
    ],
    is_active: true,
    created_at: "2025-08-10 17:00:00.000000+00",
    updated_at: "2025-08-24 22:00:00.000000+00",
    show_on_home: true,
  },
  {
    id: "f7b684b5-d65c-4844-b6da-39225a5cd013",
    name: "Tiramisu",
    short_description:
      "Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream.",
    long_description:
      "Our Tiramisu is a classic Italian dessert that combines coffee-soaked ladyfinger biscuits with a rich, creamy mascarpone filling. Each layer is carefully assembled to create the perfect balance of coffee flavor and creamy sweetness. Topped with a dusting of cocoa powder, this elegant dessert is perfect for dinner parties or as a sophisticated end to any meal.",
    category_id: "f7b684b5-d65c-4844-b6da-39225a5cd005",
    is_veg: true,
    has_offer: false,
    offer_percentage: null,
    offer_up_to_price: "0.00",
    banner_image: "/images/products/tiramisu-banner.jpg",
    additional_images: [
      "/images/products/tiramisu-1.jpg",
      "/images/products/tiramisu-2.jpg",
    ],
    selling_type: "piece",
    weight_options: [],
    piece_options: [
      {
        price: "380",
        stock: "9",
        isActive: true,
        quantity: "1 piece",
      },
    ],
    calories: 450,
    net_weight: 180,
    protein: "8.00",
    fats: "28.00",
    carbs: "42.00",
    sugars: "30.00",
    fiber: "1.00",
    sodium: 150,
    add_text_on_cake: false,
    add_candles: false,
    add_knife: true,
    add_message_card: true,
    delivery_option: "both",
    highlights: [
      "Coffee Flavored",
      "Mascarpone Cream",
      "Ladyfinger Biscuits",
      "Italian Classic",
    ],
    ingredients: [
      "Ladyfinger Biscuits",
      "Mascarpone Cheese",
      "Coffee",
      "Eggs",
      "Sugar",
      "Cocoa Powder",
    ],
    is_active: true,
    created_at: "2025-08-12 18:00:00.000000+00",
    updated_at: "2025-08-26 23:00:00.000000+00",
    show_on_home: true,
  },
];

// Export individual products for easy access
export const getHomepageProduct = (id: string): Product | undefined => {
  return homepageProducts.find((product) => product.id === id);
};

export const getHomepageProductsByCategory = (
  categoryId: string
): Product[] => {
  return homepageProducts.filter(
    (product) => product.category_id === categoryId
  );
};

export const getVegetarianHomepageProducts = (): Product[] => {
  return homepageProducts.filter((product) => product.is_veg);
};

export const getHomepageProductsWithOffers = (): Product[] => {
  return homepageProducts.filter((product) => product.has_offer);
};
