import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import DesktopHeader from "@/components/block/DesktopHeader";

// Desktop Header Skeleton Component
export function DesktopHeaderSkeleton() {
  return (
    <div className="hidden lg:flex bg-white dark:bg-[#202028] border-b border-gray-200 dark:border-gray-700 h-16 items-center justify-end px-6 gap-4">
      {/* Search Bar Skeleton */}
      <div className="relative w-80">
        <Skeleton className="w-full h-10 rounded-full dark:bg-[#18171C]" />
      </div>

      {/* Notification Icon Skeleton */}
      <div className="relative">
        <Skeleton className="h-5 w-5 rounded dark:bg-[#18171C]" />
        <Skeleton className="absolute -top-1 -right-1 h-3 w-3 rounded-full dark:bg-[#18171C]" />
      </div>

      {/* Cart Icon Skeleton */}
      <div className="relative">
        <Skeleton className="h-5 w-5 rounded dark:bg-[#18171C]" />
        <Skeleton className="absolute -top-1 -right-1 h-3 w-3 rounded-full dark:bg-[#18171C]" />
      </div>

      {/* Profile/Auth Skeleton */}
      <div className="relative">
        <div className="flex items-center space-x-1">
          <Skeleton className="h-10 w-10 rounded-full dark:bg-[#18171C]" />
          <Skeleton className="h-4 w-4 rounded dark:bg-[#18171C]" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <>
      <DesktopHeader />
      <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#18171C] py-8 px-4">
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-4xl xl:max-w-6xl mx-auto space-y-4 pb-20">
          {/* Top Section for Desktop: User Info, Logout, Stats */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start lg:gap-4">
            {/* User Info Card */}
            <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-4 flex items-center gap-4 lg:flex-grow lg:min-h-[140px] lg:justify-center border border-gray-200 dark:border-transparent">
              <Skeleton className="h-16 w-16 rounded-full dark:bg-[#18171C]" />
              <div className="flex-grow">
                <Skeleton className="h-6 w-32 mb-2 dark:bg-[#18171C]" />
                <Skeleton className="h-4 w-40 dark:bg-[#18171C]" />
              </div>
              {/* Logout and Theme Toggle buttons for desktop, hidden on mobile */}
              <div className="hidden lg:flex items-center gap-2">
                <Skeleton className="h-10 w-20 dark:bg-[#18171C]" />
                <Skeleton className="h-10 w-24 dark:bg-[#18171C]" />
              </div>
            </div>

            {/* Stats Cards for Desktop */}
            <div className="grid grid-cols-2 gap-4 mt-4 lg:mt-0 lg:w-1/2 xl:w-2/5">
              <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-4 text-center border border-gray-200 dark:border-transparent">
                <div className="bg-[#e0eeff] dark:bg-[#01499C] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Skeleton className="h-6 w-6 rounded dark:bg-[#18171C]" />
                </div>
                <Skeleton className="h-8 w-8 mx-auto mb-2 dark:bg-[#18171C]" />
                <Skeleton className="h-4 w-20 mx-auto dark:bg-[#18171C]" />
              </div>
              <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-4 text-center border border-gray-200 dark:border-transparent">
                <div className="bg-[#ffe0ed] dark:bg-[#A00043] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Skeleton className="h-6 w-6 rounded dark:bg-[#18171C]" />
                </div>
                <Skeleton className="h-8 w-8 mx-auto mb-2 dark:bg-[#18171C]" />
                <Skeleton className="h-4 w-16 mx-auto dark:bg-[#18171C]" />
              </div>
            </div>
          </div>

          {/* Appearance Section (only on mobile, hidden on desktop as per Figma) */}
          <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-4 flex items-center justify-between lg:hidden border border-gray-200 dark:border-transparent">
            <div className="flex items-center gap-4">
              <div className="bg-[#f4f4f7] dark:bg-[#18171C] rounded-full w-10 h-10 flex items-center justify-center">
                <Skeleton className="h-5 w-5 rounded dark:bg-[#18171C]" />
              </div>
              <Skeleton className="h-5 w-24 dark:bg-[#18171C]" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20 dark:bg-[#18171C]" />
              <Skeleton className="h-4 w-4 dark:bg-[#18171C]" />
            </div>
          </div>

          {/* Main Content Sections for Desktop */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Account Section */}
              <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-transparent">
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-5 bg-[#7a0000] dark:bg-[#7a0000] rounded-tr-full rounded-br-full"></span>
                    <Skeleton className="h-6 w-32 dark:bg-[#18171C]" />
                  </div>
                </div>
                <div className="space-y-2 py-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-2"
                    >
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full dark:bg-[#18171C]" />
                        <Skeleton className="h-4 w-24 dark:bg-[#18171C]" />
                      </div>
                      <Skeleton className="h-4 w-4 dark:bg-[#18171C]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Support & Help Section */}
              <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-transparent">
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-5 bg-[#7a0000] dark:bg-[#7a0000] rounded-tr-full rounded-br-full"></span>
                    <Skeleton className="h-6 w-40 dark:bg-[#18171C]" />
                  </div>
                </div>
                <div className="space-y-2 py-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-2"
                    >
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full dark:bg-[#18171C]" />
                        <Skeleton className="h-4 w-20 dark:bg-[#18171C]" />
                      </div>
                      <Skeleton className="h-4 w-4 dark:bg-[#18171C]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 mt-4 lg:mt-0">
              {/* Orders Section */}
              <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-transparent">
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-5 bg-[#7a0000] dark:bg-[#7a0000] rounded-tr-full rounded-br-full"></span>
                    <Skeleton className="h-6 w-20 dark:bg-[#18171C]" />
                  </div>
                </div>
                <div className="space-y-2 py-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-2"
                    >
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full dark:bg-[#18171C]" />
                        <Skeleton className="h-4 w-20 dark:bg-[#18171C]" />
                      </div>
                      <Skeleton className="h-4 w-4 dark:bg-[#18171C]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Section */}
              <div className="bg-white dark:bg-[#202028] rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-transparent">
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-5 bg-[#7a0000] dark:bg-[#7a0000] rounded-tr-full rounded-br-full"></span>
                    <Skeleton className="h-6 w-16 dark:bg-[#18171C]" />
                  </div>
                </div>
                <div className="space-y-2 py-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-2"
                    >
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full dark:bg-[#18171C]" />
                        <Skeleton className="h-4 w-28 dark:bg-[#18171C]" />
                      </div>
                      <Skeleton className="h-4 w-4 dark:bg-[#18171C]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Logout button for mobile, hidden on desktop - after Legal section */}
          <div className="w-full lg:hidden block mt-4 mb-4">
            <div className="w-full bg-white dark:bg-[#202028] rounded-2xl shadow-sm p-4 py-6 flex items-center justify-between border border-gray-200 dark:border-transparent">
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-5 dark:bg-[#18171C]" />
                <Skeleton className="h-4 w-16 dark:bg-[#18171C]" />
              </div>
              <Skeleton className="h-4 w-4 dark:bg-[#18171C]" />
            </div>
          </div>

          {/* App Version */}
          <div className="text-center text-[#858585] dark:text-gray-400 text-xs pt-4">
            <p>Duchess v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
}
