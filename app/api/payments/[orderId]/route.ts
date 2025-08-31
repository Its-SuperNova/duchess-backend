import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPaymentsByOrderId } from "@/lib/payment-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Get payments for the order
    const payments = await getPaymentsByOrderId(orderId);

    return NextResponse.json({
      success: true,
      payments,
      count: payments.length,
    });
  } catch (err: any) {
    console.error("Error fetching payments:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

