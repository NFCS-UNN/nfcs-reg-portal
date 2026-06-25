/**
 * Date formatting utilities for NFCS Portal
 */

/**
 * Returns a human-readable relative time string.
 * - Within 24 hours: "3 hours ago", "just now", etc.
 * - Older than 24 hours: formatted date like "June 23, 2026"
 */
export function formatTimeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Within the last minute
  if (diffSeconds < 60) return "just now";
  // Within the last hour
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  // Within the last 24 hours
  if (diffHours < 24) return `${diffHours}h ago`;
  // Yesterday
  if (diffDays === 1) return "Yesterday";
  // Within the last 7 days
  if (diffDays < 7) return `${diffDays} days ago`;

  // Older than 7 days — return formatted date
  return formatDate(dateStr);
}

/**
 * Returns a nicely formatted date string like "June 23, 2026"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Returns a short formatted date like "23 Jun 2026"
 */
export function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Groups an array of ISO date strings by month, returning counts per month.
 * Returns last N months including current month.
 */
export function groupByMonth(
  dates: (string | null | undefined)[],
  monthsBack = 6
): { month: string; count: number }[] {
  const now = new Date();
  const result: { month: string; count: number }[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-NG", { month: "short", year: "2-digit" });
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const count = dates.filter((date) => {
      if (!date) return false;
      const dd = new Date(date);
      const key = `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}`;
      return key === monthKey;
    }).length;
    result.push({ month: label, count });
  }

  return result;
}
