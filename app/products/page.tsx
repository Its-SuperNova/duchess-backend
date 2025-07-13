"use client";

import { getActiveProducts } from "@/lib/actions/products";
import ProductCard from "@/components/productcard";
import { processProductForHomepage } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  ChevronDown,
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
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

export default function ProductsPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedVegFilter, setSelectedVegFilter] = useState<string>("");
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get categoryId from query params
  const categoryId = searchParams?.category;

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
        const fetchedProducts = await getActiveProducts();
        const processedProducts = fetchedProducts.map(
          processProductForHomepage
        );

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(processedProducts.map((p) => p.category).filter(Boolean))
        ).map((name) => ({ id: name, name }));

        setCategories(uniqueCategories);
        setProducts(processedProducts);

        // Apply initial category filter if provided
        if (categoryId) {
          const filtered = processedProducts.filter(
            (product) => product.categories?.id === categoryId
          );
          setFilteredProducts(filtered);
          setSelectedCategory(categoryId);
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

    // Filter by flavor
    if (selectedFlavor) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(selectedFlavor.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(selectedFlavor.toLowerCase())
      );
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
  }, [
    products,
    selectedCategory,
    selectedVegFilter,
    selectedFlavor,
    selectedSort,
  ]);

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
    setSelectedFlavor("");
  };

  const clearSort = () => {
    setSelectedSort("");
  };

  const hasActiveFilters =
    selectedCategory || selectedVegFilter || selectedFlavor;

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <div className="text-lg">Loading products...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {categoryId ? "Products in this Category" : "All Products"}
          </h1>
          <div className="flex gap-3">
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
                      [
                        selectedCategory,
                        selectedVegFilter,
                        selectedFlavor,
                      ].filter(Boolean).length
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

                      <div className="grid grid-cols-3 gap-6">
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

                        {/* Flavor Filter */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Icon
                              icon="majesticons:cup"
                              className="w-4 h-4 text-primary"
                            />
                            <label className="text-sm font-medium text-foreground">
                              Flavor
                            </label>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <Button
                              variant={
                                selectedFlavor === "" ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setSelectedFlavor("")}
                              className={`justify-start h-9 ${
                                selectedFlavor === ""
                                  ? "bg-primary text-white hover:bg-primary/90"
                                  : ""
                              }`}
                            >
                              {selectedFlavor === "" && (
                                <Check className="w-4 h-4 mr-2" />
                              )}
                              All Flavors
                            </Button>
                            {flavors.map((flavor) => (
                              <Button
                                key={flavor}
                                variant={
                                  selectedFlavor === flavor
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setSelectedFlavor(flavor)}
                                className={`justify-start h-9 ${
                                  selectedFlavor === flavor
                                    ? "bg-primary text-white hover:bg-primary/90"
                                    : ""
                                }`}
                              >
                                {selectedFlavor === flavor && (
                                  <Check className="w-4 h-4 mr-2" />
                                )}
                                {flavor}
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
    </div>
  );
}
