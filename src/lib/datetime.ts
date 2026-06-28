/** Japan Standard Time (UTC+9) — used for all user-visible dates/times */
export const JST_TIMEZONE = "Asia/Tokyo";

type DateInput = string | number | Date;

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse timestamps from DB, Supabase Realtime, or APIs.
 * Strings without a timezone are treated as UTC (Postgres / Supabase default).
 */
export function parseTimestamp(input: DateInput): Date {
  if (input instanceof Date) return input;
  if (typeof input === "number") return new Date(input);

  const s = input.trim();
  if (!s) return new Date(NaN);
  if (ISO_DATE_ONLY.test(s)) return parseDateOnlyJST(s);
  if (/[zZ]$/.test(s) || /[+-]\d{2}:\d{2}$/.test(s)) return new Date(s);

  const normalized = s.includes("T") ? s : s.replace(" ", "T");
  return new Date(`${normalized}Z`);
}

function toDate(input: DateInput): Date {
  return parseTimestamp(input);
}

function isValidDate(d: Date): boolean {
  return !Number.isNaN(d.getTime());
}

const DATE_OPTS: Intl.DateTimeFormatOptions = {
  timeZone: JST_TIMEZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
};

const DATETIME_OPTS: Intl.DateTimeFormatOptions = {
  timeZone: JST_TIMEZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

const TIME_OPTS: Intl.DateTimeFormatOptions = {
  timeZone: JST_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
};

/** e.g. 2026/6/26 */
export function formatDateJST(input: DateInput, fallback = "—"): string {
  const d = toDate(input);
  if (!isValidDate(d)) return fallback;
  return d.toLocaleDateString("ja-JP", DATE_OPTS);
}

/** e.g. 2026/6/26 15:30 */
export function formatDateTimeJST(input: DateInput, fallback = "—"): string {
  const d = toDate(input);
  if (!isValidDate(d)) return fallback;
  return d.toLocaleString("ja-JP", DATETIME_OPTS);
}

/** e.g. 15:30 */
export function formatTimeJST(input: DateInput, fallback = "—"): string {
  const d = toDate(input);
  if (!isValidDate(d)) return fallback;
  return d.toLocaleTimeString("ja-JP", TIME_OPTS);
}

/** e.g. 2026-06-28 17:56:00 (JST) */
export function formatDateTimeFullJST(input: DateInput, fallback = "—"): string {
  const d = toDate(input);
  if (!isValidDate(d)) return fallback;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: JST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(d);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  let hour = get("hour");
  if (hour === "24") hour = "00";

  return `${get("year")}-${get("month")}-${get("day")} ${hour}:${get("minute")}:${get("second")}`;
}

/** YYYY-MM-DD in JST (for job posted dates, etc.) */
export function formatDateISOJST(input: DateInput): string {
  const d = toDate(input);
  if (!isValidDate(d)) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Current calendar year in JST */
export function getYearJST(): number {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone: JST_TIMEZONE, year: "numeric" }).format(new Date())
  );
}

/** ISO 8601 with explicit +09:00 offset when serializing for APIs / client */
export function toISOStringJST(input: DateInput = new Date()): string {
  const d = toDate(input);
  if (!isValidDate(d)) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: JST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(d);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  let hour = get("hour");
  if (hour === "24") hour = "00";

  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}:${get("second")}+09:00`;
}

/** Normalize any DB / Realtime timestamp string to JST ISO for the client */
export function serializeTimestamp(input: DateInput): string {
  return toISOStringJST(input);
}

/** Current instant serialized as JST (+09:00) */
export function nowISOStringJST(): string {
  return toISOStringJST(new Date());
}

/** Parse YYYY-MM-DD as midnight JST (for seeds / date-only fields) */
export function parseDateOnlyJST(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00+09:00`);
}

/** Use for Prisma `DateTime` writes — always the current instant (stored as UTC in timestamptz). */
export function now(): Date {
  return new Date();
}
