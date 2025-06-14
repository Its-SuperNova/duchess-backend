"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Search, Tag, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
// Add these imports at the top with the other imports
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { CiCircleList } from "react-icons/ci";
// Add these imports at the top with the other imports
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

// Import server actions
import {
  getCategoriesWithProductCounts,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryVisibility,
} from "@/lib/actions/categories";

export default function CategoriesPage() {
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Add a new state variable after the other useState declarations
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state for add/edit category
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    isActive: true,
  });

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategoriesWithProductCounts();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Initialize edit form with category data
  const handleEditCategory = (category: any) => {
    setFormData({
      id: category.id,
      name: category.name,
      description: category.description || "",
      isActive: category.is_active,
    });
    setIsEditDialogOpen(true);
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Toggle active status
  const handleStatusChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isActive: checked,
    });
  };

  // Add new category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSaving(true);

      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        is_active: formData.isActive,
      };

      const newCategory = await createCategory(categoryData);

      setCategories([...categories, newCategory]);
      resetForm();
      setIsAddDialogOpen(false);
      toast.success("Category created successfully!");
    } catch (error) {
      console.error("Error creating category:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create category. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Update category
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSaving(true);

      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        is_active: formData.isActive,
      };

      const updatedCategory = await updateCategory(formData.id, categoryData);

      setCategories(
        categories.map((category) =>
          category.id === formData.id ? updatedCategory : category
        )
      );
      resetForm();
      setIsEditDialogOpen(false);
      toast.success("Category updated successfully!");
    } catch (error) {
      console.error("Error updating category:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update category. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Delete category
  const confirmDelete = async () => {
    if (categoryToDelete && !deleting) {
      try {
        setDeleting(true);
        await deleteCategory(categoryToDelete);
        setCategories(
          categories.filter((category) => category.id !== categoryToDelete)
        );
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
        toast.success("Category deleted successfully!");
      } catch (error) {
        console.error("Error deleting category:", error);
        if (
          error instanceof Error &&
          error.message.includes("contains products")
        ) {
          toast.error(
            "Cannot delete category: It contains products. Please move or delete all products first."
          );
        } else {
          toast.error("Failed to delete category");
        }
      } finally {
        setDeleting(false);
      }
    }
  };

  // Toggle category visibility
  const handleCategoryVisibilityChange = async (
    categoryId: string,
    checked: boolean
  ) => {
    try {
      await toggleCategoryVisibility(categoryId, checked);
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === categoryId
            ? { ...category, is_active: checked }
            : category
        )
      );
      toast.success(
        `Category ${checked ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error toggling category visibility:", error);
      toast.error("Failed to update category visibility");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      description: "",
      isActive: true,
    });
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading categories...</p>
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
            Categories
          </h1>
          <p className="text-muted-foreground">
            Manage product categories and classifications
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Category
        </Button>
      </div>

      {/* Search and Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 justify-between sm:justify-start">
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
          <Button
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => setShowEmptyState(!showEmptyState)}
          >
            {showEmptyState ? "Show Categories" : "Show Empty"}
          </Button>
        </div>
      </div>

      {/* Categories Table or Empty State */}
      {showEmptyState || filteredCategories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-blue-100 p-4 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              <Tag className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              No categories available yet
            </h3>
            <p className="mt-2 max-w-sm text-center text-muted-foreground">
              Start adding categories to organize your products! Categories you
              add will appear here.
            </p>
            <Button
              className="mt-6 bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Category
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card>
          <div className="overflow-x-auto">
            <Table className="admin-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                          <Tag className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{category.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {category.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {category.products_count} products
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          category.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }
                      >
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={category.is_active}
                          onCheckedChange={(checked) =>
                            handleCategoryVisibilityChange(category.id, checked)
                          }
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <Label className="text-sm">
                          {category.is_active ? "Visible" : "Hidden"}
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
                                onClick={() => handleEditCategory(category)}
                                className="h-8 w-8"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit category</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setCategoryToDelete(category.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                disabled={category.products_count > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {category.products_count > 0
                                ? "Cannot delete: Category has products"
                                : "Delete category"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        // Card view implementation
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                    <Tag className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {category.products_count} products
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {category.description || "No description"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={category.is_active}
                      onCheckedChange={(checked) =>
                        handleCategoryVisibilityChange(category.id, checked)
                      }
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <Label className="text-sm">
                      {category.is_active ? "Active" : "Inactive"}
                    </Label>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCategory(category)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCategoryToDelete(category.id);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                      disabled={category.products_count > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!showEmptyState && categories.length > 0 && (
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
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category to organize your products. Categories help
              customers find what they're looking for.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="E.g., Cakes, Cookies, Pastries"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleStatusChange}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information. Changes will be reflected
              immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="E.g., Cakes, Cookies, Pastries"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={handleStatusChange}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Updating..." : "Update Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCategoryToDelete(null);
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
