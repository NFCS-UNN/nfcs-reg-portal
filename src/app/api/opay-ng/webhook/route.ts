import { NextResponse } from "next/server";
import { OpayNigeriaService } from "@/lib/services/opay-nigeria.service";

function extractTransactionSummary(payload: unknown) {
  const body = payload as {
    data?: {
      reference?: string;
      outOrderNo?: string;
      status?: string;
      orderStatus?: string;
      amount?: unknown;
      currency?: string;
    };
    reference?: string;
    status?: string;
  };

  return {
    reference: body.data?.reference || body.data?.outOrderNo || body.reference || null,
    status: body.data?.status || body.data?.orderStatus || body.status || null,
    amount: body.data?.amount || null,
    currency: body.data?.currency || null,
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  try {
    const signature = request.headers.get("Signature") || request.headers.get("signature");
    const timestamp =
      request.headers.get("RequestTimestamp") || request.headers.get("requesttimestamp");

    const opay = new OpayNigeriaService();
    const isAuthentic = opay.verifyWebhookSignature(rawBody, signature, timestamp);

    if (!isAuthentic) {
      console.warn("[OPay Nigeria webhook] Rejected invalid signature");

      return NextResponse.json(
        {
          code: "40000",
          message: "Invalid signature",
        },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const transaction = extractTransactionSummary(payload);

    console.info("[OPay Nigeria webhook] Verified transaction event", {
      ...transaction,
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      code: "00000",
      message: "SUCCESS",
    });
  } catch (error) {
    console.error("[OPay Nigeria webhook] Failed to process event", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        code: "50000",
        message: "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}
