"use client";

import { GraduationCap } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { AppHeader, AppPage } from "@/components/ui/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import { useSeekerBadges } from "@/components/seeker/SeekerBadgeProvider";

export default function CoursesPage() {
  const { saveCount, chatCount } = useSeekerBadges();

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
