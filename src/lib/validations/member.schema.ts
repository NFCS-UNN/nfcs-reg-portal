import { z } from "zod";

export const ORGANS = [
  "gospel_band",
  "evangelical_committee",
  "federation_theater",
  "social_communications_commission",
  "discipline_committee",
] as const;

export const memberSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(11, "Valid Nigerian phone number required (min 11 digits)"),
  date_of_birth: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  faculty: z.string().min(1, "Faculty is required"),
  department: z.string().min(1, "Department is required"),
  matric_number: z.string().min(1, "Matric number is required"),
  academic_level: z.string().min(1, "Academic level is required"),
  organ: z.enum(ORGANS, { required_error: "Select an organ" }),
  society: z.string().optional().or(z.literal("")),
  parish: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type MemberFormValues = z.infer<typeof memberSchema>;
