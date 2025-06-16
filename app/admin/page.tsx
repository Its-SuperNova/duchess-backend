import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Clock,
  DollarSign,
  Download,
  MoreHorizontal,
  Package,
  ShoppingBag,
  ShoppingCart,
  Star,
  Users,
} from "lucide-react"

// Mock data for the dashboard
const summaryCards = [
  {
    title: "Total Orders",
    value: "1,284",
    change: "+12.5%",
    trend: "up",
    icon: ShoppingBag,
  },
  {
    title: "Total Revenue",
    value: "$45,231",
    change: "+8.2%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "New Customers",
    value: "573",
    change: "+32.1%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Out-of-Stock",
    value: "12",
    change: "-2",
    trend: "down",
    icon: Package,
  },
]

const recentOrders = [
  {
    id: "ORD-7352",
    customer: "Emma Wilson",
    amount: "$124.99",
    status: "delivered",
    date: "Apr 23, 2025",
    email: "emma@example.com",
  },
  {
    id: "ORD-7351",
    customer: "Michael Brown",
    amount: "$89.50",
    status: "pending",
    date: "Apr 23, 2025",
    email: "michael@example.com",
  },
  {
    id: "ORD-7350",
    customer: "Sophia Martinez",
    amount: "$47.25",
    status: "delivered",
    date: "Apr 22, 2025",
    email: "sophia@example.com",
  },
  {
    id: "ORD-7349",
    customer: "Liam Johnson",
    amount: "$53.00",
    status: "cancelled",
    date: "Apr 22, 2025",
    email: "liam@example.com",
  },
  {
    id: "ORD-7348",
    customer: "Olivia Davis",
    amount: "$212.75",
    status: "delivered",
    date: "Apr 21, 2025",
    email: "olivia@example.com",
  },
]

const topProducts = [
  {
    name: "Strawberry Cheesecake",
    sales: 124,
    revenue: "$3,720",
    image: "/classic-strawberry-cheesecake.png",
  },
  {
    name: "Chocolate Éclair",
    sales: 98,
    revenue: "$2,450",
    image: "/classic-chocolate-eclair.png",
  },
  {
    name: "Red Velvet Cake",
    sales: 86,
    revenue: "$2,150",
    image: "/red-velvet-cheesecake.png",
  },
]

const activityFeed = [
  {
    action: "New order placed",
    description: "Emma Wilson ordered Strawberry Cheesecake",
    time: "2h ago",
  },
  {
    action: "Product updated",
    description: "Admin updated Chocolate Éclair price",
    time: "4h ago",
  },
  {
    action: "New review",
    description: "Michael Brown left a 5-star review",
    time: "6h ago",
  },
  {
    action: "Inventory alert",
    description: "Red Velvet Cake is running low on stock",
    time: "Yesterday",
  },
  {
    action: "New customer",
    description: "Sophia Martinez created an account",
    time: "Yesterday",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

export default function AdminDashboard() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 overflow-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your admin dashboard.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0">
          <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button size="sm" className="h-9 w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            View Analytics
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl sm:text-2xl font-bold">{card.value}</p>
                    <span
                      className={`flex items-center text-xs font-medium ${
                        card.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {card.trend === "up" ? (
                        <ArrowUp className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDown className="mr-1 h-3 w-3" />
                      )}
                      {card.change}
                    </span>
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

      {/* Main Content Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Column (Orders & Chart) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Daily revenue for the past week</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Last 7 days <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem>Last month</DropdownMenuItem>
                  <DropdownMenuItem>This year</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[350px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                <div className="text-center p-4">
                  <h3 className="text-lg font-medium mb-2">Revenue Chart</h3>
                  <p className="text-muted-foreground text-sm">
                    Revenue data visualization is available in the full version.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>You have {recentOrders.length} orders this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="hidden sm:table-cell">Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="hidden sm:table-cell">Amount</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium hidden sm:table-cell">{order.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 hidden sm:flex">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${order.customer}`} />
                                <AvatarFallback>{order.customer.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium leading-none">{order.customer}</p>
                                <p className="text-xs text-muted-foreground hidden xs:block">{order.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{order.amount}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge className={getStatusColor(order.status)} variant="outline">
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View details</DropdownMenuItem>
                                <DropdownMenuItem>Update status</DropdownMenuItem>
                                <DropdownMenuItem>Contact customer</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col xs:flex-row items-center justify-between border-t px-4 py-4 sm:px-6">
              <p className="text-sm text-muted-foreground mb-2 xs:mb-0">Showing 5 of 24 orders</p>
              <Button variant="outline" size="sm" className="w-full xs:w-auto">
                View All Orders
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column (Top Products & Activity) */}
        <div className="space-y-6">
          {/* Top Selling Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Your best performing products this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md flex-shrink-0">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{product.name}</h4>
                    <div className="mt-1 flex items-center text-sm text-muted-foreground">
                      <ShoppingCart className="mr-1 h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{product.sales} sales</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600">{product.revenue}</span>
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
            </CardContent>
            <CardFooter className="border-t px-4 py-4 sm:px-6">
              <Button variant="outline" className="w-full">
                View All Products
              </Button>
            </CardFooter>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activityFeed.map((activity, index) => (
                <div key={index} className="flex gap-4 pb-4 last:pb-0">
                  <div className="relative mt-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                      <Clock className="h-4 w-4" />
                    </div>
                    {index < activityFeed.length - 1 && (
                      <div className="absolute bottom-0 left-1/2 top-8 -ml-px border-l border-dashed border-muted-foreground/20" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t px-4 py-4 sm:px-6">
              <Button variant="ghost" className="w-full">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t pt-6">
        <p className="text-center text-sm text-muted-foreground">
          © 2025 Duchess Pastries Admin Panel. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
