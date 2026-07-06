"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import VideoFeedItem from "./VideoFeedItem";
import type { JobFeedItem } from "@/lib/types";

type SlideSlot = {
  role: "prev" | "current" | "next";
  job: JobFeedItem;
};

type SwipeCardProps = {
  prevJob: JobFeedItem | null;
  currentJob: JobFeedItem;
  nextJob: JobFeedItem | null;
  isSaved: (jobId: string) => boolean;
  chromeVisible?: boolean;
  canSwipeUp?: boolean;
  canSwipeDown?: boolean;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onToggleChrome?: () => void;
  onChromeActivity?: () => void;
  onSave: (job: JobFeedItem) => void;
  onApply: (job: JobFeedItem) => void;
  onDetail: (job: JobFeedItem) => void;
};

function buildSlides(
  prevJob: JobFeedItem | null,
  currentJob: JobFeedItem,
  nextJob: JobFeedItem | null
): SlideSlot[] {
  const slides: SlideSlot[] = [];
  if (prevJob) slides.push({ role: "prev", job: prevJob });
  slides.push({ role: "current", job: currentJob });
  if (nextJob) slides.push({ role: "next", job: nextJob });
  return slides;
}

export default function SwipeCard({
  prevJob,
  currentJob,
  nextJob,
  isSaved,
  chromeVisible = true,
  canSwipeUp = true,
  canSwipeDown = true,
  onSwipeUp,
  onSwipeDown,
  onToggleChrome,
  onChromeActivity,
  onSave,
  onApply,
  onDetail,
}: SwipeCardProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pageHeightRef = useRef(0);
  const isResettingRef = useRef(false);
  const commitLockRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const slides = buildSlides(prevJob, currentJob, nextJob);
  const currentSlotIndex = prevJob ? 1 : 0;
  const [activeSlot, setActiveSlot] = useState(currentSlotIndex);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);

  const measureHeight = useCallback(() => {
    const h = scrollerRef.current?.clientHeight ?? 0;
    if (h > 0) pageHeightRef.current = h;
  }, []);

  const scrollToCurrent = useCallback(
    (behavior: ScrollBehavior = "auto") => {
      const el = scrollerRef.current;
      const h = pageHeightRef.current;
      if (!el || !h) return;
      el.scrollTo({ top: currentSlotIndex * h, behavior });
    },
    [currentSlotIndex]
  );

  useEffect(() => {
    measureHeight();
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      measureHeight();
      isResettingRef.current = true;
      scrollToCurrent();
      isResettingRef.current = false;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureHeight, scrollToCurrent]);

  useLayoutEffect(() => {
    measureHeight();
    isResettingRef.current = true;
    scrollToCurrent("auto");
    setActiveSlot(currentSlotIndex);
    setPendingJobId(null);
    commitLockRef.current = false;
    isResettingRef.current = false;
  }, [currentJob.id, currentSlotIndex, measureHeight, scrollToCurrent]);

  const syncActiveSlot = useCallback(() => {
    const el = scrollerRef.current;
    const h = pageHeightRef.current;
    if (!el || !h || isResettingRef.current || commitLockRef.current) return;
    setActiveSlot(Math.round(el.scrollTop / h));
  }, []);

  const commitSwipe = useCallback(
    (direction: "up" | "down") => {
      const targetJob = direction === "up" ? nextJob : prevJob;
      if (!targetJob || commitLockRef.current) return;

      commitLockRef.current = true;
      isResettingRef.current = true;
      setPendingJobId(targetJob.id);
      if (direction === "up") onSwipeUp();
      else onSwipeDown();
    },
    [nextJob, onSwipeDown, onSwipeUp, prevJob]
  );

  const handleScrollSettled = useCallback(() => {
    if (isResettingRef.current || commitLockRef.current) return;

    const el = scrollerRef.current;
    const h = pageHeightRef.current;
    if (!el || !h) return;

    const slot = Math.round(el.scrollTop / h);
    if (slot < currentSlotIndex) {
      if (!canSwipeDown || !prevJob) {
        isResettingRef.current = true;
        scrollToCurrent("smooth");
        window.setTimeout(() => {
          isResettingRef.current = false;
        }, 300);
        return;
      }
      commitSwipe("down");
      return;
    }

    if (slot > currentSlotIndex) {
      if (!canSwipeUp || !nextJob) {
        isResettingRef.current = true;
        scrollToCurrent("smooth");
        window.setTimeout(() => {
          isResettingRef.current = false;
        }, 300);
        return;
      }
      commitSwipe("up");
    }
  }, [
    canSwipeDown,
    canSwipeUp,
    commitSwipe,
    currentSlotIndex,
    nextJob,
    prevJob,
    scrollToCurrent,
  ]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleSettle = () => {
      syncActiveSlot();
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        settleTimer = null;
        handleScrollSettled();
      }, 80);
    };

    const onScrollEnd = () => handleScrollSettled();
    el.addEventListener("scroll", scheduleSettle, { passive: true });
    el.addEventListener("scrollend", onScrollEnd);

    return () => {
      if (settleTimer) clearTimeout(settleTimer);
      el.removeEventListener("scroll", scheduleSettle);
      el.removeEventListener("scrollend", onScrollEnd);
    };
  }, [handleScrollSettled, syncActiveSlot]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a, input, textarea, select")) return;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a, input, textarea, select")) return;
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || !onToggleChrome) return;

    const dx = Math.abs(event.clientX - start.x);
    const dy = Math.abs(event.clientY - start.y);
    if (dx < 10 && dy < 10) {
      onToggleChrome();
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div
        ref={scrollerRef}
        className="seeker-video-feed-scroller"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {slides.map(({ job }, slideIndex) => {
          const isActive = pendingJobId ? job.id === pendingJobId : slideIndex === activeSlot;
          const isAdjacent = job.id === prevJob?.id || job.id === nextJob?.id;

          return (
            <div key={job.id} className="seeker-video-feed-slide">
              <VideoFeedItem
                job={job}
                isActive={isActive}
                preloadVideo={!isActive && isAdjacent}
                swipeEnabled={isActive}
                chromeVisible={isActive ? chromeVisible : false}
                isSaved={isSaved(job.id)}
                onChromeActivity={onChromeActivity}
                onSave={() => onSave(job)}
                onApply={() => onApply(job)}
                onDetail={() => onDetail(job)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
