import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MapPin, Clock, Info, Eye, Trash2, ArrowUpRight } from "lucide-react";
import { deleteEvent } from "@/lib/actions/event.actions";
import Link from "next/link";

export default async function EventsListPage() {
  const supabase = await createClient();

  // Fetch current user and profile to check roles
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isExco = ["exco", "super_admin"].includes(profile?.role || "student");

  // Fetch events
  let query = supabase.from("events").select("*");

  if (!isExco) {
    // Only published events for normal members
    query = query.eq("is_published", true);
  }

  // Sort by starts_at
  query = query.order("starts_at", { ascending: true });

  const { data: events, error } = await query;

  // Action wrapper for delete
  const handleDeleteEvent = async (id: string) => {
    "use server";
    await deleteEvent(id, user.id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-text-primary">
            Chapter Events
          </h1>
          <p className="text-xs text-text-secondary">
            Upcoming fellowships, mass celebrations, and executive meetings.
          </p>
        </div>

        {isExco && (
          <Button asChild variant="primary" className="sm:self-end">
            <Link href="/admin/events/create" className="gap-2">
              <Plus className="h-4 w-4" /> Schedule Event
            </Link>
          </Button>
        )}
      </div>

      {/* Events List Grid */}
      {error ? (
        <div className="text-center py-10 bg-white rounded-[12px] border border-neutrals-borderLight">
          <Info className="mx-auto h-10 w-10 text-text-tertiary mb-3" />
          <h3 className="text-sm font-bold text-text-primary">Failed to load events</h3>
          <p className="text-xs text-text-secondary mt-1">{error.message}</p>
        </div>
      ) : !events || events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[12px] border border-neutrals-borderLight shadow-card">
          <Calendar className="mx-auto h-10 w-10 text-text-tertiary mb-3" />
          <h3 className="text-sm font-bold text-text-primary">No events scheduled</h3>
          <p className="text-xs text-text-secondary mt-1">
            Check back later for upcoming fellowships and meetings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {events.map((event) => {
            const startDate = new Date(event.starts_at);
            const dateStr = startDate.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const timeStr = startDate.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Card key={event.id} hoverable className="overflow-hidden">
                <CardContent className="p-6 flex flex-col gap-4">
                  {/* Event Meta Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1 text-left">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="inactive" className="capitalize select-none">
                          {event.event_type}
                        </Badge>
                        {event.organ && (
                          <Badge variant="inactive" className="capitalize select-none bg-purple-50 text-purple-700">
                            Organ: {event.organ.replace("_", " ")}
                          </Badge>
                        )}
                        {isExco && !event.is_published && (
                          <Badge variant="pending" className="select-none">Draft</Badge>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-text-primary mt-1.5 leading-tight">
                        {event.title}
                      </h3>
                    </div>

                    {/* Date Block badge */}
                    <div className="h-12 w-12 bg-brand-light text-brand rounded-[10px] flex flex-col items-center justify-center font-bold select-none shrink-0 border border-brand-border">
                      <span className="text-[10px] leading-none uppercase">
                        {startDate.toLocaleDateString(undefined, { month: "short" })}
                      </span>
                      <span className="text-base leading-none mt-0.5">
                        {startDate.toLocaleDateString(undefined, { day: "numeric" })}
                      </span>
                    </div>
                  </div>

                  {/* Details block */}
                  <div className="space-y-2 text-left text-xs text-text-secondary border-t border-neutrals-borderLight pt-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-text-tertiary shrink-0" />
                      <span>{dateStr} &bull; {timeStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-text-tertiary shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Body description */}
                  {event.description && (
                    <p className="text-[12px] text-text-secondary leading-relaxed text-left line-clamp-3">
                      {event.description}
                    </p>
                  )}

                  {/* Exco delete options */}
                  {isExco && (
                    <div className="flex justify-end gap-2 border-t border-neutrals-borderLight pt-3">
                      <form action={handleDeleteEvent.bind(null, event.id)}>
                        <Button type="submit" variant="ghost" className="h-8 px-2 text-xs text-danger hover:bg-rose-50 font-semibold gap-1 select-none">
                          <Trash2 className="h-3.5 w-3.5" /> Cancel Event
                        </Button>
                      </form>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
