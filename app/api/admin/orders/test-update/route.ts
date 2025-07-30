import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    console.log("Test update request:", { orderId, status });

    // Test if we can fetch the order
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("id, status, payment_status")
      .eq("id", orderId)
      .single();

    console.log("Fetch result:", { existingOrder, fetchError });

    if (fetchError) {
      return NextResponse.json({
        success: false,
        error: "Order not found",
        fetchError: fetchError.message,
      });
    }

    // Test update
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ status: status })
      .eq("id", orderId)
      .select()
      .single();

    console.log("Update result:", { updatedOrder, updateError });

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: "Update failed",
        updateError: updateError.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Test update successful",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Test update error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
