import * as crypto from "crypto";

/**
 * Generates HMAC-SHA512 signature for OPay API server-to-server requests.
 * Sorts all request payload keys alphabetically, stringifies the JSON,
 * and signs it with the secret private key.
 */
export function generateOPaySignature(
  payload: Record<string, unknown>,
  secretKey: string,
): string {
  const sortedPayload: Record<string, unknown> = {};
  Object.keys(payload)
    .sort()
    .forEach((key) => {
      sortedPayload[key] = payload[key];
    });

  const payloadString = JSON.stringify(sortedPayload);
  return crypto
    .createHmac("sha512", secretKey)
    .update(payloadString)
    .digest("hex");
}

/**
 * Verifies OPay callback notifications.
 * Signature is computed by signing (RequestTimestamp + rawRequestBody) with the Secret Key.
 */
export function verifyOPayWebhookSignature(
  timestamp: string,
  rawBody: string,
  signature: string,
  secretKey: string,
): boolean {
  const calculated = crypto
    .createHmac("sha512", secretKey)
    .update(timestamp + rawBody)
    .digest("hex");
  return calculated === signature;
}

export interface OPayOrderParams {
  reference: string;
  amount: number; // in local currency (we'll multiply by 100 internally to convert to lowest unit e.g. kobo/piastres)
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
}

type OPayApiResponse = {
  code?: string;
  message?: string;
  data?: Record<string, unknown>;
};

type OPayOrderResponse = Record<string, unknown> & {
  cashierUrl: string;
  orderNo?: string;
};

function readEnv(name: string) {
  return process.env[name]?.trim();
}

function readBaseUrl(name: string, fallback?: string) {
  return (readEnv(name) || fallback || "").replace(/\/$/, "");
}

function isPlaceholderValue(value?: string) {
  return (
    !value ||
    value.toLowerCase().includes("placeholder") ||
    value.toLowerCase().includes("your-") ||
    value.startsWith("OPAYxxx")
  );
}

function assertUsableCredential(value: string | undefined, label: string): asserts value is string {
  if (isPlaceholderValue(value)) {
    throw missingCredentialsError(label);
  }
}

function summarizeEnvValue(name: string, value?: string) {
  return {
    name,
    present: Boolean(value),
    usable: !isPlaceholderValue(value),
    length: value?.length || 0,
    last4: value ? value.slice(-4) : null,
  };
}

export function getOPayEnvironmentDiagnostics() {
  const secretKey = getOPaySecretKey();

  return {
    baseUrl: readBaseUrl("OPAY_BASE_URL", "https://testapi.opaycheckout.com"),
    country: readEnv("OPAY_COUNTRY") || "NG",
    currency: readEnv("OPAY_CURRENCY") || "NGN",
    appUrl: readBaseUrl("NEXT_PUBLIC_APP_URL") || null,
    merchantId: summarizeEnvValue("OPAY_MERCHANT_ID", readEnv("OPAY_MERCHANT_ID")),
    publicKey: summarizeEnvValue("OPAY_PUBLIC_KEY", readEnv("OPAY_PUBLIC_KEY")),
    secretKey: summarizeEnvValue("OPAY_SECRET_KEY", readEnv("OPAY_SECRET_KEY")),
    privateKey: summarizeEnvValue("OPAY_PRIVATE_KEY", readEnv("OPAY_PRIVATE_KEY")),
    activeServerSecret: summarizeEnvValue("OPAY_SECRET_KEY/OPAY_PRIVATE_KEY", secretKey),
  };
}

function missingCredentialsError(requiredLabel: string) {
  const diagnostics = getOPayEnvironmentDiagnostics();
  console.error("OPay credentials are not usable", diagnostics);

  return new Error(
    `Missing OPay credentials (${requiredLabel}). Runtime check: ` +
      `merchantId=${diagnostics.merchantId.usable ? "ok" : "missing"}, ` +
      `publicKey=${diagnostics.publicKey.usable ? "ok" : "missing"}, ` +
      `secretKey=${diagnostics.activeServerSecret.usable ? "ok" : "missing"}.`,
  );
}

export function getOPaySecretKey() {
  return readEnv("OPAY_PRIVATE_KEY") || readEnv("OPAY_SECRET_KEY");
}

