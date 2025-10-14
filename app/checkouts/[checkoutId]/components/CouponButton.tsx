"use client";

import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import { TicketSale } from "@solar-icons/react";

interface CouponButtonProps {
  checkoutId: string;
  selectedCoupon?: string | null;
}

export default function CouponButton({
  checkoutId,
  selectedCoupon,
}: CouponButtonProps) {
  return (
    <div className="bg-white mx-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
      <Link href={`/checkouts/${checkoutId}/coupons`}>
        <button className="w-full flex items-center justify-between text-left">
          <div className="flex items-center">
            <TicketSale className="h-5 w-5 mr-3 text-black" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {selectedCoupon ? selectedCoupon : "View all coupons"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#2664eb]">View all</span>
            <IoIosArrowForward className="h-5 w-5 text-gray-600" />
          </div>
        </button>
      </Link>
    </div>
  );
}
