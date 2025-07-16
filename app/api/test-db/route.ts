import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Test the cart_items table structure
    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable, column_default")
      .eq("table_name", "cart_items")
      .eq("table_schema", "public")
      .order("ordinal_position");

    if (columnsError) {
      return NextResponse.json(
        { error: "Failed to get table structure", details: columnsError },
        { status: 500 }
      );
    }

    // Try to insert a test record
    const testData = {
      cart_id: "00000000-0000-0000-0000-000000000000",
      product_id: "test-123",
      quantity: 1,
      variant: "Test",
      price: 100.0,
      product_name: "Test Product",
      product_image: "/test.jpg",
      category: "Test Category",
    };

    // Try with new columns
    const { data: insertResult, error: insertError } = await supabase
      .from("cart_items")
      .insert({
        ...testData,
        add_text_on_cake: false,
        add_candles: false,
        add_knife: false,
        add_message_card: false,
        cake_text: null,
        gift_card_text: null,
        order_type: "weight",
      })
      .select()
      .single();

    // Clean up test data
    if (insertResult) {
      await supabase.from("cart_items").delete().eq("product_id", "test-123");
    }

    return NextResponse.json({
      tableStructure: columns,
      insertTest: {
        success: !insertError,
        error: insertError?.message,
        data: insertResult,
      },
    });
  } catch (error) {
    console.error("Test DB error:", error);
    return NextResponse.json(
      { error: "Test failed", details: error },
      { status: 500 }
    );
  }
}
