import {
  parseRegistrationTrendRange,
  REGISTRATION_TREND_RANGES,
  type RegistrationTrendRange,
} from "@/lib/admin-registration-trend";

export { REGISTRATION_TREND_RANGES, parseRegistrationTrendRange, type RegistrationTrendRange };

export type JobTrendPoint = {
  key: string;
  label: string;
  pending: number;
  active: number;
  cancelled: number;
};
