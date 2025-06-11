import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";

// Desktop Header Skeleton Component
export function DesktopHeaderSkeleton() {
  return (
    <div className="hidden lg:flex bg-white border-b border-gray-200 h-16 items-center justify-end px-6 gap-4">
      {/* Search Bar Skeleton */}
      <div className="relative w-80">
        <Skeleton className="w-full h-10 rounded-full" />
      </div>

      {/* Notification Icon Skeleton */}
      <div className="relative">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="absolute -top-1 -right-1 h-3 w-3 rounded-full" />
      </div>

      {/* Cart Icon Skeleton */}
      <div className="relative">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="absolute -top-1 -right-1 h-3 w-3 rounded-full" />
      </div>

      {/* Profile/Auth Skeleton */}
      <div className="relative">
        <div className="flex items-center space-x-1">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <>
      <DesktopHeaderSkeleton />
      <div className="min-h-screen bg-[#f4f4f7] py-8 px-4">
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-4xl xl:max-w-6xl mx-auto space-y-4 pb-20">
          {/* Top Section Skeleton for Desktop */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-4">
            {/* User Info Card Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 lg:flex-grow lg:min-h-[140px] lg:justify-center">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2 flex-grow">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              {/* Logout button skeleton for desktop */}
              <Skeleton className="hidden lg:block h-10 w-24 rounded-full" />
            </div>

            {/* Mobile only: Stats Cards, Appearance, Account, and Support Section Skeletons (grouped) */}
            <div className="lg:hidden space-y-2">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                {/* Total Orders Card Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                  <div className="bg-[#e0eeff] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
                {/* Favorites Card Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                  <div className="bg-[#ffe0ed] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              </div>
              {/* Appearance Section Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#f4f4f7] rounded-full w-10 h-10 flex items-center justify-center">
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                  <Skeleton className="h-5 w-24 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-10 rounded" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
              </div>
              {/* Account and Support Section Skeletons (grouped) */}
              <div className="space-y-2">
                {/* Account Section Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 pt-4">
                    <Skeleton className="w-1 h-5 rounded-tr-full rounded-br-full" />
                    <Skeleton className="h-6 w-24 pl-4" />
                  </div>
                  <div className="space-y-2 py-4">
                    <div className="px-4 flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-6 w-32 rounded" />
                    </div>
                    <div className="px-4 flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-6 w-40 rounded" />
                    </div>
                    <div className="px-4 flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-6 w-44 rounded" />
                    </div>
                  </div>
                </div>
                {/* Support & Help Section Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 pt-4">
                    <Skeleton className="w-1 h-5 rounded-tr-full rounded-br-full" />
                    <Skeleton className="h-6 w-32 pl-4" />
                  </div>
                  <div className="space-y-2 py-4">
                    <div className="px-4 flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-6 w-32 rounded" />
                    </div>
                    <div className="px-4 flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-6 w-36 rounded" />
                    </div>
                    <div className="px-4 flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-6 w-44 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop only: Stats Cards Skeleton (inside desktop layout) */}
            <div className="hidden lg:grid grid-cols-2 gap-4 mt-0 lg:mt-0 lg:w-1/2 xl:w-2/5">
              {/* Total Orders Card Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <div className="bg-[#e0eeff] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
                <Skeleton className="h-8 w-12 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
              {/* Favorites Card Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <div className="bg-[#ffe0ed] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
                <Skeleton className="h-8 w-12 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            </div>
          </div>

          {/* Logout button skeleton for mobile */}
          <Skeleton className="h-16 w-full rounded-2xl lg:hidden" />

          {/* Main Content Sections Skeleton for Desktop */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-4">
            {/* Left Column Skeleton */}
            <div className="space-y-4">
              {/* Account Section Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 pt-4">
                  <Skeleton className="w-1 h-5 rounded-tr-full rounded-br-full" />
                  <Skeleton className="h-6 w-24 pl-4" />
                </div>
                <div className="space-y-2 py-4">
                  <div className="px-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded" />
                  </div>
                  <div className="px-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-40 rounded" />
                  </div>
                </div>
              </div>
              {/* Support & Help Section Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 pt-4">
                  <Skeleton className="w-1 h-5 rounded-tr-full rounded-br-full" />
                  <Skeleton className="h-6 w-32 pl-4" />
                </div>
                <div className="space-y-2 py-4">
                  <div className="px-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded" />
                  </div>
                  <div className="px-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-36 rounded" />
                  </div>
                  <div className="px-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-44 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-4 mt-4 lg:mt-0">
              {/* Orders Section Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 pt-4">
                  <Skeleton className="w-1 h-5 rounded-tr-full rounded-br-full" />
                  <Skeleton className="h-6 w-20 pl-4" />
                </div>
                <div className="space-y-2 py-4">
                  <div className="px-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-36 rounded" />
                  </div>
                  <div className="px-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-40 rounded" />
                  </div>
                </div>
              </div>

              {/* Legal Section Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 pt-4">
                  <Skeleton className="w-1 h-5 rounded-tr-full rounded-br-full" />
                  <Skeleton className="h-6 w-16 pl-4" />
                </div>
                <div className="space-y-2 py-4">
                  <div className="px-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-40 rounded" />
                  </div>
                  <div className="px-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-44 rounded" />
                  </div>
                  <div className="px-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-48 rounded" />
                  </div>
                  <div className="px-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-52 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logout button skeleton for mobile, hidden on desktop - after Legal section */}
          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between lg:hidden mt-4 mb-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-20 rounded" />
            </div>
            <Skeleton className="h-4 w-4 rounded" />
          </div>

          {/* App Version Skeleton */}
          <Skeleton className="h-4 w-24 mx-auto mt-4" />
        </div>
      </div>
    </>
  );
}
