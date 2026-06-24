import * as React from "react";
import { ManualPaymentForm } from "@/components/forms/ManualPaymentForm";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function RecordManualPaymentPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1 select-none">
        <Link
          href="/admin/dues"
          className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-brand-accent mb-2 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Manage Dues
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          Record Manual Payment
        </h1>
        <p className="text-xs text-text-secondary">
          Record cash/manual dues payment collected on-site from members or legacy alumni.
        </p>
      </div>

      {/* Form Card Layout */}
      <Card className="max-w-[720px] mx-auto border border-neutrals-borderLight shadow-card bg-white">
        <CardContent className="p-8">
          <ManualPaymentForm />
        </CardContent>
      </Card>
    </div>
  );
}
