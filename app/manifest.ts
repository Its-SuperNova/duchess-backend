import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Duchess Pastries",
    short_name: "Duchess",
    description: "Sweetness Delivered - Delicious pastries delivered to your door",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f9d5e5",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
