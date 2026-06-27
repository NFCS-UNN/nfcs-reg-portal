import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, AlertCircle } from "lucide-react";
import Link from "next/link";
import { DuesAnalytics } from "@/components/dues/DuesAnalytics";
import { DuesTable } from "@/components/dues/DuesTable";
import { formatNaira } from "@/lib/utils/money";

export default async function AdminDuesPage() {
  const supabase = await createClient();

  // Fetch all payments with profile, legacy_member and recorded_by exco details
  const { data: payments, error } = await supabase
    .from("payments")
    .select(`
      *,
      profiles!profile_id (
        full_name,
        matric_number,
        passport_photo_url
      ),
      legacy_members (
        full_name,
        matric_number
      ),
      recorder:profiles!recorded_by (
        full_name,
        passport_photo_url
      )
    `)
    .order("created_at", { ascending: false });

  // Calculate quick stats from all retrieved payments
  let totalCollected = 0;
  let onlineCollected = 0;
  let manualCollected = 0;
  let pendingCount = 0;

  if (payments) {
    payments.forEach((p) => {
      const amount = parseFloat(p.amount.toString());
      if (p.status === "confirmed") {
        totalCollected += amount;
        if (p.channel === "online") {
          onlineCollected += amount;
        } else if (p.channel === "manual") {
          manualCollected += amount;
        }
      } else if (p.status === "pending") {
        pendingCount++;
      }
    });
  }

  // Fetch current user's role for UI permission gating
  const { data: { user } } = await supabase.auth.getUser();
  const { data: currentProfile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const currentUserRole = currentProfile?.role ?? "";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-text-primary">
            Dues & Payments Dashboard
          </h1>
          <p className="text-xs text-text-secondary">
            Manage dues payments, reconcile pending items, and analyze revenue trends.
          </p>
        </div>

        <Button asChild variant="primary" className="sm:self-end">
          <Link href="/admin/dues/record" className="gap-2">
            <Plus className="h-4 w-4" /> Record Manual Payment
          </Link>
        </Button>
      </div>

      {/* KPI stats row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 select-none">
        <Card hoverable>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-text-secondary">Total Dues Collected</span>
              <h3 className="text-xl font-bold text-brand-accent font-mono">
                {formatNaira(totalCollected)}
              </h3>
            </div>
            <div className="h-10 w-10 bg-brand-light text-brand rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-text-secondary">Online Collections</span>
              <h3 className="text-xl font-bold text-text-primary font-mono">
                {formatNaira(onlineCollected)}
              </h3>
            </div>
            <div className="h-10 w-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center dark:bg-emerald-950/20 dark:text-emerald-500">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-text-secondary">Manual Collections</span>
              <h3 className="text-xl font-bold text-text-primary font-mono">
                {formatNaira(manualCollected)}
              </h3>
            </div>
            <div className="h-10 w-10 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center dark:bg-indigo-950/20 dark:text-indigo-500">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-text-secondary">Pending Transactions</span>
              <h3 className="text-xl font-bold text-text-primary font-mono">{pendingCount}</h3>
            </div>
            <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center dark:bg-amber-950/20 dark:text-amber-500">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      {payments && payments.length > 0 && (
        <DuesAnalytics payments={payments} />
      )}

      {/* Dues History list table */}
      <div className="space-y-4">
        <div className="space-y-0.5 select-none">
          <h3 className="text-sm font-bold text-text-primary">Payment Records</h3>
          <p className="text-xs text-text-tertiary">Confirm pending receipts, reverse transactions, and edit entries.</p>
        </div>

        {error ? (
          <div className="text-center py-10 bg-white dark:bg-prussian-blue-2 rounded-[12px] border border-neutrals-borderLight">
            <AlertCircle className="mx-auto h-10 w-10 text-danger mb-3" />
            <h3 className="text-sm font-bold text-text-primary">Failed to load dues records</h3>
            <p className="text-xs text-text-secondary mt-1">{error.message}</p>
          </div>
        ) : !payments || payments.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-prussian-blue-2 rounded-[12px] border border-neutrals-borderLight shadow-card">
            <CreditCard className="mx-auto h-10 w-10 text-text-tertiary mb-3" />
            <h3 className="text-sm font-bold text-text-primary">No payments logged</h3>
            <p className="text-xs text-text-secondary mt-1">
              No payments have been recorded yet. Click &quot;Record Manual Payment&quot; above to log the first dues.
            </p>
          </div>
        ) : (
          <DuesTable initialPayments={payments as any} currentUserRole={currentUserRole} />
        )}
      </div>
    </div>
  );
}
