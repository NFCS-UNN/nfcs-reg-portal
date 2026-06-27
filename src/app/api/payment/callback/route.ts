import { NextResponse } from "next/server";
import { getOPaySecretKey, verifyOPayWebhookSignature, queryOPayStatus } from "@/lib/opay";
import { confirmOnlinePayment, failOnlinePayment } from "@/lib/actions/payment.actions";

export async function POST(req: Request) {
  try {
    // 1. Get raw request body and headers
    const signature = req.headers.get("Signature") || req.headers.get("signature");
    const timestamp = req.headers.get("RequestTimestamp") || req.headers.get("requesttimestamp");
    const rawBody = await req.text();

    if (!rawBody) {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    // 2. Validate webhook signature
    const secretKey = getOPaySecretKey();
    const isMock =
      !secretKey ||
      secretKey.includes("placeholder") ||
      secretKey.startsWith("OPAYxxx");

    let isSignatureValid = false;
    if (isMock) {
      console.warn("OPay Private Key is placeholder or missing. Skipping signature validation.");
      isSignatureValid = true;
    } else if (signature && timestamp) {
      isSignatureValid = verifyOPayWebhookSignature(timestamp, rawBody, signature, secretKey);
    }

    if (!isSignatureValid) {
      console.error("OPay webhook signature verification failed.");
      return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
    }

    // 3. Process the notification payload
    const reference = payload.data?.outOrderNo || payload.data?.reference;
    if (!reference) {
      console.error("No transaction reference found in callback payload.");
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // 4. Perform direct status query from OPay API to guarantee finality (per security recommendation)
    let finalStatus = payload.data?.status;
    let gatewayResponse = payload;

    if (!isMock) {
      try {
        const queryResult = await queryOPayStatus(reference);
        finalStatus =
          queryResult?.status ||
          queryResult?.orderStatus ||
          queryResult?.transactionStatus ||
          queryResult?.paymentStatus;
        gatewayResponse = queryResult;
      } catch (queryErr: unknown) {
        console.error(
          `Failed to query OPay status for reference ${reference}:`,
          queryErr instanceof Error ? queryErr.message : "Unknown error",
        );
        // Fall back to callback payload status if query fails but signature is valid
      }
    }

    // 5. Update database and send confirmation emails
    if (finalStatus === "SUCCESS") {
      const confirmResult = await confirmOnlinePayment(reference, gatewayResponse);
      if (confirmResult.error) {
        console.error(`Error confirming payment ${reference}:`, confirmResult.error);
        return NextResponse.json({ error: confirmResult.error }, { status: 500 });
      }
      console.log(`Payment reference ${reference} confirmed successfully via OPay webhook.`);
    } else if (finalStatus === "FAIL" || finalStatus === "CLOSE") {
      const failResult = await failOnlinePayment(reference, gatewayResponse);
      if (failResult.error) {
        console.error(`Error marking payment ${reference} as failed:`, failResult.error);
        return NextResponse.json({ error: failResult.error }, { status: 500 });
      }
      console.log(`Payment reference ${reference} marked as failed via OPay webhook.`);
    } else {
      console.log(`Unhandled payment status ${finalStatus} for reference ${reference}.`);
    }

    // Return the response format OPay expects (code 00000 / SUCCESS)
    return NextResponse.json({
      code: "00000",
      message: "SUCCESS",
    });
  } catch (err: unknown) {
    console.error("Error processing OPay callback webhook:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
