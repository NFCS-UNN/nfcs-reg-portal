import { Resend } from "resend";
import * as React from "react";

// Check if Resend keys are present
const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM_EMAIL || "noreply@nfcs-unn.org";

const hasResend = resendApiKey && resendApiKey.startsWith("re_");
const resend = hasResend ? new Resend(resendApiKey) : null;

interface EmailPayload {
  to: string;
  subject: string;
  react: React.ReactElement;
  htmlText?: string; // Optional raw fallback text
}

export async function sendEmail({ to, subject, react, htmlText }: EmailPayload) {
  if (hasResend && resend) {
    try {
      const response = await resend.emails.send({
        from: `NFCS UNN <${resendFrom}>`,
        to,
        subject,
        react,
      });
      return { success: true, messageId: response.data?.id };
    } catch (err: any) {
      console.error("Resend API error:", err);
      // Fall through to mock logger
    }
  }

  // Fallback Mock Email sending
  console.log("==================================================");
  console.log(`[MOCK EMAIL SENT]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`From: NFCS UNN <${resendFrom}>`);
  console.log("==================================================");

  // We can write to local logs in scratch or console
  return { success: true, mock: true };
}
