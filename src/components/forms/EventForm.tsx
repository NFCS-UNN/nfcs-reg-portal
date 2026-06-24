"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, type EventFormValues } from "@/lib/validations/event.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createEvent } from "@/lib/actions/event.actions";
import { AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/hooks/useUser";
import { ORGANS } from "@/lib/validations/member.schema";
import { useRouter } from "next/navigation";

export function EventForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { profile } = useUser();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      event_type: "general",
      organ: undefined,
      location: "",
      starts_at: "",
      ends_at: "",
      is_published: true,
    },
  });

  const selectedType = watch("event_type");

  const onSubmit = async (values: EventFormValues) => {
    if (!profile) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await createEvent(values, profile.id);
      if (result?.error) {
        setError(result.error);
        toast({
          title: "Failed to Create Event",
          description: result.error,
          variant: "error",
        });
      } else {
        toast({
          title: "Event Scheduled",
          description: "New event entry has been recorded.",
          variant: "success",
        });
        router.push("/admin/events");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-status-errorBackground p-3 text-xs font-semibold text-status-errorText border border-status-errorBorder animate-in fade-in-50">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-secondary">Event Title</label>
        <Input error={!!errors.title} {...register("title")} placeholder="Monthly Fellowship & Adoration" />
        {errors.title && <p className="text-[11px] text-danger mt-1">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">Event Type</label>
          <Select error={!!errors.event_type} {...register("event_type")}>
            <option value="general">General Chapter Event</option>
            <option value="organ">Organ Specific</option>
            <option value="meeting">Exco Meeting</option>
          </Select>
          {errors.event_type && <p className="text-[11px] text-danger mt-1">{errors.event_type.message}</p>}
        </div>

        {selectedType === "organ" && (
          <div className="space-y-1.5 animate-in fade-in duration-150">
            <label className="text-xs font-semibold text-text-secondary">NFCS Organ Scope</label>
            <Select error={!!errors.organ} {...register("organ")}>
              <option value="">Select Organ</option>
              {ORGANS.map((o) => (
                <option key={o} value={o}>
                  {o.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-secondary">Location Venue</label>
        <Input error={!!errors.location} {...register("location")} placeholder="St. Peter's Chaplaincy Hall A" />
        {errors.location && <p className="text-[11px] text-danger mt-1">{errors.location.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">Starts At</label>
          <Input error={!!errors.starts_at} type="datetime-local" {...register("starts_at")} />
          {errors.starts_at && <p className="text-[11px] text-danger mt-1">{errors.starts_at.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">Ends At (Optional)</label>
          <Input error={!!errors.ends_at} type="datetime-local" {...register("ends_at")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-secondary">Event Description</label>
        <textarea
          {...register("description")}
          rows={4}
          placeholder="Details about the event, guest speakers, dress codes, etc."
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-text-primary focus:border-brand-accent focus:outline-none focus:shadow-inputFocus transition-all"
        />
      </div>

      {/* Publish Toggle Box */}
      <div className="flex items-center gap-2 p-3 bg-surface-subtle border border-neutrals-border rounded-lg select-none">
        <input
          type="checkbox"
          id="is_published"
          {...register("is_published")}
          className="h-4 w-4 rounded text-brand-accent focus:ring-brand-accent border-gray-300"
        />
        <label htmlFor="is_published" className="text-xs font-semibold text-text-primary cursor-pointer">
          Publish instantly (make visible to all registered members)
        </label>
      </div>

      <div className="flex justify-end pt-4 border-t border-neutrals-borderLight">
        <Button type="submit" variant="primary" className="px-6 h-10 text-xs font-semibold" isLoading={isLoading}>
          Schedule Event
        </Button>
      </div>
    </form>
  );
}
