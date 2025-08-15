"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import { User } from "lucide-react";
import { Heart, UserCheck, Bag5 } from "@solar-icons/react";
import { useState, useEffect } from "react";
import { isUserAdmin } from "@/lib/auth-utils";

export default function UserHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { cart } = useCart();
  const { favorites } = useFavorites();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if we're on the checkout page
  const isCheckoutPage = pathname?.startsWith("/checkout");

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalFavorites = favorites.length;

  const goToProfile = () => {
    if (session?.user) {
      router.push("/profile");
    } else {
      router.push("/login");
    }
  };

  // Search removed from header

  useEffect(() => {
    let isMounted = true;
    async function checkAdmin() {
      try {
        if (session?.user?.email) {
          const hasAdminAccess = await isUserAdmin(session.user.email);
          if (isMounted) setIsAdmin(!!hasAdminAccess);
        } else {
          if (isMounted) setIsAdmin(false);
        }
      } catch {
        if (isMounted) setIsAdmin(false);
      }
    }
    checkAdmin();
    return () => {
      isMounted = false;
    };
  }, [session]);

  return (
    <>
      {/* Tagline */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto w-full max-w-[1200px] px-4">
          <div className="py-2 text-center">
            <p className="text-xs md:text-sm text-gray-600">
              We also accept orders over the phone – Call us at{" "}
              <a
                href="tel:9080022593"
                className="underline hover:text-gray-800 transition-colors"
              >
                9080022593
              </a>{" "}
              or{" "}
              <a
                href="tel:7603831952"
                className="underline hover:text-gray-800 transition-colors"
              >
                7603831952
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="mx-auto w-full max-w-[1200px] px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Left: Logo - Always visible */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="relative h-[64px] w-[150px]">
                <Image
                  src="/logo/duchess-pastry-2.svg"
                  alt="Duchess Pastries"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="sr-only">Duchess Pastries</span>
            </Link>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Admin - Only for Admin users */}
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    aria-label="Admin"
                    className="hidden md:inline-flex h-8 px-3 items-center justify-center rounded-full bg-white border border-gray-300 text-black hover:bg-gray-50 gap-2"
                  >
                    <UserCheck className="h-5 w-5" />
                    <span className="text-sm font-medium">Admin</span>
                  </Link>
                  <Link
                    href="/admin"
                    aria-label="Admin"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-300 text-black md:hidden hover:bg-gray-50"
                  >
                    <UserCheck className="h-5 w-5" />
                  </Link>
                </>
              )}
              {/* Search removed from header */}

              {/* Favorites - Hidden on Mobile and Checkout */}
              {!isCheckoutPage && (
                <Link
                  href="/favorites"
                  aria-label="Favorites"
                  className="relative hidden md:inline-flex h-8 w-8 items-center justify-center rounded-full text-black"
                >
                  <Heart className="h-5 w-5" />
                  {totalFavorites > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#7A0000] text-white text-[10px] font-semibold flex items-center justify-center">
                      {totalFavorites > 9 ? "9+" : totalFavorites}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart - Hidden on Checkout */}
              {!isCheckoutPage && (
                <Link
                  href="/cart"
                  aria-label="Cart"
                  className="relative inline-flex h-8 w-8 items-center justify-center rounded-full text-black"
                >
                  <Bag5 weight="Linear" size={20} color="#0f4159" />
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#7A0000] text-white text-[10px] font-semibold flex items-center justify-center">
                      {totalCartItems > 9 ? "9+" : totalCartItems}
                    </span>
                  )}
                </Link>
              )}

              {/* Profile */}
              <button
                onClick={goToProfile}
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-full text-black overflow-hidden"
                aria-label="Profile"
              >
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={session.user.name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile search removed */}
        </div>
      </header>
    </>
  );
}
