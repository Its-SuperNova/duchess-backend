"use client";

import { useState, useEffect } from "react";
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
import { Coupon } from "@/lib/supabase";

// Categories for coupon applicability
const categories = [
  { id: 1, name: "Cakes" },
  { id: 2, name: "Cookies" },
  { id: 3, name: "Pastries" },
  { id: 4, name: "Breads" },
  { id: 5, name: "Cupcakes" },
  { id: 6, name: "Tarts" },
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
  usagePerUser: z.coerce.number().min(1),
  validFrom: z.date(),
  validUntil: z.date(),
  applicableCategories: z.array(z.number()).optional(),
  isActive: z.boolean().default(true),
});

export default function EditCouponPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [fetching, setFetching] = useState(true);

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
      usagePerUser: 1,
      validFrom: new Date(),
      validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      applicableCategories: [],
      isActive: true,
    },
  });

  // Fetch coupon data
  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const response = await fetch(`/api/coupons/${params.id}`);
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
          minOrderAmount: couponData.min_order_amount,
          maxDiscountCap: couponData.max_discount_cap || 0,
          usageLimit: couponData.usage_limit,
          usagePerUser: couponData.usage_per_user,
          validFrom: new Date(couponData.valid_from),
          validUntil: new Date(couponData.valid_until),
          applicableCategories:
            couponData.applicable_categories?.map((cat: string) =>
              parseInt(cat)
            ) || [],
          isActive: couponData.is_active,
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
  }, [params.id, form, router]);

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const couponData = {
        code: values.code,
        type: values.type,
        value: values.value,
        minOrderAmount: values.minOrderAmount,
        maxDiscountCap: values.maxDiscountCap,
        usageLimit: values.usageLimit,
        usagePerUser: values.usagePerUser,
        validFrom: values.validFrom.toISOString(),
        validUntil: values.validUntil.toISOString(),
        applicableCategories:
          values.applicableCategories?.map((id) => id.toString()) || [],
        isActive: values.isActive,
      };

      const response = await fetch(`/api/coupons/${params.id}`, {
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
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Edit Coupon</h1>
      </div>

      <Card>
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
                  name="minOrderAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Order Amount</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <span className="mr-2">₹</span>
                          <Input type="number" {...field} min={0} />
                        </div>
                      </FormControl>
                      <FormDescription>0 for no minimum</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("type") === "percentage" && (
                  <FormField
                    control={form.control}
                    name="maxDiscountCap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Discount Cap</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <span className="mr-2">₹</span>
                            <Input
                              type="number"
                              {...field}
                              min={0}
                              placeholder="No cap"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Maximum discount amount for percentage discounts (0
                          for no cap)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="usageLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Usage Limit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? null
                                : Number.parseInt(e.target.value);
                            field.onChange(value);
                          }}
                          min={1}
                          placeholder="Unlimited"
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for unlimited usage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usagePerUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usage Per User</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={1} />
                      </FormControl>
                      <FormDescription>
                        How many times each user can use this coupon
                      </FormDescription>
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

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="applicableCategories"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">
                          Applicable Categories
                        </FormLabel>
                        <FormDescription>
                          Select which product categories this coupon can be
                          applied to
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {categories.map((category) => (
                          <FormField
                            key={category.id}
                            control={form.control}
                            name="applicableCategories"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={category.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
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
                                                (value) => value !== category.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {category.name}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormDescription className="mt-4">
                        Leave all unchecked to apply to all products
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Coupon Status
                        </FormLabel>
                        <FormDescription>
                          Enable or disable this coupon
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
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
