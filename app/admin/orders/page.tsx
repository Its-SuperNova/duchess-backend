"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, FileDown, Filter, MoreHorizontal, Search, ShoppingBag } from "lucide-react"

// Mock data for orders
const orders = [
  {
    id: "ORD7352",
    customer: {
      name: "Emma Wilson",
      email: "emma@example.com",
      avatar: "/profile-placeholder.png",
    },
    products: 3,
    amount: "₹1,249.99",
    paymentStatus: "paid",
    orderStatus: "delivered",
    date: "2 days ago",
    fullDate: "Apr 23, 2025",
  },
  {
    id: "ORD7351",
    customer: {
      name: "Michael Brown",
      email: "michael@example.com",
      avatar: "/profile-placeholder.png",
    },
    products: 1,
    amount: "₹895.50",
    paymentStatus: "paid",
    orderStatus: "processing",
    date: "2 days ago",
    fullDate: "Apr 23, 2025",
  },
  {
    id: "ORD7350",
    customer: {
      name: "Sophia Martinez",
      email: "sophia@example.com",
      avatar: "/profile-placeholder.png",
    },
    products: 2,
    amount: "₹472.25",
    paymentStatus: "pending",
    orderStatus: "processing",
    date: "3 days ago",
    fullDate: "Apr 22, 2025",
  },
  {
    id: "ORD7349",
    customer: {
      name: "Liam Johnson",
      email: "liam@example.com",
      avatar: "/profile-placeholder.png",
    },
    products: 4,
    amount: "₹530.00",
    paymentStatus: "failed",
    orderStatus: "cancelled",
    date: "3 days ago",
    fullDate: "Apr 22, 2025",
  },
  {
    id: "ORD7348",
    customer: {
      name: "Olivia Davis",
      email: "olivia@example.com",
      avatar: "/profile-placeholder.png",
    },
    products: 2,
    amount: "₹2,127.75",
    paymentStatus: "paid",
    orderStatus: "delivered",
    date: "4 days ago",
    fullDate: "Apr 21, 2025",
  },
  {
    id: "ORD7347",
    customer: {
      name: "Noah Wilson",
      email: "noah@example.com",
      avatar: "/profile-placeholder.png",
    },
    products: 1,
    amount: "₹349.99",
    paymentStatus: "paid",
    orderStatus: "out for delivery",
    date: "4 days ago",
    fullDate: "Apr 21, 2025",
  },
  {
    id: "ORD7346",
    customer: {
      name: "Ava Thompson",
      email: "ava@example.com",
      avatar: "/profile-placeholder.png",
    },
    products: 3,
    amount: "₹789.50",
    paymentStatus: "paid",
    orderStatus: "delivered",
    date: "5 days ago",
    fullDate: "Apr 20, 2025",
  },
  {
    id: "ORD7345",
    customer: {
      name: "James Anderson",
      email: "james@example.com",
      avatar: "/profile-placeholder.png",
    },
    products: 2,
    amount: "₹459.99",
    paymentStatus: "pending",
    orderStatus: "processing",
    date: "5 days ago",
    fullDate: "Apr 20, 2025",
  },
  {
    id: "ORD7344",
    customer: {
      name: "Isabella Garcia",
      email: "isabella@example.com",
      avatar: "/profile-placeholder.png",
    },
    products: 5,
    amount: "₹1,875.25",
    paymentStatus: "paid",
    orderStatus: "delivered",
    date: "6 days ago",
    fullDate: "Apr 19, 2025",
  },
  {
    id: "ORD7343",
    customer: {
      name: "Ethan Martinez",
      email: "ethan@example.com",
      avatar: "/profile-placeholder.png",
    },
    products: 1,
    amount: "₹299.99",
    paymentStatus: "failed",
    orderStatus: "cancelled",
    date: "6 days ago",
    fullDate: "Apr 19, 2025",
  },
]

// Helper function to get badge color based on status
const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

const getOrderStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "processing":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "out for delivery":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

export default function OrdersPage() {
  const [showEmptyState, setShowEmptyState] = useState(false)

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and track customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto">
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Show All</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Delivered</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Processing</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Out for Delivery</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Cancelled</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Payment
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter by Payment</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Show All</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Paid</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Pending</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Failed</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowEmptyState(!showEmptyState)}>
            {showEmptyState ? "Show Orders" : "Show Empty State"}
          </Button>
        </div>
      </div>

      {/* Orders Table or Empty State */}
      {showEmptyState ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-blue-100 p-4 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
            <p className="mt-2 max-w-sm text-center text-muted-foreground">
              Orders placed by customers will show up here. You can manage and track all customer orders from this page.
            </p>
            <Button className="mt-6">Go to Products</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table className="admin-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Products</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium hidden sm:table-cell">#{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 hidden sm:flex">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${order.customer.name}`}
                            alt={order.customer.name}
                          />
                          <AvatarFallback>
                            {order.customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">{order.customer.name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <span>{order.products}</span>
                        <span className="text-muted-foreground">{order.products === 1 ? "item" : "items"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{order.amount}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className={getPaymentStatusColor(order.paymentStatus)} variant="outline">
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getOrderStatusColor(order.orderStatus)} variant="outline">
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col">
                        <span className="text-sm">{order.date}</span>
                        <span className="text-xs text-muted-foreground">{order.fullDate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Update status</DropdownMenuItem>
                          <DropdownMenuItem>Print invoice</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Cancel order</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
