"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { CiCircleList } from "react-icons/ci";
import { format } from "date-fns";
import { toast } from "sonner";
import { Coupon } from "@/lib/supabase";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Fetch coupons from database
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/coupons");
      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }
      const data = await response.json();
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Filter coupons based on search and status filter
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && coupon.is_active) ||
      (statusFilter === "inactive" && !coupon.is_active) ||
      (statusFilter === "expired" && new Date(coupon.valid_until) < new Date());
    return matchesSearch && matchesStatus;
  });

  // Handle delete coupon
  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete coupon");
      }

      toast.success("Coupon deleted successfully!");
      await fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon");
    }
  };

  // Handle toggle coupon status
  const handleToggleCouponStatus = async (
    id: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update coupon status");
      }

      toast.success(
        `Coupon ${!currentStatus ? "enabled" : "disabled"} successfully!`
      );
      await fetchCoupons();
    } catch (error) {
      console.error("Error updating coupon status:", error);
      toast.error("Failed to update coupon status");
    }
  };

  // Status badge component
  const StatusBadge = ({ coupon }: { coupon: Coupon }) => {
    const now = new Date();
    const validUntil = new Date(coupon.valid_until);

    let status = "active";
    if (!coupon.is_active) {
      status = "inactive";
    } else if (validUntil < now) {
      status = "expired";
    }

    const variants: Record<string, string> = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    return (
      <Badge className={variants[status] || ""} variant="outline">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading coupons...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Coupons Management</h1>
          <p className="text-md text-muted-foreground">
            Manage your discount coupons and promotional offers
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/admin/coupons/analytics";
            }}
            className="w-full sm:w-auto"
          >
            <BarChart3 className="mr-2 h-4 w-4" /> Analytics
          </Button>
          <Button
            onClick={() => {
              window.location.href = "/admin/coupons/create";
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Coupon
          </Button>
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className={viewMode === "card" ? "bg-muted" : ""}
                  onClick={() => setViewMode("card")}
                >
                  <HiOutlineSquares2X2 className="h-5 w-5" />
                  <span className="sr-only">Card View</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={viewMode === "table" ? "bg-muted" : ""}
                  onClick={() => setViewMode("table")}
                >
                  <CiCircleList className="h-5 w-5" />
                  <span className="sr-only">Table View</span>
                </Button>
              </div>
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
            </div>
          </div>
        </div>
        <div>
          {viewMode === "table" ? (
            <div className="rounded-md border overflow-hidden">
              <Table className="admin-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Coupon Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Min. Order
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Usage Limit
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Valid Period
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="text-center">
                      Enable/Disable
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No coupons found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-medium">
                          {coupon.code}
                        </TableCell>
                        <TableCell>
                          {coupon.type === "percentage"
                            ? `${coupon.value}%`
                            : `₹${coupon.value}`}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          ₹{coupon.min_order_amount}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {coupon.usage_limit === null
                            ? "Unlimited"
                            : coupon.usage_limit}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({coupon.usage_per_user}/user)
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {format(new Date(coupon.valid_from), "MMM d, yyyy")} -
                          {format(new Date(coupon.valid_until), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <StatusBadge coupon={coupon} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={coupon.is_active}
                            onCheckedChange={() =>
                              handleToggleCouponStatus(
                                coupon.id,
                                coupon.is_active
                              )
                            }
                            className="data-[state=checked]:bg-green-600"
                          />
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
                              <DropdownMenuItem
                                onClick={() => {
                                  window.location.href = `/admin/coupons/edit/${coupon.id}`;
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteCoupon(coupon.id)}
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCoupons.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No coupons found
                </div>
              ) : (
                filteredCoupons.map((coupon) => (
                  <Card key={coupon.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">
                          {coupon.code}
                        </CardTitle>
                        <StatusBadge coupon={coupon} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Discount:
                        </span>
                        <span className="font-medium">
                          {coupon.type === "percentage"
                            ? `${coupon.value}%`
                            : `₹${coupon.value}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Min Order:
                        </span>
                        <span className="font-medium">
                          ₹{coupon.min_order_amount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Usage Limit:
                        </span>
                        <span className="font-medium">
                          {coupon.usage_limit === null
                            ? "Unlimited"
                            : coupon.usage_limit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Per User:
                        </span>
                        <span className="font-medium">
                          {coupon.usage_per_user}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Valid Period:
                        </span>
                        <span className="font-medium text-xs">
                          {format(new Date(coupon.valid_from), "MMM d, yyyy")} -
                          {format(new Date(coupon.valid_until), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Status:
                        </span>
                        <Switch
                          checked={coupon.is_active}
                          onCheckedChange={() =>
                            handleToggleCouponStatus(
                              coupon.id,
                              coupon.is_active
                            )
                          }
                          className="data-[state=checked]:bg-green-600"
                        />
                      </div>
                    </CardContent>
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              window.location.href = `/admin/coupons/edit/${coupon.id}`;
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
