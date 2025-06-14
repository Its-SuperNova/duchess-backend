"use client";

import { useState, useEffect } from "react"; // Import useEffect
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
import { toast } from "sonner";

// Import server actions
import {
  getProducts,
  deleteProduct,
  toggleProductVisibility,
} from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";

export default function ProductsPage() {
  const router = useRouter();
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(productsData || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch products and categories");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Delete product
  const confirmDelete = async () => {
    if (productToDelete && !deleting) {
      try {
        setDeleting(true);
        await deleteProduct(productToDelete);
        setProducts(
          products.filter((product) => product.id !== productToDelete)
        );
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
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "low-stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "out-of-stock":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Get stock status based on product data
  const getStockStatus = (product: any) => {
    if (!product.is_active) return "out-of-stock";

    // Check weight options
    if (product.weight_options && product.weight_options.length > 0) {
      const activeWeightOptions = product.weight_options.filter(
        (opt: any) => opt.isActive
      );
      if (activeWeightOptions.length === 0) return "out-of-stock";

      const totalStock = activeWeightOptions.reduce((sum: number, opt: any) => {
        const stock = parseInt(opt.stock) || 0;
        return sum + stock;
      }, 0);

      if (totalStock === 0) return "out-of-stock";
      if (totalStock <= 5) return "low-stock";
      return "in-stock";
    }

    // Check piece options
    if (product.piece_options && product.piece_options.length > 0) {
      const activePieceOptions = product.piece_options.filter(
        (opt: any) => opt.isActive
      );
      if (activePieceOptions.length === 0) return "out-of-stock";

      const totalStock = activePieceOptions.reduce((sum: number, opt: any) => {
        const stock = parseInt(opt.stock) || 0;
        return sum + stock;
      }, 0);

      if (totalStock === 0) return "out-of-stock";
      if (totalStock <= 5) return "low-stock";
      return "in-stock";
    }

    return "out-of-stock";
  };

  // Get price from product
  const getProductPrice = (product: any) => {
    if (product.weight_options && product.weight_options.length > 0) {
      const activeOption = product.weight_options.find(
        (opt: any) => opt.isActive
      );
      return activeOption ? parseInt(activeOption.price) : 0;
    }

    if (product.piece_options && product.piece_options.length > 0) {
      const activeOption = product.piece_options.find(
        (opt: any) => opt.isActive
      );
      return activeOption ? parseInt(activeOption.price) : 0;
    }

    return 0;
  };

  // Filter products based on search term, category, and stock status
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.short_description &&
        product.short_description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    // Category filter
    const matchesCategory =
      categoryFilter === "all" || product.categories?.name === categoryFilter;

    // Stock filter
    const stockStatus = getStockStatus(product);
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in-stock" && stockStatus === "in-stock") ||
      (stockFilter === "low-stock" && stockStatus === "low-stock") ||
      (stockFilter === "out-of-stock" && stockStatus === "out-of-stock");

    return matchesSearch && matchesCategory && matchesStock;
  });

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Products
          </h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/products/create")}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
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
          </div>

          <div className="flex gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>

            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => setShowEmptyState(!showEmptyState)}
            >
              {showEmptyState ? "Show Products" : "Show Empty"}
            </Button>
          </div>
        </div>
      </div>

      {/* Products Table or Empty State */}
      {showEmptyState || filteredProducts.length === 0 ? (
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
                  <TableHead className="hidden sm:table-cell">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const price = getProductPrice(product);

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={product.banner_image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {product.short_description}
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
                        <div className="font-medium">₹{price}</div>
                        {product.has_offer && product.offer_percentage && (
                          <div className="text-sm text-green-600">
                            {product.offer_percentage}% off
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-sm text-muted-foreground">
                          {stockStatus === "in-stock"
                            ? "Available"
                            : stockStatus === "low-stock"
                            ? "Low Stock"
                            : "Out of Stock"}
                        </div>
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
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product);
            const price = getProductPrice(product);

            return (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={product.banner_image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {product.has_offer && product.offer_percentage && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      {product.offer_percentage}% OFF
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold line-clamp-1">
                      {product.name}
                    </h3>
                    <Badge className={getStatusBadgeColor(stockStatus)}>
                      {stockStatus.replace("-", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {product.short_description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">₹{price}</span>
                    <Badge variant="outline">{product.categories?.name}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
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
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProduct(product)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
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
      {!showEmptyState && products.length > 0 && (
        <div className="flex items-center justify-end">
          <div className="text-sm text-muted-foreground mr-4">
            Showing <strong>1 - {Math.min(10, filteredProducts.length)}</strong>{" "}
            of <strong>{filteredProducts.length}</strong> products
          </div>
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
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

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
