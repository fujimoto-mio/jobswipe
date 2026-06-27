"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VideoFeed from "@/components/VideoFeed";
import BottomNav from "@/components/BottomNav";
import FilterScreen from "@/components/FilterScreen";
import { apiFetch } from "@/lib/api-client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { saveProfile } from "@/lib/profile";
import Logo from "@/components/ui/Logo";
import Link from "next/link";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import type { JobFilters } from "@/lib/types";

const FILTER_KEY = "jobswipe_filters_ready";

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saveCount, setSaveCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [authReady, setAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [filters, setFilters] = useState<JobFilters>({ areas: [], categories: [] });
  const [filtersReady, setFiltersReady] = useState(false);

  const refreshCounts = useCallback(() => {
    apiFetch("/api/saves")
      .then((r) => r.json())
      .then((d) => setSaveCount(d.count ?? 0));
    apiFetch("/api/chat")
      .then((r) => r.json())
      .then((d) => setChatCount(d.threads?.length ?? 0));
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(Boolean(data.session));
      setAuthReady(true);
      if (data.session) {
        refreshCounts();
        apiFetch("/api/profile")
          .then((r) => r.json())
          .then((d) => {
            if (d.profile) saveProfile(d.profile);
          });
      }
    });

    const ready = sessionStorage.getItem(FILTER_KEY);
    if (ready) {
      try {
        setFilters(JSON.parse(ready));
        setFiltersReady(true);
      } catch {
        sessionStorage.removeItem(FILTER_KEY);
      }
    }
  }, [refreshCounts]);

  useEffect(() => {
    if (!authReady || isLoggedIn) return;

    const params = new URLSearchParams({ next: "/explore" });
    if (searchParams.get("auth") === "required") {
      params.set("reason", "required");
    }
    router.replace(`/login?${params.toString()}`);
  }, [authReady, isLoggedIn, router, searchParams]);

  const handleContinueFilters = () => {
    sessionStorage.setItem(FILTER_KEY, JSON.stringify(filters));
    setFiltersReady(true);
  };

  if (!authReady || !isLoggedIn) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <PageLoading message="認証を確認中..." />
      </div>
    );
  }

  if (!filtersReady) {
    return (
      <FilterScreen
        filters={filters}
        onChange={setFilters}
        onContinue={handleContinueFilters}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-black">
      <header className="absolute left-0 right-0 top-0 z-30 bg-gradient-to-b from-black/50 to-transparent pb-6 pt-3">
        <div className="page-container flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" theme="dark" inTopbar />
          </Link>
          <button
            type="button"
            onClick={() => setFiltersReady(false)}
            className="rounded border border-white/25 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[var(--accent)] shadow-sm backdrop-blur-md transition hover:bg-white"
          >
            条件変更
          </button>
        </div>
      </header>

      <main className="relative h-full w-full flex-1 overflow-hidden">
        <VideoFeed filters={filters} onSaveCountChange={setSaveCount} />
      </main>

      <BottomNav saveCount={saveCount} chatCount={chatCount} theme="overlay" />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center bg-white">
          <PageLoading />
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
