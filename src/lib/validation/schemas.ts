import * as Yup from "yup";
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
import { NEW_COMPANY_VALUE } from "@/lib/constants";
import { isValidJobSalaryRange, isValidSalaryMax, isValidSalaryMin } from "@/lib/validation/job-salary";

const email = Yup.string()
  .trim()
  .email("有効なメールアドレスを入力してください")
  .required("メールアドレスを入力してください");

const password = Yup.string()
  .min(8, "パスワードは8文字以上で設定してください")
  .required("パスワードを入力してください");

const optionalUrl = Yup.string()
  .trim()
  .transform((v) => (v ? v : undefined))
  .optional()
  .url("有効なURLを入力してください");

import {
  isBirthdayInAgeRange,
  isValidBirthday,
} from "@/lib/birthday";

const birthdayField = Yup.string()
  .trim()
  .required("生年月日を入力してください")
  .test("valid-date", "有効な生年月日を入力してください", (v) => Boolean(v && isValidBirthday(v)))
  .test("min-age", "18歳以上である必要があります", (v) => Boolean(v && isBirthdayInAgeRange(v, 18, 80)))
  .test("max-age", "80歳以下である必要があります", (v) => Boolean(v && isBirthdayInAgeRange(v, 18, 80)));

export const loginSchema = Yup.object({
  email,
  password: Yup.string().required("パスワードを入力してください"),
});

export const passwordChangeSchema = Yup.object({
  password,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "パスワードが一致しません")
    .required("確認用パスワードを入力してください"),
});

export const emailChangeSchema = Yup.object({ email });

export const seekerSettingsSchema = Yup.object({
  notifyHiredEmail: Yup.boolean().required(),
  notifyChatEmail: Yup.boolean().required(),
});

export const seekerSettingsPatchSchema = Yup.object({
  notifyHiredEmail: Yup.boolean().optional(),
  notifyChatEmail: Yup.boolean().optional(),
}).test("at-least-one", "更新する項目がありません", (v) =>
  v?.notifyHiredEmail !== undefined || v?.notifyChatEmail !== undefined
);

export const seekerAccountSchema = Yup.object({
  email,
  password,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "パスワードが一致しません")
    .required("確認用パスワードを入力してください"),
});

const workHistoryEntrySchema = Yup.object({
  company: Yup.string().trim().required("会社名を入力してください"),
  role: Yup.string().trim().required("職種・役職を入力してください"),
  startYear: Yup.string().trim().required("開始年を選択してください"),
  startMonth: Yup.string().trim().required("開始月を選択してください"),
  startDay: Yup.string().trim().default(""),
  endYear: Yup.string()
    .trim()
    .default("")
    .when("isCurrent", {
      is: false,
      then: (schema) => schema.required("終了年を選択してください"),
      otherwise: (schema) => schema,
    }),
  endMonth: Yup.string()
    .trim()
    .default("")
    .when("isCurrent", {
      is: false,
      then: (schema) => schema.required("終了月を選択してください"),
      otherwise: (schema) => schema,
    }),
  endDay: Yup.string()
    .trim()
    .default(""),
  isCurrent: Yup.boolean().default(false),
  description: Yup.string().trim().max(2000, "2000文字以内で入力してください").default(""),
});

const skillEntrySchema = Yup.object({
  name: Yup.string().trim().required("スキル名を入力してください").max(40, "40文字以内で入力してください"),
  years: Yup.string()
    .trim()
    .required("経験年数を選択してください")
    .oneOf([...EXPERIENCE_LEVELS], "経験年数を選択してください"),
});

const seekerCareerFields = {
  introSentence: Yup.string().trim().max(500, "500文字以内で入力してください").default(""),
  futureGoals: Yup.string().trim().max(2000, "2000文字以内で入力してください").default(""),
  skills: Yup.array().of(skillEntrySchema).max(30, "スキルは30件まで登録できます").default([]),
  workHistory: Yup.array().of(workHistoryEntrySchema).max(10, "職歴は10件まで登録できます").default([]),
};

const seekerPreferenceFields = {
  desiredSalary: Yup.string()
    .trim()
    .default("")
    .test(
      "valid-salary",
      "希望年収を選択してください",
      (v) => !v || (SALARY_RANGES as readonly string[]).includes(v)
    ),
  jobSearchIntent: Yup.string()
    .trim()
    .default("")
    .test(
      "valid-intent",
      "転職意欲を選択してください",
      (v) => !v || (JOB_SEARCH_INTENTS as readonly string[]).includes(v)
    ),
};

