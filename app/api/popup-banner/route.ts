import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type DeviceType = "desktop" | "mobile";

const TABLE_NAME = "popup_banners";

const normalizeRecord = (record: any) => ({
  id: record.id,
  deviceType: record.device_type as DeviceType,
  backgroundImageUrl: record.background_image_url || "",
  backgroundPublicId: record.background_public_id || "",
  buttonUrl: record.button_url || "",
  couponCode: record.coupon_code || "",
  showPrimaryButton:
    record.show_primary_button !== undefined
      ? record.show_primary_button
      : true,
  showCouponButton:
    record.show_coupon_button !== undefined ? record.show_coupon_button : true,
  enableBackdrop:
    record.enable_backdrop !== undefined ? record.enable_backdrop : true,
  delaySeconds:
    typeof record.delay_seconds === "number" ? record.delay_seconds : 0,
  isActive: record.is_active !== false,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceType = searchParams.get("deviceType");
    const includeInactive = searchParams.get("includeInactive") === "1";

    let query = supabaseAdmin.from(TABLE_NAME).select("*");

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    if (deviceType) {
      query = query.eq("device_type", deviceType);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const popupBanners: Record<string, ReturnType<typeof normalizeRecord>> = {};
    data?.forEach((record) => {
      popupBanners[record.device_type] = normalizeRecord(record);
    });

    return NextResponse.json({ popupBanners });
  } catch (error) {
    console.error("Error fetching popup banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch popup banners" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const banners = body?.banners;

    if (!Array.isArray(banners) || banners.length === 0) {
      return NextResponse.json(
        { error: "At least one banner payload is required" },
        { status: 400 }
      );
    }

    const allowedDevices: DeviceType[] = ["desktop", "mobile"];
    const now = new Date().toISOString();

    const upsertPayload = banners.map((banner: any) => {
      const deviceType = banner.deviceType as DeviceType;
      if (!allowedDevices.includes(deviceType)) {
        throw new Error(
          `Invalid device type "${banner.deviceType}". Use "desktop" or "mobile".`
        );
      }

      const delaySeconds = Number.isFinite(banner.delaySeconds)
        ? Math.max(0, Math.floor(banner.delaySeconds))
        : 0;

      return {
        device_type: deviceType,
        background_image_url: banner.backgroundImageUrl || "",
        background_public_id: banner.backgroundPublicId || "",
        button_url: banner.buttonUrl || "",
        coupon_code: banner.couponCode || "",
        show_primary_button:
          banner.showPrimaryButton !== undefined
            ? !!banner.showPrimaryButton
            : true,
        show_coupon_button:
          banner.showCouponButton !== undefined
            ? !!banner.showCouponButton
            : true,
        enable_backdrop:
          banner.enableBackdrop !== undefined ? !!banner.enableBackdrop : true,
        delay_seconds: delaySeconds,
        is_active: banner.isActive !== undefined ? !!banner.isActive : true,
        updated_at: now,
        created_at: now,
      };
    });

    const { data, error } = await supabaseAdmin
      .from(TABLE_NAME)
      .upsert(upsertPayload, {
        onConflict: "device_type",
      })
      .select("*");

    if (error) {
      throw error;
    }

    const popupBanners: Record<string, ReturnType<typeof normalizeRecord>> = {};
    data?.forEach((record) => {
      popupBanners[record.device_type] = normalizeRecord(record);
    });

    return NextResponse.json({
      message: "Popup banners saved successfully",
      popupBanners,
    });
  } catch (error) {
    console.error("Error saving popup banners:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save popup banners",
      },
      { status: 500 }
    );
  }
}

