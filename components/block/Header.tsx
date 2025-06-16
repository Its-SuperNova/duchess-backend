"use client"

import type { FC } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface HeaderProps {
  title?: string
}

const Header: FC<HeaderProps> = ({ title }) => {
  const pathname = usePathname()

  // Only show header on home page for mobile
  if (pathname !== "/") {
    return null
  }

  return (
    <header className="lg:hidden w-full mb-2 py-4 px-4 flex items-center justify-between dark:bg-gray-900">
      {/* Logo on the left */}
      <div className="flex items-center">
        <Link href="/">
          <img src="/duchess-logo.png" alt="Duchess Pastries" className="h-8" />
        </Link>
      </div>

      {/* Profile image on the right */}
      <Link href="/profile">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700">
          <Image src="/profile-avatar.png" alt="Profile" width={32} height={32} className="object-cover" />
        </div>
      </Link>
    </header>
  )
}

export default Header
