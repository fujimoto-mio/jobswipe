import * as Yup from "yup";
import {
  AREAS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  GENDERS,
  JOB_CATEGORIES,
} from "@/lib/constants";

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

export const seekerAccountSchema = Yup.object({
  email,
  password,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "パスワードが一致しません")
    .required("確認用パスワードを入力してください"),
});

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
  email,
});

/** Server-side seeker registration — profile fields + password. */
export const seekerRegisterSchema = Yup.object({
  ...seekerProfileFields,
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

export const applySchema = Yup.object({
  name: Yup.string().trim().required("氏名を入力してください"),
  birthday: birthdayField,
  area: Yup.string().trim().required("エリアを入力してください"),
  jobType: Yup.string().trim().required("希望職種を入力してください"),
  email,
  message: Yup.string().trim(),
});

/** Seeker profile edit — same fields as registration except email (auth-bound). */
export const profileEditSchema = Yup.object(seekerProfileFields);

/** @deprecated Use profileEditSchema — email is managed via Supabase Auth. */
export const profileSchema = profileEditSchema.shape({ email });

export const companyProfileSchema = Yup.object({
  name: Yup.string().trim().required("担当者名を入力してください"),
  companyName: Yup.string().trim().required("会社名を入力してください"),
  website: optionalUrl,
  description: Yup.string().trim(),
});

export const jobFormSchema = Yup.object({
  title: Yup.string().trim().required("求人タイトルを入力してください"),
  company: Yup.string().trim().required("会社名を入力してください"),
  location: Yup.string().trim().required("勤務地を入力してください"),
  area: Yup.string()
    .oneOf([...AREAS], "エリアを選択してください")
    .required("エリアを選択してください"),
  category: Yup.string()
    .oneOf([...JOB_CATEGORIES], "職種を選択してください")
    .required("職種を選択してください"),
  salary: Yup.string().trim().required("年収を入力してください"),
  employmentType: Yup.string().oneOf([...EMPLOYMENT_TYPES]),
  description: Yup.string().trim().required("仕事内容を入力してください"),
  requirements: Yup.string(),
  benefits: Yup.string(),
  tags: Yup.string(),
  website: optionalUrl,
  careersPage: optionalUrl,
  twitter: optionalUrl,
  instagram: optionalUrl,
  linkedin: optionalUrl,
  jobPdf: optionalUrl,
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
export type SeekerAccountValues = Yup.InferType<typeof seekerAccountSchema>;
export type SeekerProfileValues = Yup.InferType<typeof seekerProfileSchema>;
export type SeekerRegisterValues = Yup.InferType<typeof seekerRegisterSchema>;
export type CompanyRegisterValues = Yup.InferType<typeof companyRegisterSchema>;
export type ApplyValues = Yup.InferType<typeof applySchema>;
export type ProfileEditValues = Yup.InferType<typeof profileEditSchema>;
export type ProfileValues = Yup.InferType<typeof profileSchema>;
export type CompanyProfileValues = Yup.InferType<typeof companyProfileSchema>;
export type JobFormValues = Yup.InferType<typeof jobFormSchema>;
export type ChatMessageValues = Yup.InferType<typeof chatMessageSchema>;
export type StaffProfileValues = Yup.InferType<typeof staffProfileSchema>;
