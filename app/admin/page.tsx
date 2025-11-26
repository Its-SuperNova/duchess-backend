"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Clock,
  DollarSign,
  Download,
  Filter,
  MoreHorizontal,
  Package,
  ShoppingBag,
  ShoppingCart,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { SummaryCardsSkeleton } from "@/components/summary-cards-skeleton";
import { AnalyticsChart } from "@/components/analytics-chart";
import { DateRangeDialog } from "@/components/date-range-dialog";

// Types for dashboard data
interface SummaryCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: any;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
  email: string;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: string;
  image: string;
}

interface DashboardData {
  summaryCards: SummaryCard[];
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  analyticsChartData: {
    date: string;
    orders: number;
    revenue: number;
    users: number;
  }[];
}

// Dynamically import Lottie for empty state animations
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
});

// Icon mapping for summary cards
const iconMap = {
  "Total Orders": ShoppingBag,
  "Total Revenue": DollarSign,
  "Reviews & Feedback": Star,
  "Total Users": Users,
};

// Mock data for the dashboard (fallback)
const fallbackSummaryCards = [
  {
    title: "Total Orders",
    value: "0",
    change: "0%",
    trend: "up" as const,
    icon: ShoppingBag,
  },
  {
    title: "Total Revenue",
    value: "₹0",
    change: "0%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Reviews & Feedback",
    value: "0",
    change: "0%",
    trend: "up" as const,
    icon: Star,
  },
  {
    title: "Total Users",
    value: "0",
    change: "0%",
    trend: "up" as const,
    icon: Users,
  },
];

