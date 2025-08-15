"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import { User } from "lucide-react";
import { Heart, Magnifer, UserCheck, Bag5 } from "@solar-icons/react";
import { IoCloseOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import { isUserAdmin } from "@/lib/auth-utils";

export default function UserHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { cart } = useCart();
  const { favorites } = useFavorites();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchExpanded(false);
    }
  };

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchBlur = () => {
    if (!searchQuery.trim()) {
      setIsSearchExpanded(false);
    }
  };

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
              {/* Desktop Search - Hidden on Mobile and Checkout */}
              {!isCheckoutPage && (
                <div
                  className={`relative transition-all duration-300 ease-in-out hidden md:block ${
                    isSearchExpanded ? "w-64" : "w-8"
                  }`}
                >
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter Search"
                      className={`h-8 bg-transparent border-b border-gray-300 focus:outline-none focus:border-black transition-all duration-300 ${
                        isSearchExpanded ? "w-full pr-8" : "w-0 opacity-0"
                      }`}
                      onBlur={handleSearchBlur}
                      style={{
                        width: isSearchExpanded ? "calc(100% - 64px)" : "0px",
                        marginLeft: "36px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSearchClick}
                      className={`absolute left-0 top-1/2 transform -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full text-black ${
                        isSearchExpanded ? "pointer-events-none" : ""
                      }`}
                      aria-label="Search"
                    >
                      <Magnifer className="h-5 w-5 text-black" />
                    </button>
                    {isSearchExpanded && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchExpanded(false);
                          setSearchQuery("");
                        }}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-600"
                        aria-label="Close search"
                      >
                        <IoCloseOutline className="h-5 w-5" />
                      </button>
                    )}
                  </form>
                </div>
              )}

              {/* Mobile Search Icon - Hidden on Desktop and Checkout */}
              {!isCheckoutPage && (
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-black md:hidden"
                  aria-label="Search"
                >
                  <Magnifer className="h-5 w-5" />
                </button>
              )}

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

          {/* Mobile Search Expansion - Slides down from header, hidden on checkout */}
          {!isCheckoutPage && (
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden md:hidden ${
                isSearchExpanded ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="pb-4">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Search"
                    className="w-full h-12 pl-12 pr-12 bg-transparent border-b border-gray-300 focus:outline-none focus:border-black text-base"
                    onBlur={handleSearchBlur}
                  />
                  <Magnifer className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  {isSearchExpanded && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchExpanded(false);
                        setSearchQuery("");
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-600"
                      aria-label="Close search"
                    >
                      <IoCloseOutline className="h-5 w-5" />
                    </button>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
