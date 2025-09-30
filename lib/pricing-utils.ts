/**
 * Pricing utilities for tax calculations and pricing management
 */

export interface TaxAmounts {
  cgstAmount: number;
  sgstAmount: number;
  totalTaxAmount: number;
}

/**
 * Calculate CGST and SGST amounts based on taxable amount
 * @param taxableAmount - The amount on which tax should be calculated
 * @returns Object containing CGST, SGST, and total tax amounts
 */
export function calculateTaxAmounts(taxableAmount: number): TaxAmounts {
  // CGST and SGST rates (9% each = 18% total GST)
  const CGST_RATE = 0.09; // 9%
  const SGST_RATE = 0.09; // 9%

  const cgstAmount = Math.round(taxableAmount * CGST_RATE * 100) / 100;
  const sgstAmount = Math.round(taxableAmount * SGST_RATE * 100) / 100;
  const totalTaxAmount = cgstAmount + sgstAmount;

  return {
    cgstAmount,
    sgstAmount,
    totalTaxAmount,
  };
}

/**
 * Calculate delivery charges based on distance and zone
 * @param distance - Distance in kilometers
 * @param zone - Delivery zone
 * @returns Delivery charge amount
 */
export function calculateDeliveryCharge(
  distance: number,
  zone?: string
): number {
  // Base delivery charges
  const BASE_CHARGE = 30;
  const PER_KM_CHARGE = 5;

  // Zone-based multipliers
  const zoneMultipliers: Record<string, number> = {
    "Zone A - Express": 1.0,
    "Zone B - Standard": 1.2,
    "Zone C - Extended": 1.5,
    "Zone D - Outskirts": 2.0,
    "Zone E - Remote": 2.5,
  };

  const multiplier = zoneMultipliers[zone || ""] || 1.2;
  const calculatedCharge =
    (BASE_CHARGE + distance * PER_KM_CHARGE) * multiplier;

  return Math.round(calculatedCharge);
}

/**
 * Calculate total order amount including taxes and delivery
 * @param itemTotal - Total of all items
 * @param deliveryCharge - Delivery charge
 * @param discountAmount - Discount amount
 * @returns Final total amount
 */
export function calculateTotalAmount(
  itemTotal: number,
  deliveryCharge: number = 0,
  discountAmount: number = 0
): number {
  const taxableAmount = itemTotal - discountAmount;
  const { totalTaxAmount } = calculateTaxAmounts(taxableAmount);

  return itemTotal + deliveryCharge - discountAmount + totalTaxAmount;
}
