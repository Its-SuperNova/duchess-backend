import type React from "react";
import { ProductSelectionProvider } from "@/context/product-selection-context";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProductSelectionProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="flex flex-col min-h-screen">{children}</main>
      </div>
    </ProductSelectionProvider>
  );
}
