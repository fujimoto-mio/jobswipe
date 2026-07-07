import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceLpPage from "@/components/service-lp/ServiceLpPage";
import { isServiceLpEnabled } from "@/lib/service-lp";
import "./lp.css";

export function generateMetadata(): Metadata {
  if (!isServiceLpEnabled()) {
    return { title: "Not Found" };
  }

  return {
    title: "採用のプロ集団が提案するSNS運用代行サービス｜株式会社MasKOFF",
    description:
      "SNS運用×動画で届ける会社の空気感。応募者が知っていれば生じなかったミスマッチを、月15万円から完全代行で防ぎます。",
    openGraph: {
      title: "採用のプロ集団が提案するSNS運用代行サービス｜株式会社MasKOFF",
      description:
        "SNS運用×動画で届ける会社の空気感。応募者が知っていれば生じなかったミスマッチを、月15万円から完全代行で防ぎます。",
      type: "website",
      url: "/lp/",
    },
  };
}

export default function ServiceLpRoutePage() {
  if (!isServiceLpEnabled()) {
    notFound();
  }

  return <ServiceLpPage />;
}
