import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// Banner data - same as in hero component for consistency
const banners = [
  {
    id: 1,
    image: "/cookie-banner-mobile.png",
    desktopImage:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cookies%20offer-gVsY97iVCDkrq7i7UiQJr0Y7qYlCx3.png",
    alt: "Special offer on chocolate chip cookies",
    link: "/offers/cookies",
  },
  {
    id: 2,
    image: "/banner-cake.png",
    desktopImage: "/banner-cake.png",
    alt: "Celebrate with every slice - chocolate cake with strawberries",
    link: "/offers/cakes",
  },
  {
    id: 3,
    image: "/banner-cupcakes.png",
    desktopImage: "/banner-cupcakes.png",
    alt: "Fluffy, frosted cupcakes with blackberries",
    link: "/offers/cupcakes",
  },
  {
    id: 4,
    image: "/banner-cheesecakes.png",
    desktopImage: "/banner-cheesecakes.png",
    alt: "Classic Indian delights - mini cheesecakes",
    link: "/offers/indian-sweets",
  },
]

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-20">
      {/* Back navigation - similar to other pages */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-4 h-[64px] flex items-center border-b">
        <Link href="/" className="flex items-center text-[#361C1C]">
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="font-medium">Special Offers</span>
        </Link>
      </div>

      <main className="px-4 py-4">
        <div className="space-y-6">
          {banners.map((banner) => (
            <div key={banner.id} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <Link href={banner.link} className="block">
                <div className="relative">
                  {/* Mobile and Tablet Banner */}
                  <div className="block lg:hidden">
                    <Image
                      src={banner.image || "/placeholder.svg"}
                      alt={banner.alt}
                      width={1080}
                      height={400}
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  {/* Desktop Banner */}
                  <div className="hidden lg:block">
                    <Image
                      src={banner.desktopImage || "/placeholder.svg"}
                      alt={banner.alt}
                      width={1200}
                      height={400}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
