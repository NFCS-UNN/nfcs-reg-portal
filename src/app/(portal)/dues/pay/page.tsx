"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, type PaymentFormValues } from "@/lib/validations/payment.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { initiatePayment } from "@/lib/actions/payment.actions";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { AlertCircle, CreditCard, ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

export default function PayDuesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: "5000",
      dues_type: "annual_dues",
      payment_period: "2024/2025 Session",
      notes: "",
    },
  });

  const onSubmit = async (values: PaymentFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await initiatePayment({
        amount: parseFloat(values.amount),
        dues_type: values.dues_type,
        payment_period: values.payment_period,
        notes: values.notes,
      });

      if (response?.error) {
        setError(response.error);
        toast({
          title: "Payment Error",
          description: response.error,
          variant: "error",
        });
      } else if (response?.reference) {
        toast({
          title: "Order Initiated",
          description: "Forwarding you to the secure checkout sandbox...",
          variant: "info",
        });
        router.push(`/dues/pay/checkout?ref=${response.reference}`);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1 select-none">
        <Link
          href="/dues"
          className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-brand-accent mb-2 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to My Dues
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          Pay Levies & Dues
        </h1>
        <p className="text-xs text-text-secondary">
          Initiate secure online card/bank transfer dues payments.
        </p>
      </div>

      {/* Card Wrapper */}
      <Card className="max-w-[560px] mx-auto border border-neutrals-borderLight shadow-card bg-white">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-status-errorBackground p-3 text-xs font-semibold text-status-errorText border border-status-errorBorder animate-in fade-in-50">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Dues Levy Type</label>
              <Select error={!!errors.dues_type} {...register("dues_type")} disabled={isLoading}>
                <option value="annual_dues">Annual Dues (Student/Alumnus)</option>
                <option value="membership_levy">Membership Registrations Levy</option>
                <option value="special_levy">Special Levy / Donations</option>
                <option value="other">Other Payments</option>
              </Select>
              {errors.dues_type && <p className="text-[11px] text-danger mt-1">{errors.dues_type.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Amount to Pay (₦)</label>
              <Input error={!!errors.amount} {...register("amount")} placeholder="5000" disabled={isLoading} />
              {errors.amount && <p className="text-[11px] text-danger mt-1">{errors.amount.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Academic Session / Period</label>
              <Input error={!!errors.payment_period} {...register("payment_period")} placeholder="2024/2025 Session" disabled={isLoading} />
              {errors.payment_period && <p className="text-[11px] text-danger mt-1">{errors.payment_period.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Payment Description Notes (Optional)</label>
              <Input {...register("notes")} placeholder="e.g. Annual dues payment for 2024/2025 academic session" disabled={isLoading} />
            </div>

            <Button type="submit" variant="primary" className="w-full gap-2 font-semibold h-11" isLoading={isLoading}>
              <CreditCard className="h-4 w-4" /> Proceed to Secure Checkout
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
