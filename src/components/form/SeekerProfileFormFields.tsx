"use client";

import {
  FormBirthdayInput,
  FormSelect,
  FormTextInput,
  FormTextarea,
} from "@/components/form/FormFields";
import {
  AREAS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  GENDERS,
  JOB_CATEGORIES,
} from "@/lib/constants";

type SeekerProfileFormFieldsProps = {
  showEmail?: boolean;
  emailReadOnly?: boolean;
  showCareerProfile?: boolean;
};

export default function SeekerProfileFormFields({
  showEmail = false,
  emailReadOnly = true,
  showCareerProfile = false,
}: SeekerProfileFormFieldsProps) {
  return (
    <div className="profile-form-fields">
      {showCareerProfile && (
        <div className="profile-form-section">
          <p className="profile-form-section-title">プロフィール</p>
          <FormTextarea
            name="introSentence"
            label="一言紹介"
            rows={3}
            maxLength={500}
            placeholder="例：ユーザー視点で課題解決に取り組んできました"
          />
          <FormTextarea
            name="summary"
            label="サマリー"
            rows={5}
            maxLength={5000}
            placeholder="これまでの経験や強み、希望する働き方などを記入してください"
          />
          <FormTextInput
            name="resumeUrl"
            label="履歴書"
            type="url"
            placeholder="https://example.com/resume.pdf"
          />
        </div>
      )}

      <div className="profile-form-section">
        {showCareerProfile && <p className="profile-form-section-title">登録情報</p>}
        <FormTextInput name="name" label="氏名" placeholder="山田 太郎" autoComplete="name" />

        <div className="profile-form-row profile-form-row-2">
          <FormSelect name="gender" label="性別" options={GENDERS} />
          <FormBirthdayInput name="birthday" label="生年月日" />
        </div>

        <div className="profile-form-row profile-form-row-2">
          <FormSelect name="area" label="希望エリア" options={AREAS} />
          <FormSelect name="desiredJobType" label="希望職種" options={JOB_CATEGORIES} />
        </div>

        <div className="profile-form-row profile-form-row-2">
          <FormSelect name="experience" label="社会人経験" options={EXPERIENCE_LEVELS} />
          <FormSelect name="employmentType" label="希望雇用形態" options={EMPLOYMENT_TYPES} />
        </div>

        {showEmail && (
          <FormTextInput
            name="email"
            label="メールアドレス"
            type="email"
            readOnly={emailReadOnly}
            className={emailReadOnly ? "bg-slate-100 text-slate-500" : undefined}
          />
        )}
      </div>
    </div>
  );
}
