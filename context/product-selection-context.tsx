"use client";

import React, { createContext, useContext, useState } from "react";

export type OrderType = "weight" | "piece";

interface ProductSelectionContextType {
  selectedWeightOption: number;
  setSelectedWeightOption: (index: number) => void;
  selectedPieceOption: number;
  setSelectedPieceOption: (index: number) => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  pieceQuantity: number;
  setPieceQuantity: (qty: number) => void;
}

const ProductSelectionContext = createContext<
  ProductSelectionContextType | undefined
>(undefined);

export const ProductSelectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedWeightOption, setSelectedWeightOption] = useState(0);
  const [selectedPieceOption, setSelectedPieceOption] = useState(0);
  const [orderType, setOrderType] = useState<OrderType>("piece");
  const [pieceQuantity, setPieceQuantity] = useState(1);

  return (
    <ProductSelectionContext.Provider
      value={{
        selectedWeightOption,
        setSelectedWeightOption,
        selectedPieceOption,
        setSelectedPieceOption,
        orderType,
        setOrderType,
        pieceQuantity,
        setPieceQuantity,
      }}
    >
      {children}
    </ProductSelectionContext.Provider>
  );
};

export function useProductSelection() {
  const context = useContext(ProductSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useProductSelection must be used within a ProductSelectionProvider"
    );
  }
  return context;
}
