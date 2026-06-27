import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TableWrapper,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Receipt, Eye, Printer, ExternalLink, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { formatNaira } from "@/lib/utils/money";

function getStatusVariant(status: string) {
  switch (status) {
    case "confirmed": return "paid";
    case "pending": return "pending";
    case "failed": return "unpaid";
    case "reversed": return "partial";
    default: return "inactive";
  }
}

export default async function AllReceiptsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  // Fetch all payments for this user
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  const confirmedCount = (payments || []).filter((p) => p.status === "confirmed").length;
  const pendingCount = (payments || []).filter((p) => p.status === "pending").length;

  const duesTypeLabels: Record<string, string> = {
    annual_dues: "Annual Session Dues",
    membership_levy: "Registration Levy",
    special_levy: "Special Levy / Donation",
    other: "Other Payment",
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="space-y-1">
          <Link
            href="/dues"
            className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-brand-accent mb-1 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to My Dues
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">
            My Receipts
          </h1>
          <p className="text-xs text-text-secondary">
            All payment records and receipts generated for your account.
          </p>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-2">
          <Badge variant="paid">{confirmedCount} Confirmed</Badge>
          {pendingCount > 0 && (
            <Badge variant="pending">{pendingCount} Pending</Badge>
          )}
        </div>
      </div>

      {/* Table or Empty State */}
      {!payments || payments.length === 0 ? (
        <div className="text-center py-16 bg-white border border-neutrals-borderLight rounded-2xl shadow-card">
          <Receipt className="mx-auto h-10 w-10 text-text-tertiary mb-3" />
          <h3 className="text-sm font-bold text-text-primary">No receipts yet</h3>
          <p className="text-xs text-text-secondary mt-1 mb-4">
            Once you make a payment, your receipts will appear here.
          </p>
          <Button asChild variant="primary" className="h-9 text-xs gap-2">
            <Link href="/dues/pay">Pay Dues / Levies</Link>
          </Button>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => {
                const datePaid = p.payment_date
                  ? new Date(p.payment_date).toLocaleDateString("en-NG", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                  : p.created_at
                    ? new Date(p.created_at).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                    : "—";

                return (
                  <TableRow key={p.id}>
                    <TableCell variant="mono">
                      {p.payment_reference || "—"}
                    </TableCell>

                    <TableCell className="capitalize">
                      {duesTypeLabels[p.dues_type] ||
                        p.dues_type.replace(/_/g, " ")}
                    </TableCell>

                    <TableCell variant="mono" className="font-semibold text-text-primary">
                      {formatNaira(p.amount)}
                    </TableCell>

                    <TableCell variant="secondary">
                      {p.payment_period || "—"}
                    </TableCell>

                    <TableCell variant="secondary">
                      <Badge
                        variant="inactive"
                        className="capitalize px-2 py-0.5 rounded-[4px] border-none select-none"
                      >
                        {p.channel}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={getStatusVariant(p.status)}>
                        {p.status}
                      </Badge>
                    </TableCell>

                    <TableCell variant="secondary">{datePaid}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* View — all payments */}
                        <Link
                          href={`/dues/receipt/${p.id}`}
                          className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-brand-accent transition-colors font-semibold"
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>

                        {/* Print — confirmed only */}
                        {p.status === "confirmed" && (
                          <Link
                            href={`/dues/receipt/${p.id}`}
                            className="inline-flex items-center gap-1 text-xs text-brand-accent hover:text-brand transition-colors font-semibold"
                            title="Download Receipt"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            PDF
                          </Link>
                        )}

                        {/* Complete — pending online only */}
                        {p.status === "pending" &&
                          p.channel === "online" &&
                          p.payment_reference && (
                            <Link
                              href={`/dues/pay/checkout?ref=${p.payment_reference}`}
                              className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors font-semibold"
                              title="Complete Payment"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Complete
                            </Link>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableWrapper>
      )}
    </div>
  );
}
