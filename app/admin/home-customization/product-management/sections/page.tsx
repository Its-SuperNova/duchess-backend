"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, GripVertical, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getProductSections,
  createProductSection,
  updateProductSection,
  deleteProductSection,
  updateSectionOrder,
  ProductSection,
} from "@/lib/actions/sections";

export default function SectionManagementPage() {
  const router = useRouter();
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ProductSection | null>(
    null
  );
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    max_products: 12,
  });

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
        description: "Failed to load product sections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async () => {
    try {
      if (!formData.name.trim() || !formData.title.trim()) {
        toast({
          title: "Error",
          description: "Name and title are required",
          variant: "destructive",
        });
        return;
      }

      await createProductSection(formData);
      setCreateDialogOpen(false);
      setFormData({ name: "", title: "", description: "", max_products: 12 });
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

  const handleEditSection = async () => {
    if (!editingSection) return;

    try {
      await updateProductSection(editingSection.id, formData);
      setEditDialogOpen(false);
      setEditingSection(null);
      setFormData({ name: "", title: "", description: "", max_products: 12 });
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

  const handleDeleteSection = async (sectionId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this section? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteProductSection(sectionId);
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

  const openEditDialog = (section: ProductSection) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      title: section.title,
      description: section.description || "",
      max_products: section.max_products,
    });
    setEditDialogOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetSectionId: string) => {
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

    // Update order in database
    try {
      await updateSectionOrder(newSections.map((s) => s.id));
      toast({
        title: "Success",
        description: "Section order updated",
      });
    } catch (error) {
      console.error("Error updating section order:", error);
      toast({
        title: "Error",
        description: "Failed to update section order",
        variant: "destructive",
      });
      // Revert on error
      await loadSections();
    }

    setDraggedSection(null);
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
              Product Sections
            </h1>
            <p className="text-muted-foreground">
              Create and manage product sections for the homepage
            </p>
          </div>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Section Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., featured-products"
                />
              </div>
              <div>
                <Label htmlFor="title">Section Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Featured Products"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description for this section"
                />
              </div>
              <div>
                <Label htmlFor="max_products">Max Products</Label>
                <Input
                  id="max_products"
                  type="number"
                  value={formData.max_products}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
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
                  onClick={() => setCreateDialogOpen(false)}
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
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No product sections found. Create your first section to get
                started.
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Section
              </Button>
            </CardContent>
          </Card>
        ) : (
          sections.map((section, index) => (
            <Card
              key={section.id}
              className={`transition-all duration-200 ${
                draggedSection === section.id
                  ? "opacity-50 scale-95"
                  : "hover:shadow-md"
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, section.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, section.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                      {index + 1}
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
                      {section.current_products_count || 0} products
                    </Badge>
                    <Badge variant="outline">Max: {section.max_products}</Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/admin/home-customization/product-management/sections/${section.id}`
                          )
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(section)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSection(section.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="cursor-move">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Section Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., featured-products"
              />
            </div>
            <div>
              <Label htmlFor="edit-title">Section Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Featured Products"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description for this section"
              />
            </div>
            <div>
              <Label htmlFor="edit-max_products">Max Products</Label>
              <Input
                id="edit-max_products"
                type="number"
                value={formData.max_products}
                onChange={(e) =>
                  setFormData({
                    ...formData,
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
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSection}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Update Section
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
