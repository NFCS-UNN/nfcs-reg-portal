import { z } from "zod";

export const ORGANS = [
  "gospel_band",
  "evangelical_committee",
  "federation_theater",
  "social_communications_commission",
  "discipline_committee",
] as const;

const currentYear = new Date().getFullYear();

export const matricSchema = z.string()
  .refine(
    (val) => {
      const regex = /^(\d{4})\/(\d{6})$/;
      const match = val.match(regex);
      if (!match) return false;
      const year = parseInt(match[1], 10);
      return year >= 1960 && year <= currentYear;
    },
    {
      message: `Matric number must be in format YYYY/DDDDDD (e.g. 2021/123456) with year between 1960 and ${currentYear}`,
    }
  );

export const phoneSchema = z.string()
  .refine(
    (val) => {
      const regex = /^(?:\+234|234|0)[789]\d{9}$/;
      return regex.test(val);
    },
    {
      message: "Please enter a valid Nigerian phone number (e.g. 08031234567 or +2348031234567)",
    }
  );

export const memberSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: phoneSchema,
  date_of_birth: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  faculty: z.string().min(1, "Faculty is required"),
  department: z.string().min(1, "Department is required"),
  matric_number: matricSchema,
  academic_level: z.string().min(1, "Academic level is required"),
  organ: z.enum(ORGANS, { message: "Select an organ" }),
  society: z.string().optional().or(z.literal("")),
  parish: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type MemberFormValues = z.infer<typeof memberSchema>;

export const signupSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  matric_number: matricSchema,
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

