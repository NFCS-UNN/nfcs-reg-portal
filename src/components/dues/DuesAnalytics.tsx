"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { groupByMonth } from "@/lib/utils/date";
import { formatNaira } from "@/lib/utils/money";

interface PaymentData {
  amount: number;
  status: string;
  channel: string;
  created_at: string | null;
}

interface DuesAnalyticsProps {
  payments: PaymentData[];
}

const STATUS_COLORS = {
  confirmed: "#10b981", // emerald
  pending: "#f59e0b",   // amber
  failed: "#ef4444",    // red
  reversed: "#6366f1",  // indigo
};

const CHANNEL_COLORS = {
  online: "#06b6d4",    // cyan
  manual: "#8b5cf6",    // purple
};

export function DuesAnalytics({ payments }: DuesAnalyticsProps) {
  const duesRevenueTrend = React.useMemo(() => {
    const confirmedPayments = payments.filter((p) => p.status === "confirmed");
    const dates = confirmedPayments.map((p) => p.created_at).filter((d): d is string => d !== null);
    const monthsGrouped = groupByMonth(dates, 6);

    return monthsGrouped.map((group) => {
      // Find all payments that fall within this month
      const monthPayments = confirmedPayments.filter((p) => {
        if (!p.created_at) return false;
        const d = new Date(p.created_at);
        const groupLabel = d.toLocaleDateString("en-NG", { month: "short", year: "2-digit" });
        return groupLabel === group.month;
      });

      const amount = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      return { month: group.month, amount };
    });
  }, [payments]);

  const statusDistribution = React.useMemo(() => {
    const counts = payments.reduce(
      (acc, p) => {
        const status = p.status || "pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      key: name,
    }));
  }, [payments]);

  const channelBreakdown = React.useMemo(() => {
    const confirmedPayments = payments.filter((p) => p.status === "confirmed");
    const counts = confirmedPayments.reduce(
      (acc, p) => {
        const channel = p.channel || "online";
        acc[channel] = (acc[channel] || 0) + Number(p.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      key: name,
    }));
  }, [payments]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6 select-none">
      {/* Revenue Trend */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-text-primary">Dues Revenue Trend</CardTitle>
          <CardDescription className="text-xs text-text-secondary">Confirmed revenue collected over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={duesRevenueTrend} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={10}
                tickFormatter={(val) => formatNaira(Number(val))}
              />
              <Tooltip
                formatter={(val: any) => [formatNaira(Number(val)), "Revenue"]}
                cursor={{ fill: "transparent" }}
              />
              <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribution Charts Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
        {/* Payment Status Distribution */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-bold text-text-primary">Status Distribution</CardTitle>
            <CardDescription className="text-xs text-text-secondary">All transaction statuses</CardDescription>
          </CardHeader>
          <CardContent className="h-[180px] flex items-center justify-between pt-0">
            <div className="w-[60%] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry) => (
                      <Cell
                        key={`cell-${entry.key}`}
                        fill={STATUS_COLORS[entry.key as keyof typeof STATUS_COLORS] || "#cbd5e1"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[40%] flex flex-col gap-1.5 justify-center">
              {statusDistribution.map((entry) => {
                const color = STATUS_COLORS[entry.key as keyof typeof STATUS_COLORS] || "#cbd5e1";
                return (
                  <div key={entry.key} className="flex items-center gap-1.5 text-[10px] font-medium text-text-secondary">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="truncate">{entry.name}</span>
                    <span className="font-mono text-text-primary ml-auto font-bold">{entry.value}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Channel Revenue Breakdown */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-bold text-text-primary">Channel Revenue</CardTitle>
            <CardDescription className="text-xs text-text-secondary">Online vs Manual share</CardDescription>
          </CardHeader>
          <CardContent className="h-[180px] flex items-center justify-between pt-0">
            <div className="w-[60%] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {channelBreakdown.map((entry) => (
                      <Cell
                        key={`cell-${entry.key}`}
                        fill={CHANNEL_COLORS[entry.key as keyof typeof CHANNEL_COLORS] || "#cbd5e1"}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatNaira(Number(val))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[40%] flex flex-col gap-1.5 justify-center">
              {channelBreakdown.map((entry) => {
                const color = CHANNEL_COLORS[entry.key as keyof typeof CHANNEL_COLORS] || "#cbd5e1";
                return (
                  <div key={entry.key} className="flex items-center gap-1.5 text-[10px] font-medium text-text-secondary">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="truncate">{entry.name}</span>
                    <span className="font-mono text-text-primary ml-auto font-bold">{formatNaira(entry.value)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
