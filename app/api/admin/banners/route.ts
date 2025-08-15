import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, deviceType, banners } = body;

    if (!type || !deviceType || !banners) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate banner type
    if (!["hero", "footer"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid banner type. Must be 'hero' or 'footer'" },
        { status: 400 }
      );
    }

    // Validate device type
    if (!["desktop", "mobile"].includes(deviceType)) {
      return NextResponse.json(
        { error: "Invalid device type. Must be 'desktop' or 'mobile'" },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Process each banner
    for (const banner of banners) {
      try {
        const { imageUrl, isClickable, redirectUrl, position = 1 } = banner;

        if (!imageUrl) {
          errors.push(`Banner ${position}: Image URL is required`);
          continue;
        }

        // Check if banner already exists
        let existingBanner;
        if (type === "hero") {
          const { data: existing } = await supabase
            .from("banners")
            .select("id")
            .eq("type", type)
            .eq("device_type", deviceType)
            .eq("position", position)
            .single();
          existingBanner = existing;
        } else if (type === "footer") {
          const { data: existing } = await supabase
            .from("banners")
            .select("id")
            .eq("type", type)
            .eq("device_type", deviceType)
            .single();
          existingBanner = existing;
        }

        const bannerData = {
          name: `${type}-${deviceType}-${position}`,
          type,
          device_type: deviceType,
          position,
          image_url: imageUrl,
          is_clickable: isClickable || false,
          redirect_url: isClickable ? redirectUrl : null,
          is_active: true,
          updated_at: new Date().toISOString(),
        };

        let result;
        if (existingBanner) {
          // Update existing banner
          const { data, error } = await supabase
            .from("banners")
            .update(bannerData)
            .eq("id", existingBanner.id)
            .select()
            .single();

          if (error) throw error;
          result = { action: "updated", data };
        } else {
          // Create new banner
          const insertData = {
            ...bannerData,
            created_at: new Date().toISOString(),
          };
          const { data, error } = await supabase
            .from("banners")
            .insert(insertData)
            .select()
            .single();

          if (error) throw error;
          result = { action: "created", data };
        }

        results.push(result);
      } catch (error) {
        console.error(`Error processing banner:`, error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        errors.push(`Banner ${banner.position || "unknown"}: ${errorMessage}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          message: "Some banners failed to save",
          results,
          errors,
        },
        { status: 207 } // Multi-status
      );
    }

    return NextResponse.json({
      message: "Banners saved successfully",
      results,
    });
  } catch (error) {
    console.error("Error saving banners:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const deviceType = searchParams.get("deviceType");

    let query = supabase.from("banners").select("*");

    if (type) {
      query = query.eq("type", type);
    }

    if (deviceType) {
      query = query.eq("device_type", deviceType);
    }

    // Order by type, device_type, and position
    query = query.order("type").order("device_type").order("position");

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ banners: data });
  } catch (error) {
    console.error("Error fetching banners:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
