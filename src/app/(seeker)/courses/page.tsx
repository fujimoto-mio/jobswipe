"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { AppHeader, AppPage } from "@/components/ui/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/api-client";
import { fetchSeekerUnreadTotal } from "@/lib/chat-unread";

export default function CoursesPage() {
  const [saveCount, setSaveCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      apiFetch("/api/saves")
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) setSaveCount(data.count ?? 0);
        }),
      fetchSeekerUnreadTotal().then((count) => {
        if (!cancelled) setChatCount(count);
      }),
    ]);

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppPage>
      <AppHeader title="スキル講座" backHref="/explore" />

      <main className="page-main page-container flex min-h-0 flex-1 flex-col overflow-x-hidden pb-[4.5rem]">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-8">
          <EmptyState
            variant="seeker"
            icon={GraduationCap}
            title="スキル講座は現在実装中です"
            description="ただいま機能を準備しています。公開までしばらくお待ちください。"
          />
        </div>
      </main>

      <BottomNav saveCount={saveCount} chatCount={chatCount} />
    </AppPage>
  );
}
