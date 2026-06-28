"use client";

import { FormSelect, FormTextInput } from "@/components/form/FormFields";
import {
  AREAS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  GENDERS,
  JOB_CATEGORIES,
} from "@/lib/constants";
import { maxBirthdayForMinAge, minBirthdayForMaxAge } from "@/lib/birthday";

type SeekerProfileFormFieldsProps = {
  showEmail?: boolean;
  emailReadOnly?: boolean;
};

export default function SeekerProfileFormFields({
  showEmail = false,
  emailReadOnly = true,
}: SeekerProfileFormFieldsProps) {
  return (
    <>
      <FormTextInput name="name" label="氏名" placeholder="山田 太郎" autoComplete="name" />

      <div className="grid grid-cols-2 gap-3">
        <FormSelect name="gender" label="性別" options={GENDERS} />
        <FormTextInput
          name="birthday"
          label="生年月日"
          type="date"
          min={minBirthdayForMaxAge(80)}
          max={maxBirthdayForMinAge(18)}
          autoComplete="bday"
        />
      </div>

      <FormSelect name="area" label="希望エリア" options={AREAS} />
      <FormSelect name="desiredJobType" label="希望職種" options={JOB_CATEGORIES} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormSelect name="experience" label="社会人経験" options={EXPERIENCE_LEVELS} />
        <FormSelect name="employmentType" label="希望雇用形態" options={EMPLOYMENT_TYPES} />
      </div>

      {showEmail && (
        <FormTextInput
          name="email"
          label="メールアドレス"
          type="email"
          readOnly={emailReadOnly}
          className={emailReadOnly ? "bg-slate-50 text-slate-500" : undefined}
        />
      )}
    </>
  );
}
