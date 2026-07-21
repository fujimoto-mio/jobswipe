/** 希望エリア・勤務地 — 47都道府県 */
export const AREAS = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
] as const;

/** 希望職種・求人カテゴリ */
export const JOB_CATEGORIES = [
  "エンジニア",
  "デザイナー",
  "クリエイター",
  "プロダクトマネージャー",
  "データサイエンティスト",
  "営業",
  "マーケティング",
  "広報・PR",
  "カスタマーサポート",
  "事務・アシスタント",
  "人事",
  "総務・法務",
  "経理・財務",
  "コンサルタント",
  "販売・接客",
  "サービス・フード",
  "美容・エステ",
  "医療・看護",
  "介護・福祉",
  "教育・保育",
  "建設・土木",
  "建築・不動産",
  "製造・生産",
  "物流・運輸",
  "ドライバー",
  "研究・開発",
  "金融・保険",
  "編集・ライター",
  "公務員・団体",
  "その他",
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

export type JobApprovalStatus = "Draft" | "Pending" | "Active" | "Cancelled" | "Closed";

export const JOB_APPROVAL_STATUSES: JobApprovalStatus[] = ["Draft", "Pending", "Active", "Cancelled", "Closed"];

export const JOB_APPROVAL_LABELS: Record<JobApprovalStatus, string> = {
  Draft: "下書き",
  Pending: "申請中",
  Active: "承認済み",
  Cancelled: "差し戻し",
  Closed: "キャンセル済み",
};

export const JOB_APPROVAL_BADGE_CLASS: Record<JobApprovalStatus, string> = {
  Draft: "badge-slate",
  Pending: "badge-amber",
  Active: "badge-green",
  Cancelled: "badge-red",
  Closed: "badge-slate",
};

export type JobSubmissionStatus = "Pending" | "Approved" | "Rejected";

export const JOB_SUBMISSION_STATUSES: JobSubmissionStatus[] = ["Pending", "Approved", "Rejected"];

export const JOB_SUBMISSION_LABELS: Record<JobSubmissionStatus, string> = {
  Pending: "申請中",
  Approved: "承認済み",
  Rejected: "差し戻し",
};

export type CompanyStatus = "Active" | "Pending" | "Suspended" | "Cancelled";

export const COMPANY_STATUSES: CompanyStatus[] = [
  "Active",
  "Pending",
  "Suspended",
  "Cancelled",
];

export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  Active: "有効",
  Pending: "審査待ち",
  Suspended: "停止中",
  Cancelled: "却下",
};

export const COMPANY_STATUS_BADGE_CLASS: Record<CompanyStatus, string> = {
  Active: "badge-green",
  Pending: "badge-amber",
  Suspended: "badge-red",
  Cancelled: "badge-slate",
};

export type SeekerStatus = "Active" | "Suspended";

export const SEEKER_STATUSES: SeekerStatus[] = ["Active", "Suspended"];

export const SEEKER_STATUS_LABELS: Record<SeekerStatus, string> = {
  Active: "有効",
  Suspended: "停止中",
};

export const SEEKER_STATUS_BADGE_CLASS: Record<SeekerStatus, string> = {
  Active: "badge-green",
  Suspended: "badge-red",
};

/** Sentinel value for admin job form — create a new company row instead of linking an existing one. */
export const NEW_COMPANY_VALUE = "__new__";

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@jobswipe.app";



  