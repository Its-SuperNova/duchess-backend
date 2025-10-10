"use client";

import { Card, CardContent } from "@/components/ui/card";

export function SummaryCardsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden bg-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="rounded-full bg-gray-200 p-2 animate-pulse">
                <div className="h-5 w-5 bg-gray-300 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
