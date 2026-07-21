import type { EmploymentType as PrismaEmploymentType } from "@prisma/client";
import {
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPE_VALUES,
  type EmploymentTypeValue,
} from "@/lib/constants";
import type { EmploymentType } from "@/lib/types";

/**
 * Compile-time guard: fails the build if the Prisma enum and the label map in
 * constants.ts ever drift apart (in either direction).
 */
type EmploymentTypeEnumInSync = EmploymentTypeValue extends PrismaEmploymentType
  ? PrismaEmploymentType extends EmploymentTypeValue
    ? true
    : never
  : never;

// A bare conditional type resolving to `never` is not an error on its own, so
// the assertion has to be consumed by a value for the build to actually break.
const employmentTypeEnumInSync: EmploymentTypeEnumInSync = true;
void employmentTypeEnumInSync;

/** Database enum value -> Japanese label used by the API and the UI. */
export function toEmploymentTypeLabel(value: PrismaEmploymentType): EmploymentType {
  return EMPLOYMENT_TYPE_LABELS[value];
}

/** Japanese label -> database enum value. Throws on an unknown label. */
export function toPrismaEmploymentType(label: string): PrismaEmploymentType {
  const value = EMPLOYMENT_TYPE_VALUES[label as EmploymentType];
  // Deliberately does not echo the input back — this message is surfaced to
  // users verbatim by the job routes.
  if (!value) throw new Error("雇用形態を正しく選択してください");
  return value;
}

/** Label list -> database enum values, dropping anything unrecognised. */
export function toPrismaEmploymentTypes(labels: readonly string[]): PrismaEmploymentType[] {
  return labels
    .map((label) => EMPLOYMENT_TYPE_VALUES[label as EmploymentType])
    .filter((value): value is PrismaEmploymentType => Boolean(value));
}

/**
 * Enum values whose label contains `query`. Free-text search cannot use
 * `contains` on an enum column, so callers match on the labels instead.
 */
export function employmentTypeValuesMatching(query: string): PrismaEmploymentType[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return (Object.entries(EMPLOYMENT_TYPE_LABELS) as [PrismaEmploymentType, string][])
    .filter(([, label]) => label.toLowerCase().includes(q))
    .map(([value]) => value);
}
