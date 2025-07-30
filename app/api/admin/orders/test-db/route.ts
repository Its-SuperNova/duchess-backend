import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    console.log("Testing database connectivity...");

    // Test 1: Check if we can read from orders table
    const { data: orders, error: readError } = await supabaseAdmin
      .from("orders")
      .select("id, status, payment_status")
      .limit(5);

    console.log("Read test result:", { orders, readError });

    if (readError) {
      return NextResponse.json({
        success: false,
        error: "Cannot read from orders table",
        details: readError.message,
      });
    }

    // Test 2: Check if we can update an order (if any exist)
    if (orders && orders.length > 0) {
      const testOrder = orders[0];
      console.log("Testing update on order:", testOrder.id);

      const { data: updatedOrder, error: updateError } = await supabaseAdmin
        .from("orders")
        .update({ status: testOrder.status }) // Update with same status to test
        .eq("id", testOrder.id)
        .select()
        .single();

      console.log("Update test result:", { updatedOrder, updateError });

      if (updateError) {
        return NextResponse.json({
          success: false,
          error: "Cannot update orders table",
          details: updateError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database connectivity test passed",
      ordersCount: orders?.length || 0,
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      success: false,
      error: "Database test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
