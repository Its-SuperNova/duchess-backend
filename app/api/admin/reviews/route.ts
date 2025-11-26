import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

type ReviewStatus = "published" | "pending" | "reported";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("email", session.user.email)
      .single();

    if (userError || !user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch orders that have rating or feedback and include basic product info via order_items
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        customer_rating,
        customer_feedback,
        created_at,
        payment_status,
        contact_name,
        users(email),
        order_items(
          product_name,
          product_image
        )
      `
      )
      .not("customer_rating", "is", null)
      .order("created_at", { ascending: false })
      .limit(200);

    if (ordersError) {
      console.error("Error fetching review orders:", ordersError);
      return NextResponse.json(
        { error: "Failed to load reviews" },
        { status: 500 }
      );
    }

    const reviews = (orders || []).map((order) => {
      const firstItem = order.order_items?.[0];
      const rating = order.customer_rating ?? 0;
      const reviewText = order.customer_feedback ?? "";

      let status: ReviewStatus = "published";
      if (!reviewText || rating === 0) {
        status = "pending";
      }

      return {
        id: order.id as string,
        product: {
          name: firstItem?.product_name || "Unknown product",
          image: firstItem?.product_image || "/placeholder.svg",
        },
        rating,
        review: reviewText,
        customer: {
          name: order.contact_name || "Unknown customer",
          avatar: null,
          // Consider verified if payment is completed
          verified: order.payment_status === "paid",
        },
        date: new Date(order.created_at).toLocaleDateString(),
        status,
      };
    });

    const total = reviews.length;
    const rated = reviews.filter((r) => r.rating && r.rating > 0);
    const averageRating =
      rated.length > 0
        ? rated.reduce((sum, r) => sum + r.rating, 0) / rated.length
        : 0;

    const pending = reviews.filter((r) => r.status === "pending").length;
    const reported = reviews.filter((r) => r.status === "reported").length;

    return NextResponse.json({
      reviews,
      stats: {
        total,
        averageRating,
        pending,
        reported,
      },
    });
  } catch (error) {
    console.error("Unexpected error in /api/admin/reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


