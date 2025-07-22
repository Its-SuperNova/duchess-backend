"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import AdminProductCardPreview from "../../create/components/admin-product-card-preview";
import { ProductInfoCard } from "../../create/components/product-info-card";
import { BannerImageUploadCard } from "../../create/components/banner-image-upload-card";
import { SellingOptionsCard } from "../../create/components/selling-options-card";
import { ProductGalleryCard } from "../../create/components/product-gallery-card";
import { DeliveryOptionsCard } from "../../create/components/delivery-options-card";
import { ProductDetailsCard } from "../../create/components/product-details-card";
import { MacronutrientsCard } from "../../create/components/macronutrients-card";
import { CustomizationOptionsCard } from "../../create/components/customization-options-card";

import MobileProductPreview from "../../create/mobile-product-preview";
import DesktopProductPreview from "../../create/desktop-product-preview";

// Import server actions
import { getCategories } from "@/lib/actions/categories";
import { getProductById, updateProduct } from "@/lib/actions/products";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  const [activeTab, setActiveTab] = useState("card");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    longDescription: "",
    category: "",
    isVeg: true,
    hasOffer: false,
    offerPercentage: "",
    offerUpToPrice: "",
    price: "",
    weightOptions: [{ weight: "0.5 Kg", price: "", stock: "", isActive: true }],
    pieceOptions: [
      { quantity: "1 piece", price: "", stock: "", isActive: true },
    ],
    stock: "",
    sellingType: "weight",
    calories: "",
    netWeight: "",
    protein: "",
    fats: "",
    carbs: "",
    sugars: "",
    fiber: "",
    sodium: "",
    deliveryOption: "both",
    addTextOnCake: false,
    addCandles: false,
    addKnife: false,
    addMessageCard: false,
    highlights: [] as string[],
    ingredients: [] as string[],
  });

  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>(
    Array(8).fill("")
  );
  const [previewMode, setPreviewMode] = useState(false);
  const [mediaSlots, setMediaSlots] = useState(4);
  const [urlInputIndex, setUrlInputIndex] = useState(-1);
  const [mediaUrls, setMediaUrls] = useState<string[]>(Array(8).fill(""));
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">(
    "mobile"
  );

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Failed to load categories");
      }
    };
    loadCategories();
  }, []);

  // Load product data from database
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const product = await getProductById(productId);

        if (product) {
          // Find the category name from the category_id
          const productCategory = categories.find(
            (cat) => cat.id === product.category_id
          );

          setFormData({
            name: product.name || "",
            shortDescription: product.short_description || "",
            longDescription: product.long_description || "",
            category: productCategory?.name || "",
            isVeg: product.is_veg ?? true,
            hasOffer: product.has_offer ?? false,
            offerPercentage: product.offer_percentage?.toString() || "",
            offerUpToPrice: product.offer_up_to_price?.toString() || "",
            price: "",
            weightOptions: product.weight_options || [
              { weight: "0.5 Kg", price: "", stock: "", isActive: true },
            ],
            pieceOptions: product.piece_options || [
              { quantity: "1 piece", price: "", stock: "", isActive: true },
            ],
            stock: "",
            sellingType: product.selling_type || "weight",
            calories: product.calories?.toString() || "",
            netWeight: product.net_weight?.toString() || "",
            protein: product.protein?.toString() || "",
            fats: product.fats?.toString() || "",
            carbs: product.carbs?.toString() || "",
            sugars: product.sugars?.toString() || "",
            fiber: product.fiber?.toString() || "",
            sodium: product.sodium?.toString() || "",
            deliveryOption: product.delivery_option || "both",
            addTextOnCake: product.add_text_on_cake ?? false,
            addCandles: product.add_candles ?? false,
            addKnife: product.add_knife ?? false,
            addMessageCard: product.add_message_card ?? false,
            highlights: product.highlights || [],
            ingredients: product.ingredients || [],
          });
          setBannerImage(product.banner_image || null);
          setAdditionalImages(product.additional_images || Array(8).fill(""));
          setMediaSlots(product.additional_images?.length || 4);
        } else {
          toast.error("Product not found");
          router.push("/admin/products");
        }
      } catch (error) {
        console.error("Error loading product:", error);
        toast.error("Failed to load product");
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    if (productId && categories.length > 0) {
      loadProduct();
    }
  }, [productId, router, categories]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | React.ChangeEvent<HTMLTextAreaElement>
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle select changes (for category, sellingType, deliveryOption, highlights, ingredients)
  const handleSelectChange = (name: string, value: string | string[]) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle toggle switches (for isVeg, hasOffer, customization options)
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Handle banner image upload
  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle additional image upload
  const handleAdditionalImageUpload = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...additionalImages];
        newImages[index] = reader.result as string;
        setAdditionalImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove additional image
  const removeAdditionalImage = (index: number) => {
    const newImages = [...additionalImages];
    newImages[index] = "";
    setAdditionalImages(newImages);
  };

  // Add weight option
  const addWeightOption = () => {
    setFormData({
      ...formData,
      weightOptions: [
        ...formData.weightOptions,
        { weight: "", price: "", stock: "", isActive: true },
      ],
    });
  };

  // Update weight option
  const updateWeightOption = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const newWeightOptions = [...formData.weightOptions];
    newWeightOptions[index] = {
      ...newWeightOptions[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      weightOptions: newWeightOptions,
    });
  };

  // Remove weight option
  const removeWeightOption = (index: number) => {
    if (formData.weightOptions.length > 1) {
      const newWeightOptions = [...formData.weightOptions];
      newWeightOptions.splice(index, 1);
      setFormData({
        ...formData,
        weightOptions: newWeightOptions,
      });
    }
  };

  // Update piece option
  const updatePieceOption = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const newPieceOptions = [...formData.pieceOptions];
    newPieceOptions[index] = {
      ...newPieceOptions[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      pieceOptions: newPieceOptions,
    });
  };

  // Handle URL input change
  const handleUrlChange = (index: number, url: string) => {
    const newUrls = [...mediaUrls];
    newUrls[index] = url;
    setMediaUrls(newUrls);
  };

  // Handle URL submission
  const handleUrlSubmit = (index: number) => {
    const url = mediaUrls[index];
    if (url) {
      const newImages = [...additionalImages];
      newImages[index] = url;
      setAdditionalImages(newImages);
      setUrlInputIndex(-1);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!formData.shortDescription.trim()) {
      toast.error("Short description is required");
      return;
    }

    if (!formData.category) {
      toast.error("Category is required");
      return;
    }

    // Find category ID from category name
    const selectedCategory = categories.find(
      (cat) => cat.name === formData.category
    );
    if (!selectedCategory) {
      toast.error("Selected category not found");
      return;
    }

    try {
      setSaving(true);

      const productData = {
        name: formData.name.trim(),
        short_description: formData.shortDescription.trim(),
        long_description: formData.longDescription.trim(),
        category_id: selectedCategory.id,
        is_veg: formData.isVeg,
        has_offer: formData.hasOffer,
        offer_percentage: formData.offerPercentage
          ? parseInt(formData.offerPercentage)
          : null,
        offer_up_to_price: formData.offerUpToPrice
          ? parseFloat(formData.offerUpToPrice)
          : 0,
        banner_image: bannerImage,
        additional_images: additionalImages.filter((img) => img),
        selling_type: formData.sellingType,
        weight_options: formData.weightOptions,
        piece_options: formData.pieceOptions,
        calories: formData.calories ? parseInt(formData.calories) : null,
        net_weight: formData.netWeight ? parseInt(formData.netWeight) : null,
        protein: formData.protein ? parseFloat(formData.protein) : null,
        fats: formData.fats ? parseFloat(formData.fats) : null,
        carbs: formData.carbs ? parseFloat(formData.carbs) : null,
        sugars: formData.sugars ? parseFloat(formData.sugars) : null,
        fiber: formData.fiber ? parseFloat(formData.fiber) : null,
        sodium: formData.sodium ? parseInt(formData.sodium) : null,
        delivery_option: formData.deliveryOption,
        add_text_on_cake: formData.addTextOnCake,
        add_candles: formData.addCandles,
        add_knife: formData.addKnife,
        add_message_card: formData.addMessageCard,
        highlights: formData.highlights,
        ingredients: formData.ingredients,
      };

      await updateProduct(productId, productData);
      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update product. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
        Loading product data...
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => router.push("/admin/products")}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Modify product details</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="card">Product Card</TabsTrigger>
            <TabsTrigger value="page">Product Page</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? "Edit Mode" : "Preview Mode"}
            </Button>
            {previewMode && (
              <div className="flex items-center gap-2">
                <Button
                  variant={previewDevice === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewDevice("mobile")}
                >
                  Mobile
                </Button>
                <Button
                  variant={previewDevice === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewDevice("desktop")}
                >
                  Desktop
                </Button>
              </div>
            )}
            <Button
              type="submit"
              form="product-form"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
          <TabsContent value="card" className="space-y-6">
            {previewMode ? (
              <AdminProductCardPreview
                name={formData.name}
                description={formData.shortDescription}
                isVeg={formData.isVeg}
                hasOffer={formData.hasOffer}
                offerPercentage={formData.offerPercentage}
                offerUpToPrice={formData.offerUpToPrice}
                image={bannerImage}
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <ProductInfoCard
                  formData={formData}
                  handleChange={handleChange}
                  handleSelectChange={handleSelectChange}
                  handleSwitchChange={handleSwitchChange}
                  categories={categories}
                />
                <BannerImageUploadCard
                  bannerImage={bannerImage}
                  setBannerImage={setBannerImage}
                  handleBannerImageUpload={handleBannerImageUpload}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="page" className="space-y-6">
            {previewMode ? (
              previewDevice === "mobile" ? (
                <div className="flex justify-center items-start">
                  <div className="w-[390px] h-[844px] bg-black rounded-[3rem] p-2 shadow-2xl">
                    <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                      <div
                        className="w-full h-full overflow-y-auto scrollbar-hidden"
                        style={{
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                        }}
                      >
                        <MobileProductPreview
                          name={formData.name}
                          category={formData.category}
                          description={formData.longDescription}
                          isVeg={formData.isVeg}
                          bannerImage={bannerImage}
                          additionalImages={additionalImages.filter(
                            (img) => img
                          )}
                          weightOptions={formData.weightOptions}
                          pieceOptions={formData.pieceOptions}
                          price={
                            formData.weightOptions[0]?.price || formData.price
                          }
                          calories={formData.calories}
                          netWeight={formData.netWeight}
                          protein={formData.protein}
                          fats={formData.fats}
                          carbs={formData.carbs}
                          sugars={formData.sugars}
                          fiber={formData.fiber}
                          sodium={formData.sodium}
                          deliveryOption={formData.deliveryOption}
                          addTextOnCake={formData.addTextOnCake}
                          addCandles={formData.addCandles}
                          addKnife={formData.addKnife}
                          addMessageCard={formData.addMessageCard}
                          highlights={formData.highlights}
                          ingredients={formData.ingredients}
                          sellingType={formData.sellingType}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <DesktopProductPreview
                  name={formData.name}
                  category={formData.category}
                  description={formData.longDescription}
                  isVeg={formData.isVeg}
                  bannerImage={bannerImage}
                  additionalImages={additionalImages.filter((img) => img)}
                  weightOptions={formData.weightOptions}
                  pieceOptions={formData.pieceOptions}
                  price={formData.weightOptions[0]?.price || formData.price}
                  calories={formData.calories}
                  netWeight={formData.netWeight}
                  protein={formData.protein}
                  fats={formData.fats}
                  carbs={formData.carbs}
                  sugars={formData.sugars}
                  fiber={formData.fiber}
                  sodium={formData.sodium}
                  deliveryOption={formData.deliveryOption}
                  addTextOnCake={formData.addTextOnCake}
                  addCandles={formData.addCandles}
                  addKnife={formData.addKnife}
                  addMessageCard={formData.addMessageCard}
                  highlights={formData.highlights}
                  ingredients={formData.ingredients}
                  sellingType={formData.sellingType}
                />
              )
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                  <SellingOptionsCard
                    formData={formData}
                    handleSelectChange={handleSelectChange}
                    addWeightOption={addWeightOption}
                    updateWeightOption={updateWeightOption}
                    removeWeightOption={removeWeightOption}
                    updatePieceOption={updatePieceOption}
                  />
                  <ProductGalleryCard
                    additionalImages={additionalImages}
                    setAdditionalImages={setAdditionalImages}
                    mediaSlots={mediaSlots}
                    setMediaSlots={setMediaSlots}
                    urlInputIndex={urlInputIndex}
                    setUrlInputIndex={setUrlInputIndex}
                    mediaUrls={mediaUrls}
                    setMediaUrls={setMediaUrls}
                    handleAdditionalImageUpload={handleAdditionalImageUpload}
                    removeAdditionalImage={removeAdditionalImage}
                    handleUrlChange={handleUrlChange}
                    handleUrlSubmit={handleUrlSubmit}
                  />
                  <DeliveryOptionsCard
                    formData={formData}
                    handleSelectChange={handleSelectChange}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <ProductDetailsCard
                    formData={formData}
                    handleChange={handleChange}
                    handleSelectChange={handleSelectChange}
                    handleSwitchChange={handleSwitchChange}
                    categories={categories}
                  />
                  <MacronutrientsCard
                    formData={formData}
                    handleChange={handleChange}
                  />
                  <CustomizationOptionsCard
                    formData={formData}
                    handleSwitchChange={handleSwitchChange}
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
}
