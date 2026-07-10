import type { Metadata } from "next";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import ServiceLpContactPage from "@/components/service-lp/ServiceLpContactPage";
import "../lp.css";

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-zen-kaku",
  display: "swap",
});

export const metadata: Metadata = {
  title: "お問い合わせ｜JobSwipe",
  description: "JobSwipeへのお問い合わせはこちらから。モニター企業のご相談やサービス説明のご依頼を承ります。",
};

export default function ServiceLpContactRoutePage() {
  return (
    <div className={zenKaku.variable}>
      <ServiceLpContactPage />
    </div>
  );
}
