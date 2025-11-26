import { NextRequest, NextResponse } from "next/server";
import { updateCategoryOrder } from "@/lib/actions/categories";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryOrders } = body;

    console.log("📦 Received category order update request:", {
      categoryOrders,
      count: categoryOrders?.length,
    });

    if (!categoryOrders || !Array.isArray(categoryOrders)) {
      return NextResponse.json(
        { error: "Invalid category orders data", success: false },
        { status: 400 }
      );
    }

    const result = await updateCategoryOrder(categoryOrders);

    console.log("✅ Category order updated successfully:", result);

    return NextResponse.json(
      {
        message: "Category order updated successfully",
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating category order:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update category order",
        success: false,
      },
      { status: 500 }
    );
  }
}
