import * as React from "react";
import { EventForm } from "@/components/forms/EventForm";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CreateEventPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1 select-none">
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-brand-accent mb-2 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Events
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          Schedule New Event
        </h1>
        <p className="text-xs text-text-secondary">
          Add general, organ-specific, or exco-only events to the calendar.
        </p>
      </div>

      {/* Form Card Layout */}
      <Card className="max-w-[720px] mx-auto border border-neutrals-borderLight shadow-card bg-white">
        <CardContent className="p-8">
          <EventForm />
        </CardContent>
      </Card>
    </div>
  );
}
