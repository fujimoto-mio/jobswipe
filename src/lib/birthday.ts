import { formatDateISOJST, formatDateJST, getYearJST, parseDateOnlyJST } from "@/lib/datetime";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse YYYY-MM-DD (JST date-only) for DB storage. */
export function parseBirthday(value: string): Date | null {
  const trimmed = value.trim();
  if (!ISO_DATE_RE.test(trimmed)) return null;
  const d = parseDateOnlyJST(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  if (formatDateISOJST(d) !== trimmed) return null;
  return d;
}

export function splitBirthday(value: string | null | undefined): {
  year: string;
  month: string;
  day: string;
} {
  if (!value || !ISO_DATE_RE.test(value.trim())) {
    return { year: "", month: "", day: "" };
  }
  const [year, month, day] = value.split("-");
  return {
    year,
    month: String(Number(month)),
    day: String(Number(day)),
  };
}

/** Build YYYY-MM-DD when all parts are valid; otherwise empty string. */
export function composeBirthday(year: string, month: string, day: string): string {
  const y = year.trim();
  const m = month.trim();
  const d = day.trim();
  if (!y || !m || !d) return "";
  if (!/^\d{4}$/.test(y) || !/^\d{1,2}$/.test(m) || !/^\d{1,2}$/.test(d)) return "";
  const candidate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  return parseBirthday(candidate) ? candidate : "";
}

/** API / form value from a Date column. */
export function birthdayToInputValue(date: Date | string): string {
  return formatDateISOJST(date);
}

export function formatBirthdayDisplay(value: string | Date | null | undefined, fallback = "—"): string {
  if (!value) return fallback;
  return formatDateJST(value, fallback);
}

export function calculateAge(birthday: string | Date, asOf: Date = new Date()): number {
  const birth = typeof birthday === "string" ? parseBirthday(birthday) : birthday;
  if (!birth) return 0;

  const asOfYear = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
    }).format(asOf)
  );
  const birthYear = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
    }).format(birth)
  );
  let age = asOfYear - birthYear;

  const asOfMonthDay = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    month: "2-digit",
    day: "2-digit",
  }).format(asOf);
  const birthMonthDay = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    month: "2-digit",
    day: "2-digit",
  }).format(birth);

  if (birthMonthDay > asOfMonthDay) age -= 1;
  return age;
}

export function isValidBirthday(value: string): boolean {
  return parseBirthday(value) !== null;
}

export function isBirthdayInAgeRange(value: string, min = 18, max = 80): boolean {
  if (!isValidBirthday(value)) return false;
  const age = calculateAge(value);
  return age >= min && age <= max;
}

/** Latest allowed birthday for minimum age (e.g. 18+). */
export function maxBirthdayForMinAge(minAge = 18): string {
  return `${getYearJST() - minAge}-12-31`;
}

/** Earliest allowed birthday for maximum age. */
export function minBirthdayForMaxAge(maxAge = 80): string {
  return `${getYearJST() - maxAge}-01-01`;
}

export function birthdayYearOptions(minAge = 18, maxAge = 80): string[] {
  const current = getYearJST();
  const years: string[] = [];
  for (let y = current - minAge; y >= current - maxAge; y -= 1) {
    years.push(String(y));
  }
  return years;
}

export function birthdayMonthOptions(): string[] {
  return Array.from({ length: 12 }, (_, i) => String(i + 1));
}

export function birthdayDayOptions(year: string, month: string): string[] {
  const y = Number(year);
  const m = Number(month);
  if (!y || !m || m < 1 || m > 12) {
    return Array.from({ length: 31 }, (_, i) => String(i + 1));
  }
  const daysInMonth = new Date(y, m, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
}
