"use client";

import { useState } from "react";
import { Users, Package, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ChartData = {
  date: string;
  users: number;
  orders: number;
  revenue: number;
  artworks: number;
};

type AdminDashboardStatsProps = {
  stats: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalArtworks: number;
  };
  chartData: ChartData[];
};

export default function AdminDashboardStats({ stats, chartData }: AdminDashboardStatsProps) {
  const [activeTab, setActiveTab] = useState<"users" | "orders" | "revenue" | "artworks" | null>(null);

  const getChartConfig = () => {
    switch (activeTab) {
      case "users": return { dataKey: "users", color: "#2563eb", title: "New Users (Last 30 Days)" }; // blue-600
      case "orders": return { dataKey: "orders", color: "#059669", title: "New Orders (Last 30 Days)" }; // emerald-600
      case "revenue": return { dataKey: "revenue", color: "#16a34a", title: "Revenue (RWF) (Last 30 Days)" }; // green-600
      case "artworks": return { dataKey: "artworks", color: "#9333ea", title: "New Artworks (Last 30 Days)" }; // purple-600
      default: return null;
    }
  };

  const chartConfig = getChartConfig();

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button 
          onClick={() => setActiveTab(activeTab === "users" ? null : "users")}
          className={`text-left bg-white dark:bg-[#1a1a24] rounded-lg border ${activeTab === "users" ? "border-blue-500 ring-2 ring-blue-500/50 dark:border-blue-500 dark:ring-blue-500/50" : "border-gray-200 dark:border-gray-700"} p-6 hover:shadow-md transition-all group`}
        >
          <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
        </button>

        <button 
          onClick={() => setActiveTab(activeTab === "orders" ? null : "orders")}
          className={`text-left bg-white dark:bg-[#1a1a24] rounded-lg border ${activeTab === "orders" ? "border-emerald-500 ring-2 ring-emerald-500/50 dark:border-emerald-500 dark:ring-emerald-500/50" : "border-gray-200 dark:border-gray-700"} p-6 hover:shadow-md transition-all group`}
        >
          <Package className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalOrders}</p>
        </button>

        <button 
          onClick={() => setActiveTab(activeTab === "revenue" ? null : "revenue")}
          className={`text-left bg-white dark:bg-[#1a1a24] rounded-lg border ${activeTab === "revenue" ? "border-green-500 ring-2 ring-green-500/50 dark:border-green-500 dark:ring-green-500/50" : "border-gray-200 dark:border-gray-700"} p-6 hover:shadow-md transition-all group`}
        >
          <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalRevenue.toLocaleString()}</p>
        </button>

        <button 
          onClick={() => setActiveTab(activeTab === "artworks" ? null : "artworks")}
          className={`text-left bg-white dark:bg-[#1a1a24] rounded-lg border ${activeTab === "artworks" ? "border-purple-500 ring-2 ring-purple-500/50 dark:border-purple-500 dark:ring-purple-500/50" : "border-gray-200 dark:border-gray-700"} p-6 hover:shadow-md transition-all group`}
        >
          <Package className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Artworks</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalArtworks}</p>
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeTab ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
        {activeTab && chartConfig && (
          <div className="bg-white dark:bg-[#1a1a24] rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-fade-in shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">{chartConfig.title}</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    minTickGap={20}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value} 
                    width={50}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#f3f4f6", borderRadius: "0.5rem" }}
                    itemStyle={{ color: chartConfig.color, fontWeight: "bold" }}
                    wrapperStyle={{ outline: "none" }}
                    cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={chartConfig.dataKey} 
                    stroke={chartConfig.color} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
