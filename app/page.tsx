import HomeClient from "./home-client";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  // Product data for the home page
  const products = [
    {
      id: 1,
      name: "Red Velvet Cake",
      rating: 4.8,
      imageUrl: "/red-velvet-cheesecake.png",
      price: 499,
      isVeg: true,
      description:
        "Layered with creamy cheesecake, made with cocoa, cream cheese, and vanilla.",
    },
    {
      id: 2,
      name: "Chocolate Eclair",
      rating: 4.7,
      imageUrl: "/classic-chocolate-eclair.png",
      price: 299,
      isVeg: true,
      description:
        "Crisp choux pastry filled with rich chocolate cream and topped with chocolate glaze.",
    },
    {
      id: 3,
      name: "Strawberry Cheesecake",
      rating: 4.9,
      imageUrl: "/classic-strawberry-cheesecake.png",
      price: 549,
      isVeg: true,
      description:
        "Creamy cheesecake with a graham cracker crust topped with fresh strawberry compote.",
    },
    {
      id: 4,
      name: "Lemon Tart",
      rating: 4.6,
      imageUrl: "/bright-lemon-tart.png",
      price: 349,
      isVeg: true,
      description:
        "Buttery pastry shell filled with tangy lemon curd and dusted with powdered sugar.",
    },
    {
      id: 5,
      name: "Raspberry Macarons",
      rating: 4.8,
      imageUrl: "/vibrant-raspberry-macarons.png",
      price: 399,
      isVeg: true,
      description:
        "Delicate almond meringue cookies filled with raspberry buttercream.",
    },
    {
      id: 6,
      name: "Chocolate Chip Cookies",
      rating: 4.7,
      imageUrl: "/classic-chocolate-chip-cookies.png",
      price: 249,
      isVeg: true,
      description:
        "Classic cookies loaded with premium chocolate chips and baked to golden perfection.",
    },
    {
      id: 7,
      name: "Vanilla Cake",
      rating: 4.5,
      imageUrl: "/classic-vanilla-cake.png",
      price: 449,
      isVeg: true,
      description:
        "Light and fluffy vanilla sponge cake with smooth buttercream frosting.",
    },
    {
      id: 8,
      name: "Chocolate Brownie",
      rating: 4.9,
      imageUrl: "/decadent-chocolate-brownie.png",
      price: 299,
      isVeg: true,
      description:
        "Rich, fudgy chocolate brownie with a crackly top and gooey center.",
    },
    {
      id: 9,
      name: "Strawberry Cupcake",
      rating: 4.6,
      imageUrl: "/frosted-strawberry-cupcake.png",
      price: 279,
      isVeg: true,
      description:
        "Moist vanilla cupcake topped with strawberry buttercream and fresh strawberry.",
    },
    {
      id: 10,
      name: "Rustic Sourdough",
      rating: 4.7,
      imageUrl: "/rustic-loaf.png",
      price: 349,
      isVeg: true,
      description:
        "Artisanal sourdough bread with a crispy crust and chewy interior.",
    },
    {
      id: 11,
      name: "Chocolate Almond Cake",
      rating: 4.8,
      imageUrl: "/decadent-chocolate-almond-cake.png",
      price: 599,
      isVeg: true,
      description:
        "Rich chocolate cake with almond flour, topped with ganache and toasted almonds.",
    },
    {
      id: 12,
      name: "Celebration Cake",
      rating: 5.0,
      imageUrl: "/celebration-cake.png",
      price: 799,
      isVeg: true,
      description:
        "Festive layered cake with colorful sprinkles, perfect for special occasions.",
    },
  ];

  return (
    <ProtectedRoute>
      <div>
        <HomeClient products={products} />
      </div>
    </ProtectedRoute>
  );
}
