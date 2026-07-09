export const LP_ACCENT = "#2b62c9";

export const LP_BASE_PATH = "/lp";
export const LP_CONTACT_PATH = "/lp/contact";

export const LP_ASSETS = {
  logo: "/lp/logo-mark.webp",
  hero: "/lp/JobSwipe-top.webp",
} as const;

export const PROBLEM_ITEMS = [
  {
    icon: "↑",
    iconSize: "lg" as const,
    title: "コスト高騰",
    description: "運用型媒体費、求人誌掲載費、人材紹介手数料が年々上昇",
  },
  {
    icon: "¥",
    iconSize: "sm" as const,
    title: "費用対効果の悪化",
    description: "応募単価(CPA)、採用単価が悪化し、“採れない採用”が常態化",
  },
  {
    icon: "？",
    iconSize: "lg" as const,
    title: "伝わらない情報",
    description: "文字と写真の求人票では、職場の雰囲気、人間関係、実際の働き方が伝わらない",
  },
  {
    icon: "⟲",
    iconSize: "sm" as const,
    title: "早期離職",
    description: "応募後離脱、内定辞退、3ヶ月以内離職が増加し、採用コストが膨らむ",
  },
] as const;

export const POSTING_METHODS = [
  {
    number: "01",
    title: "採用動画をすでにお持ちの場合",
    description:
      "TikTok・Instagram・YouTubeなどに投稿済みの採用動画があれば、URLをご共有いただくだけで掲載できます。",
  },
  {
    number: "02",
    title: "採用動画をお持ちでない場合",
    description: "JobSwipeが15秒の企業紹介動画の制作をサポートいたします。",
  },
  {
    number: "03",
    title: "より多くの求職者へ届けたい場合",
    description: "インフルエンサーによる企業紹介動画の制作・発信もご利用いただけます。",
    footnote: "（別途料金が発生いたします）",
  },
] as const;

export const FOOTER_LEGAL_LINKS = [
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/terms", label: "利用規約" },
  { href: "#", label: "会社概要" },
] as const;
