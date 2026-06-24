"use server";

import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ManualPaymentFormValues } from "@/lib/validations/payment.schema";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import DuesReceipt from "../../../emails/DuesReceipt";
import * as React from "react";

export async function initiatePayment(values: {
  amount: number;
  dues_type: any;
  payment_period: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required" };
  }

  const payment_reference = `NFCS-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;

  try {
    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        profile_id: user.id,
        amount: values.amount,
        dues_type: values.dues_type,
        channel: "online",
        status: "pending",
        payment_reference,
        gateway: "mock_gateway",
        payment_period: values.payment_period,
        notes: values.notes || null,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { success: true, reference: payment_reference };
  } catch (err: any) {
    return { error: err?.message || "Failed to initiate payment" };
  }
}

export async function confirmMockPayment(reference: string) {
  try {
    const { data: payment, error: findError } = await adminClient
      .from("payments")
      .select("*")
      .eq("payment_reference", reference)
      .single();

    if (findError || !payment) {
      return { error: "Payment record not found" };
    }

    const { error: updateError } = await adminClient
      .from("payments")
      .update({
        status: "confirmed",
        payment_date: new Date().toISOString().split("T")[0],
      })
      .eq("payment_reference", reference);

    if (updateError) {
      return { error: updateError.message };
    }

    // Write audit log
    await adminClient.from("audit_log").insert({
      actor_id: payment.profile_id || payment.recorded_by,
      action: "payment_confirmed",
      target_type: "payment",
      target_id: payment.id,
      metadata: {
        reference,
        amount: payment.amount,
      },
    });

    // Send DuesReceipt email
    try {
      let email = "";
      let fullName = "";
      if (payment.profile_id) {
        const { data: profile } = await adminClient
          .from("profiles")
          .select("email, full_name")
          .eq("id", payment.profile_id)
          .single();
        if (profile) {
          email = profile.email;
          fullName = profile.full_name;
        }
      } else if (payment.legacy_member_id) {
        const { data: legacy } = await adminClient
          .from("legacy_members")
          .select("email, full_name")
          .eq("id", payment.legacy_member_id)
          .single();
        if (legacy) {
          email = legacy.email || "";
          fullName = legacy.full_name;
        }
      }

      if (email) {
        await sendEmail({
          to: email,
          subject: `NFCS Payment Receipt: ${reference}`,
          react: (
            <DuesReceipt
              fullName={fullName}
              reference={reference}
              amount={payment.amount}
              duesType={payment.dues_type}
              period={payment.payment_period || ""}
              datePaid={new Date().toLocaleDateString()}
            />
          ),
        });
      }
    } catch (emailErr) {
      console.error("Failed to send dues receipt email:", emailErr);
    }

    revalidatePath("/dues");
    revalidatePath("/admin/dues");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Failed to confirm payment" };
  }
}

export async function failMockPayment(reference: string) {
  try {
    const { error } = await adminClient
      .from("payments")
      .update({
        status: "failed",
      })
      .eq("payment_reference", reference);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dues");
    revalidatePath("/admin/dues");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Failed to fail payment" };
  }
}

export async function recordManualPayment(values: ManualPaymentFormValues, excoId: string) {
  try {
    // Check if target is a legacy member or profile
    const supabase = await createClient();
    
    // Check in profiles first
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", values.member_id)
      .single();

    let profile_id = null;
    let legacy_member_id = null;
    let email = "";
    let fullName = "";

    if (profile) {
      profile_id = values.member_id;
      email = profile.email;
      fullName = profile.full_name;
    } else {
      const { data: legacy } = await adminClient
        .from("legacy_members")
        .select("id, email, full_name")
        .eq("id", values.member_id)
        .single();
      if (legacy) {
        legacy_member_id = values.member_id;
        email = legacy.email || "";
        fullName = legacy.full_name;
      }
    }

    const { data: payment, error } = await adminClient
      .from("payments")
      .insert({
        profile_id,
        legacy_member_id,
        amount: parseFloat(values.amount),
        dues_type: values.dues_type,
        channel: "manual",
        status: "confirmed",
        payment_period: values.payment_period,
        payment_reference: `MAN-${crypto.randomUUID().substring(0, 8).toUpperCase()}`,
        recorded_by: excoId,
        receipt_number: values.receipt_number,
        payment_date: values.payment_date,
        notes: values.notes || null,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Write audit log
    await adminClient.from("audit_log").insert({
      actor_id: excoId,
      action: "record_manual_payment",
      target_type: "payment",
      target_id: payment.id,
      metadata: {
        member_id: values.member_id,
        amount: values.amount,
      },
    });

    // Send DuesReceipt email
    try {
      if (email) {
        await sendEmail({
          to: email,
          subject: `NFCS Payment Receipt: ${payment.payment_reference}`,
          react: (
            <DuesReceipt
              fullName={fullName}
              reference={payment.payment_reference}
              amount={payment.amount}
              duesType={payment.dues_type}
              period={payment.payment_period || ""}
              datePaid={payment.payment_date || new Date().toLocaleDateString()}
            />
          ),
        });
      }
    } catch (emailErr) {
      console.error("Failed to send dues receipt email:", emailErr);
    }

    revalidatePath("/dues");
    revalidatePath("/admin/dues");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Failed to record manual payment" };
  }
}
