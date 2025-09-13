"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Search, GripVertical, X, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getProductSections,
  addProductToSection,
  removeProductFromSection,
  updateProductOrderInSection,
  ProductSection,
} from "@/lib/actions/sections";
import { getAllProductsForManagement } from "@/lib/actions/products";
import { getProductThumbnailUrl } from "@/lib/image-utils";

export default function SectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sectionId = params.id as string;

  const [section, setSection] = useState<ProductSection | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedProduct, setDraggedProduct] = useState<string | null>(null);

  useEffect(() => {
    if (sectionId) {
      loadData();
    }
  }, [sectionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sectionsData, productsData] = await Promise.all([
        getProductSections(),
        getAllProductsForManagement({}),
      ]);

      const currentSection = sectionsData.find((s) => s.id === sectionId);
      if (!currentSection) {
        toast({
          title: "Error",
          description: "Section not found",
          variant: "destructive",
        });
        router.back();
        return;
      }

      setSection(currentSection);
      setAllProducts(productsData.products || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load section data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productId: string) => {
    try {
      await addProductToSection(sectionId, productId);
      await loadData();
      toast({
        title: "Success",
        description: "Product added to section",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product to section",
        variant: "destructive",
      });
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    try {
      await removeProductFromSection(sectionId, productId);
      await loadData();
      toast({
        title: "Success",
        description: "Product removed from section",
      });
    } catch (error) {
      console.error("Error removing product:", error);
      toast({
        title: "Error",
        description: "Failed to remove product from section",
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, productId: string) => {
    setDraggedProduct(productId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetProductId: string) => {
    e.preventDefault();

    if (!draggedProduct || draggedProduct === targetProductId || !section) {
      setDraggedProduct(null);
      return;
    }

    const currentProducts = section.products || [];
    const newProducts = [...currentProducts];
    const draggedIndex = newProducts.findIndex((p) => p.id === draggedProduct);
    const targetIndex = newProducts.findIndex((p) => p.id === targetProductId);

    // Move product to new position
    const [movedProduct] = newProducts.splice(draggedIndex, 1);
    newProducts.splice(targetIndex, 0, movedProduct);

    // Update local state
    setSection({
      ...section,
      products: newProducts,
    });

    // Update order in database
    try {
      await updateProductOrderInSection(
        sectionId,
        newProducts.map((p) => p.id)
      );
      toast({
        title: "Success",
        description: "Product order updated",
      });
    } catch (error) {
      console.error("Error updating product order:", error);
      toast({
        title: "Error",
        description: "Failed to update product order",
        variant: "destructive",
      });
      // Revert on error
      await loadData();
    }

    setDraggedProduct(null);
  };

  const availableProducts = allProducts.filter((product) => {
    const isInSection = section?.products?.some((p) => p.id === product.id);
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return !isInSection && matchesSearch;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading section...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Section not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {section.title}
            </h1>
            <p className="text-muted-foreground">
              {section.description || "Manage products in this section"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {section.current_products_count || 0} / {section.max_products}{" "}
            products
          </Badge>
          <Dialog
            open={addProductDialogOpen}
            onOpenChange={setAddProductDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Products
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Add Products to {section.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {availableProducts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {searchTerm
                        ? "No products found matching your search"
                        : "All products are already in this section"}
                    </p>
                  ) : (
                    availableProducts.map((product) => (
                      <Card key={product.id} className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={getProductThumbnailUrl(product)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">
                              {product.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {product.categories?.name || "No category"}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddProduct(product.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            Add
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Section Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Products in {section.title}
            <Badge variant="outline">
              {section.current_products_count || 0} products
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!section.products || section.products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No products in this section yet.
              </p>
              <Button
                onClick={() => setAddProductDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {section.products.map((product, index) => (
                <Card
                  key={product.id}
                  className={`relative transition-all duration-200 ${
                    draggedProduct === product.id
                      ? "opacity-50 scale-95"
                      : "hover:shadow-lg"
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, product.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, product.id)}
                >
                  {/* Position Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProduct(product.id)}
                      className="h-6 w-6 p-0 bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Drag Handle */}
                  <div className="absolute top-2 right-8 z-10">
                    <div className="flex items-center justify-center w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full shadow-sm cursor-move">
                      <GripVertical className="h-3 w-3 text-gray-600" />
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {/* Product Image */}
                    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 mb-3">
                      <img
                        src={getProductThumbnailUrl(product)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {product.categories?.name || "No category"}
                      </p>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1">
                        {product.is_veg && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Veg
                          </span>
                        )}
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          {product.selling_type}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
