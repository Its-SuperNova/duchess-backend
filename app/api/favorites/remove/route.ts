import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    console.log("DELETE request received:", {
      productId,
      userEmail: session.user.email,
    });

    // Validate required fields
    if (!productId && productId !== 0) {
      return NextResponse.json(
        { error: "Missing required field: productId" },
        { status: 400 }
      );
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !user) {
      console.error("User lookup failed:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User found:", { userId: user.id });

    // Convert productId to string for querying (consistent with add operation)
    const productIdString = productId.toString();

    console.log("Attempting to delete favorite:", {
      userId: user.id,
      productId,
      productIdString,
    });

    // First, check if the favorite exists before deleting
    const { data: existingFavorites, error: checkError } = await supabaseAdmin
      .from("favorites")
      .select("id, product_id")
      .eq("user_id", user.id)
      .eq("product_id", productIdString);

    if (checkError) {
      console.error("Error checking existing favorites:", checkError);
      return NextResponse.json(
        { error: "Failed to verify favorite existence" },
        { status: 500 }
      );
    }

    console.log("Existing favorites found:", existingFavorites);

    if (!existingFavorites || existingFavorites.length === 0) {
      console.log("No matching favorite found for deletion");
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }

    // Remove from favorites
    const { data: deletedData, error: deleteError } = await supabaseAdmin
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productIdString)
      .select();

    if (deleteError) {
      console.error("Error removing from favorites:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove from favorites" },
        { status: 500 }
      );
    }

    console.log("Deletion result:", {
      deletedData,
      deletedCount: deletedData?.length || 0,
    });

    // Verify deletion was successful
    if (!deletedData || deletedData.length === 0) {
      console.error("No rows were deleted - deletion failed");
      return NextResponse.json(
        { error: "Deletion failed - no rows affected" },
        { status: 500 }
      );
    }

    console.log("Successfully deleted favorite:", {
      productId,
      deletedCount: deletedData.length,
    });

    return NextResponse.json({
      success: true,
      message: "Removed from favorites",
      deletedCount: deletedData.length,
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
