export function stripMoneyFormatting(value: string) {
  return value.replace(/,/g, "").trim();
}

export function sanitizeMoneyInput(value: string) {
  const stripped = stripMoneyFormatting(value);
  const digitsAndDot = stripped.replace(/[^\d.]/g, "");
  const [whole = "", ...decimalParts] = digitsAndDot.split(".");
  const decimal = decimalParts.join("").slice(0, 2);

  if (!decimalParts.length) {
    return whole;
  }

  return `${whole}.${decimal}`;
}

export function formatAmountInput(value: string) {
  const sanitized = sanitizeMoneyInput(value);

  if (!sanitized) {
    return "";
  }

  const [whole, decimal] = sanitized.split(".");
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimal !== undefined ? `${formattedWhole}.${decimal}` : formattedWhole;
}

export function parseMoneyAmount(value: string | number) {
  const normalized =
    typeof value === "number" ? String(value) : stripMoneyFormatting(value);
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : NaN;
}

export function isValidMoneyAmount(value: string | number) {
  const normalized =
    typeof value === "number" ? String(value) : stripMoneyFormatting(value);

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return false;
  }

  return parseMoneyAmount(normalized) > 0;
}

export function formatNumberWithCommas(value: string | number) {
  const amount = parseMoneyAmount(value);

  if (!Number.isFinite(amount)) {
    return "0";
  }

  return amount.toLocaleString("en-NG", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function formatNaira(value: string | number) {
  return `₦${formatNumberWithCommas(value)}`;
}
