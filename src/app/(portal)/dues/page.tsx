import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { CreditCard, CheckCircle, XCircle, Clock, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyDuesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Fetch payments
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  const currentSession = "2024/2025 Session";
  const duesAmount = 5000;

  // Check if current session is paid
  const currentPayment = payments?.find(
    (p) => p.payment_period === currentSession && p.dues_type === "annual_dues"
  );
  
  let paymentStatus: "paid" | "unpaid" | "partial" = "unpaid";
  if (currentPayment) {
    if (currentPayment.status === "confirmed") {
      paymentStatus = "paid";
    } else if (currentPayment.status === "pending") {
      paymentStatus = "partial"; // Pending online counts as outstanding/partial
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-text-primary">
            Dues & Levies
          </h1>
          <p className="text-xs text-text-secondary">
            View and manage your academic session dues and event levies.
          </p>
        </div>

        <Button asChild variant="primary" className="sm:self-end">
          <Link href="/dues/pay" className="gap-2">
            <CreditCard className="h-4 w-4" /> Pay Dues / Levies
          </Link>
        </Button>
      </div>

      {/* Session Dues Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 select-none">
        {/* Current Session Card from DESIGN.json */}
        <div className="bg-white border border-neutrals-borderLight rounded-[12px] p-5 flex items-center justify-between shadow-card hover:bg-surface-subtle transition-all duration-150">
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-text-primary font-mono">
                {currentSession}
              </span>
              <span className="bg-brand-light text-brand-accent border border-brand-border rounded-[6px] px-2 py-0.5 text-[10px] font-semibold">
                Current
              </span>
            </div>
            <span className="text-base font-bold text-text-primary font-mono">
              ₦{duesAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {paymentStatus === "paid" ? (
              <div className="flex items-center gap-1.5 text-status-successText">
                <CheckCircle className="h-5 w-5 text-brand-accent shrink-0" />
                <span className="text-xs font-semibold">Paid</span>
              </div>
            ) : paymentStatus === "partial" ? (
              <div className="flex items-center gap-1.5 text-status-warningText">
                <Clock className="h-5 w-5 text-amber-500 shrink-0 animate-pulse" />
                <span className="text-xs font-semibold">Pending</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-danger">
                <XCircle className="h-5 w-5 text-danger shrink-0" />
                <span className="text-xs font-semibold">Outstanding</span>
              </div>
            )}
          </div>
        </div>

        {/* Mock Past Session Card */}
        <div className="bg-white border border-neutrals-borderLight rounded-[12px] p-5 flex items-center justify-between shadow-card opacity-80 hover:opacity-100 transition-all duration-150">
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-text-primary font-mono">
                2023/2024 Session
              </span>
              <span className="bg-[#F3F4F6] text-text-secondary border border-neutrals-border rounded-[6px] px-2 py-0.5 text-[10px]">
                Past
              </span>
            </div>
            <span className="text-base font-bold text-text-primary font-mono">
              ₦5,000.00
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-status-successText">
            <CheckCircle className="h-5 w-5 text-brand-accent shrink-0" />
            <span className="text-xs font-semibold">Paid</span>
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div className="space-y-4">
        <div className="space-y-0.5 select-none">
          <h3 className="text-sm font-bold text-text-primary">Payment History</h3>
          <p className="text-xs text-text-tertiary">All online and manual dues logged in the portal.</p>
        </div>

        {!payments || payments.length === 0 ? (
          <div className="text-center py-12 bg-white border border-neutrals-borderLight rounded-[12px] shadow-card">
            <CreditCard className="mx-auto h-10 w-10 text-text-tertiary mb-3" />
            <h3 className="text-sm font-bold text-text-primary">No payments found</h3>
            <p className="text-xs text-text-secondary mt-1">
              You haven&apos;t completed any dues payments yet. Click &quot;Pay Dues / Levies&quot; above to start.
            </p>
          </div>
        ) : (
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
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
                {payments.map((p) => (
                  <TableRow key={p.id}>
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
                ))}
              </TableBody>
            </Table>
          </TableWrapper>
        )}
      </div>
    </div>
  );
}
