import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing database connectivity...");

    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (testError) {
      console.error("Basic connection test failed:", testError);
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: testError,
        },
        { status: 500 }
      );
    }

    console.log("Basic connection successful");

    // Test if orders table exists
    const { data: ordersTest, error: ordersError } = await supabase
      .from("orders")
      .select("count")
      .limit(1);

    if (ordersError) {
      console.error("Orders table test failed:", ordersError);
      return NextResponse.json(
        {
          error: "Orders table not accessible",
          details: ordersError,
          suggestion:
            "Run the SQL script to create orders and order_items tables",
        },
        { status: 500 }
      );
    }

    console.log("Orders table accessible");

    // Test if order_items table exists
    const { data: orderItemsTest, error: orderItemsError } = await supabase
      .from("order_items")
      .select("count")
      .limit(1);

    if (orderItemsError) {
      console.error("Order items table test failed:", orderItemsError);
      return NextResponse.json(
        {
          error: "Order items table not accessible",
          details: orderItemsError,
          suggestion:
            "Run the SQL script to create orders and order_items tables",
        },
        { status: 500 }
      );
    }

    console.log("Order items table accessible");

    return NextResponse.json({
      status: "All tables accessible",
      message: "Database is ready for orders",
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
