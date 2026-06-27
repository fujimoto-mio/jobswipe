"use client";

import { AREAS, EMPLOYMENT_TYPES, JOB_CATEGORIES } from "@/lib/constants";
import { FormSelect, FormTextInput, FormTextarea } from "@/components/form/FormFields";

type JobFormFieldsProps = {
  companyLocked?: boolean;
};

export default function JobFormFields({ companyLocked = false }: JobFormFieldsProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <FormTextInput name="title" label="求人タイトル *" placeholder="フロントエンドエンジニア" />
        <FormTextInput
          name="company"
          label="会社名 *"
          placeholder="株式会社〇〇"
          readOnly={companyLocked}
          className={companyLocked ? "bg-[#F8FAFC] text-[#64748B]" : ""}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormTextInput name="location" label="勤務地 *" placeholder="東京都渋谷区" />
        <FormSelect name="area" label="エリア *" options={AREAS} placeholder="エリアを選択" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormTextInput name="salary" label="年収 *" placeholder="年収 500万〜800万円" />
        <FormSelect name="category" label="職種 *" options={JOB_CATEGORIES} placeholder="職種を選択" />
      </div>

      <FormSelect name="employmentType" label="雇用形態" options={EMPLOYMENT_TYPES} placeholder="雇用形態を選択" />

      <FormTextarea name="description" label="仕事内容 *" rows={4} placeholder="仕事内容を入力..." />
      <FormTextarea
        name="requirements"
        label="必須条件（1行1項目）"
        rows={4}
        placeholder={"3年以上の開発経験\nReact/TypeScriptの実務経験"}
      />
      <FormTextarea
        name="benefits"
        label="福利厚生（1行1項目）"
        rows={3}
        placeholder={"リモートワーク可\nフレックスタイム制"}
      />
      <FormTextInput name="tags" label="タグ（カンマ区切り）" placeholder="React, リモート可, フレックス" />

      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
        <h3 className="mb-3 font-medium text-[#1E293B]">リンク設定</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <FormTextInput name="website" label="企業HP URL" placeholder="https://..." />
          <FormTextInput name="careersPage" label="採用ページ URL" placeholder="https://..." />
          <FormTextInput name="twitter" label="Twitter / X URL" placeholder="https://..." />
          <FormTextInput name="instagram" label="Instagram URL" placeholder="https://..." />
          <FormTextInput name="linkedin" label="LinkedIn URL" placeholder="https://..." />
          <FormTextInput name="jobPdf" label="求人票PDF URL" placeholder="https://..." />
        </div>
      </div>
    </>
  );
}
