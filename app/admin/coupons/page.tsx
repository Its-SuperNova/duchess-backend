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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [toggleConfirm, setToggleConfirm] = useState<{
    id: string;
    currentStatus: boolean;
    code: string;
  } | null>(null);
  const [isToggleLoading, setIsToggleLoading] = useState(false);

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
      {/* Toggle confirmation dialog */}
      <AlertDialog
        open={!!toggleConfirm}
        onOpenChange={(open) => !open && setToggleConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleConfirm?.currentStatus
                ? "Disable coupon?"
                : "Enable coupon?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleConfirm?.currentStatus
                ? `Are you sure you want to disable coupon ${toggleConfirm?.code}?`
                : `Are you sure you want to enable coupon ${toggleConfirm?.code}?`}
              {isToggleLoading && (
                <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                  <span>Updating...</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setToggleConfirm(null)}
              disabled={isToggleLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isToggleLoading}
              onClick={async () => {
                if (toggleConfirm) {
                  try {
                    setIsToggleLoading(true);
                    await handleToggleCouponStatus(
                      toggleConfirm.id,
                      toggleConfirm.currentStatus
                    );
                  } finally {
                    setIsToggleLoading(false);
                    setToggleConfirm(null);
                  }
                }
              }}
            >
              {isToggleLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                  Updating...
                </span>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
                              setToggleConfirm({
                                id: coupon.id,
                                currentStatus: coupon.is_active,
                                code: coupon.code,
                              })
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
                filteredCoupons.map((coupon) => {
                  // Calculate discount display text
                  const discountText =
                    coupon.type === "percentage"
                      ? `${coupon.value}% OFF`
                      : `₹${coupon.value} OFF`;

                  return (
                    <div key={coupon.id} className="w-full max-w-md mx-auto">
                      <div className="relative bg-white rounded-xl overflow-hidden border shadow-sm">
                        {/* Orange left section with perforated edge */}
                        <div className="absolute left-0 top-0 bottom-0 w-20 bg-[#921c1c] flex items-center justify-center">
                          {/* Perforated circles on the left edge - only 4 circles centered */}
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div
                                key={i}
                                className="w-3 h-3 bg-[#f5f6fa] rounded-full -ml-1.5 mb-2 last:mb-0"
                              />
                            ))}
                          </div>

                          {/* Vertical discount text */}
                          <div className="text-white font-bold text-sm tracking-wider transform -rotate-90 whitespace-nowrap">
                            {discountText}
                          </div>
                        </div>

                        {/* Main content area */}
                        <div className="ml-20 p-4">
                          {/* Header with coupon code and status */}
                          <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold text-gray-800">
                              {coupon.code}
                            </h2>
                            <StatusBadge coupon={coupon} />
                          </div>

                          {/* Save amount */}
                          <div className="mb-2">
                            <p className="text-lg font-semibold text-green-600">
                              Save ₹
                              {coupon.type === "percentage"
                                ? Math.round(coupon.value)
                                : coupon.value}{" "}
                              on orders!
                            </p>
                          </div>

                          {/* Dotted separator */}
                          <div className="border-t-2 border-dotted border-gray-300 mb-2"></div>

                          {/* Description */}
                          <div className="mb-3">
                            <p className="text-gray-600 text-sm leading-relaxed">
                              Use code {coupon.code} and get {discountText} on
                              orders above ₹{coupon.min_order_amount || 0}
                              {coupon.max_discount_cap &&
                                coupon.type === "percentage" && (
                                  <span>
                                    . Maximum discount: ₹
                                    {coupon.max_discount_cap}
                                  </span>
                                )}
                            </p>
                          </div>

                          {/* Additional admin info */}
                          <div className="space-y-2 text-xs text-gray-500">
                            <div className="flex gap-2">
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-50 border-blue-200 text-blue-700"
                              >
                                Usage Limit:{" "}
                                {coupon.usage_limit === null
                                  ? "Unlimited"
                                  : coupon.usage_limit}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-50 border-green-200 text-green-700"
                              >
                                Per User: {coupon.usage_per_user}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Valid Period:</span>
                              <span>
                                {format(
                                  new Date(coupon.valid_from),
                                  "MMM d, yyyy"
                                )}{" "}
                                -{" "}
                                {format(
                                  new Date(coupon.valid_until),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Status:</span>
                              <Switch
                                checked={coupon.is_active}
                                onCheckedChange={() =>
                                  setToggleConfirm({
                                    id: coupon.id,
                                    currentStatus: coupon.is_active,
                                    code: coupon.code,
                                  })
                                }
                                className="data-[state=checked]:bg-green-600"
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={() => {
                                  window.location.href = `/admin/coupons/edit/${coupon.id}`;
                                }}
                              >
                                <Edit className="mr-1 h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteCoupon(coupon.id)}
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
