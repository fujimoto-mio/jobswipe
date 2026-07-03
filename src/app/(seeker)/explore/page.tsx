"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VideoFeed from "@/components/VideoFeed";
import BottomNav from "@/components/BottomNav";
import FilterScreen from "@/components/FilterScreen";
import { apiFetch, apiFetchCached } from "@/lib/api-client";
import { fetchSeekerUnreadTotal } from "@/lib/chat-unread";
import { getCachedClientSession } from "@/lib/auth/client-session";
import SeekerBrandHeader from "@/components/seeker/SeekerBrandHeader";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import type { JobFilters } from "@/lib/types";
import {
  DEFAULT_JOB_FILTERS,
  buildExploreFeedParams,
  exploreFeedParamsKey,
  isExploreFeedReady,
  loadStoredExploreFilters,
  parseExploreFiltersFromParams,
  saveStoredExploreFilters,
} from "@/lib/job-filters";

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saveCount, setSaveCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [authReady, setAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [draftFilters, setDraftFilters] = useState<JobFilters>(() => loadStoredExploreFilters());

  const showFeed = isExploreFeedReady(searchParams);
  const filters = parseExploreFiltersFromParams(searchParams);
  const feedParamsKey = exploreFeedParamsKey(searchParams);

  const refreshCounts = useCallback(() => {
    void apiFetchCached<{ count?: number }>("/api/saves", 20_000).then((d) =>
      setSaveCount(d.count ?? 0)
    );
    void fetchSeekerUnreadTotal().then(setChatCount);
  }, []);

  useEffect(() => {
    void getCachedClientSession().then((loggedIn) => {
      setIsLoggedIn(loggedIn);
      setAuthReady(true);
      if (loggedIn) {
        refreshCounts();
      }
    });
  }, [refreshCounts]);

  useEffect(() => {
    if (!authReady || isLoggedIn) return;

    const exploreQuery = searchParams.toString();
    const nextPath = exploreQuery ? `/explore?${exploreQuery}` : "/explore";
    const params = new URLSearchParams({ next: nextPath });
    if (searchParams.get("auth") === "required") {
      params.set("reason", "required");
    }
    router.replace(`/login?${params.toString()}`);
  }, [authReady, isLoggedIn, router, searchParams]);

  const navigateToFeed = (nextFilters: JobFilters, options?: { started?: boolean }) => {
    const params = buildExploreFeedParams(nextFilters, options);
    const query = params.toString();
    router.replace(query ? `/explore?${query}` : "/explore");
  };

  const handleContinueFilters = () => {
    saveStoredExploreFilters(draftFilters);
    navigateToFeed(draftFilters);
  };

  const handleSkipFilters = () => {
    navigateToFeed(DEFAULT_JOB_FILTERS, { started: true });
  };

  const handleDraftFiltersChange = (nextFilters: JobFilters) => {
    setDraftFilters(nextFilters);
    saveStoredExploreFilters(nextFilters);
  };

  const handleOpenFilterScreen = () => {
    setDraftFilters(filters);
    saveStoredExploreFilters(filters);
    router.replace("/explore");
  };

  if (!authReady || !isLoggedIn) {
    return (
      <div className="flex h-full items-center justify-center">
        <PageLoading message="認証を確認中..." />
      </div>
    );
  }

  if (!showFeed) {
    return (
      <FilterScreen
        filters={draftFilters}
        onChange={handleDraftFiltersChange}
        onContinue={handleContinueFilters}
        onCancel={handleSkipFilters}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-black">
      <header className="absolute left-0 right-0 top-0 z-30 bg-gradient-to-b from-black/50 to-transparent pb-4 pt-2">
        <SeekerBrandHeader
          theme="dark"
          menuVariant="overlay"
          logoHref="/"
          action={
            <button type="button" onClick={handleOpenFilterScreen} className="btn-pill-overlay">
              条件変更
            </button>
          }
        />
      </header>

      <main className="relative h-full w-full flex-1 overflow-hidden">
        <VideoFeed
          filters={filters}
          fetchKey={feedParamsKey}
          onSaveCountChange={setSaveCount}
        />
      </main>

      <BottomNav saveCount={saveCount} chatCount={chatCount} theme="overlay" />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <PageLoading />
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
