import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const { banner_image } = await request.json();

    if (!banner_image) {
      return NextResponse.json(
        { error: "Banner image URL is required" },
        { status: 400 }
      );
    }

    // Update the product's banner image
    const { data, error } = await supabaseAdmin
      .from("products")
      .update({ banner_image })
      .eq("id", productId)
      .select("id, name, banner_image")
      .single();

    if (error) {
      console.error("Error updating product image:", error);
      return NextResponse.json(
        { error: "Failed to update product image" },
        { status: 500 }
      );
    }

    console.log("✅ Product image updated successfully:", {
      productId,
      productName: data.name,
      newImageUrl: banner_image,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        name: data.name,
        banner_image: data.banner_image,
      },
    });
  } catch (error) {
    console.error("Error in product image update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