async function readOPayResponse(response: Response): Promise<OPayApiResponse> {
  const bodyText = await response.text();

  try {
    return JSON.parse(bodyText) as OPayApiResponse;
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

/**
 * Calls OPay /cashier/create to initialize a cashier checkout session.
 */
export async function createOPayOrder(params: OPayOrderParams): Promise<OPayOrderResponse> {
  const baseUrl =
    readBaseUrl("OPAY_BASE_URL", "https://testapi.opaycheckout.com");
  const appUrl = readBaseUrl("NEXT_PUBLIC_APP_URL");
  const merchantId = readEnv("OPAY_MERCHANT_ID");
  const publicKey = readEnv("OPAY_PUBLIC_KEY");
  const country = readEnv("OPAY_COUNTRY") || "NG";
  const currency = readEnv("OPAY_CURRENCY") || "NGN";

  assertUsableCredential(merchantId, "Merchant ID");
  assertUsableCredential(publicKey, "Public Key");

  if (!appUrl) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL. OPay needs this for returnUrl and callbackUrl.");
  }

  // OPay amount total is in the lowest currency unit (kobo/piastres).
  const totalAmountLowestUnit = Math.round(params.amount * 100);

  // Format phone number to remove '+' for OPay compatibility
  const formattedPhone = params.customerPhone
    ? params.customerPhone.replace("+", "").trim()
    : "2348000000000";

  const payload = {
    country,
    reference: params.reference,
    amount: {
      total: totalAmountLowestUnit,
      currency: params.currency || currency,
    },
    returnUrl: `${appUrl}/dues/pay/checkout?ref=${params.reference}&opay_return=1`,
    callbackUrl: `${appUrl}/api/payment/callback`,
    userInfo: {
      userName: params.customerName || "Student",
      userEmail: params.customerEmail || "student@nfcs-unn.org",
      userMobile: formattedPhone,
    },
    productList: [
      {
        productId: params.reference,
        name: params.notes || "NFCS Dues Payment",
        description: params.notes || "NFCS Dues Payment",
        price: totalAmountLowestUnit,
        quantity: 1,
      },
    ],
  };

  const response = await fetch(
    `${baseUrl}/api/v1/international/cashier/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicKey}`,
        MerchantId: merchantId,
      },
      body: JSON.stringify(payload),
    },
  );

  const responseData = await readOPayResponse(response);

  if (!response.ok || responseData.code !== "00000") {
    throw new Error(
      responseData.message ||
        `Failed to create OPay order (Code ${responseData.code})`,
    );
  }

  const data = responseData.data || {};
  const cashierUrl =
    data.cashierUrl || data.paymentUrl || data.checkoutUrl || data.url;

  if (!cashierUrl) {
    throw new Error("OPay did not return a checkout URL for this transaction");
  }

  return {
    ...data,
    cashierUrl: String(cashierUrl),
  }; // contains cashierUrl, orderNo, reference, orderStatus
}

/**
 * Queries OPay payment status to confirm transaction finality.
 */
export async function queryOPayStatus(reference: string) {
  const baseUrl =
    readBaseUrl("OPAY_BASE_URL", "https://testapi.opaycheckout.com");
  const merchantId = readEnv("OPAY_MERCHANT_ID");
  const secretKey = getOPaySecretKey();
  const country = readEnv("OPAY_COUNTRY") || "NG";

  assertUsableCredential(merchantId, "Merchant ID");
  assertUsableCredential(secretKey, "OPAY_SECRET_KEY/OPAY_PRIVATE_KEY");

  const payload = {
    reference,
    country: country,
  };

  const signature = generateOPaySignature(payload, secretKey);

  const response = await fetch(
    `${baseUrl}/api/v1/international/cashier/status`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${signature}`,
        MerchantId: merchantId,
      },
      body: JSON.stringify(payload),
    },
  );

  const responseData = await readOPayResponse(response);

  if (!response.ok || responseData.code !== "00000") {
    throw new Error(
      responseData.message ||
        `Failed to query OPay status (Code ${responseData.code})`,
    );
  }

  return responseData.data; // contains reference, status, orderNo, amount, etc.
}
