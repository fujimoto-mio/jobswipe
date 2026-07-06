"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import SwipeCard from "./SwipeCard";
import { apiFetch, apiFetchCached, invalidateApiCache } from "@/lib/api-client";
import {
  exploreFeedCacheKey,
  getExploreFeedCache,
  setExploreFeedCache,
  updateExploreFeedSaves,
} from "@/lib/explore-feed-cache";
import { useSeekerBadges } from "@/components/seeker/SeekerBadgeProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Job, JobFeedItem, JobFilters } from "@/lib/types";

const ApplyModal = dynamic(() => import("./ApplyModal"), { ssr: false });
const JobDetailModal = dynamic(() => import("./JobDetailModal"), { ssr: false });

const JOBS_CACHE_TTL_MS = 30_000;

type VideoFeedProps = {
  filters: JobFilters;
  fetchKey?: string;
  chromeVisible?: boolean;
  onToggleChrome?: () => void;
  onChromeActivity?: () => void;
  onActiveVideoChange?: () => void;
};

export default function VideoFeed({
  filters,
  fetchKey = "",
  chromeVisible = false,
  onToggleChrome,
  onChromeActivity,
  onActiveVideoChange,
}: VideoFeedProps) {
  const { savedIds, saveCount, applySavesUpdate } = useSeekerBadges();
  const badgesRef = useRef({ savedIds, saveCount });
  badgesRef.current = { savedIds, saveCount };
  const [jobs, setJobs] = useState<JobFeedItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applyJob, setApplyJob] = useState<JobFeedItem | null>(null);
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const feedIdentityRef = useRef("");
  const pendingViewsRef = useRef<Set<string>>(new Set());
  const flushViewsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filterKey = exploreFeedCacheKey(filters);

  const buildJobsUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.areas.length) params.set("areas", filters.areas.join(","));
    if (filters.categories.length) params.set("categories", filters.categories.join(","));
    const qs = params.toString();
    return `/api/jobs${qs ? `?${qs}` : ""}`;
  }, [filters.areas, filters.categories]);

  const flushViewCounts = useCallback(() => {
    const jobIds = [...pendingViewsRef.current];
    pendingViewsRef.current.clear();
    if (!jobIds.length) return;

    void apiFetch("/api/jobs/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobIds }),
    }).catch(() => {});
  }, []);

  const queueViewCount = useCallback(
    (jobId: string) => {
      if (!jobId || pendingViewsRef.current.has(jobId)) return;
      pendingViewsRef.current.add(jobId);
      if (flushViewsTimerRef.current) clearTimeout(flushViewsTimerRef.current);
      flushViewsTimerRef.current = setTimeout(() => {
        flushViewsTimerRef.current = null;
        flushViewCounts();
      }, 1200);
    },
    [flushViewCounts]
  );

  const fetchData = useCallback(async () => {
    const jobsUrl = buildJobsUrl();
    const feedIdentity = `${filterKey}|${fetchKey}`;
    const isNewFeed = feedIdentityRef.current !== feedIdentity;
    feedIdentityRef.current = feedIdentity;

    const cached = getExploreFeedCache(filterKey, fetchKey);

    if (cached) {
      setJobs(cached.jobs);
      if (isNewFeed) setIndex(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const jobsData = await apiFetchCached<{ jobs: JobFeedItem[] }>(jobsUrl, JOBS_CACHE_TTL_MS);
      const nextJobs = jobsData.jobs ?? [];
      const { savedIds: currentSavedIds, saveCount: currentCount } = badgesRef.current;

      setJobs(nextJobs);
      setIndex(0);
      setExploreFeedCache(filterKey, fetchKey, {
        jobs: nextJobs,
        savedIds: [...currentSavedIds],
        count: currentCount,
      });
    } finally {
      setLoading(false);
    }
  }, [buildJobsUrl, fetchKey, filterKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const current = jobs[index];
    if (current) {
      queueViewCount(current.id);
      onActiveVideoChange?.();
    }
  }, [index, jobs, queueViewCount, onActiveVideoChange]);

  useEffect(() => {
    return () => {
      if (flushViewsTimerRef.current) clearTimeout(flushViewsTimerRef.current);
      flushViewCounts();
    };
  }, [flushViewCounts]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const goNext = () => {
    setIndex((i) => Math.min(i + 1, jobs.length - 1));
  };
  const goPrev = () => {
    setIndex((i) => Math.max(i - 1, 0));
  };

  const handleSave = async (job: JobFeedItem) => {
    onChromeActivity?.();
    const res = await apiFetch("/api/saves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.id }),
    });
    const data = await res.json();
    const nextSavedIds = data.savedIds as string[];
    const nextCount = data.count as number;
    applySavesUpdate(nextSavedIds, nextCount);
    invalidateApiCache("/api/saves");
    updateExploreFeedSaves(filterKey, fetchKey, nextSavedIds, nextCount);
    showToast(data.saved ? "気になるに保存しました" : "保存を解除しました");
  };

  const openDetail = async (job: JobFeedItem) => {
    onChromeActivity?.();
    setDetailLoading(true);
    setDetailJob(job as Job);
    try {
      const res = await apiFetch(`/api/jobs/${job.id}?trackView=false`);
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setDetailJob(data.job as Job);
    } catch {
      setDetailJob(null);
      showToast("求人詳細の読み込みに失敗しました");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApplySuccess = () => {
    setApplyJob(null);
    showToast("応募が完了しました");
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--seeker-bg)]">
        <LoadingSpinner size="lg" message="求人動画を読み込み中..." dark />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-medium text-[var(--seeker-text)]">条件に合う求人がありません</p>
        <p className="text-sm text-[var(--seeker-text-muted)]">絞り込み条件を変更してください</p>
      </div>
    );
  }

  const currentJob = jobs[index];
  const nextJob = index < jobs.length - 1 ? jobs[index + 1] : null;
  const prevJob = index > 0 ? jobs[index - 1] : null;
  const canGoNext = index < jobs.length - 1;
  const canGoPrev = index > 0;

  return (
    <>
      <div className="relative h-full w-full bg-black">
        <SwipeCard
          prevJob={prevJob}
          currentJob={currentJob}
          nextJob={nextJob}
          isSaved={(jobId) => savedIds.has(jobId)}
          chromeVisible={chromeVisible}
          canSwipeUp={canGoNext}
          canSwipeDown={canGoPrev}
          onSwipeUp={goNext}
          onSwipeDown={goPrev}
          onToggleChrome={onToggleChrome}
          onChromeActivity={onChromeActivity}
          onSave={handleSave}
          onApply={(job) => {
            onChromeActivity?.();
            setApplyJob(job);
          }}
          onDetail={(job) => void openDetail(job)}
        />
      </div>

      <AnimatePresence>
        {detailJob && !detailLoading && (
          <JobDetailModal
            key={detailJob.id}
            job={detailJob}
            isSaved={savedIds.has(detailJob.id)}
            onClose={() => setDetailJob(null)}
            onSave={() => handleSave(detailJob)}
            onApply={() => {
              setDetailJob(null);
              setApplyJob(detailJob);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {applyJob && (
          <ApplyModal
            key={applyJob.id}
            job={applyJob}
            onClose={() => setApplyJob(null)}
            onSuccess={handleApplySuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] left-1/2 z-50 -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-xl ring-1 ring-slate-200"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
