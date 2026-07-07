export const LP_IMG_BASE = "/lp";

export function lpImg(name: string) {
  return `${LP_IMG_BASE}/${name}`;
}

export const PARTNER_LOGOS = [
  "company-logo01.webp",
  "company-logo02.webp",
  "company-logo03.webp",
  "company-logo04.webp",
  "company-logo05.webp",
  "company-logo06.webp",
  "company-logo07.webp",
  "company-logo08.webp",
] as const;

export const PLAN_FEATURES: Array<{
  icon: string;
  title: string;
  desc: string;
  full?: boolean;
}> = [
  { icon: "🎬", title: "動画制作", desc: "月4本\n撮影・編集・構成まで完全代行" },
  { icon: "📲", title: "ストーリーズ", desc: "毎日更新 ※1回/平日" },
  { icon: "📸", title: "対応SNS", desc: "Instagram" },
  { icon: "✏️", title: "投稿設計", desc: "社風・人柄・リアルを伝える構成\n（拡散より理解重視）" },
  { icon: "📊", title: "レポート", desc: "月次で辞退率・面談率・承諾率を可視化", full: true },
] ;

export const PLAN_RESULTS = [
  { label: "説明会予約率", value: "35% → 60%" },
  { label: "面接出席率", value: "68% → 96.7%" },
  { label: "内定承諾率", value: "58% → 69%" },
] as const;

export const CASE_ITEMS = ["case-01.webp", "case-02.webp", "case-03.webp", "case-04.webp"] as const;

export const COMPARISON_ROWS: Array<{
  label: string;
  highlight: string;
  other1: string;
  other2: string;
  price?: boolean;
}> = [
  { label: "目的", highlight: "社風・価値観の伝達／定着", other1: "認知・露出", other2: "応募者数獲得" },
  { label: "KPI", highlight: "辞退率・承諾率", other1: "投稿本数・再生回数", other2: "応募数・閲覧数" },
  { label: "費用", highlight: "月15万円〜", other1: "月35万円〜", other2: "月20万円〜", price: true },
  { label: "工数", highlight: "月2時間程度〜", other1: "依頼・管理が発生", other2: "常時連絡・修正対応" },
];

export const VOICES = [
  {
    illust: "voice-illust01.webp",
    region: "東京都 ・ IT企業",
    meta: "設立2018年 ／ 社員数41名",
    title: "内定承諾率が向上",
    body: "採用があまり順調にいかず、何か新しいことをしないと模索していたところにSNS運用サービスを知り導入しました。先日の中途採用では、SNSを見て社風に魅かれたと言ってくれた子が見事入社。SNSの効力の強さを実感しました。",
  },
  {
    illust: "voice-illust02.webp",
    region: "兵庫県 ・ 建設業",
    meta: "設立1970年 ／ 社員数125名",
    title: "新卒者が毎年入ってくるようになりました。",
    body: "新卒採用を始めたいという思いから取り組みをスタートした結果、毎年新卒者が入社する仕組みが整い、組織に新しい風が吹き込まれるようになりました。",
  },
  {
    illust: "voice-illust03.webp",
    region: "東京都 ・ 不動産業",
    meta: "設立2012年 ／ 社員数110名",
    title: "ちょっとした有名人",
    body: "TikTok、インスタの運用代行を依頼。運用から1年が経過し、フォロワー数もかなり増えました。SNSから新規問合せが月に何本か入り、採用の新規応募も入ってくるようになりました。",
  },
] as const;

export const INDUSTRY_TAGS = ["# IT業界", "# WEB業界", "# 通信業界", "# 不動産業界"] as const;

export const PAIN_POINTS = [
  { emoji: "😓", text: "ネームバリューのある\n大手企業に勝てない" },
  { emoji: "🏆", text: "採用条件がいい企業\nばかりに人が集まる" },
  { emoji: "📉", text: "採用後の\n定着率が低い" },
] as const;

export const FAQ_ITEMS = [
  {
    q: "SNSの運用は初めてです。社内に詳しい人がいないのですが大丈夫ですか？",
    a: "はい、まったく問題ありません。アカウント開設から運用ルールの整備、投稿文・構成の作成、動画撮影・編集まですべて弊社が代行します。貴社側のご対応は、月1回のお打ち合わせと、2時間程度の撮影にご協力いただくだけで完結します。",
    useIllust: true,
  },
  {
    q: "社員の顔を出すのが難しいのですが、動画は作れますか？",
    a: "顔出しなしでも効果的な構成をご提案できます。たとえば「社内の空気感」や「働く人の声（音声のみ）」「オフィスツアー」など、雰囲気が伝わる切り口を多数ご用意しています。顔出しを求められない企業様にも導入実績がありますのでご安心ください。",
    useIllust: false,
  },
  {
    q: "他社と比べて費用が安く見えるのですが、サービスの質は大丈夫ですか？",
    a: "投稿本数ではなく、効果に焦点を当てているためコスト効率が高いのが特徴です。他社が「月20投稿で60万円〜」の量型運用であるのに対し、弊社は「月4本前後でも辞退率・承諾率を改善する設計」を重視。採用支援を専門にしてきた会社が、実務の課題から逆算して作った運用モデルです。",
    useIllust: false,
  },
] as const;

export const PREFECTURES = [
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
