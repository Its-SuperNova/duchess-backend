import type React from "react"
import "../../globals.css"
import "./styles.css"
import BottomNav from "@/components/block/BottomNav"

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex flex-col min-h-screen">
        {children}
        <BottomNav />
      </main>
    </div>
  )
}