const seekerContactFields = {
  phone: Yup.string()
    .trim()
    .default("")
    .test("valid-phone", "有効な電話番号を入力してください", (value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 11;
    }),
  address: Yup.string().trim().max(500, "500文字以内で入力してください").default(""),
};

const seekerPersonalFields = {
  education: Yup.string()
    .trim()
    .default("")
    .test(
      "valid-education",
      "最終学歴を選択してください",
      (v) => !v || (EDUCATION_LEVELS as readonly string[]).includes(v)
    ),
};

const seekerProfileFields = {
  name: Yup.string().trim().required("氏名を入力してください"),
  gender: Yup.string()
    .oneOf([...GENDERS], "性別を選択してください")
    .required("性別を選択してください"),
  birthday: birthdayField,
  area: Yup.string()
    .oneOf([...AREAS], "エリアを選択してください")
    .required("エリアを選択してください"),
  desiredJobType: Yup.string()
    .oneOf([...JOB_CATEGORIES], "希望職種を選択してください")
    .required("希望職種を選択してください"),
  experience: Yup.string()
    .oneOf([...EXPERIENCE_LEVELS], "社会人経験を選択してください")
    .required("社会人経験を選択してください"),
  employmentType: Yup.string()
    .oneOf([...EMPLOYMENT_TYPES], "希望雇用形態を選択してください")
    .required("希望雇用形態を選択してください"),
};

export const seekerProfileSchema = Yup.object({
  ...seekerProfileFields,
  ...seekerContactFields,
  email,
});

/** Server-side seeker registration — profile fields + password. */
export const seekerRegisterSchema = Yup.object({
  ...seekerProfileFields,
  ...seekerContactFields,
  email,
  password,
});

export const companyRegisterSchema = Yup.object({
  companyName: Yup.string().trim().required("会社名を入力してください"),
  contactName: Yup.string().trim().required("担当者名を入力してください"),
  email,
  password,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "パスワードが一致しません")
    .required("確認用パスワードを入力してください"),
});

const legalAcceptance = (message: string) =>
  Yup.boolean().oneOf([true], message).required(message);

export const seekerRegisterFormSchema = seekerProfileSchema.shape({
  acceptLegal: legalAcceptance("利用規約およびプライバシーポリシーへの同意が必要です"),
});

export const companyRegisterFormSchema = companyRegisterSchema.shape({
  acceptLegal: legalAcceptance(
    "利用規約、プライバシーポリシーおよび求人掲載ガイドラインへの同意が必要です"
  ),
});

export const applySchema = Yup.object({
  name: Yup.string().trim().required("氏名を入力してください"),
  birthday: birthdayField,
  area: Yup.string().trim().required("エリアを入力してください"),
  jobType: Yup.string().trim().required("希望職種を入力してください"),
  email,
  message: Yup.string().trim().max(2000, "2000文字以内で入力してください").default(""),
});

/** Seeker profile edit — same fields as registration except email (auth-bound). */
export const profileEditSchema = Yup.object({
  ...seekerProfileFields,
  ...seekerPersonalFields,
  ...seekerContactFields,
  ...seekerPreferenceFields,
  ...seekerCareerFields,
  avatarUrl: Yup.string()
    .transform((v) => (v == null ? "" : String(v)))
    .trim()
    .default(""),
  bannerUrl: Yup.string()
    .transform((v) => (v == null ? "" : String(v)))
    .trim()
    .default(""),
});

export const profileMediaPatchSchema = Yup.object({
  avatarUrl: Yup.string()
    .transform((v) => (v == null ? "" : String(v)))
    .trim()
    .optional(),
  bannerUrl: Yup.string()
    .transform((v) => (v == null ? "" : String(v)))
    .trim()
    .optional(),
}).test("at-least-one", "更新する項目がありません", (v) =>
  v?.avatarUrl !== undefined || v?.bannerUrl !== undefined
);

/** @deprecated Use profileEditSchema — email is managed via Supabase Auth. */
export const profileSchema = profileEditSchema.shape({ email });

