"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmMockPayment, failMockPayment, getPaymentByReference } from "@/lib/actions/payment.actions";
import {
  expireStaleOPayCheckout,
  resumeOPayCheckout,
  syncOPayPaymentStatus,
} from "@/lib/actions/opay.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ShieldCheck, Loader2, Sparkles, XCircle, AlertTriangle } from "lucide-react";

type CheckoutPayment = {
  id: string;
  payment_reference: string;
  dues_type: string;
  payment_period: string | null;
  amount: string;
  status: string;
  profile_id: string;
  gateway: string | null;
  opay_cashier_url: string | null;
  mock_checkout_enabled?: boolean;
  full_name?: string | null;
};

function MockCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const ref = searchParams.get("ref");

  const [isLoading, setIsLoading] = React.useState(true);
  const [payment, setPayment] = React.useState<CheckoutPayment | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [opayContinueUrl, setOpayContinueUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadPayment() {
      if (!ref) {
        setError("Missing transaction reference.");
        setIsLoading(false);
        return;
      }

      try {
        // Use the server action (adminClient) to avoid RLS join issues
        const result = await getPaymentByReference(ref);
        if (result.error || !result.payment) {
          setError(result.error || "Payment transaction not found.");
          setIsLoading(false);
        } else {
          const p = result.payment;
          setPayment(p as unknown as CheckoutPayment);

          if (p.status === "confirmed") {
            router.push(`/dues/receipt/${p.id}`);
            return;
          }

          if (p.gateway === "opay") {
            const syncResult = await syncOPayPaymentStatus(p.payment_reference || ref);

            if (syncResult.success && syncResult.status === "confirmed") {
              router.push(`/dues/receipt/${syncResult.paymentId || p.id}`);
              return;
            }

            if (syncResult.success && syncResult.status === "failed") {
              setError("OPay marked this transaction as failed. Please start a fresh payment.");
              setIsLoading(false);
              return;
            }

            if (syncResult.error) {
              setError(syncResult.error);
              setIsLoading(false);
              return;
            }

            const expireResult = await expireStaleOPayCheckout(p.payment_reference || ref);
            if (expireResult.error) {
              setError(expireResult.error);
              setIsLoading(false);
              return;
            }

            if (expireResult.expired) {
              setError("This OPay checkout session has expired. The payment has been marked as failed. Please create a new payment.");
              setIsLoading(false);
              return;
            }

            if (p.opay_cashier_url) {
              setOpayContinueUrl(p.opay_cashier_url);
              setIsLoading(false);
              return;
            }

            const resumeResult = await resumeOPayCheckout(p.payment_reference || ref);
            if (resumeResult.success && resumeResult.cashierUrl) {
              setOpayContinueUrl(resumeResult.cashierUrl);
              setIsLoading(false);
            } else {
              setError(resumeResult.error || "OPay checkout link could not be recreated. Please start a fresh payment.");
              setIsLoading(false);
            }
          } else if (p.gateway === "mock_gateway" && p.mock_checkout_enabled) {
            setIsLoading(false);
          } else if (p.gateway === "mock_gateway") {
            setError("This old sandbox transaction can no longer be completed. Please start a fresh OPay payment.");
            setIsLoading(false);
          } else {
            setError("This transaction cannot be completed from the sandbox checkout.");
            setIsLoading(false);
          }
        }
      } catch {
        setError("Failed to load transaction details.");
        setIsLoading(false);
      }
    }
    loadPayment();
  }, [ref, router]);

  const handleSuccess = async () => {
    if (!ref) return;
    setIsSubmitting(true);
    try {
      const response = await confirmMockPayment(ref);
      if (response?.error) {
        toast({
          title: "Simulation Error",
          description: response.error,
          variant: "error",
        });
      } else {
        toast({
          title: "Payment Confirmed",
          description: "Online payment mock confirmed successfully!",
          variant: "success",
        });
        router.push("/dues");
      }
    } catch {
      toast({
        title: "Simulation Error",
        description: "Failed to simulate payment.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFailure = async () => {
    if (!ref) return;
    setIsSubmitting(true);
    try {
      const response = await failMockPayment(ref);
      if (response?.error) {
        toast({
          title: "Simulation Error",
          description: response.error,
          variant: "error",
        });
      } else {
        toast({
          title: "Payment Failed",
          description: "Online payment mock failed.",
          variant: "error",
        });
        router.push("/dues");
      }
    } catch {
      toast({
        title: "Simulation Error",
        description: "Failed to simulate payment.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 text-brand animate-spin" />
        <span className="text-xs text-text-secondary">Loading checkout gateway...</span>
      </div>
    );
  }

  if (error || !payment) {
    const retryHref = payment
      ? `/dues/pay?type=${payment.dues_type}&session=${encodeURIComponent(payment.payment_period || "")}`
      : null;

    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-center">
        <AlertTriangle className="h-10 w-10 text-danger" />
        <h3 className="text-sm font-bold text-text-primary">Checkout Error</h3>
        <p className="text-xs text-text-secondary max-w-xs">{error || "Payment not found."}</p>
        <div className="flex gap-2">
          {retryHref && (
            <Button onClick={() => router.push(retryHref)} variant="primary" size="sm">
              Retry Payment
            </Button>
          )}
          <Button onClick={() => router.push("/dues")} variant="secondary" size="sm">
            Return to Dues
          </Button>
        </div>
      </div>
    );
  }

  if (payment.gateway === "opay") {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-8 w-8 text-brand" />
        <h3 className="text-sm font-bold text-text-primary">Payment Still Processing</h3>
        <p className="text-xs text-text-secondary max-w-xs">
          We could not confirm this payment yet. If you have not completed checkout, continue with OPay.
        </p>
        <div className="flex gap-2">
          {opayContinueUrl && (
            <Button onClick={() => (window.location.href = opayContinueUrl)} variant="primary" size="sm">
              Continue to OPay
            </Button>
          )}
          <Button onClick={() => router.push("/dues")} variant="secondary" size="sm">
            Return to Dues
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[440px] mx-auto py-10">
      <Card className="border border-neutrals-borderLight shadow-modal bg-white overflow-hidden">
        {/* Header banner */}
        <div className="bg-[#091D0A] text-white p-6 relative select-none">
          <div className="absolute right-0 bottom-0 top-0 opacity-15 pointer-events-none flex items-center justify-center">
            <Sparkles className="h-24 w-24 text-white" />
          </div>
          <div className="z-10 flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#BBF7D0]">
              Monnify/OPay Mock Sandbox
            </span>
            <h2 className="text-lg font-bold">Secure Online Payment</h2>
            <p className="text-[11px] opacity-90">
              Transaction reference: <span className="font-mono">{payment.payment_reference}</span>
            </p>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Member & Amount Block */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-semibold border-b border-neutrals-borderLight pb-3">
              <span className="text-text-secondary">Payee</span>
              <span className="text-text-primary">{payment.full_name ?? "—"}</span>
            </div>

            <div className="flex justify-between items-center text-xs font-semibold border-b border-neutrals-borderLight pb-3">
              <span className="text-text-secondary">Dues Levy Type</span>
              <span className="text-text-primary capitalize">{payment.dues_type.replace(/_/g, " ")}</span>
            </div>

            <div className="flex justify-between items-center text-xs font-semibold border-b border-neutrals-borderLight pb-3">
              <span className="text-text-secondary">Session / Period</span>
              <span className="text-text-primary">{payment.payment_period}</span>
            </div>

            <div className="flex justify-between items-center p-4 rounded-xl bg-surface-subtle border border-neutrals-border">
              <span className="text-xs font-semibold text-text-secondary">Total Amount</span>
              <span className="text-lg font-bold text-brand-accent font-mono">
                ₦{parseFloat(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Sandbox Warning */}
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] rounded-lg leading-relaxed flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
            <span>
              This is a sandbox simulation page. No real money will be charged. Click below to simulate the bank response.
            </span>
          </div>

          {/* Mock Action triggers */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleSuccess}
              variant="primary"
              disabled={isSubmitting}
              className="w-full gap-2 font-semibold h-11"
            >
              <ShieldCheck className="h-4 w-4" /> Simulate Payment Success
            </Button>

            <Button
              onClick={handleFailure}
              variant="danger"
              disabled={isSubmitting}
              className="w-full gap-2 font-semibold h-11"
            >
              <XCircle className="h-4 w-4" /> Simulate Payment Failure
            </Button>

            <Button
              onClick={() => router.push("/dues")}
              variant="secondary"
              disabled={isSubmitting}
              className="w-full h-11 text-xs"
            >
              Cancel Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MockCheckoutPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-page">
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 text-brand animate-spin" />
          <span className="text-xs text-text-secondary">Loading checkout simulation...</span>
        </div>
      </div>
    }>
      <MockCheckoutContent />
    </React.Suspense>
  );
}
