import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
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

    // Get filter parameter
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "monthly";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    // Calculate date ranges based on filter
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    switch (filter) {
      case "custom":
        if (customStart && customEnd) {
          startDate = new Date(customStart);
          endDate = new Date(customEnd);
          // For custom dates, use the same range for previous period (for now)
          const rangeDays = Math.floor(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          previousStartDate = new Date(
            startDate.getTime() - rangeDays * 24 * 60 * 60 * 1000
          );
          previousEndDate = new Date(startDate);
        } else {
          // Fallback to monthly if custom dates are not provided
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          previousStartDate = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
          );
          previousEndDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        break;
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        previousStartDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1
        );
        previousEndDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        break;
      case "weekly":
        const startOfWeek = now.getDate() - now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek);
        endDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek + 7);
        previousStartDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          startOfWeek - 7
        );
        previousEndDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          startOfWeek
        );
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last3months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        previousEndDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "last6months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        previousEndDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case "overall":
        startDate = new Date(0); // Beginning of time
        endDate = new Date();
        previousStartDate = new Date(0);
        previousEndDate = new Date();
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // 1. Total Orders
    const { data: currentOrders, error: ordersError } = await supabase
      .from("orders")
      .select("id, created_at")
      .gte("created_at", startDate.toISOString())
      .lt("created_at", endDate.toISOString());

    const { data: previousOrders, error: prevOrdersError } = await supabase
      .from("orders")
      .select("id")
      .gte("created_at", previousStartDate.toISOString())
      .lt("created_at", previousEndDate.toISOString());

    // 2. Total Revenue
    const { data: currentRevenue, error: revenueError } = await supabase
      .from("orders")
      .select("total_amount")
      .gte("created_at", startDate.toISOString())
      .lt("created_at", endDate.toISOString())
      .eq("payment_status", "paid");

    const { data: previousRevenue, error: prevRevenueError } = await supabase
      .from("orders")
      .select("total_amount")
      .gte("created_at", previousStartDate.toISOString())
      .lt("created_at", previousEndDate.toISOString())
      .eq("payment_status", "paid");

    // 3. New Users (for the selected period)
    const { data: currentUsers, error: usersError } = await supabase
      .from("users")
      .select("id")
      .gte("created_at", startDate.toISOString())
      .lt("created_at", endDate.toISOString());

    const { data: previousUsers, error: prevUsersError } = await supabase
      .from("users")
      .select("id")
      .gte("created_at", previousStartDate.toISOString())
      .lt("created_at", previousEndDate.toISOString());

    // 4. Total Users (all users in the system)
    const { data: totalUsers, error: totalUsersError } = await supabase
      .from("users")
      .select("id");

    // 5. Recent Orders (last 5 orders)
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        total_amount,
        status,
        payment_status,
        created_at,
        contact_name,
        contact_number,
        users(email)
      `
      )
      .order("created_at", { ascending: false })
      .limit(5);

    // 6. Top Products (by order items)
    const { data: topProducts, error: topProductsError } = await supabase
      .from("order_items")
      .select(
        `
        product_name,
        product_image,
        quantity,
        total_price,
        products!inner(id, name)
      `
      )
      .gte("created_at", startDate.toISOString())
      .lt("created_at", endDate.toISOString());

    // Calculate statistics
    const currentOrdersCount = currentOrders?.length || 0;
    const previousOrdersCount = previousOrders?.length || 0;
    const ordersChange =
      previousOrdersCount > 0
        ? (
            ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) *
            100
          ).toFixed(1)
        : "0";

    const currentRevenueTotal =
      currentRevenue?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const previousRevenueTotal =
      previousRevenue?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const revenueChange =
      previousRevenueTotal > 0
        ? (
            ((currentRevenueTotal - previousRevenueTotal) /
              previousRevenueTotal) *
            100
          ).toFixed(1)
        : "0";

    const currentUsersCount = currentUsers?.length || 0;
    const previousUsersCount = previousUsers?.length || 0;
    const usersChange =
      previousUsersCount > 0
        ? (
            ((currentUsersCount - previousUsersCount) / previousUsersCount) *
            100
          ).toFixed(1)
        : "0";

    const totalUsersCount = totalUsers?.length || 0;

    // Process top products
    const productSales = new Map();
    topProducts?.forEach((item) => {
      const productName = item.product_name;
      if (productSales.has(productName)) {
        const existing = productSales.get(productName);
        productSales.set(productName, {
          name: productName,
          sales: existing.sales + item.quantity,
          revenue: existing.revenue + item.total_price,
          image: item.product_image || "/placeholder.svg",
        });
      } else {
        productSales.set(productName, {
          name: productName,
          sales: item.quantity,
          revenue: item.total_price,
          image: item.product_image || "/placeholder.svg",
        });
      }
    });

    const topProductsList = Array.from(productSales.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3);

    // Process recent orders
    const processedRecentOrders =
      recentOrders?.map((order) => ({
        id: order.order_number,
        customer: order.contact_name,
        amount: `₹${order.total_amount.toFixed(2)}`,
        status: order.status,
        date: new Date(order.created_at).toLocaleDateString(),
        email: order.users?.[0]?.email || "",
      })) || [];

    return NextResponse.json({
      summaryCards: [
        {
          title: "Total Orders",
          value: currentOrdersCount.toLocaleString(),
          change: `+${ordersChange}%`,
          trend: parseFloat(ordersChange) >= 0 ? "up" : "down",
        },
        {
          title: "Total Revenue",
          value: `₹${currentRevenueTotal.toLocaleString()}`,
          change: `+${revenueChange}%`,
          trend: parseFloat(revenueChange) >= 0 ? "up" : "down",
        },
        {
          title: "Reviews & Feedback",
          value: "47",
          change: "+12.5%",
          trend: "up",
        },
        {
          title: "Total Users",
          value:
            filter === "overall"
              ? totalUsersCount.toLocaleString()
              : currentUsersCount.toLocaleString(),
          change: filter === "overall" ? "0%" : `+${usersChange}%`,
          trend:
            filter === "overall"
              ? "up"
              : parseFloat(usersChange) >= 0
              ? "up"
              : "down",
        },
      ],
      recentOrders: processedRecentOrders,
      topProducts: topProductsList,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
