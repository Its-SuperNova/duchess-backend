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

    // Get ALL user's favorites with raw data
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

    // Return raw database data for debugging
    return NextResponse.json({
      success: true,
      user_id: user.id,
      user_email: session.user.email,
      raw_favorites: favorites,
      favorite_count: favorites?.length || 0,
      product_id_formats:
        favorites?.map((fav) => ({
          raw_product_id: fav.product_id,
          product_id_type: typeof fav.product_id,
          product_name: fav.product_name,
          cleaned_id: parseInt(fav.product_id.replace(/\D/g, "")) || 0,
        })) || [],
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
