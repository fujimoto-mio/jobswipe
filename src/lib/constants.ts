export const AREAS = [
  "東京都",
  "神奈川県",
  "大阪府",
  "愛知県",
  "福岡県",
  "北海道",
  "宮城県",
  "広島県",
  "京都府",
  "兵庫県",
  "リモート",
] as const;

export const JOB_CATEGORIES = [
  "エンジニア",
  "デザイナー",
  "営業",
  "マーケティング",
  "カスタマーサポート",
  "人事",
  "経理・財務",
  "クリエイター",
  "プロダクトマネージャー",
  "データサイエンティスト",
] as const;

export const GENDERS = ["男性", "女性"] as const;

export const EXPERIENCE_LEVELS = [
  "未経験",
  "1年未満",
  "1〜3年",
  "3〜5年",
  "5〜10年",
  "10年以上",
] as const;

export const EMPLOYMENT_TYPES = [
  "正社員",
  "契約社員",
  "派遣",
  "パート・アルバイト",
  "業務委託",
  "インターン",
] as const;

export const SALARY_RANGES = [
  "200万円未満",
  "200〜300万円",
  "300〜400万円",
  "400〜500万円",
  "500〜600万円",
  "600〜800万円",
  "800〜1000万円",
  "1000万円以上",
  "応相談",
] as const;

/** Job form: annual salary lower bound */
export const JOB_SALARY_MIN_OPTIONS = [
  "200万円",
  "300万円",
  "400万円",
  "500万円",
  "600万円",
  "800万円",
  "1000万円",
  "応相談",
] as const;

/** Job form: annual salary upper bound */
export const JOB_SALARY_MAX_OPTIONS = [
  "300万円",
  "400万円",
  "500万円",
  "600万円",
  "800万円",
  "1000万円",
  "1000万円以上",
] as const;

export const JOB_SEARCH_INTENTS = [
  "積極的に探している",
  "良い求人があれば",
  "今は探していない",
] as const;

export const EDUCATION_LEVELS = [
  "中学校卒",
  "高等学校卒",
  "専門学校卒",
  "短大卒",
  "大学卒",
  "大学院卒",
  "その他",
] as const;

export const APPLICATION_STATUS_LABELS = {
  new: "新規受付",
  scheduling: "面談設定中",
  interview_done: "面談完了",
  hired: "採用",
  rejected: "不採用",
} as const;

export const JOB_APPROVAL_LABELS = {
  pending: "審査中",
  approved: "公開中",
  rejected: "却下",
} as const;

/** Sentinel value for admin job form — create a new company row instead of linking an existing one. */
export const NEW_COMPANY_VALUE = "__new__";

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@jobswipe.app";
