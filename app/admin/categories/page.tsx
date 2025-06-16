"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Plus, Search, Tag, Pencil, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
// Add these imports at the top with the other imports
import { HiOutlineSquares2X2 } from "react-icons/hi2"
import { CiCircleList } from "react-icons/ci"
// Add these imports at the top with the other imports
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Sample categories data
const initialCategories = [
  {
    id: 1,
    name: "Cakes",
    description: "Delicious cakes and pastries",
    products: 24,
    isActive: true,
  },
  {
    id: 2,
    name: "Cupcakes",
    description: "Colorful small cakes",
    products: 10,
    isActive: true,
  },
  {
    id: 3,
    name: "Cookies",
    description: "Crunchy and soft cookies",
    products: 8,
    isActive: false,
  },
  {
    id: 4,
    name: "Breads",
    description: "Freshly baked bread and rolls",
    products: 15,
    isActive: true,
  },
  {
    id: 5,
    name: "Pastries",
    description: "Flaky and delicate pastries",
    products: 18,
    isActive: true,
  },
  {
    id: 6,
    name: "Donuts",
    description: "Sweet and fluffy donuts",
    products: 12,
    isActive: true,
  },
  {
    id: 7,
    name: "Brownies",
    description: "Rich chocolate treats",
    products: 6,
    isActive: true,
  },
]

export default function CategoriesPage() {
  const [showEmptyState, setShowEmptyState] = useState(false)
  const [categories, setCategories] = useState(initialCategories)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  // Add a new state variable after the other useState declarations
  const [viewMode, setViewMode] = useState<"table" | "card">("table")

  // Form state for add/edit category
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    description: "",
    isActive: true,
  })

  // Initialize edit form with category data
  const handleEditCategory = (category: any) => {
    setFormData({
      id: category.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    })
    setIsEditDialogOpen(true)
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Toggle active status
  const handleStatusChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isActive: checked,
    })
  }

  // Add new category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    const newCategory = {
      id: categories.length + 1,
      name: formData.name,
      description: formData.description,
      products: 0,
      isActive: formData.isActive,
    }

    setCategories([...categories, newCategory])
    resetForm()
    setIsAddDialogOpen(false)
  }

  // Update category
  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedCategories = categories.map((category) =>
      category.id === formData.id
        ? { ...category, name: formData.name, description: formData.description, isActive: formData.isActive }
        : category,
    )

    setCategories(updatedCategories)
    resetForm()
    setIsEditDialogOpen(false)
  }

  // Delete category
  const confirmDelete = () => {
    if (categoryToDelete !== null) {
      setCategories(categories.filter((category) => category.id !== categoryToDelete))
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      id: 0,
      name: "",
      description: "",
      isActive: true,
    })
  }

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage product categories and classifications</p>
        </div>

        <Button
          onClick={() => {
            resetForm()
            setIsAddDialogOpen(true)
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
            onClick={() => setViewMode("table")}
            className={viewMode === "table" ? "bg-muted" : ""}
          >
            <CiCircleList className="h-5 w-5" />
            <span className="sr-only">List View</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("card")}
            className={viewMode === "card" ? "bg-muted" : ""}
          >
            <HiOutlineSquares2X2 className="h-5 w-5" />
            <span className="sr-only">Grid View</span>
          </Button>
          <Button variant="outline" className="ml-auto" onClick={() => setShowEmptyState(!showEmptyState)}>
            {showEmptyState ? "Show Categories" : "Show Empty State"}
          </Button>
        </div>
      </div>

      {/* Categories Table or Card View or Empty State */}
      {showEmptyState || categories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-blue-100 p-4 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              <Tag className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No categories found</h3>
            <p className="mt-2 max-w-sm text-center text-muted-foreground">
              Create your first category to organize your products. Categories help customers find what they're looking
              for.
            </p>
            <Button className="mt-6 bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddDialogOpen(true)}>
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
                  <TableHead>Category Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Total Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate">{category.description}</TableCell>
                    <TableCell className="hidden sm:table-cell">{category.products} Products</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          category.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`category-visibility-${category.id}`}
                          checked={category.isActive}
                          onCheckedChange={(checked) =>
                            setCategories((prevCategories) =>
                              prevCategories.map((cat) =>
                                cat.id === category.id ? { ...cat, isActive: checked } : cat,
                              ),
                            )
                          }
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <Label htmlFor={`category-visibility-${category.id}`} className="sr-only">
                          Toggle visibility for {category.name}
                        </Label>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => handleEditCategory(category)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit Category</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Category</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setCategoryToDelete(category.id)
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete Category</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Category</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="overflow-hidden admin-card">
              <CardContent className="p-0">
                <div className="p-6 dark:bg-[#1f1f1f]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <Badge
                      variant="outline"
                      className={
                        category.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{category.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{category.products} Products</span>
                  </div>
                </div>
                <div className="bg-muted p-4 flex justify-end gap-2 dark:bg-[#141414]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Category</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:text-red-700"
                          onClick={() => {
                            setCategoryToDelete(category.id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Category</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
        <DialogContent className="sm:max-w-[500px] w-[95vw] max-w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new category to organize your products.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCategory}>
            <div className="space-y-4 py-4 admin-form-grid">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Write a short description..."
                  value={formData.description}
                  onChange={handleChange}
                  className="min-h-[100px] focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                  required
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
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Save Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] max-w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Make changes to the category details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory}>
            <div className="space-y-4 py-4 admin-form-grid">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  placeholder="Write a short description..."
                  value={formData.description}
                  onChange={handleChange}
                  className="min-h-[100px] focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                  required
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
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Update Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 py-4">
            <div className="rounded-full bg-red-100 p-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="text-sm text-muted-foreground">
              Deleting this category will not delete associated products, but they will no longer be categorized.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
