import { z } from "zod";

export const DUES_TYPES = ["membership_levy", "annual_dues", "special_levy", "other"] as const;

export const paymentSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  dues_type: z.enum(DUES_TYPES, { required_error: "Please select a dues type" }),
  payment_period: z.string().min(4, "Session label is required (e.g. 2024/2025 Session)"),
  notes: z.string().optional().or(z.literal("")),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const manualPaymentSchema = paymentSchema.extend({
  member_id: z.string().min(1, "Please select a member"),
  receipt_number: z.string().min(1, "Receipt number is required"),
  payment_date: z.string().min(1, "Payment date is required"),
});

export type ManualPaymentFormValues = z.infer<typeof manualPaymentSchema>;
