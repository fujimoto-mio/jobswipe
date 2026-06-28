"use client";

import { useEffect } from "react";
import { useField, useFormikContext } from "formik";
import {
  AREAS,
  EMPLOYMENT_TYPES,
  JOB_CATEGORIES,
  JOB_SALARY_MAX_OPTIONS,
  JOB_SALARY_MIN_OPTIONS,
  NEW_COMPANY_VALUE,
} from "@/lib/constants";
import { FormError, FormSelect, FormTextInput, FormTextarea } from "@/components/form/FormFields";
import FormSelectPicker from "@/components/form/FormSelectPicker";
import type { JobFormValues } from "@/lib/validation/schemas";
import { formatJobSalary } from "@/lib/validation/job-salary";

export type CompanyOption = {
  id: string;
  name: string;
  jobCount: number;
};

type JobFormFieldsProps = {
  companyLocked?: boolean;
  companies?: CompanyOption[];
  readOnly?: boolean;
};

function CompanyFields({ companyLocked, companies, readOnly }: JobFormFieldsProps) {
  const { values } = useFormikContext<JobFormValues>();
  const [companyIdField, companyIdMeta, companyIdHelpers] = useField("companyId");

  if (companyLocked) {
    return (
      <FormTextInput
        name="company"
        label="会社名 *"
        readOnly
        className="bg-[#F8FAFC] text-[#64748B]"
      />
    );
  }

  const showNewCompanyName =
    !companies?.length || !values.companyId || values.companyId === NEW_COMPANY_VALUE;

  return (
    <div className="space-y-4">
      {companies && companies.length > 0 && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">企業 *</span>
          <select
            name={companyIdField.name}
            value={companyIdField.value ?? ""}
            onChange={(e) => companyIdHelpers.setValue(e.target.value)}
            onBlur={() => companyIdHelpers.setTouched(true)}
            disabled={readOnly}
            className={`input-field w-full ${companyIdMeta.touched && companyIdMeta.error ? "ring-1 ring-red-300" : ""} ${readOnly ? "bg-[#F8FAFC] text-[#64748B]" : ""}`}
          >
            <option value="">企業を選択</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}（求人 {c.jobCount}件）
              </option>
            ))}
            <option value={NEW_COMPANY_VALUE}>新規企業を登録...</option>
          </select>
          {companyIdMeta.touched && companyIdMeta.error && (
            <p className="mt-1 text-xs text-red-600">{companyIdMeta.error}</p>
          )}
        </label>
      )}
      {showNewCompanyName && (
        <FormTextInput name="company" label="会社名 *" placeholder="株式会社〇〇" readOnly={readOnly} />
      )}
    </div>
  );
}

function FormJobSalaryField({ readOnly }: { readOnly?: boolean }) {
  const { values, setFieldValue } = useFormikContext<JobFormValues>();
  const [salaryMinField, salaryMinMeta, salaryMinHelpers] = useField("salaryMin");
  const [salaryMaxField, salaryMaxMeta, salaryMaxHelpers] = useField("salaryMax");
  const isNegotiable = values.salaryMin === "応相談";

  useEffect(() => {
    if (isNegotiable) {
      setFieldValue("salaryMax", "");
    }
  }, [isNegotiable, setFieldValue]);

  if (readOnly) {
    return (
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">年収 *</span>
        <input
          readOnly
          value={formatJobSalary(values.salaryMin ?? "", values.salaryMax ?? "")}
          className="input-field bg-[#F8FAFC] text-[#64748B]"
        />
      </label>
    );
  }

  const pickerProps = {
    error: Boolean(salaryMinMeta.error || salaryMaxMeta.error),
    touched: Boolean(salaryMinMeta.touched || salaryMaxMeta.touched),
  };

  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">年収 *</span>
      <div className={`grid gap-3 ${isNegotiable ? "grid-cols-1" : "grid-cols-2"}`}>
        <FormSelectPicker
          {...pickerProps}
          name={salaryMinField.name}
          value={salaryMinField.value ?? ""}
          options={JOB_SALARY_MIN_OPTIONS}
          placeholder="下限"
          title="年収（下限）"
          onChange={(value) => salaryMinHelpers.setValue(value)}
          onBlur={() => salaryMinHelpers.setTouched(true)}
        />
        {!isNegotiable && (
          <FormSelectPicker
            {...pickerProps}
            name={salaryMaxField.name}
            value={salaryMaxField.value ?? ""}
            options={JOB_SALARY_MAX_OPTIONS}
            placeholder="上限"
            title="年収（上限）"
            onChange={(value) => salaryMaxHelpers.setValue(value)}
            onBlur={() => salaryMaxHelpers.setTouched(true)}
          />
        )}
      </div>
      <FormError name="salaryMin" />
      {!isNegotiable && <FormError name="salaryMax" />}
    </div>
  );
}

export default function JobFormFields({
  companyLocked = false,
  companies = [],
  readOnly = false,
}: JobFormFieldsProps) {
  return (
    <>
      <FormTextInput
        name="title"
        label="求人タイトル *"
        placeholder="フロントエンドエンジニア"
        readOnly={readOnly}
      />
      <CompanyFields companyLocked={companyLocked} companies={companies} readOnly={readOnly} />

      <div className="grid gap-4 md:grid-cols-2">
        <FormSelect
          name="location"
          label="勤務地 *"
          options={AREAS}
          placeholder="勤務地を選択"
          readOnly={readOnly}
        />
        <FormSelect
          name="employmentType"
          label="雇用形態"
          options={EMPLOYMENT_TYPES}
          placeholder="雇用形態を選択"
          readOnly={readOnly}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormJobSalaryField readOnly={readOnly} />
        <FormSelect name="category" label="職種 *" options={JOB_CATEGORIES} placeholder="職種を選択" readOnly={readOnly} />
      </div>

      <FormTextarea name="description" label="仕事内容 *" rows={4} placeholder="仕事内容を入力..." readOnly={readOnly} />
      <FormTextarea
        name="requirements"
        label="必須条件（1行1項目）"
        rows={4}
        placeholder={"3年以上の開発経験\nReact/TypeScriptの実務経験"}
        readOnly={readOnly}
      />
      <FormTextarea
        name="benefits"
        label="福利厚生（1行1項目）"
        rows={3}
        placeholder={"リモートワーク可\nフレックスタイム制"}
        readOnly={readOnly}
      />
      <FormTextInput name="tags" label="タグ（カンマ区切り）" placeholder="React, リモート可, フレックス" readOnly={readOnly} />

      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
        <h3 className="mb-3 font-medium text-[#1E293B]">リンク設定</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <FormTextInput name="website" label="企業HP URL" placeholder="https://..." readOnly={readOnly} />
          <FormTextInput name="careersPage" label="採用ページ URL" placeholder="https://..." readOnly={readOnly} />
          <FormTextInput name="twitter" label="Twitter / X URL" placeholder="https://..." readOnly={readOnly} />
          <FormTextInput name="instagram" label="Instagram URL" placeholder="https://..." readOnly={readOnly} />
          <FormTextInput name="linkedin" label="LinkedIn URL" placeholder="https://..." readOnly={readOnly} />
          <FormTextInput name="jobPdf" label="求人票PDF URL" placeholder="https://..." readOnly={readOnly} />
        </div>
      </div>
    </>
  );
}
