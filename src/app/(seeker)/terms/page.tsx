"use client";

import Link from "next/link";
import { AppHeader, AppPage } from "@/components/ui/AppShell";

export default function TermsPage() {
  return (
    <AppPage>
      <AppHeader title="利用規約" backHref="/settings" />
      <main className="page-main overflow-y-auto px-4 py-6 pb-10 text-sm leading-relaxed text-slate-700">
        <p className="mb-4 text-xs text-slate-500">最終更新日: 2026年6月27日</p>
        <h2 className="mb-2 text-base font-bold text-slate-900">第1条（適用）</h2>
        <p className="mb-4">
          本規約は、JobSwipe（以下「本サービス」）の利用条件を定めるものです。ユーザーは本規約に同意のうえ本サービスを利用するものとします。
        </p>
        <h2 className="mb-2 text-base font-bold text-slate-900">第2条（アカウント）</h2>
        <p className="mb-4">
          ユーザーは正確な情報を登録し、自己の責任においてアカウントを管理するものとします。第三者への貸与・譲渡は禁止します。
        </p>
        <h2 className="mb-2 text-base font-bold text-slate-900">第3条（禁止事項）</h2>
        <p className="mb-4">
          虚偽の応募、スパム行為、法令違反、他ユーザーまたは企業への迷惑行為、その他運営が不適切と判断する行為を禁止します。
        </p>
        <h2 className="mb-2 text-base font-bold text-slate-900">第4条（免責）</h2>
        <p className="mb-4">
          本サービス上の求人情報の正確性、採用の成立、企業とのトラブル等について、運営者は一切の責任を負いません。
        </p>
        <p>
          詳細な規約全文は準備中です。ご不明点は
          <Link href="/settings" className="mx-1 text-[var(--accent)] underline">
            設定
          </Link>
          画面のお問い合わせよりご連絡ください。
        </p>
      </main>
    </AppPage>
  );
}
