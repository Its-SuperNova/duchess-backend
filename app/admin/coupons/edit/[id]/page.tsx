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
import { CalendarIcon, ArrowLeft, Search } from "lucide-react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Coupon } from "@/lib/supabase";
import Image from "next/image";

// Hardcoded categories as fallback
const hardcodedCategories = [
  { id: "550e8400-e29b-41d4-a716-446655440001", name: "Brownies & Brookies" },
  { id: "550e8400-e29b-41d4-a716-446655440002", name: "Cakes" },
  { id: "550e8400-e29b-41d4-a716-446655440003", name: "Cookies" },
  { id: "550e8400-e29b-41d4-a716-446655440004", name: "Pastries" },
];

// Form schema for coupon editing
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
  validFrom: z.date(),
  validUntil: z.date(),
  applyToSpecific: z.boolean(),
  restrictionType: z.enum(["products", "categories"]).optional(),
  applicableCategories: z.array(z.string()).optional(),
  applicableProducts: z.array(z.string()).optional(),
  enableMinOrderAmount: z.boolean(),
  enableMaxDiscountCap: z.boolean(),
  enableUsageLimit: z.boolean(),
});

export default function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [fetching, setFetching] = useState(true);
  const [couponId, setCouponId] = useState<string>("");

  // New state for categories and products
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

  // Handle async params
  useEffect(() => {
    params.then((resolvedParams) => {
      setCouponId(resolvedParams.id);
    });
  }, [params]);

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
      validFrom: new Date(),
      validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      applyToSpecific: false,
      restrictionType: "categories",
      applicableCategories: [],
      applicableProducts: [],
      enableMinOrderAmount: false,
      enableMaxDiscountCap: false,
      enableUsageLimit: false,
    },
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          console.log("📋 Categories API response:", data);
          // Fix: API returns {categories: [...], success: true}
          setCategories(data.categories || []);
        } else {
          console.warn("⚠️ Categories API failed, using fallback");
          // Fallback to hardcoded categories
          setCategories(hardcodedCategories);
        }
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
        setCategories(hardcodedCategories);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products and set initial category
  useEffect(() => {
    const fetchProducts = async (categoryId: string) => {
      try {
        setProductsLoading(true);
        const response = await fetch(
          `/api/products/by-category?category_id=${categoryId}`
        );
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        } else {
          // Fallback to mock products
          setProducts([
            {
              id: 1,
              name: "Chocolate Brownie",
              category_id: categoryId,
              banner_image: "/images/homePage-Product/brownie1.png",
              categories: { name: "Brownies & Brookies" },
            },
            {
              id: 2,
              name: "Vanilla Brownie",
              category_id: categoryId,
              banner_image: "/images/homePage-Product/brownie2.png",
              categories: { name: "Brownies & Brookies" },
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    if (categories.length > 0) {
      // Find "Brownies & Brookies" category or use first category
      const brownieCategory = categories.find(
        (cat) => cat.name === "Brownies & Brookies"
      );
      const initialCategoryId = brownieCategory
        ? brownieCategory.id
        : categories[0].id;
      setSelectedCategoryId(initialCategoryId);
      fetchProducts(initialCategoryId);
    }
  }, [categories]);

  // Fetch coupon data
  useEffect(() => {
    if (!couponId) return;

    const fetchCoupon = async () => {
      try {
        const response = await fetch(`/api/coupons/${couponId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch coupon");
        }
        const couponData = await response.json();
        setCoupon(couponData);

        // Set form values
        form.reset({
          code: couponData.code,
          type: couponData.type,
          value: couponData.value,
          minOrderAmount: couponData.min_order_amount || 0,
          maxDiscountCap: couponData.max_discount_cap || 0,
          usageLimit: couponData.usage_limit || 100,
          validFrom: new Date(couponData.valid_from),
          validUntil: new Date(couponData.valid_until),
          applyToSpecific: couponData.apply_to_specific || false,
          restrictionType: couponData.restriction_type || "categories",
          applicableCategories: couponData.applicable_categories || [],
          applicableProducts:
            couponData.applicable_products?.map((id: number) =>
              id.toString()
            ) || [],
          enableMinOrderAmount: couponData.enable_min_order_amount || false,
          enableMaxDiscountCap: couponData.enable_max_discount_cap || false,
          enableUsageLimit: couponData.enable_usage_limit || false,
        });
      } catch (error) {
        console.error("Error fetching coupon:", error);
        toast.error("Failed to fetch coupon");
        router.push("/admin/coupons");
      } finally {
        setFetching(false);
      }
    };

    fetchCoupon();
  }, [couponId, form, router]);

  // Filter products based on search and selection
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected products only
    if (showOnlySelected) {
      const selectedProductIds = form.watch("applicableProducts") || [];
      filtered = filtered.filter((product) =>
        selectedProductIds.includes(product.id.toString())
      );
    }

    return filtered;
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
          : null,
        usageLimit: values.enableUsageLimit ? values.usageLimit : null,
        validFrom: values.validFrom.toISOString(),
        validUntil: values.validUntil.toISOString(),
        applyToSpecific: values.applyToSpecific,
        restrictionType: values.restrictionType,
        applicableCategories: values.applicableCategories || [],
        applicableProducts:
          values.applicableProducts?.map((id) => parseInt(id)) || [],
        enableMinOrderAmount: values.enableMinOrderAmount,
        enableMaxDiscountCap: values.enableMaxDiscountCap,
        enableUsageLimit: values.enableUsageLimit,
      };

      const response = await fetch(`/api/coupons/${couponId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(couponData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update coupon");
      }

      toast.success("Coupon updated successfully!");
      router.push("/admin/coupons");
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update coupon"
      );
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading coupon...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Coupon not found</p>
          <Button
            onClick={() => router.push("/admin/coupons")}
            className="mt-4"
          >
            Back to Coupons
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="text-[black] border-[#e6e6e8] "
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Edit Coupon</h1>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Edit Coupon: {coupon.code}</CardTitle>
          <CardDescription>
            Update the coupon details and settings
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
                            disabled={(date) => date < form.watch("validFrom")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Apply to Specific Products/Categories Toggle */}
              <FormField
                control={form.control}
                name="applyToSpecific"
                render={({ field }) => (
                  <FormItem className="rounded-lg border p-4">
                    <div className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Apply to Specific Products/Categories
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
                          <SelectItem value="categories">Categories</SelectItem>
                          <SelectItem value="products">Products</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Categories Section */}
              {form.watch("applyToSpecific") &&
                form.watch("restrictionType") === "categories" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Select Categories</h3>
                      {categoriesLoading && (
                        <div className="text-sm text-gray-500">Loading...</div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {Array.isArray(categories) &&
                        categories.map((category) => (
                          <FormField
                            key={category.id}
                            control={form.control}
                            name="applicableCategories"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Switch
                                    checked={
                                      field.value?.includes(category.id) ||
                                      false
                                    }
                                    onCheckedChange={(checked) => {
                                      const currentValues = field.value || [];
                                      if (checked) {
                                        field.onChange([
                                          ...currentValues,
                                          category.id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          currentValues.filter(
                                            (id) => id !== category.id
                                          )
                                        );
                                      }
                                    }}
                                    className="data-[state=checked]:bg-blue-600"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {category.name}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                    </div>
                  </div>
                )}

              {/* Products Section */}
              {form.watch("applyToSpecific") &&
                form.watch("restrictionType") === "products" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Select Products</h3>
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 w-64"
                          />
                        </div>
                        <Select
                          value={selectedCategoryId || ""}
                          onValueChange={(value) => {
                            setSelectedCategoryId(value);
                            // Fetch products for selected category
                            fetch(
                              `/api/products/by-category?category_id=${value}`
                            )
                              .then((res) => res.json())
                              .then((data) => setProducts(data.products || []))
                              .catch(() => setProducts([]));
                          }}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by category" />
                          </SelectTrigger>
                          <SelectContent className="left-0">
                            <div className="grid grid-cols-2 gap-1 p-1">
                              {Array.isArray(categories) &&
                                categories.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                            </div>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowOnlySelected(!showOnlySelected)}
                        >
                          {showOnlySelected ? "Show All" : "Show Selected"}
                        </Button>
                      </div>
                    </div>

                    {productsLoading ? (
                      <div className="text-center py-8">
                        Loading products...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 pr-3">
                                <div className="text-sm text-gray-500 mb-1">
                                  {product.categories?.name}
                                </div>
                                <div className="font-medium">
                                  {product.name}
                                </div>
                              </div>
                              <FormField
                                control={form.control}
                                name="applicableProducts"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Switch
                                        checked={
                                          field.value?.includes(
                                            product.id.toString()
                                          ) || false
                                        }
                                        onCheckedChange={(checked) => {
                                          const currentValues =
                                            field.value || [];
                                          if (checked) {
                                            field.onChange([
                                              ...currentValues,
                                              product.id.toString(),
                                            ]);
                                          } else {
                                            field.onChange(
                                              currentValues.filter(
                                                (id) =>
                                                  id !== product.id.toString()
                                              )
                                            );
                                          }
                                        }}
                                        className="data-[state=checked]:bg-blue-600"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              {/* Toggle-controlled fields */}
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
                            <FormDescription>0 for no minimum</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </FormItem>
                )}
              />

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
                    {field.value && (
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
                                  placeholder="Enter maximum discount cap"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </FormItem>
                )}
              />

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
                                value={inputField.value ?? ""}
                                min={1}
                                placeholder="Enter usage limit"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </FormItem>
                )}
              />

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
                  {loading ? "Updating..." : "Update Coupon"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
