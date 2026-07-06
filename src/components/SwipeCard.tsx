"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import VideoFeedItem from "./VideoFeedItem";
import {
  clampSwipeOffset,
  dominantSlideIndex,
  resolveSwipeIntent,
  springSnap,
  trackTranslateY,
} from "@/lib/seeker-feed-motion";
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
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pageHeightRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const isResettingRef = useRef(false);
  const commitLockRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartOffsetRef = useRef(0);
  const lastMoveRef = useRef({ y: 0, t: 0 });
  const velocityRef = useRef(0);
  const cancelSpringRef = useRef<(() => void) | null>(null);

  const slides = buildSlides(prevJob, currentJob, nextJob);
  const currentSlotIndex = prevJob ? 1 : 0;
  const [activeSlot, setActiveSlot] = useState(currentSlotIndex);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);

  const measureHeight = useCallback(() => {
    const h = viewportRef.current?.clientHeight ?? 0;
    if (h > 0) pageHeightRef.current = h;
  }, []);

  const applyTrackTransform = useCallback(
    (offsetY: number) => {
      const h = pageHeightRef.current;
      const track = trackRef.current;
      if (!track || h <= 0) return;
      track.style.transform = `translate3d(0, ${trackTranslateY(currentSlotIndex, h, offsetY)}px, 0)`;
    },
    [currentSlotIndex]
  );

  const setDragOffsetSync = useCallback(
    (nextOffset: number) => {
      dragOffsetRef.current = nextOffset;
      applyTrackTransform(nextOffset);
    },
    [applyTrackTransform]
  );

  const updateActiveSlot = useCallback(
    (offsetY: number) => {
      if (isResettingRef.current || commitLockRef.current) return;
      setActiveSlot(dominantSlideIndex(currentSlotIndex, pageHeightRef.current, offsetY));
    },
    [currentSlotIndex]
  );

  const cancelAnimation = useCallback(() => {
    cancelSpringRef.current?.();
    cancelSpringRef.current = null;
    isAnimatingRef.current = false;
  }, []);

  const animateTo = useCallback(
    (targetOffset: number, onComplete?: () => void) => {
      cancelAnimation();
      isAnimatingRef.current = true;

      cancelSpringRef.current = springSnap({
        from: dragOffsetRef.current,
        to: targetOffset,
        velocity: velocityRef.current,
        onUpdate: (value) => {
          setDragOffsetSync(value);
          updateActiveSlot(value);
        },
        onComplete: () => {
          cancelSpringRef.current = null;
          isAnimatingRef.current = false;
          setDragOffsetSync(targetOffset);
          updateActiveSlot(targetOffset);
          onComplete?.();
        },
      });
    },
    [cancelAnimation, setDragOffsetSync, updateActiveSlot]
  );

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

  useEffect(() => {
    measureHeight();
    const el = viewportRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      measureHeight();
      isResettingRef.current = true;
      setDragOffsetSync(0);
      isResettingRef.current = false;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureHeight, setDragOffsetSync]);

  useLayoutEffect(() => {
    measureHeight();
    cancelAnimation();
    isResettingRef.current = true;
    setDragOffsetSync(0);
    setActiveSlot(currentSlotIndex);
    setPendingJobId(null);
    commitLockRef.current = false;
    isResettingRef.current = false;
  }, [cancelAnimation, currentJob.id, currentSlotIndex, measureHeight, setDragOffsetSync]);

  useEffect(() => {
    return () => cancelAnimation();
  }, [cancelAnimation]);

  const finishPointer = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const viewport = viewportRef.current;
      if (!viewport || pointerIdRef.current !== event.pointerId) return;

      viewport.releasePointerCapture(event.pointerId);
      pointerIdRef.current = null;
      isDraggingRef.current = false;

      const start = pointerStartRef.current;
      pointerStartRef.current = null;

      const h = pageHeightRef.current;
      const offset = dragOffsetRef.current;
      const intent = resolveSwipeIntent(offset, velocityRef.current, h);

      const isTap =
        start &&
        Math.abs(event.clientX - start.x) < 10 &&
        Math.abs(event.clientY - start.y) < 10 &&
        Math.abs(offset) < 6;

      if (isTap) {
        if (offset !== 0) setDragOffsetSync(0);
        onToggleChrome?.();
        return;
      }

      if (intent === "up" && canSwipeUp && nextJob) {
        animateTo(-h, () => commitSwipe("up"));
        return;
      }

      if (intent === "down" && canSwipeDown && prevJob) {
        animateTo(h, () => commitSwipe("down"));
        return;
      }

      animateTo(0);
    },
    [
      animateTo,
      canSwipeDown,
      canSwipeUp,
      commitSwipe,
      nextJob,
      onToggleChrome,
      prevJob,
      setDragOffsetSync,
    ]
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a, input, textarea, select")) return;
    if (isAnimatingRef.current || commitLockRef.current) return;

    cancelAnimation();
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    dragStartOffsetRef.current = dragOffsetRef.current;
    lastMoveRef.current = { y: event.clientY, t: performance.now() };
    velocityRef.current = 0;
    isDraggingRef.current = true;
    pointerIdRef.current = event.pointerId;
    viewportRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || pointerIdRef.current !== event.pointerId || !pointerStartRef.current) return;

    const rawOffset = dragStartOffsetRef.current + (event.clientY - pointerStartRef.current.y);
    const nextOffset = clampSwipeOffset(rawOffset, pageHeightRef.current, canSwipeUp, canSwipeDown);
    setDragOffsetSync(nextOffset);

    const now = performance.now();
    const dt = now - lastMoveRef.current.t;
    if (dt > 0) {
      velocityRef.current = (event.clientY - lastMoveRef.current.y) / dt;
    }
    lastMoveRef.current = { y: event.clientY, t: now };
    updateActiveSlot(nextOffset);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a, input, textarea, select")) return;
    finishPointer(event);
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    finishPointer(event);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div
        ref={viewportRef}
        className="seeker-video-feed-viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div ref={trackRef} className="seeker-video-feed-track">
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
    </div>
  );
}
