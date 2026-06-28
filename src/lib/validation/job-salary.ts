import {
  JOB_SALARY_MAX_OPTIONS,
  JOB_SALARY_MIN_OPTIONS,
  SALARY_RANGES,
} from "@/lib/constants";

const SALARY_RANGE_MAP: Record<string, { min: string; max: string }> = {
  "200万円未満": { min: "200万円", max: "300万円" },
  "200〜300万円": { min: "200万円", max: "300万円" },
  "300〜400万円": { min: "300万円", max: "400万円" },
  "400〜500万円": { min: "400万円", max: "500万円" },
  "500〜600万円": { min: "500万円", max: "600万円" },
  "600〜800万円": { min: "600万円", max: "800万円" },
  "800〜1000万円": { min: "800万円", max: "1000万円" },
  "1000万円以上": { min: "1000万円", max: "1000万円以上" },
  応相談: { min: "応相談", max: "" },
};

function salaryAmount(value: string): number {
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

const MIN_AMOUNTS = JOB_SALARY_MIN_OPTIONS.filter((o) => o !== "応相談").map((o) => ({
  label: o,
  amount: salaryAmount(o),
}));

const MAX_AMOUNTS = JOB_SALARY_MAX_OPTIONS.map((o) => ({
  label: o,
  amount: salaryAmount(o),
}));

function snapMinOption(amount: number): string {
  if (amount <= 0) return "";
  const exact = MIN_AMOUNTS.find((o) => o.amount === amount);
  if (exact) return exact.label;
  const lower = MIN_AMOUNTS.filter((o) => o.amount <= amount).pop();
  if (lower) return lower.label;
  return MIN_AMOUNTS[0]?.label ?? "";
}

function snapMaxOption(amount: number, preferAbove = false): string {
  if (amount <= 0) return "";
  const exact = MAX_AMOUNTS.find((o) => o.amount === amount);
  if (exact) return exact.label;
  if (preferAbove) {
    const higher = MAX_AMOUNTS.find((o) => o.amount >= amount);
    if (higher) return higher.label;
  }
  const lower = MAX_AMOUNTS.filter((o) => o.amount <= amount).pop();
  if (lower) return lower.label;
  return MAX_AMOUNTS[MAX_AMOUNTS.length - 1]?.label ?? "";
}

function normalizeSalaryPair(minRaw: string, maxRaw: string): { salaryMin: string; salaryMax: string } {
  if (maxRaw.includes("以上")) {
    const minAmount = salaryAmount(minRaw);
    return {
      salaryMin: snapMinOption(minAmount),
      salaryMax: "1000万円以上",
    };
  }

  const minAmount = salaryAmount(minRaw);
  const maxAmount = salaryAmount(maxRaw);
  return {
    salaryMin: snapMinOption(minAmount),
    salaryMax: snapMaxOption(maxAmount, true),
  };
}

export function formatJobSalary(min: string, max: string): string {
  if (min === "応相談") return "応相談";
  if (!min || !max) return "";
  return `${min}〜${max}`;
}

export function parseJobSalary(salary: string): { salaryMin: string; salaryMax: string } {
  const trimmed = salary.trim();
  if (!trimmed) return { salaryMin: "", salaryMax: "" };

  const mapped = SALARY_RANGE_MAP[trimmed];
  if (mapped) return { salaryMin: mapped.min, salaryMax: mapped.max };

  if (trimmed === "応相談" || trimmed.includes("応相談")) {
    return { salaryMin: "応相談", salaryMax: "" };
  }

  for (const range of SALARY_RANGES) {
    if (trimmed === range || trimmed.includes(range)) {
      const entry = SALARY_RANGE_MAP[range];
      if (entry) return { salaryMin: entry.min, salaryMax: entry.max };
    }
  }

  if ((JOB_SALARY_MIN_OPTIONS as readonly string[]).includes(trimmed)) {
    return { salaryMin: trimmed, salaryMax: "" };
  }

  if (trimmed.includes("未満")) {
    const amount = salaryAmount(trimmed);
    return { salaryMin: snapMinOption(amount), salaryMax: snapMaxOption(amount + 100, true) };
  }

  if (trimmed.includes("以上")) {
    const amount = salaryAmount(trimmed);
    return { salaryMin: snapMinOption(amount), salaryMax: "1000万円以上" };
  }

  const fullRangeMatch = trimmed.match(/(\d+)\s*万(?:円)?\s*[〜~\-－]\s*(\d+\s*万(?:円)?(?:以上)?)/);
  if (fullRangeMatch) {
    return normalizeSalaryPair(`${fullRangeMatch[1]}万`, fullRangeMatch[2]);
  }

  const compactRangeMatch = trimmed.match(/(\d+)\s*[〜~\-－]\s*(\d+)\s*万(?:円)?/);
  if (compactRangeMatch) {
    return normalizeSalaryPair(`${compactRangeMatch[1]}万`, `${compactRangeMatch[2]}万`);
  }

  const numbers = [...trimmed.matchAll(/(\d+)\s*万/g)].map((m) => Number(m[1]));
  if (numbers.length >= 2) {
    return normalizeSalaryPair(`${numbers[0]}万`, `${numbers[1]}万`);
  }

  if (numbers.length === 1) {
    const min = snapMinOption(numbers[0]);
    const max = snapMaxOption(numbers[0], true);
    return { salaryMin: min, salaryMax: max };
  }

  return { salaryMin: "", salaryMax: "" };
}

export function defaultMaxForMin(min: string): string {
  if (!min || min === "応相談") return "";
  const minAmount = salaryAmount(min);
  const match = JOB_SALARY_MAX_OPTIONS.find((option) => salaryAmount(option) >= minAmount);
  return match ?? JOB_SALARY_MAX_OPTIONS[JOB_SALARY_MAX_OPTIONS.length - 1] ?? "";
}

export function isValidJobSalaryRange(min: string, max: string): boolean {
  if (min === "応相談") return true;
  if (!min || !max) return false;
  if (!(JOB_SALARY_MIN_OPTIONS as readonly string[]).includes(min)) return false;
  if (!(JOB_SALARY_MAX_OPTIONS as readonly string[]).includes(max)) return false;
  return salaryAmount(min) <= salaryAmount(max);
}

export function isValidSalaryMin(value: string | undefined): boolean {
  return Boolean(value && (JOB_SALARY_MIN_OPTIONS as readonly string[]).includes(value));
}

export function isValidSalaryMax(value: string | undefined): boolean {
  return Boolean(value && (JOB_SALARY_MAX_OPTIONS as readonly string[]).includes(value));
}
