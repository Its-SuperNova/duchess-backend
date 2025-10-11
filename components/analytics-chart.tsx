"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingBag, Users } from "lucide-react";

interface ChartData {
  date: string;
  orders: number;
  revenue: number;
  users: number;
}

interface AnalyticsChartProps {
  data: ChartData[];
  onFilterChange: (filter: string, startDate?: Date, endDate?: Date) => void;
  currentFilter: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  metric,
}: TooltipProps<number, string> & { metric?: string }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value || 0;
    let formattedValue = value.toString();

    if (metric === "revenue") {
      formattedValue = `₹${value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } else {
      formattedValue = value.toLocaleString("en-IN");
    }

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm font-bold text-blue-600">{formattedValue}</p>
      </div>
    );
  }
  return null;
};

export function AnalyticsChart({
  data,
  onFilterChange,
  currentFilter,
}: AnalyticsChartProps) {
  const [activeMetric, setActiveMetric] = useState("orders");

  // Wrapper function to handle filter change with additional parameters
  const handleFilterChange = (filter: string) => {
    onFilterChange(filter, undefined, undefined);
  };

  // Format data for display
  const formattedData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    orders: item.orders,
    revenue: item.revenue,
    users: item.users,
  }));

  // Calculate metrics for each tab
  const getMetricConfig = (metric: string) => {
    switch (metric) {
      case "orders":
        return {
          title: "Orders",
          description: "Daily order count",
          dataKey: "orders",
          stroke: "#2563eb",
          icon: ShoppingBag,
          formatter: (value: number) => value.toLocaleString("en-IN"),
        };
      case "revenue":
        return {
          title: "Revenue",
          description: "Daily revenue",
          dataKey: "revenue",
          stroke: "#10b981",
          icon: DollarSign,
          formatter: (value: number) => `₹${value.toLocaleString("en-IN")}`,
        };
      case "users":
        return {
          title: "New Users",
          description: "Daily new user signups",
          dataKey: "users",
          stroke: "#8b5cf6",
          icon: Users,
          formatter: (value: number) => value.toLocaleString("en-IN"),
        };
      default:
        return {
          title: "Orders",
          description: "Daily order count",
          dataKey: "orders",
          stroke: "#2563eb",
          icon: ShoppingBag,
          formatter: (value: number) => value.toLocaleString("en-IN"),
        };
    }
  };

  const config = getMetricConfig(activeMetric);
  const Icon = config.icon;

  // Calculate Y-axis domain
  const values = formattedData.map(
    (d) => d[config.dataKey as keyof typeof d] as number
  );
  const maxValue = Math.max(...values, 0);

  // Set appropriate defaults based on metric type
  let defaultMax = 100;
  if (activeMetric === "revenue") {
    defaultMax = 1000; // Higher default for revenue
  } else if (activeMetric === "users") {
    defaultMax = 10; // Lower default for users
  }

  const yAxisMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : defaultMax;

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>{config.title} Overview</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={activeMetric} onValueChange={setActiveMetric}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orders">Orders</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="users">Users</SelectItem>
              </SelectContent>
            </Select>
            <Select value={currentFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                stroke="#9ca3af"
                domain={[0, yAxisMax]}
                tickFormatter={(value) => {
                  if (activeMetric === "revenue") {
                    return `₹${value.toLocaleString("en-IN")}`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip metric={activeMetric} />} />
              <Line
                type="monotone"
                dataKey={config.dataKey}
                stroke={config.stroke}
                strokeWidth={2}
                dot={{
                  fill: config.stroke,
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{ r: 6, fill: config.stroke }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
