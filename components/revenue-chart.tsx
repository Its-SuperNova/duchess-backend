"use client";

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

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number }>;
}

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm font-bold text-blue-600">
          ₹
          {payload[0].value?.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    );
  }
  return null;
};

export function RevenueChart({ data }: RevenueChartProps) {
  // Format data for display
  const formattedData = data.map((item) => {
    const date = new Date(item.date);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fullDate: item.date,
      revenue: item.revenue,
    };
  });

  // Calculate Y-axis domain
  const revenues = formattedData.map((d) => d.revenue);
  const maxRevenue = Math.max(...revenues, 0);
  const minRevenue = Math.min(...revenues, 0);

  // Set Y-axis with proper domain
  // If max revenue is 0, show 0-1000 range
  // Otherwise, show 0 to 110% of max revenue
  const yAxisMax = maxRevenue > 0 ? Math.ceil(maxRevenue * 1.1) : 1000;

  return (
    <div className="w-full h-[250px] sm:h-[350px]">
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
            tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "#2563eb" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
