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

export const GENDERS = ["男性", "女性", "その他", "回答しない"] as const;

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
