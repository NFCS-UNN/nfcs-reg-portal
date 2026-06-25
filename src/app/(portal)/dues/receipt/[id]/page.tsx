import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Printer, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Fetch the payment record
  const { data: payment, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();

  if (error || !payment) {
    return notFound();
  }

  // Fetch the profile for name/email
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, faculty, department, academic_level, matric_number")
    .eq("id", user.id)
    .single();

  const duesTypeLabels: Record<string, string> = {
    annual_dues: "Annual Session Dues",
    membership_levy: "Registration Levy",
    special_levy: "Special Levy / Donation",
    other: "Other Payment",
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between select-none print:hidden">
        <Link
          href="/dues"
          className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-brand-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to My Dues
        </Link>
        <Button
          variant="secondary"
          className="h-9 text-xs gap-2 font-semibold"
          id="print-receipt-btn"
        >
          <Printer className="h-4 w-4" /> Print Receipt
        </Button>
      </div>

      {/* Receipt Card */}
      <div className="max-w-[640px] mx-auto bg-white border border-neutrals-borderLight rounded-2xl shadow-card overflow-hidden print:shadow-none print:border-none print:rounded-none">
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-brand to-brand-accent p-6 text-white text-center">
          <h1 className="text-lg font-bold tracking-tight">NFCS UNN</h1>
          <p className="text-xs opacity-80 mt-1">
            Nigerian Federation of Catholic Students — University of Nigeria,
            Nsukka
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 backdrop-blur-sm">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-semibold">Payment Receipt</span>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-6">
          {/* Reference & Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">
                Reference
              </p>
              <p className="text-sm font-bold text-text-primary font-mono">
                {payment.payment_reference || "—"}
              </p>
            </div>
            <Badge
              variant={payment.status === "confirmed" ? "paid" : "pending"}
              className="text-xs"
            >
              {payment.status === "confirmed" ? "Confirmed" : payment.status}
            </Badge>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-neutrals-borderLight" />

          {/* Member Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold mb-1">
                Member Name
              </p>
              <p className="text-xs font-semibold text-text-primary">
                {profile?.full_name || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold mb-1">
                Email
              </p>
              <p className="text-xs text-text-secondary">
                {profile?.email || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold mb-1">
                Faculty
              </p>
              <p className="text-xs text-text-secondary">
                {profile?.faculty || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold mb-1">
                Department
              </p>
              <p className="text-xs text-text-secondary">
                {profile?.department || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold mb-1">
                Academic Level
              </p>
              <p className="text-xs text-text-secondary">
                {profile?.academic_level || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold mb-1">
                Reg. Number
              </p>
              <p className="text-xs text-text-secondary font-mono">
                {profile?.matric_number || "—"}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-neutrals-borderLight" />

          {/* Payment Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-secondary">Dues Type</p>
              <p className="text-xs font-semibold text-text-primary capitalize">
                {duesTypeLabels[payment.dues_type] ||
                  payment.dues_type.replace(/_/g, " ")}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-secondary">Session / Period</p>
              <p className="text-xs font-semibold text-text-primary">
                {payment.payment_period || "—"}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-secondary">Payment Channel</p>
              <p className="text-xs font-semibold text-text-primary capitalize">
                {payment.channel}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-secondary">Date Paid</p>
              <p className="text-xs font-semibold text-text-primary">
                {payment.payment_date || payment.created_at?.split("T")[0] || "—"}
              </p>
            </div>
            {payment.notes && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-secondary">Notes</p>
                <p className="text-xs text-text-primary max-w-[200px] text-right">
                  {payment.notes}
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-neutrals-borderLight" />

          {/* Total Amount */}
          <div className="flex items-center justify-between py-2">
            <p className="text-sm font-bold text-text-primary">Amount Paid</p>
            <p className="text-xl font-bold text-brand font-mono">
              ₦
              {parseFloat(payment.amount.toString()).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Receipt Number */}
          {payment.receipt_number && (
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">
                Receipt Number
              </p>
              <p className="text-sm font-bold text-text-primary font-mono mt-1">
                {payment.receipt_number}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutrals-borderLight bg-gray-50 p-4 text-center">
          <p className="text-[10px] text-text-tertiary">
            This is a computer-generated receipt. For inquiries, contact the
            NFCS Financial Secretary.
          </p>
          <p className="text-[9px] text-text-tertiary mt-1">
            Generated on {new Date().toLocaleDateString("en-NG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Print Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('print-receipt-btn')?.addEventListener('click', function() {
              window.print();
            });
          `,
        }}
      />
    </div>
  );
}
