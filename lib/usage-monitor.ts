// Usage monitoring system for Google Maps API
// Tracks API calls, costs, and provides optimization recommendations

interface UsageStats {
  date: string;
  apiCalls: number;
  cachedRequests: number;
  totalRequests: number;
  estimatedCost: number;
  costSavings: number;
  methods: {
    gps: number;
    address: number;
    pincode: number;
    cached: number;
  };
}

interface MonthlyUsage {
  month: string;
  totalApiCalls: number;
  totalCachedRequests: number;
  totalCost: number;
  totalSavings: number;
  averageDailyCost: number;
  peakDay: string;
  peakCalls: number;
}

class UsageMonitor {
  private usageStats: UsageStats[] = [];
  private readonly API_COST_PER_1000 = 5.0; // $5 per 1000 requests
  private readonly FREE_TIER_LIMIT = 40000; // 40,000 requests per month (within $200 credit)

  // Record API usage
  recordUsage(
    apiCalls: number,
    cachedRequests: number,
    methods: { gps: number; address: number; pincode: number; cached: number }
  ): void {
    const today = new Date().toISOString().split("T")[0];
    const existingStats = this.usageStats.find((stat) => stat.date === today);

    if (existingStats) {
      existingStats.apiCalls += apiCalls;
      existingStats.cachedRequests += cachedRequests;
      existingStats.totalRequests =
        existingStats.apiCalls + existingStats.cachedRequests;
      existingStats.estimatedCost = this.calculateCost(existingStats.apiCalls);
      existingStats.costSavings = this.calculateSavings(
        existingStats.cachedRequests
      );
      existingStats.methods.gps += methods.gps;
      existingStats.methods.address += methods.address;
      existingStats.methods.pincode += methods.pincode;
      existingStats.methods.cached += methods.cached;
    } else {
      this.usageStats.push({
        date: today,
        apiCalls,
        cachedRequests,
        totalRequests: apiCalls + cachedRequests,
        estimatedCost: this.calculateCost(apiCalls),
        costSavings: this.calculateSavings(cachedRequests),
        methods,
      });
    }

    console.log(
      `📊 Usage recorded: ${apiCalls} API calls, ${cachedRequests} cached, $${this.calculateCost(
        apiCalls
      ).toFixed(2)} cost`
    );
  }

  // Calculate cost for API calls
  private calculateCost(apiCalls: number): number {
    return (apiCalls / 1000) * this.API_COST_PER_1000;
  }

  // Calculate savings from cached requests
  private calculateSavings(cachedRequests: number): number {
    return this.calculateCost(cachedRequests);
  }

  // Get today's usage
  getTodayUsage(): UsageStats | null {
    const today = new Date().toISOString().split("T")[0];
    return this.usageStats.find((stat) => stat.date === today) || null;
  }

  // Get this month's usage
  getMonthlyUsage(): MonthlyUsage {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const monthlyStats = this.usageStats.filter((stat) =>
      stat.date.startsWith(currentMonth)
    );

    const totalApiCalls = monthlyStats.reduce(
      (sum, stat) => sum + stat.apiCalls,
      0
    );
    const totalCachedRequests = monthlyStats.reduce(
      (sum, stat) => sum + stat.cachedRequests,
      0
    );
    const totalCost = monthlyStats.reduce(
      (sum, stat) => sum + stat.estimatedCost,
      0
    );
    const totalSavings = monthlyStats.reduce(
      (sum, stat) => sum + stat.costSavings,
      0
    );

    const peakDay = monthlyStats.reduce(
      (peak, stat) => (stat.apiCalls > peak.apiCalls ? stat : peak),
      { apiCalls: 0, date: "" }
    );

    return {
      month: currentMonth,
      totalApiCalls,
      totalCachedRequests,
      totalCost,
      totalSavings,
      averageDailyCost: totalCost / Math.max(monthlyStats.length, 1),
      peakDay: peakDay.date,
      peakCalls: peakDay.apiCalls,
    };
  }

  // Get usage trends
  getUsageTrends(days: number = 7): {
    dates: string[];
    apiCalls: number[];
    costs: number[];
    savings: number[];
    cacheHitRates: number[];
  } {
    const recentStats = this.usageStats
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, days)
      .reverse();

