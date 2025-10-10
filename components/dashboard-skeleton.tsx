"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 overflow-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0">
          <div className="h-9 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Summary Cards */}
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

      {/* Main Content Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Column (Orders & Chart) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Revenue Chart */}
          <Card className="bg-white">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
              <div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[350px] w-full bg-gray-200 rounded-md animate-pulse"></div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="bg-white">
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="hidden sm:table-cell">
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </TableHead>
                        <TableHead>
                          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </TableHead>
                        <TableHead className="hidden sm:table-cell">
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </TableHead>
                        <TableHead>
                          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                        </TableHead>
                        <TableHead className="text-right">
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium hidden sm:table-cell">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 hidden sm:flex">
                                <AvatarFallback>
                                  <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse hidden xs:block"></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col xs:flex-row items-center justify-between border-t px-4 py-4 sm:px-6">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2 xs:mb-0"></div>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse xs:w-auto"></div>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column (Top Products & Activity) */}
        <div className="space-y-6">
          {/* Top Selling Products */}
          <Card className="bg-white">
            <CardHeader>
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-56 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md flex-shrink-0">
                    <div className="h-16 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="flex items-center mb-2">
                      <div className="h-3 w-3 bg-gray-200 rounded animate-pulse mr-1"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <div
                            key={j}
                            className="h-3 w-3 bg-gray-200 rounded animate-pulse mr-1"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t px-4 py-4 sm:px-6">
              <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
            </CardFooter>
          </Card>

          {/* Activity Feed */}
          <Card className="bg-white">
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-20 w-full bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
            <CardFooter className="border-t px-4 py-4 sm:px-6">
              <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
