import crypto from "crypto";

type OpayInitializeInput = {
  amount: number;
  email: string;
  reference: string;
  returnUrl?: string;
  callbackUrl?: string;
  customerName?: string;
  customerPhone?: string;
};

type OpayInitializeResult =
  | {
      success: true;
      cashierUrl: string;
      raw: unknown;
    }
  | {
      success: false;
      error: string;
      raw?: unknown;
    };

type OpayCreateResponse = {
  code?: string;
  message?: string;
  data?: {
    cashierUrl?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

async function readOpayJson(response: Response): Promise<OpayCreateResponse | null> {
  const bodyText = await response.text();

  try {
    return JSON.parse(bodyText) as OpayCreateResponse;
  } catch {
    const preview = bodyText.replace(/\s+/g, " ").trim().slice(0, 180);
    return {
      code: String(response.status),
      message: preview
        ? `OPay returned a non-JSON response: ${preview}`
        : `OPay returned an empty non-JSON response with HTTP ${response.status}`,
    };
  }
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requireOpaySecretKey() {
  const value = process.env.OPAY_PRIVATE_KEY || process.env.OPAY_SECRET_KEY;
  if (!value) {
    throw new Error("Missing required environment variable: OPAY_SECRET_KEY or OPAY_PRIVATE_KEY");
  }

  return value;
}

function toKobo(amountInNaira: number) {
  if (!Number.isFinite(amountInNaira) || amountInNaira <= 0) {
    throw new Error("Amount must be a positive number");
  }

  return Math.round(amountInNaira * 100);
}

function timingSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export class OpayNigeriaService {
  private readonly baseUrl: string;
  private readonly merchantId: string;
  private readonly publicKey: string;
  private readonly secretKey: string;

  constructor() {
    this.baseUrl = requireEnv("OPAY_BASE_URL").replace(/\/$/, "");
    this.merchantId = requireEnv("OPAY_MERCHANT_ID");
    this.publicKey = requireEnv("OPAY_PUBLIC_KEY");
    this.secretKey = requireOpaySecretKey();
  }

  async initializePayment(input: OpayInitializeInput): Promise<OpayInitializeResult> {
    try {
      const amountInKobo = toKobo(input.amount);

      const payload = {
        country: "NG",
        reference: input.reference,
        amount: {
          total: amountInKobo,
          currency: "NGN",
        },
        returnUrl: input.returnUrl,
        callbackUrl: input.callbackUrl,
        userInfo: {
          userEmail: input.email,
          userName: input.customerName || input.email,
          userMobile: input.customerPhone,
        },
      };

      const response = await fetch(`${this.baseUrl}/api/v1/international/cashier/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.publicKey}`,
          MerchantId: this.merchantId,
        },
        body: JSON.stringify(payload),
      });

      const raw = await readOpayJson(response);

      if (!response.ok || raw?.code !== "00000" || !raw?.data?.cashierUrl) {
        return {
          success: false,
          error: raw?.message || `OPay initialization failed with HTTP ${response.status}`,
          raw,
        };
      }

      return {
        success: true,
        cashierUrl: raw.data.cashierUrl,
        raw,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to initialize OPay payment",
      };
    }
  }

  verifyWebhookSignature(rawBody: string, signature: string | null, timestamp: string | null) {
    if (!signature || !timestamp) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha512", this.secretKey)
      .update(timestamp + rawBody)
      .digest("hex");

    return timingSafeEqual(expectedSignature, signature);
  }
}
