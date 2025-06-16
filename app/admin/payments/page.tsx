import {
  ArrowUpIcon,
  CreditCardIcon,
  EyeIcon,
  RefreshCcwIcon,
  SearchIcon,
  ShoppingBagIcon,
  TrashIcon,
  AlertTriangleIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sample payment data
const payments = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    amount: "₹350.00",
    method: "Razorpay",
    status: "Success",
    orderId: "ORD12345",
    txnId: "TXN456789",
    date: "2025-04-27 14:35",
  },
  {
    id: 2,
    name: "Sarah Smith",
    email: "sarah@example.com",
    amount: "₹1,250.00",
    method: "UPI",
    status: "Success",
    orderId: "ORD12346",
    txnId: "TXN456790",
    date: "2025-04-27 12:22",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael@example.com",
    amount: "₹750.00",
    method: "Card",
    status: "Failed",
    orderId: "ORD12347",
    txnId: "TXN456791",
    date: "2025-04-26 18:45",
  },
  {
    id: 4,
    name: "Emily Johnson",
    email: "emily@example.com",
    amount: "₹500.00",
    method: "Net Banking",
    status: "Pending",
    orderId: "ORD12348",
    txnId: "TXN456792",
    date: "2025-04-26 16:30",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david@example.com",
    amount: "₹1,400.00",
    method: "Wallet",
    status: "Success",
    orderId: "ORD12349",
    txnId: "TXN456793",
    date: "2025-04-25 09:15",
  },
  {
    id: 6,
    name: "Lisa Taylor",
    email: "lisa@example.com",
    amount: "₹900.00",
    method: "UPI",
    status: "Refunded",
    orderId: "ORD12350",
    txnId: "TXN456794",
    date: "2025-04-25 08:40",
  },
]

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground mt-1">View and track all payments made by customers.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue Today</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹4,250.00</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+12%</span> from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders Paid</CardTitle>
            <ShoppingBagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground mt-1">Orders processed today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search by name, email, or transaction ID..." className="pl-8" />
        </div>
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="admin-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>User Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.name}</TableCell>
                    <TableCell className="text-muted-foreground">{payment.email}</TableCell>
                    <TableCell className="font-medium">{payment.amount}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === "Success"
                            ? "success"
                            : payment.status === "Failed"
                              ? "destructive"
                              : payment.status === "Pending"
                                ? "warning"
                                : "outline"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{payment.orderId}</TableCell>
                    <TableCell className="font-mono text-xs">{payment.txnId}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{payment.date}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">Open menu</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="flex items-center">
                            <EyeIcon className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center">
                            <RefreshCcwIcon className="mr-2 h-4 w-4" />
                            Process Refund
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center text-destructive">
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Showing 1 to 6 of 6 entries</p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
