import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Get user's favorites
    const { data: favorites, error: favoritesError } = await supabaseAdmin
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (favoritesError) {
      return NextResponse.json(
        { error: "Failed to fetch favorites" },
        { status: 500 }
      );
    }

    // Transform favorites to match frontend Product interface
    const transformedFavorites = favorites.map((fav) => ({
      id: parseInt(fav.product_id.replace(/\D/g, "")) || 0,
      name: fav.product_name,
      price: parseFloat(fav.product_price.toString()),
      image: fav.product_image,
      isVeg: fav.is_veg,
      description: fav.product_description,
      rating: fav.product_rating
        ? parseFloat(fav.product_rating.toString())
        : undefined,
      category: fav.product_category,
    }));

    return NextResponse.json(
      {
        success: true,
        favorites: transformedFavorites,
      },
      {
        headers: {
          // Cache favorites for 2 minutes to reduce database calls
          // Use private cache since favorites are user-specific
          "Cache-Control": "private, max-age=120, stale-while-revalidate=600",
          // Add ETag for conditional requests
          ETag: `"favorites-${user.id}-${Date.now()}"`,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
