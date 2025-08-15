"use client";

import { getActiveProducts } from "@/lib/actions/products";
import ProductCard from "@/components/productcard";
import { processProductForHomepage } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  X,
  Filter,
  Check,
  Utensils,
  Leaf,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Dynamically import Icon to reduce initial bundle size
const Icon = dynamic(
  () => import("@iconify/react").then((m) => ({ default: m.Icon })),
  {
    ssr: false,
    loading: () => (
      <div className="w-4 h-4 bg-gray-200 animate-pulse rounded"></div>
    ),
  }
) as any;
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";

export default function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isDietaryOpen, setIsDietaryOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedVegFilter, setSelectedVegFilter] = useState<string>("");
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  // Handle async searchParams
  useEffect(() => {
    if (searchParams) {
      searchParams.then((resolvedParams) => {
        setCategoryId(resolvedParams.category);
      });
    }
  }, [searchParams]);

  // Flavors for filtering
  const flavors = [
    "Chocolate",
    "Vanilla",
    "Strawberry",
    "Butterscotch",
    "Red Velvet",
    "Coffee",
    "Fruit",
    "Nutty",
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        // Fetch paginated products for listing; we can later add Load More
        const fetchedProducts = await getActiveProducts({
          limit: 24,
          offset: 0,
        });
        const processedProducts = fetchedProducts.map(
          processProductForHomepage
        );

        // Extract unique categories with their IDs
        const categoriesMap = new Map();
        processedProducts.forEach((product) => {
          if (product.categories) {
            categoriesMap.set(product.categories.id, product.categories);
          }
        });
        const uniqueCategories = Array.from(categoriesMap.values());

        setCategories(uniqueCategories);
        setProducts(processedProducts);

        // Apply initial category filter if provided
        if (categoryId) {
          const filtered = processedProducts.filter(
            (product) => product.categories?.id === categoryId
          );
          setFilteredProducts(filtered);
          // Set the selected category to the category name for UI consistency
          const categoryName = processedProducts.find(
            (p) => p.categories?.id === categoryId
          )?.categories?.name;
          if (categoryName) {
            setSelectedCategory(categoryName);
          }
        } else {
          setFilteredProducts(processedProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  // Apply filters
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Filter by veg/non-veg
    if (selectedVegFilter) {
      filtered = filtered.filter((product) => {
        if (selectedVegFilter === "veg") return product.isVeg === true;
        if (selectedVegFilter === "non-veg") return product.isVeg === false;
        return true;
      });
    }

    // Apply sorting
    if (selectedSort) {
      filtered = [...filtered].sort((a, b) => {
        switch (selectedSort) {
          case "price-low":
            return a.price - b.price;
          case "price-high":
            return b.price - a.price;
          case "name-asc":
            return (a.name || "").localeCompare(b.name || "");
          case "name-desc":
            return (b.name || "").localeCompare(a.name || "");
          default:
            return 0;
        }
      });
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedVegFilter, selectedSort]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest(".sort-dropdown") &&
        !target.closest(".filter-dropdown")
      ) {
        setIsSortOpen(false);
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedVegFilter("");
  };

  const clearSort = () => {
    setSelectedSort("");
  };

  const hasActiveFilters = selectedCategory || selectedVegFilter;

  const hasActiveSort = selectedSort;

  // Show notFound if category is set but no products found
  if (categoryId && filteredProducts.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-2">No products found</h2>
        <p className="text-gray-500">No products found for this category.</p>
      </div>
    );
  }

  // Product skeleton loader component
  const ProductSkeleton = () => (
    <div className="bg-white rounded-[24px]">
      {/* Image skeleton */}
      <div className="relative">
        <div className="h-48 w-full bg-gray-200 animate-pulse rounded-[28px]" />
      </div>

      {/* Product details skeleton */}
      <div className="p-4">
        {/* Category and Product Name row with Veg indicator */}
        <div className="flex justify-between items-end mb-2">
          <div className="flex-1">
            {/* Category skeleton */}
            <div className="h-3 w-20 bg-gray-200 animate-pulse rounded mb-2" />
            {/* Product name skeleton */}
            <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-2" />
          </div>

          {/* Veg indicator skeleton */}
          <div className="flex justify-end mb-[14px]">
            <div className="w-6 h-6 md:w-5 md:h-5 bg-gray-200 animate-pulse rounded-lg md:rounded-md" />
          </div>
        </div>

        {/* Rating and Price row */}
        <div className="flex justify-between items-center">
          {/* Rating skeleton */}
          <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
            <div className="w-4 h-4 bg-gray-200 animate-pulse rounded-full mr-1" />
            <div className="w-6 h-4 bg-gray-200 animate-pulse rounded" />
          </div>

          {/* Price skeleton */}
          <div className="flex items-center">
            <div className="w-16 h-6 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  // Page skeleton loader for initial loading
  const PageSkeleton = () => (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-6">
          {/* Title skeleton */}
          <div className="h-9 w-48 bg-gray-200 animate-pulse rounded" />

          {/* Sort/Filter buttons skeleton - Desktop only */}
          <div className="hidden md:flex gap-3">
            <div className="h-10 w-20 bg-gray-200 animate-pulse rounded-lg" />
            <div className="h-10 w-20 bg-gray-200 animate-pulse rounded-lg" />
          </div>
        </div>

        {/* Products Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-20 md:mb-0">
          {Array.from({ length: 12 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>

        {/* Mobile Sort/Filter buttons skeleton */}
        <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex gap-3 bg-gray-200 animate-pulse rounded-[16px] shadow-lg px-2 py-1">
            <div className="h-10 w-16 bg-gray-300 animate-pulse rounded" />
            <div className="w-px bg-gray-400 my-1" />
            <div className="h-10 w-16 bg-gray-300 animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {categoryId && selectedCategory
              ? `${selectedCategory} Products`
              : "All Products"}
          </h1>
          {/* Desktop Sort/Filter - Hidden on mobile */}
          <div className="hidden md:flex gap-3">
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  hasActiveSort
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <Icon
                  icon="solar:sort-broken"
                  className={`w-4 h-4 ${
                    hasActiveSort ? "text-primary-foreground" : "text-primary"
                  }`}
                />
                Sort
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isSortOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Sort Dropdown */}
              {isSortOpen && (
                <Card className="sort-dropdown absolute right-0 top-full mt-2 w-[400px] shadow-xl border-0 ring-1 ring-black/5 z-50 bg-white">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:sort-broken"
                            className="w-5 h-5 text-primary"
                          />
                          <h3 className="font-semibold text-lg text-foreground">
                            Sort By
                          </h3>
                        </div>
                        <Button
                          onClick={() => setIsSortOpen(false)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        {/* Price Sorting */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Icon
                              icon="material-symbols:currency-rupee"
                              className="w-4 h-4 text-primary"
                            />
                            <label className="text-sm font-medium text-foreground">
                              Price
                            </label>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <Button
                              variant={
                                selectedSort === "price-low"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => {
                                setSelectedSort("price-low");
                                setIsSortOpen(false);
                              }}
                              className={`justify-start h-9 ${
                                selectedSort === "price-low"
                                  ? "bg-primary text-white hover:bg-primary/90"
                                  : ""
                              }`}
                            >
                              {selectedSort === "price-low" && (
                                <Check className="w-4 h-4 mr-2" />
                              )}
                              Low to High
                            </Button>
                            <Button
                              variant={
                                selectedSort === "price-high"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => {
                                setSelectedSort("price-high");
                                setIsSortOpen(false);
                              }}
                              className={`justify-start h-9 ${
                                selectedSort === "price-high"
                                  ? "bg-primary text-white hover:bg-primary/90"
                                  : ""
                              }`}
                            >
                              {selectedSort === "price-high" && (
                                <Check className="w-4 h-4 mr-2" />
                              )}
                              High to Low
                            </Button>
                          </div>
                        </div>

                        {/* Name Sorting */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Icon
                              icon="solar:document-text-broken"
                              className="w-4 h-4 text-primary"
                            />
                            <label className="text-sm font-medium text-foreground">
                              Name
                            </label>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <Button
                              variant={
                                selectedSort === "name-asc"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => {
                                setSelectedSort("name-asc");
                                setIsSortOpen(false);
                              }}
                              className={`justify-start h-9 ${
                                selectedSort === "name-asc"
                                  ? "bg-primary text-white hover:bg-primary/90"
                                  : ""
                              }`}
                            >
                              {selectedSort === "name-asc" && (
                                <Check className="w-4 h-4 mr-2" />
                              )}
                              A to Z
                            </Button>
                            <Button
                              variant={
                                selectedSort === "name-desc"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => {
                                setSelectedSort("name-desc");
                                setIsSortOpen(false);
                              }}
                              className={`justify-start h-9 ${
                                selectedSort === "name-desc"
                                  ? "bg-primary text-white hover:bg-primary/90"
                                  : ""
                              }`}
                            >
                              {selectedSort === "name-desc" && (
                                <Check className="w-4 h-4 mr-2" />
                              )}
                              Z to A
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Clear Sort Button */}
                      {selectedSort && (
                        <div className="mt-6 pt-4 border-t border-border">
                          <Button
                            onClick={() => {
                              setSelectedSort("");
                              setIsSortOpen(false);
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full h-9 text-muted-foreground hover:text-foreground bg-transparent"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear Sort
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  hasActiveFilters
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <Icon
                  icon="solar:filter-broken"
                  className={`w-4 h-4 ${
                    hasActiveFilters
                      ? "text-primary-foreground"
                      : "text-primary"
                  }`}
                />
                Filter
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-1 px-1.5 py-0.5 text-xs"
                  >
                    {
                      [selectedCategory, selectedVegFilter].filter(Boolean)
                        .length
                    }
                  </Badge>
                )}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isFilterOpen && (
                <Card className="filter-dropdown absolute right-0 top-full mt-2 w-[800px] shadow-xl border-0 ring-1 ring-black/5 z-50 bg-white">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                          <Filter className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-lg text-foreground">
                            Filters
                          </h3>
                        </div>
                        <Button
                          onClick={() => setIsFilterOpen(false)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        {/* Category Filter */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Icon
                              icon="ph:fork-knife-fill"
                              className="w-4 h-4 text-duchess-brown"
                            />
                            <label className="text-sm font-medium text-foreground">
                              Category
                            </label>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <Button
                              variant={
                                selectedCategory === "" ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setSelectedCategory("")}
                              className={`justify-start h-9 ${
                                selectedCategory === ""
                                  ? "bg-primary text-white hover:bg-primary/90"
                                  : ""
                              }`}
                            >
                              {selectedCategory === "" && (
                                <Check className="w-4 h-4 mr-2" />
                              )}
                              All Categories
                            </Button>
                            {categories.map((cat) => (
                              <Button
                                key={cat.id}
                                variant={
                                  selectedCategory === cat.name
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`justify-start h-9 ${
                                  selectedCategory === cat.name
                                    ? "bg-primary text-white hover:bg-primary/90"
                                    : ""
                                }`}
                              >
                                {selectedCategory === cat.name && (
                                  <Check className="w-4 h-4 mr-2" />
                                )}
                                {cat.name}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Dietary Preference Filter */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Icon
                              icon="bx:bxs-leaf"
                              className="w-4 h-4 text-primary"
                            />
                            <label className="text-sm font-medium text-foreground">
                              Dietary Preference
                            </label>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { value: "", label: "All" },
                              { value: "veg", label: "Vegetarian" },
                              { value: "non-veg", label: "Non-Vegetarian" },
                            ].map((option) => (
                              <Button
                                key={option.value}
                                variant={
                                  selectedVegFilter === option.value
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  setSelectedVegFilter(option.value)
                                }
                                className={`justify-start h-9 ${
                                  selectedVegFilter === option.value
                                    ? "bg-primary text-white hover:bg-primary/90"
                                    : ""
                                }`}
                              >
                                {selectedVegFilter === option.value && (
                                  <Check className="w-4 h-4 mr-2" />
                                )}
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Clear Filters Button */}
                      {hasActiveFilters && (
                        <div className="mt-6 pt-4 border-t border-border">
                          <Button
                            onClick={clearFilters}
                            variant="outline"
                            size="sm"
                            className="w-full h-9 text-muted-foreground hover:text-foreground bg-transparent"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear All Filters
                          </Button>
                        </div>
                      )}

                      {/* Clear All Button - when both filters and sorting are active */}
                      {hasActiveFilters && hasActiveSort && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <Button
                            onClick={() => {
                              clearFilters();
                              clearSort();
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full h-9 text-muted-foreground hover:text-foreground bg-transparent"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear All
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sort/Filter Bottom Buttons */}
        <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex gap-3 bg-primary rounded-[16px] shadow-lg px-2 py-1">
            <button
              onClick={() => setIsMobileSortOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-white"
            >
              <Icon icon="solar:sort-broken" className="w-4 h-4 text-white" />
              Sort
            </button>
            <div className="w-px bg-white/20 my-1"></div>
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-white"
            >
              <Icon icon="solar:filter-broken" className="w-4 h-4 text-white" />
              Filter
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className="ml-1 px-1.5 py-0.5 text-xs bg-white text-primary"
                >
                  {[selectedCategory, selectedVegFilter].filter(Boolean).length}
                </Badge>
              )}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-20 md:mb-0">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* No Results Message */}
        {filteredProducts.length === 0 &&
          (hasActiveFilters || hasActiveSort) && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No products match your criteria.
              </p>
              <div className="mt-4 flex gap-2 justify-center">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear filters
                  </button>
                )}
                {hasActiveSort && (
                  <button
                    onClick={clearSort}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear sort
                  </button>
                )}
                {hasActiveFilters && hasActiveSort && (
                  <button
                    onClick={() => {
                      clearFilters();
                      clearSort();
                    }}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
      </div>

      {/* Mobile Sort Drawer */}
      <Drawer open={isMobileSortOpen} onOpenChange={setIsMobileSortOpen}>
        <DrawerContent
          className="max-h-[80vh]"
          style={{ backgroundColor: "#F5F6FB" }}
        >
          <DrawerHeader className="">
            <div className="flex items-center justify-between px-1">
              <DrawerTitle className="flex items-center gap-2 text-[20px]">
                Sort options
              </DrawerTitle>
              <button
                onClick={() => setIsMobileSortOpen(false)}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-50"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Price Sorting */}
              <div className="space-y-3 bg-white rounded-[16px] p-4">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:sort-broken"
                    className="w-5 h-5 text-primary"
                  />
                  <label className="text-lg font-medium text-foreground">
                    Price
                  </label>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedSort("price-low");
                      setIsMobileSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedSort === "price-low"
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Low to High</span>
                      {selectedSort === "price-low" && (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSort("price-high");
                      setIsMobileSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedSort === "price-high"
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>High to Low</span>
                      {selectedSort === "price-high" && (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Name Sorting */}
              <div className="space-y-3 bg-white rounded-[16px] p-4">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:sort-broken"
                    className="w-5 h-5 text-primary"
                  />
                  <label className="text-lg font-medium text-foreground">
                    Name
                  </label>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedSort("name-asc");
                      setIsMobileSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedSort === "name-asc"
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>A to Z</span>
                      {selectedSort === "name-asc" && (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSort("name-desc");
                      setIsMobileSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedSort === "name-desc"
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Z to A</span>
                      {selectedSort === "name-desc" && (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <DrawerFooter className="border-t border-gray-100 bg-white">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsMobileSortOpen(false)}
                className="flex-1 h-[48px] rounded-[16px]"
              >
                Cancel
              </Button>
              {selectedSort && (
                <Button
                  onClick={() => {
                    setSelectedSort("");
                    setIsMobileSortOpen(false);
                  }}
                  className="flex-1 h-[48px] rounded-[16px] bg-primary hover:bg-primary/90"
                >
                  Clear Sort
                </Button>
              )}
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Mobile Filter Drawer */}
      <Drawer open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
        <DrawerContent
          className="max-h-[80vh]"
          style={{ backgroundColor: "#F5F6FB" }}
        >
          <DrawerHeader className="">
            <div className="flex items-center justify-between px-1">
              <DrawerTitle className="flex items-center gap-2 text-[20px]">
                Filter options
              </DrawerTitle>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-50"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>
          </DrawerHeader>
          <div className="p-4 pt-1 overflow-y-auto">
            <div className="space-y-3">
              {/* Dietary Preference Dropdown */}
              <div className="bg-white rounded-[16px]">
                <button
                  onClick={() => setIsDietaryOpen(!isDietaryOpen)}
                  className="w-full px-4 py-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon icon="bx:bxs-leaf" className="w-5 h-5 text-primary" />
                    <span className="font-medium text-gray-800">
                      Dietary Preference
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      isDietaryOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {isDietaryOpen && (
                  <div className="px-4 pb-4 space-y-2">
                    {[
                      { value: "", label: "All" },
                      { value: "veg", label: "Vegetarian" },
                      { value: "non-veg", label: "Non-Vegetarian" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedVegFilter(option.value);
                          setIsDietaryOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-[16px] transition-all ${
                          selectedVegFilter === option.value
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.label}</span>
                          {selectedVegFilter === option.value && (
                            <Check className="w-4 h-4" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="bg-white rounded-[16px]">
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full px-4 py-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="ph:fork-knife-fill"
                      className="w-5 h-5 text-primary"
                    />
                    <span className="font-medium text-gray-800">Category</span>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      isCategoryOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {isCategoryOpen && (
                  <div className="px-4 pb-4 space-y-2">
                    <button
                      onClick={() => {
                        setSelectedCategory("");
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-[16px] transition-all ${
                        selectedCategory === ""
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>All Categories</span>
                        {selectedCategory === "" && (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-[16px] transition-all ${
                          selectedCategory === cat.name
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{cat.name}</span>
                          {selectedCategory === cat.name && (
                            <Check className="w-4 h-4" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DrawerFooter className="border-t border-gray-100 bg-white">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 h-[48px] rounded-[16px]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedVegFilter("");
                  setIsMobileFilterOpen(false);
                }}
                className="flex-1 bg-primary h-[48px] rounded-[16px] hover:bg-primary/90"
              >
                Apply
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
