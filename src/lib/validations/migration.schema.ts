import { z } from "zod";
import { ORGANS } from "./member.schema";

export const MIGRATION_SOURCES = ["notebook", "dues_card", "csv_import", "manual_entry"] as const;

export const migrationSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  matric_number: z.string().optional().or(z.literal("")),
  faculty: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  academic_level: z.string().optional().or(z.literal("")),
  organ: z.enum(ORGANS).optional().or(z.literal("")),
  society: z.string().optional().or(z.literal("")),
  parish: z.string().optional().or(z.literal("")),
  migration_source: z.enum(MIGRATION_SOURCES, { message: "Source is required" }),
  notes: z.string().optional().or(z.literal("")),
  dues_amount_paid: z.string().optional().or(z.literal("")),
  dues_period: z.string().optional().or(z.literal("")),
});

export type MigrationFormValues = z.infer<typeof migrationSchema>;
