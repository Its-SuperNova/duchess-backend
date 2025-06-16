"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BarChart3, CalendarIcon, Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Sample data for coupons
const coupons = [
  {
    id: 1,
    code: "DUCHESS20",
    type: "percentage",
    value: 20,
    minOrderAmount: 500,
    usageLimit: 100,
    usagePerUser: 1,
    validFrom: new Date("2023-01-01"),
    validUntil: new Date("2023-12-31"),
    status: "active",
    redemptions: 45,
    revenue: 22500,
  },
  {
    id: 2,
    code: "WELCOME50",
    type: "flat",
    value: 50,
    minOrderAmount: 200,
    usageLimit: 200,
    usagePerUser: 1,
    validFrom: new Date("2023-01-01"),
    validUntil: new Date("2023-06-30"),
    status: "expired",
    redemptions: 150,
    revenue: 30000,
  },
  {
    id: 3,
    code: "FESTIVE100",
    type: "flat",
    value: 100,
    minOrderAmount: 1000,
    usageLimit: 50,
    usagePerUser: 1,
    validFrom: new Date("2023-10-01"),
    validUntil: new Date("2023-12-31"),
    status: "active",
    redemptions: 20,
    revenue: 25000,
  },
  {
    id: 4,
    code: "BIRTHDAY15",
    type: "percentage",
    value: 15,
    minOrderAmount: 300,
    usageLimit: null,
    usagePerUser: 1,
    validFrom: new Date("2023-01-01"),
    validUntil: new Date("2023-12-31"),
    status: "active",
    redemptions: 75,
    revenue: 18750,
  },
  {
    id: 5,
    code: "SUMMER25",
    type: "percentage",
    value: 25,
    minOrderAmount: 800,
    usageLimit: 100,
    usagePerUser: 1,
    validFrom: new Date("2023-05-01"),
    validUntil: new Date("2023-08-31"),
    status: "inactive",
    redemptions: 0,
    revenue: 0,
  },
]

// Categories for coupon applicability
const categories = [
  { id: 1, name: "Cakes" },
  { id: 2, name: "Cookies" },
  { id: 3, name: "Pastries" },
  { id: 4, name: "Breads" },
  { id: 5, name: "Cupcakes" },
  { id: 6, name: "Tarts" },
]

// Form schema for coupon creation/editing
const formSchema = z.object({
  code: z.string().min(3, {
    message: "Coupon code must be at least 3 characters.",
  }),
  type: z.enum(["flat", "percentage"]),
  value: z.coerce.number().min(1, {
    message: "Discount value must be at least 1.",
  }),
  minOrderAmount: z.coerce.number().min(0),
  maxDiscountCap: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().min(1).optional().nullable(),
  usagePerUser: z.coerce.number().min(1),
  validFrom: z.date(),
  validUntil: z.date(),
  applicableCategories: z.array(z.number()).optional(),
  isActive: z.boolean().default(true),
})