export const companyProfileSchema = Yup.object({
  name: Yup.string().trim().required("担当者名を入力してください"),
  companyName: Yup.string().trim().required("会社名を入力してください"),
  website: optionalUrl,
  postalCode: Yup.string()
    .trim()
    .transform((value) => value || undefined)
    .optional()
    .matches(/^\d{3}-?\d{4}$/, "郵便番号の形式が正しくありません（例: 150-0051）"),
  address: Yup.string().trim(),
  overview: Yup.string().trim(),
  business: Yup.string().trim(),
  careersPage: optionalUrl,
  twitter: optionalUrl,
  instagram: optionalUrl,
  linkedin: optionalUrl,
});

export const jobFormSchema = Yup.object({
  title: Yup.string().trim().required("求人タイトルを入力してください"),
  companyId: Yup.string().when(["$companyLocked", "$hasCompanies"], ([companyLocked, hasCompanies], schema) => {
    if (companyLocked || !hasCompanies) return schema.optional();
    return schema.required("企業を選択してください");
  }),
  company: Yup.string()
    .trim()
    .when(["companyId", "$companyLocked"], ([companyId, companyLocked], schema) => {
      if (companyLocked) return schema.optional();
      if (!companyId || companyId === NEW_COMPANY_VALUE) {
        return schema.required("会社名を入力してください");
      }
      return schema.optional();
    }),
  location: Yup.string()
    .required("勤務地を選択してください")
    .test("valid-location", "勤務地を選択してください", (value) =>
      Boolean(value && (AREAS as readonly string[]).includes(value))
    ),
  category: Yup.string()
    .oneOf([...JOB_CATEGORIES], "職種を選択してください")
    .required("職種を選択してください"),
  salaryMin: Yup.string()
    .required("年収（下限）を選択してください")
    .test("valid-min", "年収（下限）を選択してください", (value) => isValidSalaryMin(value))
    .test("salary-order", "下限は上限以下にしてください", function (min) {
      const max = this.parent.salaryMax as string;
      if (!min || min === "応相談" || !max) return true;
      return isValidJobSalaryRange(min, max);
    }),
  salaryMax: Yup.string().when(["salaryMin"], ([salaryMin], schema) => {
    if (salaryMin === "応相談") return schema.optional();
    return schema
      .required("年収（上限）を選択してください")
      .test("valid-max", "年収（上限）を選択してください", (value) => isValidSalaryMax(value))
      .test("salary-order", "上限は下限以上にしてください", function (max) {
        const min = this.parent.salaryMin as string;
        return isValidJobSalaryRange(min, max ?? "");
      });
  }),
  employmentType: Yup.string().oneOf([...EMPLOYMENT_TYPES]),
  description: Yup.string().trim().required("仕事内容を入力してください"),
  requirements: Yup.string(),
  benefits: Yup.string(),
  tags: Yup.string(),
  videoUrl: Yup.string()
    .trim()
    .transform((v) => (v ? v : undefined))
    .optional()
    .url("有効な動画URLを入力してください"),
});

export const chatMessageSchema = Yup.object({
  content: Yup.string().trim().required("メッセージを入力してください"),
});

export const staffProfileSchema = Yup.object({
  name: Yup.string().trim().required("担当者名を入力してください"),
});

export type LoginValues = Yup.InferType<typeof loginSchema>;
export type PasswordChangeValues = Yup.InferType<typeof passwordChangeSchema>;
export type EmailChangeValues = Yup.InferType<typeof emailChangeSchema>;
export type SeekerSettingsValues = Yup.InferType<typeof seekerSettingsSchema>;
export type SeekerSettingsPatchValues = Yup.InferType<typeof seekerSettingsPatchSchema>;
export type SeekerAccountValues = Yup.InferType<typeof seekerAccountSchema>;
export type SeekerProfileValues = Yup.InferType<typeof seekerProfileSchema>;
export type SeekerRegisterValues = Yup.InferType<typeof seekerRegisterSchema>;
export type CompanyRegisterValues = Yup.InferType<typeof companyRegisterSchema>;
export type ApplyValues = Yup.InferType<typeof applySchema>;
export type ProfileEditValues = Yup.InferType<typeof profileEditSchema>;
export type ProfileMediaPatchValues = Yup.InferType<typeof profileMediaPatchSchema>;
export type ProfileValues = Yup.InferType<typeof profileSchema>;
export type CompanyProfileValues = Yup.InferType<typeof companyProfileSchema>;
export type JobFormValues = Yup.InferType<typeof jobFormSchema>;
export type ChatMessageValues = Yup.InferType<typeof chatMessageSchema>;
export type StaffProfileValues = Yup.InferType<typeof staffProfileSchema>;
