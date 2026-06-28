"use client";

import Link from "next/link";
import { AppHeader, AppPage } from "@/components/ui/AppShell";

export default function PrivacyPage() {
  return (
    <AppPage>
      <AppHeader title="プライバシーポリシー" backHref="/settings" />
      <main className="page-main overflow-y-auto px-4 py-6 pb-10 text-sm leading-relaxed text-slate-700">
        <p className="mb-4 text-xs text-slate-500">最終更新日: 2026年6月27日</p>
        <h2 className="mb-2 text-base font-bold text-slate-900">1. 収集する情報</h2>
        <p className="mb-4">
          氏名、メールアドレス、生年月日、性別、希望条件、応募履歴、チャット内容など、サービス提供に必要な情報を収集します。
        </p>
        <h2 className="mb-2 text-base font-bold text-slate-900">2. 利用目的</h2>
        <p className="mb-4">
          求人の表示・応募処理、企業との連絡、採用通知メールの送信、サービス改善、不正利用の防止のために利用します。
        </p>
        <h2 className="mb-2 text-base font-bold text-slate-900">3. 第三者提供</h2>
        <p className="mb-4">
          応募先企業へのプロフィール・応募情報の提供、および認証・メール送信等のインフラ提供者への委託を行う場合があります。
        </p>
        <h2 className="mb-2 text-base font-bold text-slate-900">4. お問い合わせ</h2>
        <p>
          個人情報の開示・削除等のご請求は
          <Link href="/settings" className="mx-1 text-[var(--accent)] underline">
            設定
          </Link>
          画面のお問い合わせよりご連絡ください。
        </p>
      </main>
    </AppPage>
  );
}