    return {
      dates: recentStats.map((stat) => stat.date),
      apiCalls: recentStats.map((stat) => stat.apiCalls),
      costs: recentStats.map((stat) => stat.estimatedCost),
      savings: recentStats.map((stat) => stat.costSavings),
      cacheHitRates: recentStats.map(
        (stat) => stat.cachedRequests / Math.max(stat.totalRequests, 1)
      ),
    };
  }

  // Get optimization recommendations
  getOptimizationRecommendations(): {
    recommendations: string[];
    priority: "low" | "medium" | "high";
    estimatedSavings: number;
  } {
    const monthlyUsage = this.getMonthlyUsage();
    const recommendations: string[] = [];
    let priority: "low" | "medium" | "high" = "low";
    let estimatedSavings = 0;

    // Check if approaching free tier limit
    if (monthlyUsage.totalApiCalls > this.FREE_TIER_LIMIT * 0.8) {
      recommendations.push(
        "⚠️ Approaching free tier limit. Consider implementing more aggressive caching."
      );
      priority = "high";
    }

    // Check cache hit rate
    const cacheHitRate =
      monthlyUsage.totalCachedRequests /
      Math.max(
        monthlyUsage.totalApiCalls + monthlyUsage.totalCachedRequests,
        1
      );
    if (cacheHitRate < 0.3) {
      recommendations.push(
        "📈 Low cache hit rate. Implement longer cache duration and better cache keys."
      );
      priority = "medium";
      estimatedSavings += monthlyUsage.totalCost * 0.4;
    }

    // Check for high daily usage
    if (monthlyUsage.peakCalls > 1000) {
      recommendations.push(
        "🚀 High peak usage detected. Consider implementing request batching."
      );
      priority = "medium";
      estimatedSavings += monthlyUsage.totalCost * 0.2;
    }

    // Check cost threshold
    if (monthlyUsage.totalCost > 10) {
      recommendations.push(
        "💰 Monthly cost exceeds $10. Consider implementing fallback strategies."
      );
      priority = "high";
      estimatedSavings += monthlyUsage.totalCost * 0.6;
    }

    // General recommendations
    if (monthlyUsage.totalApiCalls > 1000) {
      recommendations.push(
        "💡 Consider using GPS coordinates more frequently to reduce API calls."
      );
      recommendations.push(
        "🔄 Implement batch requests for multiple distance calculations."
      );
    }

    return {
      recommendations,
      priority,
      estimatedSavings,
    };
  }

  // Get cost projection
  getCostProjection(): {
    currentMonth: number;
    projectedMonth: number;
    projectedYear: number;
    freeTierStatus: "within" | "approaching" | "exceeded";
  } {
    const monthlyUsage = this.getMonthlyUsage();
    const currentMonth = monthlyUsage.totalCost;

    // Project based on current trends
    const daysInMonth = new Date().getDate();
    const projectedMonth = (currentMonth / daysInMonth) * 30;
    const projectedYear = projectedMonth * 12;

    let freeTierStatus: "within" | "approaching" | "exceeded" = "within";
    if (monthlyUsage.totalApiCalls > this.FREE_TIER_LIMIT) {
      freeTierStatus = "exceeded";
    } else if (monthlyUsage.totalApiCalls > this.FREE_TIER_LIMIT * 0.8) {
      freeTierStatus = "approaching";
    }

    return {
      currentMonth,
      projectedMonth,
      projectedYear,
      freeTierStatus,
    };
  }

  // Export usage data
  exportUsageData(): string {
    return JSON.stringify(
      {
        usageStats: this.usageStats,
        monthlyUsage: this.getMonthlyUsage(),
        trends: this.getUsageTrends(),
        recommendations: this.getOptimizationRecommendations(),
        projection: this.getCostProjection(),
      },
      null,
      2
    );
  }

  // Clear old data (keep last 90 days)
  cleanupOldData(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    this.usageStats = this.usageStats.filter(
      (stat) => new Date(stat.date) > cutoffDate
    );

    console.log("🧹 Cleaned up usage data older than 90 days");
  }
}

// Export singleton instance
export const usageMonitor = new UsageMonitor();

// Export types
export type { UsageStats, MonthlyUsage };

