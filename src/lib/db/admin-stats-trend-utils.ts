import { formatDateISOJST, parseDateOnlyJST } from "@/lib/datetime";
import type { RegistrationTrendRange } from "@/lib/admin-registration-trend";

export function trendGranularity(days: RegistrationTrendRange): "day" | "week" {
  return days <= 30 ? "day" : "week";
}

export function startOfTrendWindow(days: RegistrationTrendRange): Date {
  const todayKey = formatDateISOJST(new Date());
  const start = parseDateOnlyJST(todayKey);
  start.setTime(start.getTime() - (days - 1) * 86400000);
  return start;
}

export function bucketLabel(key: string, granularity: "day" | "week"): string {
  const date = parseDateOnlyJST(key);
  const label = date.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
  });
  return granularity === "week" ? `${label}〜` : label;
}

function weekStartKey(date: Date): string {
  const d = parseDateOnlyJST(formatDateISOJST(date));
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
  }).format(d);
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  const offset = weekdayIndex === 0 ? 6 : weekdayIndex - 1;
  d.setTime(d.getTime() - offset * 86400000);
  return formatDateISOJST(d);
}

function eachDay(from: Date, to: Date): string[] {
  const keys: string[] = [];
  let key = formatDateISOJST(from);
  const endKey = formatDateISOJST(to);

  while (key <= endKey) {
    keys.push(key);
    const next = parseDateOnlyJST(key);
    next.setTime(next.getTime() + 86400000);
    key = formatDateISOJST(next);
  }

  return keys;
}

function eachWeek(from: Date, to: Date): string[] {
  const keys: string[] = [];
  let key = weekStartKey(from);
  const endKey = weekStartKey(to);

  while (key <= endKey) {
    keys.push(key);
    const next = parseDateOnlyJST(key);
    next.setTime(next.getTime() + 7 * 86400000);
    key = formatDateISOJST(next);
  }

  return keys;
}

export function buildTrendBucketKeys(days: RegistrationTrendRange): {
  from: Date;
  granularity: "day" | "week";
  keys: string[];
} {
  const from = startOfTrendWindow(days);
  const granularity = trendGranularity(days);
  const keys = granularity === "day" ? eachDay(from, new Date()) : eachWeek(from, new Date());
  return { from, granularity, keys };
}
