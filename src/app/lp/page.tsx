import type { Metadata } from "next";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import ServiceLpPage from "@/components/service-lp/ServiceLpPage";
import "./lp.css";

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-zen-kaku",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JobSwipe",
  description:
    "求職者が企業紹介動画をスワイプしながら閲覧し、そのまま応募・面談まで進められる新しい採用サービス。モニター企業様募集中。",
  openGraph: {
    title: "JobSwipe｜インフルエンサーPRの力を月額定額制で",
    description:
      "求職者が企業紹介動画をスワイプしながら閲覧し、そのまま応募・面談まで進められる新しい採用サービス。",
    type: "website",
    url: "/lp/",
  },
};

export default function ServiceLpRoutePage() {
  return (
    <div className={zenKaku.variable}>
      <ServiceLpPage />
    </div>
  );
}
