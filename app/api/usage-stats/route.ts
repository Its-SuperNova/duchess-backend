import { NextRequest, NextResponse } from "next/server";
import { usageMonitor } from "@/lib/usage-monitor";
import { distanceCache } from "@/lib/distance-cache";
import { distanceFallbackSystem } from "@/lib/distance-fallbacks";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "overview";

    switch (type) {
      case "overview":
        return getOverviewStats();

      case "monthly":
        return getMonthlyStats();

      case "trends":
        return getTrendsStats();

      case "recommendations":
        return getRecommendations();

      case "projection":
        return getCostProjection();

      case "cache":
        return getCacheStats();

      case "fallback":
        return getFallbackStats();

      default:
        return NextResponse.json(
          { error: "Invalid type parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Usage stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage statistics" },
      { status: 500 }
    );
  }
}

function getOverviewStats() {
  const todayUsage = usageMonitor.getTodayUsage();
  const monthlyUsage = usageMonitor.getMonthlyUsage();
  const projection = usageMonitor.getCostProjection();

  return NextResponse.json({
    today: todayUsage,
    monthly: monthlyUsage,
    projection,
    summary: {
      isWithinFreeTier: monthlyUsage.totalApiCalls < 40000,
      estimatedMonthlyCost: monthlyUsage.totalCost,
      costSavings: monthlyUsage.totalSavings,
      cacheHitRate:
        monthlyUsage.totalCachedRequests /
        Math.max(
          monthlyUsage.totalApiCalls + monthlyUsage.totalCachedRequests,
          1
        ),
    },
  });
}

function getMonthlyStats() {
  const monthlyUsage = usageMonitor.getMonthlyUsage();

  return NextResponse.json({
    month: monthlyUsage.month,
    totalApiCalls: monthlyUsage.totalApiCalls,
    totalCachedRequests: monthlyUsage.totalCachedRequests,
    totalCost: monthlyUsage.totalCost,
    totalSavings: monthlyUsage.totalSavings,
    averageDailyCost: monthlyUsage.averageDailyCost,
    peakDay: monthlyUsage.peakDay,
    peakCalls: monthlyUsage.peakCalls,
    freeTierStatus: monthlyUsage.totalApiCalls < 40000 ? "within" : "exceeded",
  });
}

function getTrendsStats() {
  const trends = usageMonitor.getUsageTrends(7);

  return NextResponse.json({
    trends,
    summary: {
      averageDailyCalls:
        trends.apiCalls.reduce((a, b) => a + b, 0) / trends.apiCalls.length,
      averageDailyCost:
        trends.costs.reduce((a, b) => a + b, 0) / trends.costs.length,
      averageCacheHitRate:
        trends.cacheHitRates.reduce((a, b) => a + b, 0) /
        trends.cacheHitRates.length,
    },
  });
}

function getRecommendations() {
  const recommendations = usageMonitor.getOptimizationRecommendations();

  return NextResponse.json({
    recommendations: recommendations.recommendations,
    priority: recommendations.priority,
    estimatedSavings: recommendations.estimatedSavings,
    implementation: {
      caching: "Implement longer cache duration and better cache keys",
      batching: "Use batch requests for multiple distance calculations",
      fallbacks: "Implement GPS and pincode-based fallbacks",
      monitoring: "Set up usage alerts and cost thresholds",
    },
  });
}

function getCostProjection() {
  const projection = usageMonitor.getCostProjection();

  return NextResponse.json({
    currentMonth: projection.currentMonth,
    projectedMonth: projection.projectedMonth,
    projectedYear: projection.projectedYear,
    freeTierStatus: projection.freeTierStatus,
    recommendations: {
      ifExceeding:
        "Consider implementing more aggressive caching and fallback strategies",
      ifApproaching: "Monitor usage closely and implement cost optimization",
      ifWithin: "Current usage is optimal, continue monitoring",
    },
  });
}

function getCacheStats() {
  const cacheStats = distanceCache.getCacheStats();

  return NextResponse.json({
    totalEntries: cacheStats.totalEntries,
    validEntries: cacheStats.validEntries,
    expiredEntries: cacheStats.expiredEntries,
    cacheEfficiency:
      cacheStats.validEntries / Math.max(cacheStats.totalEntries, 1),
    recommendations: {
      ifLowEfficiency:
        "Consider implementing better cache keys and longer duration",
      ifHighEfficiency: "Cache is working well, consider expanding cache size",
      maintenance: "Regular cleanup of expired entries is recommended",
    },
  });
}

function getFallbackStats() {
  const fallbackStats = distanceFallbackSystem.getFallbackStats();

  return NextResponse.json({
    cacheHitRate: fallbackStats.cacheHitRate,
    estimatedAPISavings: fallbackStats.estimatedAPISavings,
    fallbackMethods: fallbackStats.fallbackMethods,
    recommendations: {
      gps: "Encourage users to use GPS for most accurate results",
      haversine: "Use mathematical distance calculation for rough estimates",
      pincode: "Implement pincode-based distance lookup for common areas",
      cached: "Maximize cache usage to reduce API calls",
    },
  });
}

