import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TableWrapper,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Plus, CreditCard, AlertCircle, Calendar, User, UserPlus } from "lucide-react";
import Link from "next/link";

export default async function AdminDuesPage() {
  const supabase = await createClient();

  // Fetch all payments and join profiles and legacy_members
  const { data: payments, error } = await supabase
    .from("payments")
    .select(`
      *,
      profiles (
        full_name,
        matric_number
      ),
      legacy_members (
        full_name,
        matric_number
      )
    `)
    .order("created_at", { ascending: false });

  // Calculate quick stats
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-text-primary">
            Manage Dues Records
          </h1>
          <p className="text-xs text-text-secondary">
            View all online dues receipts and record manual payment tokens.
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
        <Card>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-text-secondary">Total Dues Collected</span>
              <h3 className="text-xl font-bold text-brand-accent font-mono">
                ₦{totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="h-10 w-10 bg-brand-light text-brand rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-text-secondary">Online Collections</span>
              <h3 className="text-xl font-bold text-text-primary font-mono">
                ₦{onlineCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="h-10 w-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-text-secondary">Manual Collections</span>
              <h3 className="text-xl font-bold text-text-primary font-mono">
                ₦{manualCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="h-10 w-10 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-text-secondary">Pending Transactions</span>
              <h3 className="text-xl font-bold text-text-primary font-mono">{pendingCount}</h3>
            </div>
            <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dues History list table */}
      <div className="space-y-4">
        <div className="space-y-0.5 select-none">
          <h3 className="text-sm font-bold text-text-primary">Dues Statements</h3>
          <p className="text-xs text-text-tertiary">List of all payments processed in the system.</p>
        </div>

        {error ? (
          <div className="text-center py-10 bg-white rounded-[12px] border border-neutrals-borderLight">
            <AlertCircle className="mx-auto h-10 w-10 text-danger mb-3" />
            <h3 className="text-sm font-bold text-text-primary">Failed to load dues records</h3>
            <p className="text-xs text-text-secondary mt-1">{error.message}</p>
          </div>
        ) : !payments || payments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[12px] border border-neutrals-borderLight shadow-card">
            <CreditCard className="mx-auto h-10 w-10 text-text-tertiary mb-3" />
            <h3 className="text-sm font-bold text-text-primary">No payments logged</h3>
            <p className="text-xs text-text-secondary mt-1">
              No payments have been recorded yet. Click &quot;Record Manual Payment&quot; above to log the first dues.
            </p>
          </div>
        ) : (
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Name</TableHead>
                  <TableHead>Matric Number</TableHead>
                  <TableHead>Reference ID</TableHead>
                  <TableHead>Dues / Levy Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Session Period</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => {
                  // Resolve member name (could be active profile or legacy member)
                  const memberName = p.profiles?.full_name || p.legacy_members?.full_name || "Unknown Member";
                  const matricNumber = p.profiles?.matric_number || p.legacy_members?.matric_number || "—";

                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <span className="font-semibold text-text-primary">{memberName}</span>
                        {p.legacy_member_id && !p.profile_id && (
                          <span className="ml-1.5 text-[9px] px-1 py-0.2 border border-neutrals-border bg-surface-subtle text-text-tertiary select-none rounded">
                            Legacy
                          </span>
                        )}
                      </TableCell>
                      
                      <TableCell variant="mono">
                        {matricNumber}
                      </TableCell>
                      
                      <TableCell variant="mono">
                        {p.payment_reference || "—"}
                      </TableCell>
                      
                      <TableCell className="capitalize">
                        {p.dues_type.replace("_", " ")}
                      </TableCell>
                      
                      <TableCell variant="mono" className="font-semibold text-text-primary">
                        ₦{parseFloat(p.amount.toString()).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      
                      <TableCell variant="secondary">
                        {p.payment_period || "—"}
                      </TableCell>
                      
                      <TableCell variant="secondary">
                        <Badge variant="inactive" className="capitalize px-2 py-0.5 rounded-[4px] border-none select-none">
                          {p.channel}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant={p.status}>{p.status}</Badge>
                      </TableCell>

                      <TableCell variant="secondary">
                        {p.payment_date || p.created_at?.split("T")[0] || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableWrapper>
        )}
      </div>
    </div>
  );
}
