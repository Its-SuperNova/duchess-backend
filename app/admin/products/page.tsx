"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  FileDown,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  RefreshCw,
  Upload,
} from "lucide-react";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { CiCircleList } from "react-icons/ci";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Import optimized server actions
import {
  getAdminProducts,
  deleteProduct,
  toggleProductVisibility,
} from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";
import { BulkImageUpdate } from "./components/bulk-image-update";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const itemsPerPage = 8;

  // Debounced search term for better performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products with optimized backend function
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAdminProducts({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        categoryFilter,
        stockFilter,
        orderTypeFilter,
      });

      setProducts(result.products || []);
      setTotalCount(result.totalCount || 0);
      setHasMore(result.hasMore || false);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    debouncedSearchTerm,
    categoryFilter,
    stockFilter,
    orderTypeFilter,
  ]);

  // Fetch categories (only once on mount)
  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  }, []);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, categoryFilter, stockFilter, orderTypeFilter]);

  // Delete product
  const confirmDelete = async () => {
    if (productToDelete && !deleting) {
      try {
        setDeleting(true);
        await deleteProduct(productToDelete);
        // Refresh the current page data
        await fetchProducts();
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
        toast.success("Product deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      } finally {
        setDeleting(false);
      }
    }
  };

  // Handle navigation to edit product
  const handleEditProduct = (product: any) => {
    router.push(`/admin/products/edit/${product.id}`);
  };

  // Handle product visibility change
  const handleProductVisibilityChange = async (
    productId: string,
    checked: boolean
  ) => {
    try {
      await toggleProductVisibility(productId, checked);
      // Update local state immediately for better UX
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId
            ? { ...product, is_active: checked }
            : product
        )
      );
      toast.success(
        `Product ${checked ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error toggling product visibility:", error);
      toast.error("Failed to update product visibility");
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "in-stock":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900 dark:hover:text-green-300";
      case "low-stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-100 hover:text-yellow-800 dark:hover:bg-yellow-900 dark:hover:text-yellow-300";
      case "out-of-stock":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 hover:bg-red-100 hover:text-red-800 dark:hover:bg-red-900 dark:hover:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-300";
    }
  };

  // Get stock status based on product data
  const getStockStatus = (product: any) => {
    if (!product.is_active) return "out-of-stock";

    // Use selling_type to determine which stock to check
    if (product.selling_type === "weight" || product.selling_type === "both") {
      // Check weight stock for weight-based products
      if (product.weight_options && product.weight_options.length > 0) {
        const activeWeightOptions = product.weight_options.filter(
          (opt: any) => opt.isActive
        );
        if (activeWeightOptions.length > 0) {
          const totalStock = activeWeightOptions.reduce(
            (sum: number, opt: any) => {
              const stock = parseInt(opt.stock) || 0;
              return sum + stock;
            },
            0
          );

          if (totalStock === 0) return "out-of-stock";
          if (totalStock <= 5) return "low-stock";
          return "in-stock";
        }
        return "out-of-stock"; // Has weight options but none are active
      }
    }

    // Check piece stock for piece-based products or fallback
    if (product.piece_options && product.piece_options.length > 0) {
      const activePieceOptions = product.piece_options.filter(
        (opt: any) => opt.isActive
      );
      if (activePieceOptions.length > 0) {
        const totalStock = activePieceOptions.reduce(
          (sum: number, opt: any) => {
            const stock = parseInt(opt.stock) || 0;
            return sum + stock;
          },
          0
        );

        if (totalStock === 0) return "out-of-stock";
        if (totalStock <= 5) return "low-stock";
        return "in-stock";
      }
    }

    return "out-of-stock";
  };

  // Get order type from product
  const getOrderType = (product: any) => {
    // Use the selling_type field from database as the authoritative source
    switch (product.selling_type) {
      case "weight":
        return "By weight";
      case "piece":
        return "By piece";
      case "both":
        return "Both";
      default:
        return "N/A";
    }
  };

  // Get price from product
  const getProductPrice = (product: any) => {
    // Use selling_type to determine what price to show
    if (product.selling_type === "weight" || product.selling_type === "both") {
      // Show weight price with weight
      if (product.weight_options && product.weight_options.length > 0) {
        const activeWeightOptions = product.weight_options.filter(
          (opt: any) => opt.isActive
        );
        if (activeWeightOptions.length > 0) {
          // Find the option with minimum price
          const minPriceOption = activeWeightOptions.reduce(
            (min: any, current: any) => {
              const currentPrice = parseFloat(current.price) || 0;
              const minPrice = parseFloat(min.price) || 0;
              return currentPrice < minPrice ? current : min;
            }
          );

          const price = parseFloat(minPriceOption.price) || 0;
          const weight = minPriceOption.weight || "";

          return {
            price,
            display: `₹${price}/${weight}`,
            type: "weight",
          };
        }
      }
    }

    // Show piece price only (for selling_type === 'piece' or fallback)
    if (product.piece_options && product.piece_options.length > 0) {
      const activePieceOptions = product.piece_options.filter(
        (opt: any) => opt.isActive
      );
      if (activePieceOptions.length > 0) {
        // Find the option with minimum price
        const minPriceOption = activePieceOptions.reduce(
          (min: any, current: any) => {
            const currentPrice = parseFloat(current.price) || 0;
            const minPrice = parseFloat(min.price) || 0;
            return currentPrice < minPrice ? current : min;
          }
        );

        const price = parseFloat(minPriceOption.price) || 0;

        return {
          price,
          display: `₹${price}/piece`,
          type: "piece",
        };
      }
    }

    return {
      price: 0,
      display: "₹0",
      type: "none",
    };
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // Skeleton components
  const TableSkeleton = () => (
    <Card>
      <div className="overflow-x-auto">
        <Table className="admin-table">
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden sm:table-cell">Order Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-16 w-16 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-10 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );

  const CardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="overflow-hidden flex flex-col h-full">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-4 flex flex-col flex-grow space-y-3">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-10 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex space-x-1">
                <Skeleton className="h-7 w-7 rounded" />
                <Skeleton className="h-7 w-7 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading && products.length === 0) {
    return (
      <div className="flex-1 space-y-6 p-6 md:p-8">
        {/* Page Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Search and Filters Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Skeleton className="h-10 flex-1" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Table Skeleton */}
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            Products
            <span className="text-base font-medium text-muted-foreground">
              (Total: {totalCount})
            </span>
          </h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => setShowBulkUpdate(true)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Upload className="mr-2 h-4 w-4" />
            Bulk Update Images
          </Button>
          <Button
            onClick={() => router.push("/admin/products/create")}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-between sm:justify-start">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className={viewMode === "card" ? "bg-muted" : ""}
              onClick={() => setViewMode("card")}
            >
              <HiOutlineSquares2X2 className="h-5 w-5" />
              <span className="sr-only">Grid View</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={viewMode === "table" ? "bg-muted" : ""}
              onClick={() => setViewMode("table")}
            >
              <CiCircleList className="h-5 w-5" />
              <span className="sr-only">List View</span>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={stockFilter}
              onValueChange={(value) => setStockFilter(value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={orderTypeFilter}
              onValueChange={(value) => setOrderTypeFilter(value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Order Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Order Types</SelectItem>
                <SelectItem value="weight">By Weight</SelectItem>
                <SelectItem value="piece">By Piece</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            {/* Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              className="flex-1 sm:flex-none"
              onClick={() => fetchProducts()}
              aria-label="Refresh"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Table or Empty State */}
      {totalCount === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-blue-100 p-4 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              <Package className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              No products available yet
            </h3>
            <p className="mt-2 max-w-sm text-center text-muted-foreground">
              Start adding delicious treats to your catalog! Products you add
              will appear here.
            </p>
            <Button
              className="mt-6 bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push("/admin/products/create")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card>
          <div className="overflow-x-auto">
            <Table className="admin-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Order Type
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const priceData = getProductPrice(product);
                  const orderType = getOrderType(product);

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                            <Image
                              src={product.banner_image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-[200px]">
                            <div className="font-medium truncate">
                              {product.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">
                          {product.categories?.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{priceData.display}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary" className="text-xs">
                          {orderType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(stockStatus)}>
                          {stockStatus.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={product.is_active}
                            onCheckedChange={(checked) =>
                              handleProductVisibilityChange(product.id, checked)
                            }
                            className="data-[state=checked]:bg-blue-600"
                          />
                          <Label className="text-sm">
                            {product.is_active ? "Active" : "Inactive"}
                          </Label>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditProduct(product)}
                                  className="h-8 w-8"
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit product</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setProductToDelete(product.id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="h-8 w-8 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete product</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        // Card view implementation would go here
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const stockStatus = getStockStatus(product);
            const priceData = getProductPrice(product);
            const orderType = getOrderType(product);

            return (
              <Card
                key={product.id}
                className="overflow-hidden flex flex-col h-full"
              >
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={product.banner_image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <CardContent className="p-4 flex flex-col flex-grow">
                  {/* Header Section */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm leading-tight flex-1 min-w-0">
                      {product.name}
                    </h3>
                    <Badge
                      className={`${getStatusBadgeColor(
                        stockStatus
                      )} flex-shrink-0 text-xs`}
                    >
                      {stockStatus.replace("-", " ")}
                    </Badge>
                  </div>

                  {/* Price and Badges Section */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-lg">
                        {priceData.display}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {product.categories?.name}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {orderType}
                      </Badge>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.is_active}
                        onCheckedChange={(checked) =>
                          handleProductVisibilityChange(product.id, checked)
                        }
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <Label className="text-xs text-muted-foreground">
                        {product.is_active ? "Active" : "Inactive"}
                      </Label>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProduct(product)}
                        className="h-7 w-7"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setProductToDelete(product.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="h-7 w-7 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <strong>
              {startIndex + 1} - {endIndex}
            </strong>{" "}
            of <strong>{totalCount}</strong> products
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={goToPrevious}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* First page */}
                {currentPage > 2 && (
                  <>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => goToPage(1)}
                        className="cursor-pointer"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    {currentPage > 3 && <PaginationEllipsis />}
                  </>
                )}

                {/* Previous page */}
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => goToPage(currentPage - 1)}
                      className="cursor-pointer"
                    >
                      {currentPage - 1}
                    </PaginationLink>
                  </PaginationItem>
                )}

                {/* Current page */}
                <PaginationItem>
                  <PaginationLink isActive>{currentPage}</PaginationLink>
                </PaginationItem>

                {/* Next page */}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => goToPage(currentPage + 1)}
                      className="cursor-pointer"
                    >
                      {currentPage + 1}
                    </PaginationLink>
                  </PaginationItem>
                )}

                {/* Last page */}
                {currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && <PaginationEllipsis />}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => goToPage(totalPages)}
                        className="cursor-pointer"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={goToNext}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {/* Bulk Image Update Dialog */}
      <Dialog open={showBulkUpdate} onOpenChange={setShowBulkUpdate}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Update Product Images</DialogTitle>
            <DialogDescription>
              Update banner images for multiple products at once. This will
              upload images to Cloudinary and update the product records.
            </DialogDescription>
          </DialogHeader>
          <BulkImageUpdate
            onUpdateComplete={() => {
              setShowBulkUpdate(false);
              fetchProducts(); // Refresh the products list
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setProductToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
