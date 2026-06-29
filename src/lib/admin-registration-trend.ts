export const REGISTRATION_TREND_RANGES = [7, 30, 90, 365] as const;
export type RegistrationTrendRange = (typeof REGISTRATION_TREND_RANGES)[number];

export type RegistrationTrendPoint = {
  key: string;
  label: string;
  companies: number;
  seekers: number;
};

export function parseRegistrationTrendRange(value: string | null): RegistrationTrendRange | null {
  const days = Number(value);
  if (REGISTRATION_TREND_RANGES.includes(days as RegistrationTrendRange)) {
    return days as RegistrationTrendRange;
  }
  return null;
}
