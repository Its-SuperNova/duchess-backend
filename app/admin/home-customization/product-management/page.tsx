"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Search,
  Package,
  Eye,
  EyeOff,
  Star,
  StarOff,
  RefreshCw,
  Grid3X3,
  List,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { getProductThumbnailUrl } from "@/lib/image-utils";
import { getProductPrice } from "@/lib/utils";
import AdminProductCard from "@/components/admin-product-card";

// Import server actions
import {
  getAllProductsForManagement,
  toggleProductVisibility,
} from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";
import {
  getProductSections,
  addProductToSection,
  removeProductFromSection,
} from "@/lib/actions/sections";

export default function HomeCustomizationProductManagementPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Dialog state
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState("");

  // Load products, categories, and sections
  const loadData = async () => {
    try {
      setLoading(true);

      // Load categories, sections, and products in parallel
      const [categoriesData, sectionsData, productsResult] = await Promise.all([
        getCategories(),
        getProductSections(),
        getAllProductsForManagement({
          search: searchTerm,
          categoryFilter: categoryFilter || "all",
        }),
      ]);

      setCategories(categoriesData || []);
      setSections(sectionsData || []);

      // Set first category as default if no category is selected
      let currentCategoryFilter = categoryFilter;
      if (!categoryFilter && categoriesData && categoriesData.length > 0) {
        currentCategoryFilter = categoriesData[0].name;
        setCategoryFilter(categoriesData[0].name);
      }

      setProducts(productsResult.products || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, categoryFilter]);

  // Toggle product visibility on homepage
  // Handle adding product to homepage section
  const handleAddToHomepage = (product: any) => {
    setSelectedProduct(product);
    setSelectedSection("");
    setSectionDialogOpen(true);
  };

  // Get which section a product belongs to
  const getProductSection = (productId: string) => {
    for (const section of sections) {
      if (section.products?.some((p: any) => p.id === productId)) {
        return section;
      }
    }
    return null;
  };

  // Handle removing product from homepage section
  const handleRemoveFromHomepage = async (productId: string) => {
    try {
      const section = getProductSection(productId);
      if (section) {
        await removeProductFromSection(section.id, productId);
        toast.success(`Product removed from ${section.title}`);
      } else {
        toast.error("Product not found in any section");
      }
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Error removing from homepage:", error);
      toast.error("Failed to remove product from homepage");
    }
  };

  // Add product to selected section
  const handleAddToSection = async () => {
    if (!selectedProduct || !selectedSection) {
      toast.error("Please select a section");
      return;
    }

    try {
      await addProductToSection(selectedSection, selectedProduct.id);
      toast.success(
        `Product added to ${
          sections.find((s) => s.id === selectedSection)?.title || "section"
        }`
      );
      setSectionDialogOpen(false);
      setSelectedProduct(null);
      setSelectedSection("");
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Error adding product to section:", error);
      toast.error("Failed to add product to section");
    }
  };

  // Use all products without homepage filter
  const filteredProducts = products;

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Product Management
            </h1>
            <p className="text-muted-foreground">
              Manage which products appear on the homepage
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Product Management
            </h1>
            <p className="text-muted-foreground">
              Manage which products appear on the homepage
            </p>
          </div>
        </div>
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() =>
            router.push(
              "/admin/home-customization/product-management/arrangement"
            )
          }
        >
          Arrangement
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 w-full sm:w-auto sm:min-w-[200px]">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
            </div>

            <div className="space-y-2 w-full sm:w-auto">
              <Label>View Mode</Label>
              <div className="flex gap-2">
                <Button
                  className={
                    viewMode === "table"
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : ""
                  }
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4 mr-2" />
                  Table
                </Button>
                <Button
                  className={
                    viewMode === "card"
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : ""
                  }
                  variant={viewMode === "card" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("card")}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Cards
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {categoryFilter && categoryFilter !== "all"
              ? `${categoryFilter} Products`
              : "Products"}{" "}
            ({filteredProducts.length})
          </CardTitle>
          <CardDescription>
            Manage which products are displayed on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={getProductThumbnailUrl(product)}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {product.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ₹{getProductPrice(product).price}
                        </span>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const section = getProductSection(product.id);
                          return section ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              {section.title}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No section
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          className="border-blue-500 text-blue-500 hover:bg-blue-50"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const section = getProductSection(product.id);
                            if (section) {
                              handleRemoveFromHomepage(product.id);
                            } else {
                              handleAddToHomepage(product);
                            }
                          }}
                        >
                          {(() => {
                            const section = getProductSection(product.id);
                            return section ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Remove from {section.title}
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Add to Homepage
                              </>
                            );
                          })()}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const section = getProductSection(product.id);
                return (
                  <AdminProductCard
                    key={product.id}
                    product={product}
                    section={section}
                    onToggleHomepage={handleAddToHomepage}
                    onRemoveFromHomepage={handleRemoveFromHomepage}
                  />
                );
              })}
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Selection Dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product to Homepage Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProduct && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={getProductThumbnailUrl(selectedProduct)}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct.categories?.name || "No category"}
                  </p>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="section-select">Select Section</Label>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a section to add this product to" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{section.title}</span>
                        <Badge variant="outline" className="ml-2">
                          {section.current_products_count || 0}/
                          {section.max_products}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sections.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No sections available. Create sections first in the section
                  management.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSectionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToSection}
                disabled={!selectedSection}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Add to Section
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
