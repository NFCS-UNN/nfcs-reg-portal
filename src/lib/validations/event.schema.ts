import { z } from "zod";
import { ORGANS } from "./member.schema";

export const eventSchema = z.object({
  title: z.string().min(2, "Event title must be at least 2 characters"),
  description: z.string().optional().or(z.literal("")),
  event_type: z.enum(["general", "organ", "meeting"], {
    required_error: "Please select an event type",
  }),
  organ: z.enum(ORGANS).optional().or(z.literal("")),
  location: z.string().min(1, "Location is required"),
  starts_at: z.string().min(1, "Start date-time is required"),
  ends_at: z.string().optional().or(z.literal("")),
  is_published: z.boolean().default(false),
});

export type EventFormValues = z.infer<typeof eventSchema>;
