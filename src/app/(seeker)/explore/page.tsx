"use client";

import { useEffect, useState, useCallback, useRef, useMemo, Suspense, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VideoFeed from "@/components/VideoFeed";
import BottomNav from "@/components/BottomNav";
import FilterScreen from "@/components/FilterScreen";
import { apiFetch, apiFetchCached } from "@/lib/api-client";
import { fetchSeekerUnreadTotal } from "@/lib/chat-unread";
import { useSeekerUser } from "@/components/seeker/SeekerUserProvider";
import SeekerBrandHeader from "@/components/seeker/SeekerBrandHeader";
import PwaInstallBanner from "@/components/pwa/PwaInstallBanner";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import type { JobFilters } from "@/lib/types";
import {
  DEFAULT_JOB_FILTERS,
  EXPLORE_FILTERS_PARAM,
  buildExploreFeedParams,
  exploreFeedParamsKey,
  isExploreFeedReady,
  loadStoredExploreFilters,
  parseExploreFiltersFromParams,
  saveStoredExploreFilters,
} from "@/lib/job-filters";

const CHROME_AUTO_HIDE_MS = 5000;

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ready: authReady, loggedIn: isLoggedIn } = useSeekerUser();
  const [saveCount, setSaveCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [draftFilters, setDraftFilters] = useState<JobFilters>(() => loadStoredExploreFilters());
  const [chromeVisible, setChromeVisible] = useState(true);
  const hideChromeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerSubmenuOpenRef = useRef({ menu: false, install: false });

  const isHeaderSubmenuOpen = () =>
    headerSubmenuOpenRef.current.menu || headerSubmenuOpenRef.current.install;

  const clearChromeHideTimer = useCallback(() => {
    if (hideChromeTimerRef.current) {
      clearTimeout(hideChromeTimerRef.current);
      hideChromeTimerRef.current = null;
    }
  }, []);

  const scheduleChromeHide = useCallback(() => {
    if (isHeaderSubmenuOpen()) return;
    clearChromeHideTimer();
    hideChromeTimerRef.current = setTimeout(() => {
      if (isHeaderSubmenuOpen()) return;
      setChromeVisible(false);
      hideChromeTimerRef.current = null;
    }, CHROME_AUTO_HIDE_MS);
  }, [clearChromeHideTimer]);

  const revealChrome = useCallback(() => {
    setChromeVisible(true);
    scheduleChromeHide();
  }, [scheduleChromeHide]);

  const keepChromeVisible = revealChrome;

  const syncHeaderSubmenuChrome = useCallback(() => {
    if (isHeaderSubmenuOpen()) {
      setChromeVisible(true);
      clearChromeHideTimer();
      return;
    }
    scheduleChromeHide();
  }, [clearChromeHideTimer, scheduleChromeHide]);

  const handleHeaderMenuOpenChange = useCallback(
    (open: boolean) => {
      headerSubmenuOpenRef.current.menu = open;
      syncHeaderSubmenuChrome();
    },
    [syncHeaderSubmenuChrome]
  );

  const handleHeaderInstallOpenChange = useCallback(
    (open: boolean) => {
      headerSubmenuOpenRef.current.install = open;
      syncHeaderSubmenuChrome();
    },
    [syncHeaderSubmenuChrome]
  );

  useEffect(() => () => clearChromeHideTimer(), [clearChromeHideTimer]);

  const showFeed = isExploreFeedReady(searchParams);
  const filters = useMemo(() => parseExploreFiltersFromParams(searchParams), [searchParams]);
  const feedParamsKey = exploreFeedParamsKey(searchParams);

  useEffect(() => {
    if (!showFeed) return;
    revealChrome();
  }, [showFeed, revealChrome]);

  const refreshCounts = useCallback(() => {
    void apiFetchCached<{ count?: number }>("/api/saves?summary=1", 20_000).then((d) =>
      setSaveCount(d.count ?? 0)
    );
    void fetchSeekerUnreadTotal().then(setChatCount);
  }, []);

  useEffect(() => {
    if (!authReady || !isLoggedIn) return;
    refreshCounts();
  }, [authReady, isLoggedIn, refreshCounts]);

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
    saveStoredExploreFilters(DEFAULT_JOB_FILTERS);
    navigateToFeed(DEFAULT_JOB_FILTERS);
  };

  const handleDraftFiltersChange = (nextFilters: JobFilters) => {
    setDraftFilters(nextFilters);
    saveStoredExploreFilters(nextFilters);
  };

  const handleOpenFilterScreen = () => {
    setDraftFilters(filters);
    saveStoredExploreFilters(filters);
    router.replace(`/explore?${EXPLORE_FILTERS_PARAM}=1`);
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
    <div
      className={`seeker-explore-feed relative h-full w-full bg-black ${
        chromeVisible ? "" : "seeker-explore-feed--chrome-hidden"
      }`}
      style={
        {
          "--pwa-install-banner-bottom": chromeVisible
            ? "calc(5.5rem + env(safe-area-inset-bottom, 0px))"
            : "calc(1rem + env(safe-area-inset-bottom, 0px))",
        } as CSSProperties
      }
    >
      <main className="absolute inset-0 overflow-hidden">
        <VideoFeed
          filters={filters}
          fetchKey={feedParamsKey}
          onSaveCountChange={setSaveCount}
          chromeVisible={chromeVisible}
          onToggleChrome={revealChrome}
          onChromeActivity={keepChromeVisible}
          onActiveVideoChange={revealChrome}
        />
      </main>

      <header className="seeker-explore-feed-header pointer-events-none absolute inset-x-0 top-0 z-30 pt-[env(safe-area-inset-top,0px)] transition-opacity duration-700">
        <div className="pointer-events-auto">
          <SeekerBrandHeader
            theme="dark"
            menuVariant="overlay"
            logoHref="/"
            className="py-1.5"
            showInstallButton
            onMenuOpenChange={handleHeaderMenuOpenChange}
            onInstallOpenChange={handleHeaderInstallOpenChange}
            action={
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleOpenFilterScreen}
                className="btn-pill-overlay"
              >
                条件変更
              </button>
            }
          />
        </div>
      </header>

      <BottomNav saveCount={saveCount} chatCount={chatCount} theme="overlay" />
      <PwaInstallBanner />
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
