"use client";

import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MessageSquare, Users, Send, Inbox, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-4">No analytics data available</div>;
  }

  const { overview, byChannel, byStatus, dailyVolume, channelPerformance } = data;

  // Calculate delivery rates per channel
  const channelDeliveryRates = byChannel.map((channel: any) => {
    const channelPerf = channelPerformance.filter(
      (p: any) => p.channel === channel.channel
    );
    const total = channelPerf.reduce((sum: number, p: any) => sum + p.count, 0);
    const delivered = channelPerf.find((p: any) => p.status === "DELIVERED")?.count || 0;
    const sent = channelPerf.find((p: any) => p.status === "SENT")?.count || 0;
    
    return {
      channel: channel.channel,
      deliveryRate: total > 0 ? ((delivered + sent) / total) * 100 : 0,
      total,
    };
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{overview.totalMessages}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{overview.activeContacts}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview.avgResponseTimeSeconds > 0
                  ? `${Math.round(overview.avgResponseTimeSeconds / 60)}m`
                  : "N/A"}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inbound/Outbound</p>
              <p className="text-lg font-bold text-gray-900">
                {overview.inboundCount} / {overview.outboundCount}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Volume */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Daily Message Volume</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyVolume}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(new Date(date), "MMM d")}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="inbound" stroke="#10b981" name="Inbound" />
              <Line type="monotone" dataKey="outbound" stroke="#6366f1" name="Outbound" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Messages by Channel */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Messages by Channel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={byChannel}
                dataKey="count"
                nameKey="channel"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {byChannel.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Performance */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Channel Delivery Rates</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={channelDeliveryRates}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Bar dataKey="deliveryRate" fill="#6366f1" name="Delivery Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Message Status */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Messages by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

