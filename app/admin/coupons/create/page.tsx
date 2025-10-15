"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

// Form schema for coupon creation
const formSchema = z.object({
  code: z.string().min(3, {
    message: "Coupon code must be at least 3 characters.",
  }),
  type: z.enum(["flat", "percentage"]),
  value: z.coerce.number().min(1, {
    message: "Discount value must be at least 1.",
  }),
  minOrderAmount: z.coerce.number().min(0),
  maxDiscountCap: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().min(1).optional().nullable(),
  // Toggle states for optional fields
  enableMinOrderAmount: z.boolean(),
  enableMaxDiscountCap: z.boolean(),
  enableUsageLimit: z.boolean(),
  validFrom: z.date(),
  validUntil: z.date(),
  applicableCategories: z.array(z.string()).optional(),
  applicableProducts: z.array(z.number()).optional(),
  applyToSpecific: z.boolean(),
  restrictionType: z.enum(["products", "categories"]).optional(),
});

export default function CreateCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [products, setProducts] = useState<
    {
      id: number;
      name: string;
      category_id: string;
      banner_image?: string;
      categories?: { name: string };
    }[]
  >([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        } else {
          console.error("Failed to fetch categories");
          // Fallback to hardcoded categories if API fails
          setCategories([
            { id: "1", name: "Cakes" },
            { id: "2", name: "Cookies" },
            { id: "3", name: "Pastries" },
            { id: "4", name: "Breads" },
            { id: "5", name: "Cupcakes" },
            { id: "6", name: "Tarts" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to hardcoded categories
        setCategories([
          { id: "1", name: "Cakes" },
          { id: "2", name: "Cookies" },
          { id: "3", name: "Pastries" },
          { id: "4", name: "Breads" },
          { id: "5", name: "Cupcakes" },
          { id: "6", name: "Tarts" },
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      // Find "Brownies & Brookies" category first, otherwise use first category
      const browniesCategory = categories.find(
        (cat) =>
          cat.name.toLowerCase().includes("brownies") ||
          cat.name.toLowerCase().includes("brookies")
      );
      const firstCategory = browniesCategory || categories[0];

      setSelectedCategoryId(firstCategory.id);
      fetchProducts(firstCategory.id);
    }
  }, [categories, selectedCategoryId]);

  // Fetch products function
  const fetchProducts = async (categoryId: string) => {
    setProductsLoading(true);
    try {
      const response = await fetch(
        `/api/products/by-category?category_id=${categoryId}`
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        console.error("Failed to fetch products");
        // Fallback to mock products
        setProducts([
          {
            id: 1,
            name: "Chocolate Brownie",
            category_id: categoryId,
            banner_image:
              "/images/homePage-Product/Chocolate-ChocochipBrookies.png",
            categories: { name: "Brownies & Brookies" },
          },
          {
            id: 2,
            name: "Chocolate Cherry Cake",
            category_id: categoryId,
            banner_image: "/images/homePage-Product/Chocolate-CherryCake.jpg",
            categories: { name: "Brownies & Brookies" },
          },
          {
            id: 3,
            name: "Chocolate Pistachio Cake",
            category_id: categoryId,
            banner_image:
              "/images/homePage-Product/Chocolate-Pistachio-MeltingCake.jpg",
            categories: { name: "Brownies & Brookies" },
          },
          {
            id: 4,
            name: "Chocolate Soft Cookies",
            category_id: categoryId,
            banner_image:
              "/images/homePage-Product/Chocolate-Soft-Centered-Cookies.jpg",
            categories: { name: "Brownies & Brookies" },
          },
          {
            id: 5,
            name: "Assorted Chocolate Box",
            category_id: categoryId,
            banner_image:
              "/images/homePage-Product/Assorted-Chocolate-Gift-Box.jpg",
            categories: { name: "Brownies & Brookies" },
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fallback to mock products
      setProducts([
        {
          id: 1,
          name: "Chocolate Brownie",
          category_id: categoryId,
          banner_image:
            "/images/homePage-Product/Chocolate-ChocochipBrookies.png",
          categories: { name: "Brownies & Brookies" },
        },
        {
          id: 2,
          name: "Chocolate Cherry Cake",
          category_id: categoryId,
          banner_image: "/images/homePage-Product/Chocolate-CherryCake.jpg",
          categories: { name: "Brownies & Brookies" },
        },
        {
          id: 3,
          name: "Chocolate Pistachio Cake",
          category_id: categoryId,
          banner_image:
            "/images/homePage-Product/Chocolate-Pistachio-MeltingCake.jpg",
          categories: { name: "Brownies & Brookies" },
        },
        {
          id: 4,
          name: "Chocolate Soft Cookies",
          category_id: categoryId,
          banner_image:
            "/images/homePage-Product/Chocolate-Soft-Centered-Cookies.jpg",
          categories: { name: "Brownies & Brookies" },
        },
        {
          id: 5,
          name: "Assorted Chocolate Box",
          category_id: categoryId,
          banner_image:
            "/images/homePage-Product/Assorted-Chocolate-Gift-Box.jpg",
          categories: { name: "Brownies & Brookies" },
        },
      ]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Filter products based on search query - will be moved to useMemo after form initialization

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      type: "percentage",
      value: 10,
      minOrderAmount: 0,
      maxDiscountCap: 0,
      usageLimit: 100,
      // Toggle states - all disabled by default
      enableMinOrderAmount: false,
      enableMaxDiscountCap: false,
      enableUsageLimit: false,
      validFrom: new Date(),
      validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      applicableCategories: [],
      applicableProducts: [],
      applyToSpecific: false,
      restrictionType: "categories",
    },
  });

  // Filter products based on search query and selection state
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (showOnlySelected) {
        // Only show products that are selected in the form
        const selectedProducts = form.watch("applicableProducts") || [];
        const isSelected = selectedProducts.includes(product.id);
        return matchesSearch && isSelected;
      }

      return matchesSearch;
    });
  }, [products, searchQuery, showOnlySelected, form]);

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const couponData = {
        code: values.code,
        type: values.type,
        value: values.value,
        minOrderAmount: values.enableMinOrderAmount ? values.minOrderAmount : 0,
        maxDiscountCap: values.enableMaxDiscountCap
          ? values.maxDiscountCap
          : undefined,
        usageLimit: values.enableUsageLimit ? values.usageLimit : null,
        validFrom: values.validFrom.toISOString(),
        validUntil: values.validUntil.toISOString(),
        applicableCategories: values.applicableCategories || [],
        applicableProducts:
          values.applicableProducts?.map((id) => id.toString()) || [],
        applyToSpecific: values.applyToSpecific,
        restrictionType: values.restrictionType,
      };

      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(couponData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create coupon");
      }

      toast.success("Coupon created successfully!");
      router.push("/admin/coupons");
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create coupon"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="text-[black] border-[#e6e6e8] hover:bg-[#e6e6e8]/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Create New Coupon</h1>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Coupon Details</CardTitle>
          <CardDescription>
            Create a new discount coupon for your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coupon Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SUMMER20" {...field} />
                      </FormControl>
                      <FormDescription>
                        Customers will enter this code at checkout
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">
                            Percentage (%)
                          </SelectItem>
                          <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Input type="number" {...field} min={1} />
                          <span className="ml-2">
                            {form.watch("type") === "percentage" ? "%" : "₹"}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Minimum Order Amount with Toggle */}
                <FormField
                  control={form.control}
                  name="enableMinOrderAmount"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border p-4">
                      <div className="flex flex-row items-center justify-between mb-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Minimum Order Amount
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </FormControl>
                      </div>

                      {field.value && (
                        <FormField
                          control={form.control}
                          name="minOrderAmount"
                          render={({ field: inputField }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center">
                          <span className="mr-2">₹</span>
                                  <Input
                                    type="number"
                                    {...inputField}
                                    min={0}
                                    placeholder="Enter minimum order amount"
                                  />
                        </div>
                      </FormControl>
                              <FormDescription>
                                0 for no minimum
                              </FormDescription>
                      <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </FormItem>
                  )}
                />

                {/* Maximum Discount Cap with Toggle */}
                  <FormField
                    control={form.control}
                  name="enableMaxDiscountCap"
                    render={({ field }) => (
                    <FormItem className="rounded-lg border p-4">
                      <div className="flex flex-row items-center justify-between mb-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Maximum Discount Cap
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </FormControl>
                      </div>

                      {form.watch("type") === "percentage" && field.value && (
                        <FormField
                          control={form.control}
                          name="maxDiscountCap"
                          render={({ field: inputField }) => (
                            <FormItem>
                        <FormControl>
                          <div className="flex items-center">
                            <span className="mr-2">₹</span>
                            <Input
                              type="number"
                                    {...inputField}
                              min={0}
                                    placeholder="Enter maximum discount amount"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                                Maximum discount amount for percentage discounts
                                (0 for no cap)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                    </FormItem>
                  )}
                />

                {/* Total Usage Limit with Toggle */}
                <FormField
                  control={form.control}
                  name="enableUsageLimit"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border p-4">
                      <div className="flex flex-row items-center justify-between mb-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Total Usage Limit
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </FormControl>
                      </div>

                      {field.value && (
                        <FormField
                          control={form.control}
                          name="usageLimit"
                          render={({ field: inputField }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                                  {...inputField}
                                  value={
                                    inputField.value === null
                                      ? ""
                                      : inputField.value
                                  }
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? null
                                : Number.parseInt(e.target.value);
                                    inputField.onChange(value);
                          }}
                          min={1}
                                  placeholder="Enter usage limit"
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for unlimited usage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                      )}
                    </FormItem>
                  )}
                />

                {/* Valid From and Valid Until in same row */}
                <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Valid From</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Valid Until</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                              disabled={(date) =>
                                date < form.watch("validFrom")
                              }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
              </div>

              {/* Toggle for Specific Products/Categories */}
              <div className="border-t pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="applyToSpecific"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Apply to Specific Products/Categories
                        </FormLabel>
                        <FormDescription>
                          Toggle to restrict this coupon to specific products or
                          categories
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Restriction Type Dropdown */}
                {form.watch("applyToSpecific") && (
                  <FormField
                    control={form.control}
                    name="restrictionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restriction Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select restriction type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="categories">
                              Categories
                            </SelectItem>
                            <SelectItem value="products">Products</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose whether to restrict by product categories or
                          specific products
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Products Selection */}
                {form.watch("applyToSpecific") &&
                  form.watch("restrictionType") === "products" && (
                    <FormField
                      control={form.control}
                      name="applicableProducts"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-4">
                              <FormLabel className="text-base">
                                Applicable Products
                              </FormLabel>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const selected =
                                    form.watch("applicableProducts") || [];
                                  const allIds = filteredProducts.map(
                                    (p) => p.id
                                  );
                                  const isAllSelected =
                                    selected.length === allIds.length;
                                  form.setValue(
                                    "applicableProducts",
                                    isAllSelected ? [] : allIds
                                  );
                                }}
                                disabled={productsLoading}
                              >
                                {(form.watch("applicableProducts")?.length ||
                                  0) === filteredProducts.length
                                  ? "Deselect All"
                                  : "Select All"}
                              </Button>
                            </div>

                            {/* Search and Category Filter */}
                            <div className="flex gap-4 mb-4">
                              <div className="flex-1">
                                <Input
                                  placeholder="Search products..."
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                  className="w-full"
                                />
                              </div>
                              <div className="w-48">
                                <Select
                                  value={selectedCategoryId || ""}
                                  onValueChange={(value) => {
                                    setSelectedCategoryId(value);
                                    fetchProducts(value);
                                    setSearchQuery(""); // Clear search when changing category
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent className="left-0">
                                    <div className="grid grid-cols-2 gap-1 p-1">
                                      {categories.map((category) => (
                                        <SelectItem
                                          key={category.id}
                                          value={category.id}
                                          className="text-xs"
                                        >
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant={
                                    showOnlySelected ? "default" : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    setShowOnlySelected(!showOnlySelected)
                                  }
                                  className={
                                    showOnlySelected
                                      ? "bg-blue-600 hover:bg-blue-700"
                                      : ""
                                  }
                                >
                                  {showOnlySelected
                                    ? "Show All"
                                    : "Show Selected"}
                                </Button>
                              </div>
                            </div>

                            <FormDescription>
                              Select which specific products this coupon can be
                              applied to
                            </FormDescription>
                          </div>

                          {productsLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-sm text-gray-500">
                                Loading products...
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {filteredProducts.map((product) => (
                                <FormField
                                  key={product.id}
                                  control={form.control}
                                  name="applicableProducts"
                                  render={({ field }) => {
                                    const isSelected = field.value?.includes(
                                      product.id
                                    );
                                    return (
                                      <FormItem>
                                        <div
                                          className={`relative border rounded-lg p-3 transition-all duration-200 ${
                                            isSelected
                                              ? "border-blue-500 bg-blue-50 shadow-md"
                                              : "border-gray-200 hover:border-gray-300"
                                          }`}
                                        >
                                          {/* Product Image */}
                                          <div className="aspect-square w-full mb-3 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                            <img
                                              src={
                                                product.banner_image ||
                                                `/images/categories/brownie.png`
                                              }
                                              alt={product.name}
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                e.currentTarget.src =
                                                  "/images/categories/brownie.png";
                                              }}
                                            />
                                          </div>

                                          {/* Product Info and Toggle */}
                                          <div className="flex items-center justify-between">
                                            {/* Left side - Category and Product Name */}
                                            <div className="flex-1 pr-3">
                                              {/* Category Name */}
                                              <div className="text-xs text-gray-500 mb-1 font-medium">
                                                {product.categories?.name ||
                                                  "Brownies & Brookies"}
                                              </div>
                                              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                                                {product.name}
                                              </h3>
                                            </div>

                                            {/* Right side - Toggle Button */}
                                            <FormControl>
                                              <Switch
                                                checked={isSelected}
                                                onCheckedChange={(checked) => {
                                                  if (checked) {
                                                    field.onChange([
                                                      ...(field.value || []),
                                                      product.id,
                                                    ]);
                                                  } else {
                                                    field.onChange(
                                                      field.value?.filter(
                                                        (value) =>
                                                          value !== product.id
                                                      )
                                                    );
                                                  }
                                                }}
                                                className="data-[state=checked]:bg-blue-600"
                                              />
                                            </FormControl>
                                          </div>
                                        </div>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                          )}

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
              </div>

              <div className="space-y-4">
                {form.watch("applyToSpecific") &&
                  form.watch("restrictionType") === "categories" && (
                <FormField
                  control={form.control}
                  name="applicableCategories"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-base">
                            Applicable Categories
                          </FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const selected =
                                form.watch("applicableCategories") || [];
                              const allIds = categories.map((c) => c.id);
                              const isAllSelected =
                                selected.length === allIds.length;
                              form.setValue(
                                "applicableCategories",
                                isAllSelected ? [] : allIds
                              );
                            }}
                                disabled={categoriesLoading}
                          >
                            {(form.watch("applicableCategories")?.length ||
                              0) === categories.length
                              ? "Deselect All"
                              : "Select All"}
                          </Button>
                        </div>
                        <FormDescription>
                          Select which product categories this coupon can be
                          applied to
                        </FormDescription>
                      </div>

                          {categoriesLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-sm text-gray-500">
                                Loading categories...
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-4">
                        {categories.map((category) => (
                          <FormField
                            key={category.id}
                            control={form.control}
                            name="applicableCategories"
                            render={({ field }) => {
                              return (
                                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <FormLabel className="text-sm font-medium">
                                          {category.name}
                                        </FormLabel>
                                  <FormControl>
                                          <Switch
                                      checked={field.value?.includes(
                                        category.id
                                      )}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...(field.value || []),
                                              category.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                      (value) =>
                                                        value !== category.id
                                              )
                                            );
                                      }}
                                            className="data-[state=checked]:bg-blue-600"
                                    />
                                  </FormControl>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                          )}

                      <FormMessage />
                    </FormItem>
                  )}
                />
                  )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="text-[#2664eb] border-[#2664eb] hover:bg-[#2664eb]/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2664eb] hover:bg-[#1f55c8]"
                >
                  {loading ? "Creating..." : "Create Coupon"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