const fallbackRecentOrders: RecentOrder[] = [];
const fallbackTopProducts: TopProduct[] = [];

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [summaryCardsLoading, setSummaryCardsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Separate filter states for grid cards and chart
  const [gridFilter, setGridFilter] = useState("overall");
  const [chartFilter, setChartFilter] = useState("monthly");
  const [gridCustomStartDate, setGridCustomStartDate] = useState<
    Date | undefined
  >(undefined);
  const [gridCustomEndDate, setGridCustomEndDate] = useState<Date | undefined>(
    undefined
  );
  const [chartCustomStartDate, setChartCustomStartDate] = useState<
    Date | undefined
  >(undefined);
  const [chartCustomEndDate, setChartCustomEndDate] = useState<
    Date | undefined
  >(undefined);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Only show full loading on initial load
        if (!dashboardData) {
          setLoading(true);
        } else {
          // Show summary cards loading for filter changes
          setSummaryCardsLoading(true);
        }

        console.log("useEffect running with:", {
          gridFilter,
          chartFilter,
          gridCustomStartDate,
          gridCustomEndDate,
          chartCustomStartDate,
          chartCustomEndDate,
        });

        const params = new URLSearchParams();
        params.append("gridFilter", gridFilter);
        params.append("chartFilter", chartFilter);
        if (gridCustomStartDate) {
          params.append("gridStartDate", gridCustomStartDate.toISOString());
        }
        if (gridCustomEndDate) {
          params.append("gridEndDate", gridCustomEndDate.toISOString());
        }
        if (chartCustomStartDate) {
          params.append("chartStartDate", chartCustomStartDate.toISOString());
        }
        if (chartCustomEndDate) {
          params.append("chartEndDate", chartCustomEndDate.toISOString());
        }

        const url = `/api/admin/dashboard?${params.toString()}`;
        console.log("Fetching URL:", url);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();

        // Add icons to summary cards and force "Reviews & Feedback" to zero
        const summaryCardsWithIcons = data.summaryCards.map((card: any) => {
          const baseCard = {
            ...card,
            icon: iconMap[card.title as keyof typeof iconMap] || ShoppingBag,
          };

          if (card.title === "Reviews & Feedback") {
            return {
              ...baseCard,
              value: "0",
              change: "0%",
            };
          }

          return baseCard;
        });

        setDashboardData({
          summaryCards: summaryCardsWithIcons,
          recentOrders: data.recentOrders,
          topProducts: data.topProducts,
          analyticsChartData: data.analyticsChartData,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setSummaryCardsLoading(false);
      }
    };

    fetchDashboardData();
  }, [
    gridFilter,
    chartFilter,
    gridCustomStartDate,
    gridCustomEndDate,
    chartCustomStartDate,
    chartCustomEndDate,
  ]);

  const handleGridFilterChange = (
    filter: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    console.log("Grid filter change:", { filter, startDate, endDate });
    setGridFilter(filter);
    if (filter === "custom" && startDate && endDate) {
      setGridCustomStartDate(startDate);
      setGridCustomEndDate(endDate);
    } else {
      setGridCustomStartDate(undefined);
      setGridCustomEndDate(undefined);
    }
  };

  const handleChartFilterChange = (
    filter: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    console.log("Chart filter change:", { filter, startDate, endDate });
    setChartFilter(filter);
    if (filter === "custom" && startDate && endDate) {
      setChartCustomStartDate(startDate);
      setChartCustomEndDate(endDate);
    } else {
      setChartCustomStartDate(undefined);
      setChartCustomEndDate(undefined);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-6 overflow-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              Error loading dashboard: {error}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-6 overflow-auto">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }
  {
    /* Page Header */
  }
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
        Dashboard
      </h1>
      <p className="text-muted-foreground">
        Welcome back to your admin dashboard.
      </p>
    </div>
    <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0">
      <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto">
        <Download className="mr-2 h-4 w-4" />
        Download Report
      </Button>
      <Button
        size="sm"
        className="h-9 w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
      >
        View Analytics
      </Button>
    </div>
  </div>;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 overflow-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back to your admin dashboard.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0">
          <DateRangeDialog
            selectedFilter={gridFilter}
            onFilterChange={handleGridFilterChange}
          />
          <Button
            size="sm"
            className="h-9 w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            View Analytics
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryCardsLoading ? (
        <SummaryCardsSkeleton />
      ) : (
        <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
          {dashboardData.summaryCards.map((card, index) => (
            <Card key={index} className="overflow-hidden bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl sm:text-2xl font-bold">
                        {card.value}
                      </p>
                      {card.title !== "Total Users" && (
                        <span
                          className={`flex items-center text-xs font-medium ${
                            card.trend === "up"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {card.trend === "up" ? (
                            <ArrowUp className="mr-1 h-3 w-3" />
                          ) : (
                            <ArrowDown className="mr-1 h-3 w-3" />
                          )}
                          {card.change}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Analytics Chart */}
      <AnalyticsChart
        data={dashboardData.analyticsChartData}
        onFilterChange={handleChartFilterChange}
        currentFilter={chartFilter}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Column (Orders & Chart) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recent Orders */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                You have {dashboardData.recentOrders.length} recent orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-48 h-48">
                    <Lottie
                      animationData={require("../../public/Lottie/Empty-Order.json")}
                      loop
                      autoplay
                    />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground text-center">
                    No recent orders yet. New orders will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="hidden sm:table-cell">
                            Order ID
                          </TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Amount
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Status
                          </TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboardData.recentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium hidden sm:table-cell">
                              {order.id}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8 hidden sm:flex">
                                  <AvatarImage
                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${order.customer}`}
                                  />
                                  <AvatarFallback>
                                    {order.customer.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium leading-none">
                                    {order.customer}
                                  </p>
                                  <p className="text-xs text-muted-foreground hidden xs:block">
                                    {order.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {order.amount}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge
                                className={getStatusColor(order.status)}
                                variant="outline"
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    View details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Update status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Contact customer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
            {dashboardData.recentOrders.length > 0 && (
              <CardFooter className="flex flex-col xs:flex-row items-center justify-between border-t px-4 py-4 sm:px-6">
                <p className="text-sm text-muted-foreground mb-2 xs:mb-0">
                  Showing 5 of 24 orders
                </p>
                <Button variant="outline" size="sm" className="w-full xs:w-auto">
                  View All Orders
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Right Column (Top Products & Activity) */}
        <div className="space-y-6">
          {/* Top Selling Products */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>
                Your best performing products this month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {dashboardData.topProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-48 h-48">
                    <Lottie
                      animationData={require("../../public/Lottie/Empty-Order.json")}
                      loop
                      autoplay
                    />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground text-center">
                    No product data available yet. Top products will show here once you have orders.
                  </p>
                </div>
              ) : (
                <>
                  {dashboardData.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-md flex-shrink-0">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {product.name}
                        </h4>
                        <div className="mt-1 flex items-center text-sm text-muted-foreground">
                          <ShoppingCart className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{product.sales} sales</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-600">
                            {product.revenue}
                          </span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
            {dashboardData.topProducts.length > 0 && (
              <CardFooter className="border-t px-4 py-4 sm:px-6">
                <Button variant="outline" className="w-full">
                  View All Products
                </Button>
              </CardFooter>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
}
