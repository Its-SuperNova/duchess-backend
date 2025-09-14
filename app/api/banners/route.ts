import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceType = searchParams.get("deviceType") || "desktop";

    // Fetch banners from database
    const { data: banners, error } = await supabaseAdmin
      .from("banners")
      .select("*")
      .eq("type", "hero")
      .eq("device_type", deviceType)
      .eq("is_active", true)
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching banners:", error);
      return NextResponse.json(
        { error: "Failed to fetch banners" },
        { status: 500 }
      );
    }

    // Transform banners to match the expected format
    const transformedBanners =
      banners?.map((banner) => ({
        id: banner.id,
        src: banner.image_url,
        alt: `Banner ${banner.position}`,
        isClickable: banner.is_clickable,
        redirectUrl: banner.redirect_url,
      })) || [];

    return NextResponse.json({
      success: true,
      banners: transformedBanners,
    });
  } catch (error) {
    console.error("Error in banners API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
