"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Target,
} from "lucide-react";

interface UsageStats {
  today: any;
  monthly: any;
  projection: any;
  summary: {
    isWithinFreeTier: boolean;
    estimatedMonthlyCost: number;
    costSavings: number;
    cacheHitRate: number;
  };
}

interface Recommendations {
  recommendations: string[];
  priority: "low" | "medium" | "high";
  estimatedSavings: number;
}

export default function CostOptimizationDashboard() {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [recommendations, setRecommendations] =
    useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      setLoading(true);
      const [usageResponse, recommendationsResponse] = await Promise.all([
        fetch("/api/usage-stats?type=overview"),
        fetch("/api/usage-stats?type=recommendations"),
      ]);

      if (usageResponse.ok && recommendationsResponse.ok) {
        const usageData = await usageResponse.json();
        const recommendationsData = await recommendationsResponse.json();

        setUsageStats(usageData);
        setRecommendations(recommendationsData);
      } else {
        setError("Failed to fetch usage statistics");
      }
    } catch (err) {
      setError("Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#202028] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      </div>
    );
  }

  if (!usageStats || !recommendations) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Cost Optimization Dashboard
        </h2>
        <button
          onClick={fetchUsageStats}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Monthly Cost */}
        <div className="bg-white dark:bg-[#202028] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monthly Cost
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${usageStats.summary.estimatedMonthlyCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Cost Savings */}
        <div className="bg-white dark:bg-[#202028] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cost Savings
              </p>
              <p className="text-2xl font-bold text-green-600">
                ${usageStats.summary.costSavings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="bg-white dark:bg-[#202028] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Database className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cache Hit Rate
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {(usageStats.summary.cacheHitRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Free Tier Status */}
        <div className="bg-white dark:bg-[#202028] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                usageStats.summary.isWithinFreeTier
                  ? "bg-green-100 dark:bg-green-900/20"
                  : "bg-red-100 dark:bg-red-900/20"
              }`}
            >
              {usageStats.summary.isWithinFreeTier ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Free Tier
              </p>
              <p
                className={`text-2xl font-bold ${
                  usageStats.summary.isWithinFreeTier
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {usageStats.summary.isWithinFreeTier ? "Within" : "Exceeded"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-[#202028] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Optimization Recommendations
          </h3>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
              recommendations.priority
            )}`}
          >
            {recommendations.priority.toUpperCase()} PRIORITY
          </div>
        </div>

        <div className="space-y-3">
          {recommendations.recommendations.map((recommendation, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {recommendation}
              </p>
            </div>
          ))}
        </div>

        {recommendations.estimatedSavings > 0 && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Potential Savings: $
                {recommendations.estimatedSavings.toFixed(2)}/month
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Implementation Status */}
      <div className="bg-white dark:bg-[#202028] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Optimization Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                ✅ Caching System
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                ✅ Fallback Strategies
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                ✅ Usage Monitoring
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                ✅ GPS Optimization
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                ✅ Batch Requests
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                ✅ Cost Tracking
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