export default function CouponsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editingCoupon, setEditingCoupon] = useState<any>(null)

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      type: "percentage",
      value: 10,
      minOrderAmount: 0,
      maxDiscountCap: 0,
      usageLimit: 100,
      usagePerUser: 1,
      validFrom: new Date(),
      validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      applicableCategories: [],
      isActive: true,
    },
  })

  // Filter coupons based on search and status filter
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || coupon.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    // Here you would typically save the coupon to your database
    alert("Coupon saved successfully!")
    form.reset()
    setEditingCoupon(null)
  }

  // Set up form for editing
  const setupEditForm = (coupon: any) => {
    setEditingCoupon(coupon)
    form.reset({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountCap: coupon.maxDiscountCap || 0,
      usageLimit: coupon.usageLimit,
      usagePerUser: coupon.usagePerUser,
      validFrom: new Date(coupon.validFrom),
      validUntil: new Date(coupon.validUntil),
      applicableCategories: coupon.applicableCategories || [],
      isActive: coupon.status === "active",
    })
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }

    return (
      <Badge className={variants[status] || ""} variant="outline">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Coupons Management</h1>
      </div>

      <Tabs defaultValue="all-coupons">
        <TabsList className="mb-4">
          <TabsTrigger value="all-coupons">All Coupons</TabsTrigger>
          <TabsTrigger value="create-coupon">Create New</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* All Coupons Tab */}
        <TabsContent value="all-coupons">
          <Card>
            <CardHeader>
              <CardTitle>All Coupons</CardTitle>
              <CardDescription>Manage your discount coupons and promotional offers</CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search coupons..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      form.reset()
                      setEditingCoupon(null)
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Coupon
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table className="admin-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Coupon Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead className="hidden md:table-cell">Min. Order</TableHead>
                      <TableHead className="hidden md:table-cell">Usage Limit</TableHead>
                      <TableHead className="hidden md:table-cell">Valid Period</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoupons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No coupons found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCoupons.map((coupon) => (
                        <TableRow key={coupon.id}>
                          <TableCell className="font-medium">{coupon.code}</TableCell>
                          <TableCell>
                            {coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">₹{coupon.minOrderAmount}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {coupon.usageLimit === null ? "Unlimited" : coupon.usageLimit}
                            <span className="text-xs text-muted-foreground ml-1">({coupon.usagePerUser}/user)</span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {format(new Date(coupon.validFrom), "MMM d, yyyy")} -
                            {format(new Date(coupon.validUntil), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <StatusBadge status={coupon.status} />
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
                                <DropdownMenuItem onClick={() => setupEditForm(coupon)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this coupon?")) {
                                      // Delete logic would go here
                                      alert("Coupon deleted")
                                    }
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Coupon Tab */}
        <TabsContent value="create-coupon">
          <Card>
            <CardHeader>
              <CardTitle>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</CardTitle>
              <CardDescription>
                {editingCoupon
                  ? `Editing coupon ${editingCoupon.code}`
                  : "Create a new discount coupon for your customers"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coupon Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. SUMMER20" {...field} />
                          </FormControl>
                          <FormDescription>Customers will enter this code at checkout</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select discount type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                              <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Value</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Input type="number" {...field} min={1} />
                              <span className="ml-2">{form.watch("type") === "percentage" ? "%" : "₹"}</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minOrderAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Order Amount</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <span className="mr-2">₹</span>
                              <Input type="number" {...field} min={0} />
                            </div>
                          </FormControl>
                          <FormDescription>0 for no minimum</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("type") === "percentage" && (
                      <FormField
                        control={form.control}
                        name="maxDiscountCap"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Discount Cap</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <span className="mr-2">₹</span>
                                <Input type="number" {...field} min={0} placeholder="No cap" />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Maximum discount amount for percentage discounts (0 for no cap)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="usageLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Usage Limit</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => {
                                const value = e.target.value === "" ? null : Number.parseInt(e.target.value)
                                field.onChange(value)
                              }}
                              min={1}
                              placeholder="Unlimited"
                            />
                          </FormControl>
                          <FormDescription>Leave empty for unlimited usage</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="usagePerUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usage Per User</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min={1} />
                          </FormControl>
                          <FormDescription>How many times each user can use this coupon</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="validFrom"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Valid From</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className="w-full pl-3 text-left font-normal">
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="validUntil"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Valid Until</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className="w-full pl-3 text-left font-normal">
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                disabled={(date) => date < form.watch("validFrom")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="applicableCategories"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Applicable Categories</FormLabel>
                            <FormDescription>
                              Select which product categories this coupon can be applied to
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {categories.map((category) => (
                              <FormField
                                key={category.id}
                                control={form.control}
                                name="applicableCategories"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={category.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(category.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), category.id])
                                              : field.onChange(field.value?.filter((value) => value !== category.id))
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">{category.name}</FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormDescription className="mt-4">
                            Leave all unchecked to apply to all products
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Coupon Status</FormLabel>
                            <FormDescription>Enable or disable this coupon</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset()
                        setEditingCoupon(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">{editingCoupon ? "Update Coupon" : "Create Coupon"}</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{coupons.length}</div>
                <p className="text-xs text-muted-foreground">
                  {coupons.filter((c) => c.status === "active").length} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{coupons.reduce((sum, coupon) => sum + coupon.redemptions, 0)}</div>
                <p className="text-xs text-muted-foreground">+20% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{coupons.reduce((sum, coupon) => sum + coupon.revenue, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">+15% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Discount</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {coupons.filter((c) => c.type === "percentage").length > 0
                    ? `${Math.round(coupons.filter((c) => c.type === "percentage").reduce((sum, c) => sum + c.value, 0) / coupons.filter((c) => c.type === "percentage").length)}%`
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">Based on percentage discounts</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Most Used Coupons</CardTitle>
                <CardDescription>Top performing coupons by redemption count</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Coupon</TableHead>
                      <TableHead>Redemptions</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...coupons]
                      .sort((a, b) => b.redemptions - a.redemptions)
                      .slice(0, 5)
                      .map((coupon) => (
                        <TableRow key={coupon.id}>
                          <TableCell className="font-medium">{coupon.code}</TableCell>
                          <TableCell>{coupon.redemptions}</TableCell>
                          <TableCell>₹{coupon.revenue.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coupon Performance</CardTitle>
                <CardDescription>Redemption rate and revenue impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 opacity-50" />
                    <p className="mt-2">Chart visualization would appear here</p>
                    <p className="text-sm">Showing redemption rates over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
