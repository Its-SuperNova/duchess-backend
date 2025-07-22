# Infinite Scroll Implementation

This document describes the infinite scroll (lazy loading) implementation for the category products page.

## Overview

The infinite scroll feature allows users to browse through large numbers of products without waiting for all data to load at once. Products are loaded in batches of 4 as the user scrolls down the page.

## Architecture

### 1. Custom Hooks

#### `useInfiniteScroll` Hook

- **Location**: `hooks/use-infinite-scroll.ts`
- **Purpose**: Generic intersection observer hook for detecting when elements come into view
- **Features**:
  - Configurable threshold and root margin
  - Automatic cleanup of observers
  - Callback-based intersection detection

#### `useInfiniteProducts` Hook

- **Location**: `hooks/use-infinite-products.ts`
- **Purpose**: Specialized hook for infinite product loading
- **Features**:
  - Integrates with `useInfiniteScroll`
  - Manages product state and pagination
  - Handles API calls and error states
  - Automatic loading when intersection is detected

### 2. API Endpoint

#### Category Products API

- **Location**: `app/api/products/category/[slug]/route.ts`
- **Purpose**: Paginated product fetching for categories
- **Features**:
  - Supports page-based pagination
  - Returns optimized product data (only necessary fields)
  - Includes pagination metadata
  - Proper error handling and validation

### 3. Components

#### `CategoryClient` Component

- **Location**: `app/products/categories/[slug]/category-client.tsx`
- **Purpose**: Client-side component handling infinite scroll UI
- **Features**:
  - Uses `useInfiniteProducts` hook
  - Renders product grid with infinite scroll
  - Shows loading states and error handling
  - Intersection observer target for auto-loading

#### Loading Components

- **Location**: `components/ui/loading-spinner.tsx` and `components/ui/product-skeleton.tsx`
- **Purpose**: Visual feedback during loading states
- **Features**:
  - Spinner with text for loading more products
  - Skeleton grid for initial loading
  - Smooth animations and mobile-optimized design

## How It Works

### 1. Initial Load

1. Page loads with 4 products initially
2. Shows skeleton loading state while fetching
3. Renders first batch of products

### 2. Infinite Scroll

1. Intersection observer watches for scroll position
2. When user approaches bottom (200px margin), triggers load
3. Fetches next 4 products from API
4. Appends new products to existing list
5. Continues until all products are loaded

### 3. Performance Optimizations

- **Data Fetching**: Only loads necessary product fields
- **Pagination**: 4 products per request (mobile-optimized)
- **Caching**: API responses cached for 5 minutes
- **Intersection Observer**: Efficient scroll detection
- **State Management**: Minimal re-renders

## Usage

### Basic Implementation

```tsx
import { useInfiniteProducts } from "@/hooks/use-infinite-products";

function MyComponent() {
  const { products, isLoading, hasMore, error, refresh, observerRef } =
    useInfiniteProducts({
      categorySlug: "cakes",
      pageSize: 4,
    });

  return (
    <div>
      {/* Product grid */}
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}

      {/* Intersection observer target */}
      {hasMore && (
        <div ref={observerRef}>
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
```

### Customization

#### Page Size

```tsx
const { products } = useInfiniteProducts({
  categorySlug: "cakes",
  pageSize: 8, // Load 8 products at a time
});
```

#### Intersection Observer Settings

```tsx
const { observerRef } = useInfiniteScroll({
  threshold: 0.5, // Trigger when 50% visible
  rootMargin: "100px", // Trigger 100px before intersection
});
```

## Mobile Optimization

### 1. Touch Scrolling

- Smooth scroll behavior on mobile devices
- Optimized intersection observer settings for touch
- Reduced page size (4 products) for better performance

### 2. Loading States

- Skeleton loading for initial load
- Compact spinner for subsequent loads
- Minimal layout shift during loading

### 3. Performance

- Efficient DOM updates
- Minimal memory usage
- Optimized for mobile network conditions

## Error Handling

### 1. Network Errors

- Automatic retry mechanism
- User-friendly error messages
- Refresh button for manual retry

### 2. Empty States

- Helpful messages when no products found
- Clear call-to-action buttons
- Graceful degradation

## Testing

### 1. Manual Testing

- Test with different category sizes
- Verify smooth scrolling on mobile
- Check loading states and error handling

### 2. Performance Testing

- Monitor memory usage during scrolling
- Check network request patterns
- Verify smooth 60fps scrolling

## Future Enhancements

### 1. Virtual Scrolling

- For very large product lists
- Only render visible products
- Improved memory efficiency

### 2. Search Integration

- Infinite scroll with search filters
- Debounced search input
- Maintain scroll position during search

### 3. Analytics

- Track scroll depth
- Monitor loading performance
- User engagement metrics

## Troubleshooting

### Common Issues

#### 1. Products Not Loading

- Check API endpoint availability
- Verify category slug format
- Check browser console for errors

#### 2. Infinite Loading Loop

- Verify `hasMore` state management
- Check intersection observer cleanup
- Ensure proper page increment logic

#### 3. Performance Issues

- Reduce page size
- Implement virtual scrolling
- Optimize product rendering

## Dependencies

- `@/lib/utils` - Utility functions including `cn`
- `lucide-react` - Icons for UI elements
- `@/components/ui/*` - UI components
- `@/hooks/*` - Custom hooks

## Browser Support

- **Modern Browsers**: Full support with Intersection Observer
- **Mobile Browsers**: Optimized for iOS Safari and Chrome Mobile
- **Fallback**: Graceful degradation for older browsers
