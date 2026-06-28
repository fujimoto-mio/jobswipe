"use client";

import {
  FormBirthdayInput,
  FormSelect,
  FormTextInput,
  FormTextarea,
} from "@/components/form/FormFields";
import FormSkillsField from "@/components/form/FormSkillsField";
import FormWorkHistoryField from "@/components/form/FormWorkHistoryField";
import {
  AREAS,
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  GENDERS,
  JOB_CATEGORIES,
  JOB_SEARCH_INTENTS,
  SALARY_RANGES,
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
        <>
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
              name="futureGoals"
              label="今後やりたいこと"
              rows={4}
              maxLength={2000}
              placeholder="今後チャレンジしたいこと、実現したいキャリアなど"
            />
          </div>

          <div className="profile-form-section">
            <p className="profile-form-section-title">希望条件</p>
            <div className="profile-form-row profile-form-row-2">
              <FormSelect name="area" label="希望エリア" options={AREAS} />
              <FormSelect name="desiredJobType" label="希望職種" options={JOB_CATEGORIES} />
            </div>
            <div className="profile-form-row profile-form-row-2">
              <FormSelect name="employmentType" label="希望雇用形態" options={EMPLOYMENT_TYPES} />
              <FormSelect name="experience" label="社会人経験" options={EXPERIENCE_LEVELS} />
            </div>
            <div className="profile-form-row profile-form-row-2">
              <FormSelect name="desiredSalary" label="希望年収" options={SALARY_RANGES} placeholder="選択" />
              <FormSelect name="jobSearchIntent" label="転職意欲" options={JOB_SEARCH_INTENTS} placeholder="選択" />
            </div>
          </div>

          <div className="profile-form-section">
            <FormWorkHistoryField name="workHistory" label="職歴" />
          </div>

          <div className="profile-form-section">
            <FormSkillsField name="skills" label="スキル" />
          </div>
        </>
      )}

      <div className="profile-form-section">
        {showCareerProfile && <p className="profile-form-section-title">登録情報</p>}
        <FormTextInput name="name" label="氏名" placeholder="山田 太郎" autoComplete="name" />

        <div className="profile-form-row profile-form-row-2">
          <FormSelect name="gender" label="性別" options={GENDERS} />
          <FormBirthdayInput name="birthday" label="生年月日" />
        </div>

        {!showCareerProfile && (
          <>
            <div className="profile-form-row profile-form-row-2">
              <FormSelect name="area" label="希望エリア" options={AREAS} />
              <FormSelect name="desiredJobType" label="希望職種" options={JOB_CATEGORIES} />
            </div>
            <div className="profile-form-row profile-form-row-2">
              <FormSelect name="experience" label="社会人経験" options={EXPERIENCE_LEVELS} />
              <FormSelect name="employmentType" label="希望雇用形態" options={EMPLOYMENT_TYPES} />
            </div>
          </>
        )}

        {showCareerProfile && (
          <FormSelect name="education" label="最終学歴" options={EDUCATION_LEVELS} placeholder="選択" />
        )}

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
