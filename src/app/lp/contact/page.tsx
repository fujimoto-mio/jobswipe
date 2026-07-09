import type { Metadata } from "next";
import ServiceLpContactPage from "@/components/service-lp/ServiceLpContactPage";
import "../lp.css";

export const metadata: Metadata = {
  title: "お問い合わせ｜JobSwipe",
  description: "JobSwipeへのお問い合わせはこちらから。モニター企業のご相談やサービス説明のご依頼を承ります。",
};

export default function ServiceLpContactRoutePage() {
  return <ServiceLpContactPage />;
}
