"use client";

import React, { createContext, useContext, useState } from "react";

interface LayoutContextType {
  isUserSidebarCollapsed: boolean;
  setIsUserSidebarCollapsed: (collapsed: boolean) => void;
  isCartSidebarOpen: boolean;
  setIsCartSidebarOpen: (open: boolean) => void;
  getLayoutClasses: () => {
    isCompact: boolean;
    isVeryCompact: boolean;
    mainContentClasses: string;
  };
  getCategoryGridConfig: () => {
    columns: number;
    maxCategories: number;
    gridClasses: string;
  };
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isUserSidebarCollapsed, setIsUserSidebarCollapsed] = useState(true);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);

  const getLayoutClasses = () => {
    // Calculate available space
    const userSidebarWidth = isUserSidebarCollapsed ? 64 : 256; // 16 or 64 (in px)
    const cartSidebarWidth = isCartSidebarOpen ? 384 : 0; // 96 (in px)

    // Assume minimum viewport width of 1024px for lg screens
    const availableWidth = 1024 - userSidebarWidth - cartSidebarWidth;

    const isCompact = availableWidth < 800; // Less than 800px available
    const isVeryCompact = availableWidth < 600; // Less than 600px available

    // Calculate main content classes
    let mainContentClasses = "flex-1 transition-all duration-300";

    // User sidebar margin
    if (!isUserSidebarCollapsed) {
      mainContentClasses += " lg:ml-64";
    } else {
      mainContentClasses += " lg:ml-16";
    }

    // Cart sidebar margin
    if (isCartSidebarOpen) {
      mainContentClasses += " lg:mr-96";
    }

    return {
      isCompact,
      isVeryCompact,
      mainContentClasses,
    };
  };

  const getCategoryGridConfig = () => {
    // Determine sidebar states
    const userSidebarExpanded = !isUserSidebarCollapsed;
    const cartSidebarExpanded = isCartSidebarOpen;
    const bothExpanded = userSidebarExpanded && cartSidebarExpanded;
    const oneExpanded = userSidebarExpanded || cartSidebarExpanded;
    const noneExpanded = !userSidebarExpanded && !cartSidebarExpanded;

    let columns = 8;
    let maxCategories = 8;
    let gridClasses = "";

    // Screen size > 1400px (2xl breakpoint)
    if (bothExpanded) {
      columns = 5;
      maxCategories = 5;
      gridClasses = "2xl:grid-cols-5 xl:grid-cols-5";
    } else if (oneExpanded) {
      columns = 6;
      maxCategories = 6;
      gridClasses = "2xl:grid-cols-6 xl:grid-cols-6";
    } else if (noneExpanded) {
      columns = 8;
      maxCategories = 8;
      gridClasses = "2xl:grid-cols-8 xl:grid-cols-8";
    }

    // Screen size 1280px - 1400px (xl breakpoint) - Override for specific cases
    const onlyUserExpanded = userSidebarExpanded && !cartSidebarExpanded;
    const onlyCartExpanded = !userSidebarExpanded && cartSidebarExpanded;

    if (onlyUserExpanded) {
      // Only user sidebar expanded: 6 categories for both xl and 2xl
      gridClasses = "2xl:grid-cols-6 xl:grid-cols-6";
      maxCategories = 6;
    } else if (onlyCartExpanded) {
      // Only cart sidebar expanded: 6 categories for 2xl, 5 categories for xl
      gridClasses = "2xl:grid-cols-6 xl:grid-cols-5";
      maxCategories = 5; // Use minimum to prevent wrapping on xl screens
    }

    // Add base responsive classes
    gridClasses += " lg:grid-cols-6 md:grid-cols-4 grid-cols-2";

    return {
      columns,
      maxCategories,
      gridClasses: `hidden lg:flex flex-nowrap gap-6 justify-start`,
    };
  };

  return (
    <LayoutContext.Provider
      value={{
        isUserSidebarCollapsed,
        setIsUserSidebarCollapsed,
        isCartSidebarOpen,
        setIsCartSidebarOpen,
        getLayoutClasses,
        getCategoryGridConfig,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
