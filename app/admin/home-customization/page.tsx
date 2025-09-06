"use client";

import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Settings,
  Save,
  RefreshCw,
  Eye,
  Layout,
  Video,
  Grid3X3,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomeCustomizationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [homeSettings, setHomeSettings] = useState({
    heroTitle: "Welcome to Duchess Pastries",
    heroSubtitle: "Delicious handmade pastries delivered fresh to your door",
    heroImage: "",
    showFeaturedProducts: true,
    showCategories: true,
    showTestimonials: true,
    showPromoBanner: true,
    promoBannerText: "Free delivery on orders above ₹500",
    showHeroVideo: false,
    heroVideoUrl: "",
    showCategoryVideo: false,
    categoryVideoUrl: "",
    categoryVideoTitle: "Our Categories",
    categoryVideoDescription:
      "Explore our delicious range of pastries and desserts",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setHomeSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Here you would typically save to your backend
      console.log("Saving home customization settings:", homeSettings);

      setHasChanges(false);
      // You could add a toast notification here
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    setHomeSettings({
      heroTitle: "Welcome to Duchess Pastries",
      heroSubtitle: "Delicious handmade pastries delivered fresh to your door",
      heroImage: "",
      showFeaturedProducts: true,
      showCategories: true,
      showTestimonials: true,
      showPromoBanner: true,
      promoBannerText: "Free delivery on orders above ₹500",
      showHeroVideo: false,
      heroVideoUrl: "",
      showCategoryVideo: false,
      categoryVideoUrl: "",
      categoryVideoTitle: "Our Categories",
      categoryVideoDescription:
        "Explore our delicious range of pastries and desserts",
    });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Home Customization
          </h1>
          <p className="text-muted-foreground">
            Customize your home page layout, content, and appearance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !hasChanges}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Hero Section
            </CardTitle>
            <CardDescription>
              Configure the main hero section of your home page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Hero Title</Label>
              <Input
                id="heroTitle"
                value={homeSettings.heroTitle}
                onChange={(e) => handleInputChange("heroTitle", e.target.value)}
                placeholder="Enter hero title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
              <Textarea
                id="heroSubtitle"
                value={homeSettings.heroSubtitle}
                onChange={(e) =>
                  handleInputChange("heroSubtitle", e.target.value)
                }
                placeholder="Enter hero subtitle"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroImage">Hero Image URL</Label>
              <Input
                id="heroImage"
                value={homeSettings.heroImage}
                onChange={(e) => handleInputChange("heroImage", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showHeroVideo"
                checked={homeSettings.showHeroVideo}
                onCheckedChange={(checked) =>
                  handleInputChange("showHeroVideo", checked)
                }
              />
              <Label htmlFor="showHeroVideo">Show Hero Video</Label>
            </div>

            {homeSettings.showHeroVideo && (
              <div className="space-y-2">
                <Label htmlFor="heroVideoUrl">Hero Video URL</Label>
                <Input
                  id="heroVideoUrl"
                  value={homeSettings.heroVideoUrl}
                  onChange={(e) =>
                    handleInputChange("heroVideoUrl", e.target.value)
                  }
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Content Sections
            </CardTitle>
            <CardDescription>
              Enable or disable different sections on your home page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showFeaturedProducts">Featured Products</Label>
                <p className="text-sm text-muted-foreground">
                  Show featured products section
                </p>
              </div>
              <Switch
                id="showFeaturedProducts"
                checked={homeSettings.showFeaturedProducts}
                onCheckedChange={(checked) =>
                  handleInputChange("showFeaturedProducts", checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showCategories">Categories</Label>
                <p className="text-sm text-muted-foreground">
                  Show categories section
                </p>
              </div>
              <Switch
                id="showCategories"
                checked={homeSettings.showCategories}
                onCheckedChange={(checked) =>
                  handleInputChange("showCategories", checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showTestimonials">Testimonials</Label>
                <p className="text-sm text-muted-foreground">
                  Show customer testimonials
                </p>
              </div>
              <Switch
                id="showTestimonials"
                checked={homeSettings.showTestimonials}
                onCheckedChange={(checked) =>
                  handleInputChange("showTestimonials", checked)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showPromoBanner">Promo Banner</Label>
                <p className="text-sm text-muted-foreground">
                  Show promotional banner
                </p>
              </div>
              <Switch
                id="showPromoBanner"
                checked={homeSettings.showPromoBanner}
                onCheckedChange={(checked) =>
                  handleInputChange("showPromoBanner", checked)
                }
              />
            </div>

            {homeSettings.showPromoBanner && (
              <div className="space-y-2">
                <Label htmlFor="promoBannerText">Promo Banner Text</Label>
                <Input
                  id="promoBannerText"
                  value={homeSettings.promoBannerText}
                  onChange={(e) =>
                    handleInputChange("promoBannerText", e.target.value)
                  }
                  placeholder="Enter promotional text"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Category Customization
            </CardTitle>
            <CardDescription>
              Customize the category section with video content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="showCategoryVideo"
                checked={homeSettings.showCategoryVideo}
                onCheckedChange={(checked) =>
                  handleInputChange("showCategoryVideo", checked)
                }
              />
              <Label htmlFor="showCategoryVideo">Show Category Video</Label>
            </div>

            {homeSettings.showCategoryVideo && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="categoryVideoTitle">Video Title</Label>
                  <Input
                    id="categoryVideoTitle"
                    value={homeSettings.categoryVideoTitle}
                    onChange={(e) =>
                      handleInputChange("categoryVideoTitle", e.target.value)
                    }
                    placeholder="Enter video title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryVideoDescription">
                    Video Description
                  </Label>
                  <Textarea
                    id="categoryVideoDescription"
                    value={homeSettings.categoryVideoDescription}
                    onChange={(e) =>
                      handleInputChange(
                        "categoryVideoDescription",
                        e.target.value
                      )
                    }
                    placeholder="Enter video description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryVideoUrl">Category Video URL</Label>
                  <Input
                    id="categoryVideoUrl"
                    value={homeSettings.categoryVideoUrl}
                    onChange={(e) =>
                      handleInputChange("categoryVideoUrl", e.target.value)
                    }
                    placeholder="https://example.com/category-video.mp4"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Category Management */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => router.push("/admin/category-management")}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Grid3X3 className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Category Management</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Organize and reorder category cards
                </p>
              </div>
              <div className="flex items-center text-primary text-sm font-medium">
                <span>Manage Categories</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
