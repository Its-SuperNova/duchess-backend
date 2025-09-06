import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeCustomizationLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Hero Section Skeleton */}
        <div className="space-y-4">
          <div className="border rounded-lg p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-20 w-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-11" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections Skeleton */}
        <div className="space-y-4">
          <div className="border rounded-lg p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-11" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-6 w-11" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                  <Skeleton className="h-6 w-11" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-26" />
                    <Skeleton className="h-3 w-42" />
                  </div>
                  <Skeleton className="h-6 w-11" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme & Colors Skeleton */}
        <div className="space-y-4">
          <div className="border rounded-lg p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-52" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-12" />
                    <Skeleton className="h-10 flex-1" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-12" />
                    <Skeleton className="h-10 flex-1" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="space-y-4">
          <div className="border rounded-lg p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-48" />
              </div>

              <div className="grid gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

