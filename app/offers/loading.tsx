import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-20">
      {/* Back navigation - similar to other pages */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-4 flex items-center border-b">
        <Link href="/" className="flex items-center text-[#361C1C]">
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="font-medium">Special Offers</span>
        </Link>
      </div>

      <main className="px-4 py-4">
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-full h-40 md:h-52 rounded-2xl" />
          ))}
        </div>
      </main>
    </div>
  )
}
