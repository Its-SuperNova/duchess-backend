import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, price, image, isVeg, description, rating, category } =
      body;

    // Validate required fields
    if (!id || !name || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: id, name, price" },
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert numeric ID to string for storage
    const productId = id.toString();

    // Check if already favorited
    const { data: existingFavorite } = await supabaseAdmin
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (existingFavorite) {
      return NextResponse.json(
        { error: "Product already in favorites" },
        { status: 409 }
      );
    }

    // Add to favorites
    const { data: favorite, error: favoriteError } = await supabaseAdmin
      .from("favorites")
      .insert({
        user_id: user.id,
        product_id: productId,
        product_name: name,
        product_price: price,
        product_image: image,
        product_category: category,
        product_description: description,
        product_rating: rating,
        is_veg: isVeg || true,
      })
      .select()
      .single();

    if (favoriteError) {
      console.error("Error adding to favorites:", favoriteError);
      return NextResponse.json(
        { error: "Failed to add to favorites" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Added to favorites",
      favorite: {
        id: parseInt(favorite.product_id.replace(/\D/g, "")) || 0,
        name: favorite.product_name,
        price: parseFloat(favorite.product_price.toString()),
        image: favorite.product_image,
        isVeg: favorite.is_veg,
        description: favorite.product_description,
        rating: favorite.product_rating
          ? parseFloat(favorite.product_rating.toString())
          : undefined,
        category: favorite.product_category,
      },
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
