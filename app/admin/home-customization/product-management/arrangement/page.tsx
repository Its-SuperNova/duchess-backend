"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Plus,
  GripVertical,
  X,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getProductSections,
  updateProductOrderInSection,
  updateSectionOrder,
  createProductSection,
  updateProductSection,
  deleteProductSection,
} from "@/lib/actions/sections";
import { getProductThumbnailUrl } from "@/lib/image-utils";
import AdminProductCard from "@/components/admin-product-card";

interface Product {
  id: string;
  name: string;
  banner_image: string | null;
  is_veg: boolean;
  weight_options: any;
  piece_options: any;
  selling_type: string;
  display_order: number;
  categories: { name: string } | null;
}

interface Section {
  id: string;
  name: string;
  title: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  max_products: number;
  products: Product[];
}

export default function ProductArrangementPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [draggedProduct, setDraggedProduct] = useState<{
    sectionId: string;
    productId: string;
  } | null>(null);

  // Create section dialog state
  const [createSectionDialogOpen, setCreateSectionDialogOpen] = useState(false);
  const [sectionFormData, setSectionFormData] = useState({
    name: "",
    title: "",
    description: "",
    max_products: 12,
  });

  // Edit section dialog state
  const [editSectionDialogOpen, setEditSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    title: "",
    description: "",
    max_products: 12,
  });

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      const sectionsData = await getProductSections();
      setSections(sectionsData);
    } catch (error) {
      console.error("Error loading sections:", error);
      toast({
        title: "Error",
        description: "Failed to load sections for arrangement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveArrangement = async () => {
    try {
      setSaving(true);
      // Save section order
      await updateSectionOrder(sections.map((s) => s.id));

      // Save product order for each section
      for (const section of sections) {
        if (section.products.length > 0) {
          await updateProductOrderInSection(
            section.id,
            section.products.map((p) => p.id)
          );
        }
      }

      toast({
        title: "Success",
        description: "Arrangement saved successfully",
      });
    } catch (error) {
      console.error("Error saving arrangement:", error);
      toast({
        title: "Error",
        description: "Failed to save arrangement",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSection = async () => {
    try {
      if (!sectionFormData.name.trim() || !sectionFormData.title.trim()) {
        toast({
          title: "Error",
          description: "Name and title are required",
          variant: "destructive",
        });
        return;
      }

      await createProductSection(sectionFormData);
      setCreateSectionDialogOpen(false);
      setSectionFormData({
        name: "",
        title: "",
        description: "",
        max_products: 12,
      });
      await loadSections();
      toast({
        title: "Success",
        description: "Section created successfully",
      });
    } catch (error) {
      console.error("Error creating section:", error);
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive",
      });
    }
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setEditFormData({
      name: section.name,
      title: section.title,
      description: section.description || "",
      max_products: section.max_products,
    });
    setEditSectionDialogOpen(true);
  };

  const handleUpdateSection = async () => {
    try {
      if (
        !editingSection ||
        !editFormData.name.trim() ||
        !editFormData.title.trim()
      ) {
        toast({
          title: "Error",
          description: "Name and title are required",
          variant: "destructive",
        });
        return;
      }

      await updateProductSection(editingSection.id, editFormData);
      setEditSectionDialogOpen(false);
      setEditingSection(null);
      await loadSections();
      toast({
        title: "Success",
        description: "Section updated successfully",
      });
    } catch (error) {
      console.error("Error updating section:", error);
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSection = (sectionId: string, sectionTitle: string) => {
    setSectionToDelete({ id: sectionId, title: sectionTitle });
    setDeleteConfirmationText("");
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!sectionToDelete) return;

    if (deleteConfirmationText.toLowerCase() !== "delete") {
      toast({
        title: "Error",
        description: "Please type 'delete' to confirm",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteProductSection(sectionToDelete.id);
      setDeleteDialogOpen(false);
      setSectionToDelete(null);
      setDeleteConfirmationText("");
      await loadSections();
      toast({
        title: "Success",
        description: "Section deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting section:", error);
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      });
    }
  };

  const handleMoveSectionUp = async (sectionId: string) => {
    const currentIndex = sections.findIndex((s) => s.id === sectionId);
    if (currentIndex <= 0) return; // Already at the top

    const newSections = [...sections];
    [newSections[currentIndex], newSections[currentIndex - 1]] = [
      newSections[currentIndex - 1],
      newSections[currentIndex],
    ];

    setSections(newSections);

    try {
      await updateSectionOrder(newSections.map((s) => s.id));
      toast({
        title: "Success",
        description: "Section moved up successfully",
      });
    } catch (error) {
      console.error("Error moving section up:", error);
      await loadSections(); // Revert on error
      toast({
        title: "Error",
        description: "Failed to move section up",
        variant: "destructive",
      });
    }
  };

  const handleMoveSectionDown = async (sectionId: string) => {
    const currentIndex = sections.findIndex((s) => s.id === sectionId);
    if (currentIndex >= sections.length - 1) return; // Already at the bottom

    const newSections = [...sections];
    [newSections[currentIndex], newSections[currentIndex + 1]] = [
      newSections[currentIndex + 1],
      newSections[currentIndex],
    ];

    setSections(newSections);

    try {
      await updateSectionOrder(newSections.map((s) => s.id));
      toast({
        title: "Success",
        description: "Section moved down successfully",
      });
    } catch (error) {
      console.error("Error moving section down:", error);
      await loadSections(); // Revert on error
      toast({
        title: "Error",
        description: "Failed to move section down",
        variant: "destructive",
      });
    }
  };

  // Section drag and drop handlers
  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSectionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleSectionDrop = async (
    e: React.DragEvent,
    targetSectionId: string
  ) => {
    e.preventDefault();

    if (!draggedSection || draggedSection === targetSectionId) {
      setDraggedSection(null);
      return;
    }

    const newSections = [...sections];
    const draggedIndex = newSections.findIndex((s) => s.id === draggedSection);
    const targetIndex = newSections.findIndex((s) => s.id === targetSectionId);

    // Move section to new position
    const [movedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, movedSection);

    setSections(newSections);
    setDraggedSection(null);
  };

  // Product drag and drop handlers
  const handleProductDragStart = (
    e: React.DragEvent,
    sectionId: string,
    productId: string
  ) => {
    setDraggedProduct({ sectionId, productId });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleProductDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleProductDrop = async (
    e: React.DragEvent,
    targetSectionId: string,
    targetProductId: string
  ) => {
    e.preventDefault();

    if (
      !draggedProduct ||
      (draggedProduct.sectionId === targetSectionId &&
        draggedProduct.productId === targetProductId)
    ) {
      setDraggedProduct(null);
      return;
    }

    const newSections = [...sections];
    const sourceSection = newSections.find(
      (s) => s.id === draggedProduct.sectionId
    );
    const targetSection = newSections.find((s) => s.id === targetSectionId);

    if (!sourceSection || !targetSection) {
      setDraggedProduct(null);
      return;
    }

    // Remove product from source section
    const draggedProductData = sourceSection.products.find(
      (p) => p.id === draggedProduct.productId
    );
    if (!draggedProductData) {
      setDraggedProduct(null);
      return;
    }

    sourceSection.products = sourceSection.products.filter(
      (p) => p.id !== draggedProduct.productId
    );

    // Add product to target section at the correct position
    const targetIndex = targetSection.products.findIndex(
      (p) => p.id === targetProductId
    );
    targetSection.products.splice(targetIndex, 0, draggedProductData);

    setSections(newSections);
    setDraggedProduct(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sections...</p>
          </div>
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
              Homepage Arrangement
            </h1>
            <p className="text-muted-foreground">
              Drag and drop to arrange sections and products on the homepage
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={createSectionDialogOpen}
            onOpenChange={setCreateSectionDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Section</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="section-name">Section Name</Label>
                  <Input
                    id="section-name"
                    value={sectionFormData.name}
                    onChange={(e) =>
                      setSectionFormData({
                        ...sectionFormData,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., featured-products"
                  />
                </div>
                <div>
                  <Label htmlFor="section-title">Section Title</Label>
                  <Input
                    id="section-title"
                    value={sectionFormData.title}
                    onChange={(e) =>
                      setSectionFormData({
                        ...sectionFormData,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g., Featured Products"
                  />
                </div>
                <div>
                  <Label htmlFor="section-description">Description</Label>
                  <Textarea
                    id="section-description"
                    value={sectionFormData.description}
                    onChange={(e) =>
                      setSectionFormData({
                        ...sectionFormData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Optional description for this section"
                  />
                </div>
                <div>
                  <Label htmlFor="section-max-products">Max Products</Label>
                  <Input
                    id="section-max-products"
                    type="number"
                    value={sectionFormData.max_products}
                    onChange={(e) =>
                      setSectionFormData({
                        ...sectionFormData,
                        max_products: parseInt(e.target.value) || 12,
                      })
                    }
                    min="1"
                    max="50"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCreateSectionDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateSection}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Create Section
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={handleSaveArrangement}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Arrangement"}
          </Button>
        </div>
      </div>

      {/* Edit Section Dialog */}
      <Dialog
        open={editSectionDialogOpen}
        onOpenChange={setEditSectionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-section-name">Section Name</Label>
              <Input
                id="edit-section-name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    name: e.target.value,
                  })
                }
                placeholder="e.g., featured-products"
              />
            </div>
            <div>
              <Label htmlFor="edit-section-title">Section Title</Label>
              <Input
                id="edit-section-title"
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    title: e.target.value,
                  })
                }
                placeholder="e.g., Featured Products"
              />
            </div>
            <div>
              <Label htmlFor="edit-section-description">Description</Label>
              <Textarea
                id="edit-section-description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
                placeholder="Optional description for this section"
              />
            </div>
            <div>
              <Label htmlFor="edit-section-max-products">Max Products</Label>
              <Input
                id="edit-section-max-products"
                type="number"
                value={editFormData.max_products}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    max_products: parseInt(e.target.value) || 12,
                  })
                }
                min="1"
                max="50"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditSectionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSection}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Update Section
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                Are you sure you want to delete the section "
                {sectionToDelete?.title}"?
              </p>
              <p className="text-red-600 text-sm mt-2">
                This action will permanently remove the section and all products
                within it. This cannot be undone.
              </p>
            </div>
            <div>
              <Label htmlFor="delete-confirmation">
                Type{" "}
                <span className="font-mono bg-gray-100 px-1 rounded">
                  delete
                </span>{" "}
                to confirm:
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Type 'delete' here"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSectionToDelete(null);
                  setDeleteConfirmationText("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmationText.toLowerCase() !== "delete"}
                className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
              >
                Delete Section
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sections Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Homepage Sections ({sections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Drag sections to reorder them, and drag products within sections to
            arrange them. You can also move products between sections.
          </p>
        </CardContent>
      </Card>

      {/* Sections and Products Arrangement */}
      <div className="space-y-6">
        {sections.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No sections found. Create sections first to manage homepage
                arrangement.
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    "/admin/home-customization/product-management/sections"
                  )
                }
              >
                Manage Sections
              </Button>
            </CardContent>
          </Card>
        ) : (
          sections.map((section, sectionIndex) => (
            <Card
              key={section.id}
              className={`transition-all duration-200 ${
                draggedSection === section.id
                  ? "opacity-50 scale-95"
                  : "hover:shadow-md"
              }`}
              draggable
              onDragStart={(e) => handleSectionDragStart(e, section.id)}
              onDragOver={handleSectionDragOver}
              onDrop={(e) => handleSectionDrop(e, section.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                      {sectionIndex + 1}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {section.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {section.current_products_count || 0} /{" "}
                      {section.max_products} products
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveSectionUp(section.id)}
                      disabled={sectionIndex === 0}
                      className="h-8 w-8 p-0"
                      title="Move section up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveSectionDown(section.id)}
                      disabled={sectionIndex === sections.length - 1}
                      className="h-8 w-8 p-0"
                      title="Move section down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSection(section)}
                      className="h-8 w-8 p-0"
                      title="Edit section"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDeleteSection(section.id, section.title)
                      }
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete section"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="cursor-move" title="Drag to reorder">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!section.products || section.products.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No products in this section yet.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/admin/home-customization/product-management/sections/${section.id}`
                        )
                      }
                    >
                      Add Products
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {section.products.map((product, productIndex) => (
                      <div
                        key={product.id}
                        className={`relative transition-all duration-200 ${
                          draggedProduct?.sectionId === section.id &&
                          draggedProduct?.productId === product.id
                            ? "opacity-50 scale-95"
                            : "hover:shadow-lg"
                        }`}
                        draggable
                        onDragStart={(e) =>
                          handleProductDragStart(e, section.id, product.id)
                        }
                        onDragOver={handleProductDragOver}
                        onDrop={(e) =>
                          handleProductDrop(e, section.id, product.id)
                        }
                      >
                        {/* Position Badge */}
                        <div className="absolute top-2 left-2 z-10">
                          <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold">
                            {productIndex + 1}
                          </div>
                        </div>

                        {/* Drag Handle */}
                        <div className="absolute top-2 right-2 z-10">
                          <div className="flex items-center justify-center w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full shadow-sm cursor-move">
                            <GripVertical className="h-3 w-3 text-gray-600" />
                          </div>
                        </div>

                        <AdminProductCard
                          product={product}
                          section={section}
                          onToggleHomepage={() => {}} // Dummy function for arrangement page
                          onRemoveFromHomepage={() => {}} // Dummy function for arrangement page
                          showSectionBadge={false} // Hide section badge since products are already in sections
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
