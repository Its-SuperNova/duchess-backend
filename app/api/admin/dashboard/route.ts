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

    // Get filter parameters
    const { searchParams } = new URL(request.url);
    const gridFilter = searchParams.get("gridFilter") || "overall";
    const chartFilter = searchParams.get("chartFilter") || "monthly";
    const gridCustomStart = searchParams.get("gridStartDate");
    const gridCustomEnd = searchParams.get("gridEndDate");
    const chartCustomStart = searchParams.get("chartStartDate");
    const chartCustomEnd = searchParams.get("chartEndDate");

    // Helper function to calculate date ranges
    const calculateDateRange = (
      filter: string,
      customStart?: string,
      customEnd?: string
    ) => {
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
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
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
          endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            startOfWeek + 7
          );
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
          previousStartDate = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
          );
          previousEndDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "last3months":
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          previousStartDate = new Date(
            now.getFullYear(),
            now.getMonth() - 6,
            1
          );
          previousEndDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case "last6months":
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          previousStartDate = new Date(
            now.getFullYear(),
            now.getMonth() - 12,
            1
          );
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
          previousStartDate = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
          );
          previousEndDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      return { startDate, endDate, previousStartDate, previousEndDate };
    };

    // Calculate date ranges for grid cards
    const gridDates = calculateDateRange(
      gridFilter,
      gridCustomStart || undefined,
      gridCustomEnd || undefined
    );

    // Calculate date ranges for chart
    const chartDates = calculateDateRange(
      chartFilter,
      chartCustomStart || undefined,
      chartCustomEnd || undefined
    );

    // 1. Total Orders (using grid dates)
    const { data: currentOrders, error: ordersError } = await supabase
      .from("orders")
      .select("id, created_at")
      .gte("created_at", gridDates.startDate.toISOString())
      .lt("created_at", gridDates.endDate.toISOString());

    const { data: previousOrders, error: prevOrdersError } = await supabase
      .from("orders")
      .select("id")
      .gte("created_at", gridDates.previousStartDate.toISOString())
      .lt("created_at", gridDates.previousEndDate.toISOString());

    // 2. Total Revenue (using grid dates)
    const { data: currentRevenue, error: revenueError } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .gte("created_at", gridDates.startDate.toISOString())
      .lt("created_at", gridDates.endDate.toISOString())
      .eq("payment_status", "paid");

    const { data: previousRevenue, error: prevRevenueError } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .gte("created_at", gridDates.previousStartDate.toISOString())
      .lt("created_at", gridDates.previousEndDate.toISOString())
      .eq("payment_status", "paid");

    // 3. New Users (for the selected period - using grid dates)
    const { data: currentUsers, error: usersError } = await supabase
      .from("users")
      .select("id")
      .gte("created_at", gridDates.startDate.toISOString())
      .lt("created_at", gridDates.endDate.toISOString());

    const { data: previousUsers, error: prevUsersError } = await supabase
      .from("users")
      .select("id")
      .gte("created_at", gridDates.previousStartDate.toISOString())
      .lt("created_at", gridDates.previousEndDate.toISOString());

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

    // 6. Top Products (by order items - using grid dates)
    const { data: topProducts, error: topProductsError } = await supabase
      .from("order_items")
      .select(
        `
        product_name,
        product_image,
        quantity,
        total_price,
        created_at
      `
      )
      .gte("created_at", gridDates.startDate.toISOString())
      .lt("created_at", gridDates.endDate.toISOString());

    // Log any errors for debugging
    if (ordersError) console.error("Orders error:", ordersError);
    if (revenueError) console.error("Revenue error:", revenueError);
    if (usersError) console.error("Users error:", usersError);
    if (recentOrdersError)
      console.error("Recent orders error:", recentOrdersError);
    if (topProductsError)
      console.error("Top products error:", topProductsError);

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

    // Debug logging
    console.log("Debug - Current orders count:", currentOrdersCount);
    console.log("Debug - Current revenue total:", currentRevenueTotal);
    console.log("Debug - Recent orders count:", recentOrders?.length);
    console.log("Debug - Top products count:", topProducts?.length);
    console.log("Debug - Grid Filter:", gridFilter);
    console.log("Debug - Chart Filter:", chartFilter);
    console.log(
      "Debug - Grid Date range:",
      gridDates.startDate.toISOString(),
      "to",
      gridDates.endDate.toISOString()
    );
    console.log(
      "Debug - Chart Date range:",
      chartDates.startDate.toISOString(),
      "to",
      chartDates.endDate.toISOString()
    );

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

    // === ANALYTICS CHART DATA CALCULATION ===
    // Get chart-specific data using chart dates
    const { data: chartOrders, error: chartOrdersError } = await supabase
      .from("orders")
      .select("id, created_at")
      .gte("created_at", chartDates.startDate.toISOString())
      .lt("created_at", chartDates.endDate.toISOString());

    const { data: chartRevenue, error: chartRevenueError } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .gte("created_at", chartDates.startDate.toISOString())
      .lt("created_at", chartDates.endDate.toISOString())
      .eq("payment_status", "paid");

    const { data: chartUsers, error: chartUsersError } = await supabase
      .from("users")
      .select("id, created_at")
      .gte("created_at", chartDates.startDate.toISOString())
      .lt("created_at", chartDates.endDate.toISOString());

    // Debug logging for chart data
    console.log("Debug - Chart orders count:", chartOrders?.length);
    console.log("Debug - Chart revenue count:", chartRevenue?.length);
    console.log("Debug - Chart users count:", chartUsers?.length);

    // Debug individual orders
    if (chartOrders) {
      console.log("Debug - Chart orders details:");
      chartOrders.forEach((order, index) => {
        console.log(`Order ${index + 1}:`, {
          id: order.id,
          created_at: order.created_at,
          dateStr: new Date(order.created_at).toISOString().split("T")[0],
        });
      });
    }

    // Calculate daily metrics (orders, revenue, users) for the chart
    const analyticsChartData: Array<{
      date: string;
      orders: number;
      revenue: number;
      users: number;
    }> = [];

    // Use chart-specific date range
    const chartStart = new Date(chartDates.startDate);
    const chartEnd = new Date(chartDates.endDate);

    // Calculate number of days in the range
    const daysDiff = Math.ceil(
      (chartEnd.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Generate daily analytics data for each day in the range
    for (let i = 0; i <= daysDiff; i++) {
      const currentDay = new Date(chartStart);
      currentDay.setDate(chartStart.getDate() + i);
      currentDay.setHours(0, 0, 0, 0);

      const nextDay = new Date(currentDay);
      nextDay.setDate(currentDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      // Get the date string for matching (YYYY-MM-DD format)
      const currentDayStr = currentDay.toISOString().split("T")[0];

      // Calculate orders for this day
      const dayOrders =
        chartOrders?.filter((order) => {
          try {
            const orderDate = new Date(order.created_at);
            if (isNaN(orderDate.getTime())) return false;
            const orderDateStr = orderDate.toISOString().split("T")[0];
            return orderDateStr === currentDayStr;
          } catch (e) {
            return false;
          }
        }).length || 0;

      // Debug specific dates
      if (
        currentDayStr === "2024-10-05" ||
        currentDayStr === "2024-10-07" ||
        currentDayStr === "2024-10-09" ||
        currentDayStr === "2024-10-10"
      ) {
        console.log(`Debug - ${currentDayStr}:`, {
          dayOrders,
          chartOrdersCount: chartOrders?.length,
          matchingOrders: chartOrders?.filter((order) => {
            try {
              const orderDate = new Date(order.created_at);
              if (isNaN(orderDate.getTime())) return false;
              const orderDateStr = orderDate.toISOString().split("T")[0];
              return orderDateStr === currentDayStr;
            } catch (e) {
              return false;
            }
          }).length,
        });
      }

      // Calculate revenue for this day
      const dayRevenue =
        chartRevenue
          ?.filter((order) => {
            try {
              const orderDate = new Date(order.created_at);
              if (isNaN(orderDate.getTime())) return false;
              const orderDateStr = orderDate.toISOString().split("T")[0];
              return orderDateStr === currentDayStr;
            } catch (e) {
              return false;
            }
          })
          .reduce((sum, order) => sum + order.total_amount, 0) || 0;

      // Calculate new users for this day
      const dayUsers =
        chartUsers?.filter((user) => {
          try {
            const userDate = new Date(user.created_at);
            if (isNaN(userDate.getTime())) return false;
            const userDateStr = userDate.toISOString().split("T")[0];
            return userDateStr === currentDayStr;
          } catch (e) {
            return false;
          }
        }).length || 0;

      analyticsChartData.push({
        date: currentDayStr,
        orders: dayOrders,
        revenue: dayRevenue,
        users: dayUsers,
      });
    }

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
            gridFilter === "overall"
              ? totalUsersCount.toLocaleString()
              : currentUsersCount.toLocaleString(),
          change: gridFilter === "overall" ? "0%" : `+${usersChange}%`,
          trend:
            gridFilter === "overall"
              ? "up"
              : parseFloat(usersChange) >= 0
              ? "up"
              : "down",
        },
      ],
      recentOrders: processedRecentOrders,
      topProducts: topProductsList,
      analyticsChartData: analyticsChartData,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
