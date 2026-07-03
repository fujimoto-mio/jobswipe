"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SwipeCard from "./SwipeCard";
import ApplyModal from "./ApplyModal";
import JobDetailModal from "./JobDetailModal";
import { preloadVideoUrl } from "@/lib/video";
import { apiFetch, invalidateApiCache } from "@/lib/api-client";
import {
  exploreFeedCacheKey,
  getExploreFeedCache,
  setExploreFeedCache,
  updateExploreFeedSaves,
} from "@/lib/explore-feed-cache";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Job, JobFilters } from "@/lib/types";

type VideoFeedProps = {
  filters: JobFilters;
  fetchKey?: string;
  onSaveCountChange?: (count: number) => void;
};

export default function VideoFeed({ filters, fetchKey = "", onSaveCountChange }: VideoFeedProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const buildJobsUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.areas.length) params.set("areas", filters.areas.join(","));
    if (filters.categories.length) params.set("categories", filters.categories.join(","));
    const qs = params.toString();
    return `/api/jobs${qs ? `?${qs}` : ""}`;
  }, [filters]);

  const fetchData = useCallback(async () => {
    const jobsUrl = buildJobsUrl();
    const cacheKey = exploreFeedCacheKey(filters);
    const cached = getExploreFeedCache(cacheKey, fetchKey);

    if (cached) {
      setJobs(cached.jobs);
      setIndex(0);
      setSavedIds(new Set(cached.savedIds));
      onSaveCountChange?.(cached.count);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [jobsRes, savedRes] = await Promise.all([
        apiFetch(jobsUrl),
        apiFetch("/api/saves"),
      ]);
      const jobsData = await jobsRes.json();
      const savedData = await savedRes.json();
      const nextJobs = jobsData.jobs as Job[];
      const nextSavedIds = savedData.savedIds as string[];
      const nextCount = savedData.count as number;

      setJobs(nextJobs);
      setIndex(0);
      setSavedIds(new Set(nextSavedIds));
      onSaveCountChange?.(nextCount);
      setExploreFeedCache(cacheKey, fetchKey, {
        jobs: nextJobs,
        savedIds: nextSavedIds,
        count: nextCount,
      });
    } finally {
      setLoading(false);
    }
  }, [buildJobsUrl, fetchKey, filters, onSaveCountChange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const current = jobs[index];
    if (current) {
      apiFetch(`/api/jobs/${current.id}`).catch(() => {});
    }
    const els: HTMLVideoElement[] = [];
    for (const neighbor of [jobs[index + 1], jobs[index - 1]]) {
      if (neighbor) {
        const el = preloadVideoUrl(neighbor.videoUrl);
        if (el) els.push(el);
      }
    }
    return () => els.forEach((el) => { el.src = ""; el.load(); });
  }, [index, jobs]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const goNext = () => setIndex((i) => Math.min(i + 1, jobs.length - 1));
  const goPrev = () => setIndex((i) => Math.max(i - 1, 0));

  const handleSave = async (job: Job) => {
    const res = await apiFetch("/api/saves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.id }),
    });
    const data = await res.json();
    const nextSavedIds = data.savedIds as string[];
    const nextCount = data.count as number;
    setSavedIds(new Set(nextSavedIds));
    onSaveCountChange?.(nextCount);
    invalidateApiCache("/api/saves");
    updateExploreFeedSaves(
      exploreFeedCacheKey(filters),
      fetchKey,
      nextSavedIds,
      nextCount
    );
    showToast(data.saved ? "気になるに保存しました" : "保存を解除しました");
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
        {prevJob && (
          <SwipeCard
            key={`bg-prev-${prevJob.id}`}
            job={prevJob}
            isTop={false}
            isSaved={savedIds.has(prevJob.id)}
            onSwipeLeft={() => {}}
            onSwipeRight={() => {}}
            onSave={() => handleSave(prevJob)}
            onApply={() => setApplyJob(prevJob)}
            onDetail={() => setDetailJob(prevJob)}
          />
        )}
        {nextJob && (
          <SwipeCard
            key={`bg-next-${nextJob.id}`}
            job={nextJob}
            isTop={false}
            isSaved={savedIds.has(nextJob.id)}
            onSwipeLeft={() => {}}
            onSwipeRight={() => {}}
            onSave={() => handleSave(nextJob)}
            onApply={() => setApplyJob(nextJob)}
            onDetail={() => setDetailJob(nextJob)}
          />
        )}
        <AnimatePresence mode="popLayout">
          {currentJob && (
            <SwipeCard
              key={currentJob.id}
              job={currentJob}
              isTop={true}
              isSaved={savedIds.has(currentJob.id)}
              canSwipeLeft={canGoNext}
              canSwipeRight={canGoPrev}
              onSwipeLeft={goNext}
              onSwipeRight={goPrev}
              onSave={() => handleSave(currentJob)}
              onApply={() => setApplyJob(currentJob)}
              onDetail={() => setDetailJob(currentJob)}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {detailJob && (
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

      {applyJob && (
        <ApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSuccess={handleApplySuccess}
        />
      )}

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
