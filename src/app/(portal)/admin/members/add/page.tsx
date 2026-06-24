import * as React from "react";
import { OnsiteRegistrationForm } from "@/components/forms/OnsiteRegistrationForm";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function OnsiteRegistrationPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1 select-none">
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-brand-accent mb-2 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Directory
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          Onsite Registration
        </h1>
        <p className="text-xs text-text-secondary">
          Manually register a new student or alumnus and activate them instantly.
        </p>
      </div>

      {/* Form Card Layout */}
      <Card className="max-w-[720px] mx-auto border border-neutrals-borderLight shadow-card bg-white">
        <CardContent className="p-8">
          <OnsiteRegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}
