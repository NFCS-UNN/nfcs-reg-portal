"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, AlertCircle, TrendingUp, DollarSign } from "lucide-react";
import { groupByMonth } from "@/lib/utils/date";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AdminAnalyticsProps {
  adminStats: {
    totalMembers: number;
    activeMembers: number;
    pendingApprovals: number;
    legacyCount: number;
    totalCollected: number;
    onlineCollected: number;
    manualCollected: number;
    pendingCount: number;
    duesCollected: number;
    otherCollected: number;
  };
  profileDates: (string | null | undefined)[];
  allPayments: {
    amount: number;
    status: string;
    channel: string;
    created_at: string;
  }[];
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function AdminAnalytics({ adminStats, profileDates, allPayments }: AdminAnalyticsProps) {
  const memberGrowthData = React.useMemo(() => {
    return groupByMonth(profileDates, 6);
  }, [profileDates]);

  const duesCollectionData = React.useMemo(() => {
    const confirmedPayments = allPayments.filter((p) => p.status === "confirmed");
    const grouped = groupByMonth(
      confirmedPayments.map((p) => p.created_at),
      6
    );

    // Now map counts to amounts
    return grouped.map((group) => {
      const monthPayments = confirmedPayments.filter((p) => {
        const d = new Date(p.created_at);
        return (
          d.toLocaleDateString("en-NG", { month: "short", year: "2-digit" }) ===
          group.month
        );
      });
      const amount = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      return { month: group.month, amount };
    });
  }, [allPayments]);

  const memberStatusData = [
    { name: "Active", value: adminStats.activeMembers },
    { name: "Pending", value: adminStats.pendingApprovals },
    { name: "Legacy (Unclaimed)", value: adminStats.legacyCount },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card hoverable>
          <CardContent className="p-5 flex items-center gap-4 justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-text-secondary">Total Members</span>
              <h3 className="text-2xl font-bold text-text-primary">{adminStats.totalMembers}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-brand-light flex items-center justify-center text-brand">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardContent className="p-5 flex items-center gap-4 justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-text-secondary">Active Members</span>
              <h3 className="text-2xl font-bold text-text-primary">{adminStats.activeMembers}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardContent className="p-5 flex items-center gap-4 justify-between">
            <div className="space-y-1 flex flex-col">
              <span className="text-xs font-semibold text-text-secondary">Pending Approvals</span>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-text-primary">{adminStats.pendingApprovals}</h3>
                {adminStats.pendingApprovals > 0 && (
                  <Badge variant="pending" className="text-[10px] px-1.5 py-0 border-none">Needs review</Badge>
                )}
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardContent className="p-5 flex items-center gap-4 justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-text-secondary">Total Amount Collected</span>
              <h3 className="text-2xl font-bold text-text-primary">
                ₦{adminStats.totalCollected.toLocaleString()}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Financial Breakdown (Online vs Manual) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1 bg-white dark:bg-prussian-blue-2 border border-neutrals-borderLight p-4 rounded-xl shadow-sm">
            <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Online Payments</span>
            <span className="text-xl font-bold text-text-primary">₦{adminStats.onlineCollected.toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-1 bg-white dark:bg-prussian-blue-2 border border-neutrals-borderLight p-4 rounded-xl shadow-sm">
            <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Manual Receipts</span>
            <span className="text-xl font-bold text-text-primary">₦{adminStats.manualCollected.toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-1 bg-white dark:bg-prussian-blue-2 border border-neutrals-borderLight p-4 rounded-xl shadow-sm">
            <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Pending / Failed Dues</span>
            <span className="text-xl font-bold text-text-primary">{adminStats.pendingCount} transactions</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1 bg-white dark:bg-prussian-blue-2 border border-neutrals-borderLight p-4 rounded-xl shadow-sm">
            <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Dues Collected (Registration &amp; Annual Dues)</span>
            <span className="text-xl font-bold text-brand">₦{adminStats.duesCollected.toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-1 bg-white dark:bg-prussian-blue-2 border border-neutrals-borderLight p-4 rounded-xl shadow-sm">
            <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Other Payments Collected (Special Levies &amp; Others)</span>
            <span className="text-xl font-bold text-emerald-600">₦{adminStats.otherCollected.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Dues Collection Trend */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Dues Collection Trend</CardTitle>
            <CardDescription>Revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={duesCollectionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(val) => `₦${val.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(val: any) => [`₦${Number(val).toLocaleString()}`, "Amount"]}
                  cursor={{ fill: "transparent" }}
                />
                <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Member Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Member Status</CardTitle>
            <CardDescription>Current state of the directory</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memberStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {memberStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="absolute bottom-6 w-full flex justify-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Legacy
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Member Growth Chart */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Member Registration Growth</CardTitle>
            <CardDescription>New registrations over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--primary)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
