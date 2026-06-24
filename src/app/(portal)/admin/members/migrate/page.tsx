"use client";

import * as React from "react";
import { MigrateForm } from "@/components/forms/MigrateForm";
import { MigrationUploader } from "@/components/migration/MigrationUploader";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export default function LegacyMigrationPage() {
  const [activeTab, setActiveTab] = React.useState<"csv" | "manual">("csv");

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
          Legacy Data Migration
        </h1>
        <p className="text-xs text-text-secondary">
          Digitize pre-portal student and alumni records from notebook registers or dues cards.
        </p>
      </div>

      {/* Tabs Row Trigger */}
      <div className="flex border-b border-neutrals-borderLight select-none">
        <button
          onClick={() => setActiveTab("csv")}
          className={cn(
            "px-4 py-2.5 text-xs font-semibold border-b-2 transition-all duration-150 border-transparent bg-transparent focus:outline-none",
            activeTab === "csv"
              ? "text-brand border-brand font-bold"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          CSV Bulk Import
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={cn(
            "px-4 py-2.5 text-xs font-semibold border-b-2 transition-all duration-150 border-transparent bg-transparent focus:outline-none",
            activeTab === "manual"
              ? "text-brand border-brand font-bold"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          Manual Single Entry
        </button>
      </div>

      {/* Content wrapper */}
      <Card className="border border-neutrals-borderLight shadow-card bg-white">
        <CardContent className="p-8">
          {activeTab === "csv" ? <MigrationUploader /> : <MigrateForm />}
        </CardContent>
      </Card>
    </div>
  );
}
