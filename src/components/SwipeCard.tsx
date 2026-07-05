"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { motion, useMotionValue, useTransform, animate, type PanInfo } from "framer-motion";
import VideoFeedItem from "./VideoFeedItem";
import type { JobFeedItem } from "@/lib/types";

const SWIPE_THRESHOLD = 72;
const SWIPE_DURATION = 0.26;

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

type StackSlideProps = {
  job: JobFeedItem;
  placement: "prev" | "current" | "next";
  scale?: ReturnType<typeof useTransform<number, number>>;
  isActive: boolean;
  preloadVideo?: boolean;
  isNext?: boolean;
  swipeEnabled?: boolean;
  chromeVisible: boolean;
  isSaved: boolean;
  zIndex: number;
  onChromeActivity?: () => void;
  onSave: () => void;
  onApply: () => void;
  onDetail: () => void;
};

function StackSlide({
  job,
  placement,
  scale,
  isActive,
  preloadVideo = false,
  isNext = false,
  swipeEnabled = false,
  chromeVisible,
  isSaved,
  zIndex,
  onChromeActivity,
  onSave,
  onApply,
  onDetail,
}: StackSlideProps) {
  const placementClass =
    placement === "prev" ? "bottom-full" : placement === "next" ? "top-full" : "inset-0";

  return (
    <motion.div
      className={`absolute left-0 right-0 h-full will-change-transform ${placementClass}`}
      style={{ scale: scale ?? 1, zIndex }}
    >
      <VideoFeedItem
        job={job}
        isActive={isActive}
        preloadVideo={preloadVideo}
        isNext={isNext}
        swipeEnabled={swipeEnabled}
        chromeVisible={chromeVisible}
        isSaved={isSaved}
        onChromeActivity={onChromeActivity}
        onSave={onSave}
        onApply={onApply}
        onDetail={onDetail}
      />
    </motion.div>
  );
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
  const containerRef = useRef<HTMLDivElement>(null);
  const dragY = useMotionValue(0);
  const heightRef = useRef(0);
  const prevPreloadKey = prevJob ? `${currentJob.id}:${prevJob.id}` : null;
  const [primedPrevKey, setPrimedPrevKey] = useState<string | null>(null);

  useEffect(() => {
    if (!prevPreloadKey) return;
    const timer = window.setTimeout(() => setPrimedPrevKey(prevPreloadKey), 400);
    return () => window.clearTimeout(timer);
  }, [prevPreloadKey]);

  const preloadPrev = prevPreloadKey !== null && primedPrevKey === prevPreloadKey;

  const currentScale = useTransform(dragY, (v) => {
    const h = heightRef.current || 1;
    return 1 - Math.min(Math.abs(v) / h, 1) * 0.04;
  });
  const prevOpacity = useTransform(dragY, [0, 80], [0, 1]);
  const nextOpacity = useTransform(dragY, [-80, 0], [1, 0]);

  const measureHeight = useCallback(() => {
    const h = containerRef.current?.offsetHeight ?? 0;
    if (h > 0) heightRef.current = h;
  }, []);

  useEffect(() => {
    measureHeight();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measureHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureHeight]);

  useEffect(() => {
    dragY.set(0);
  }, [currentJob.id, dragY]);

  const snapBack = () => {
    animate(dragY, 0, { type: "spring", stiffness: 420, damping: 36, mass: 0.85 });
  };

  const completeSwipe = (direction: "up" | "down") => {
    const h = heightRef.current || containerRef.current?.offsetHeight || window.innerHeight;
    const target = direction === "up" ? -h : h;
    animate(dragY, target, {
      duration: SWIPE_DURATION,
      ease: [0.32, 0.72, 0, 1],
    }).then(() => {
      flushSync(() => {
        if (direction === "up") onSwipeUp();
        else onSwipeDown();
      });
      dragY.set(0);
    });
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const passedThreshold = Math.abs(offset.y) > SWIPE_THRESHOLD || Math.abs(velocity.y) > 500;

    if (offset.y < 0 && passedThreshold) {
      if (!canSwipeUp) {
        snapBack();
        return;
      }
      completeSwipe("up");
    } else if (offset.y > 0 && passedThreshold) {
      if (!canSwipeDown) {
        snapBack();
        return;
      }
      completeSwipe("down");
    } else {
      snapBack();
    }
  };

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <motion.div
        className="absolute inset-0 cursor-grab select-none active:cursor-grabbing"
        style={{ y: dragY, touchAction: "none" }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={
          canSwipeUp && canSwipeDown ? 0.35 : canSwipeUp ? { top: 0.35, bottom: 0.08 } : { top: 0.08, bottom: 0.35 }
        }
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        onTap={onToggleChrome}
      >
        {prevJob && (
          <StackSlide
            key={prevJob.id}
            job={prevJob}
            placement="prev"
            isActive={false}
            preloadVideo={preloadPrev}
            chromeVisible={false}
            isSaved={isSaved(prevJob.id)}
            zIndex={1}
            onSave={() => onSave(prevJob)}
            onApply={() => onApply(prevJob)}
            onDetail={() => onDetail(prevJob)}
          />
        )}

        <StackSlide
          key={currentJob.id}
          job={currentJob}
          placement="current"
          scale={currentScale}
          isActive
          swipeEnabled
          chromeVisible={chromeVisible}
          isSaved={isSaved(currentJob.id)}
          zIndex={10}
          onChromeActivity={onChromeActivity}
          onSave={() => onSave(currentJob)}
          onApply={() => onApply(currentJob)}
          onDetail={() => onDetail(currentJob)}
        />

        {nextJob && (
          <StackSlide
            key={nextJob.id}
            job={nextJob}
            placement="next"
            isActive={false}
            isNext
            preloadVideo
            chromeVisible={false}
            isSaved={isSaved(nextJob.id)}
            zIndex={1}
            onSave={() => onSave(nextJob)}
            onApply={() => onApply(nextJob)}
            onDetail={() => onDetail(nextJob)}
          />
        )}

        <div
          className={`seeker-video-feed-chrome pointer-events-none absolute inset-0 z-30 ${chromeVisible ? "" : "seeker-video-feed-chrome--off"}`}
        >
          <motion.div
            style={{ opacity: prevOpacity }}
            className="absolute left-1/2 top-[38%] -translate-x-1/2"
          >
            <div className="rounded-2xl border-[3px] border-white/60 px-6 py-2">
              <span className="text-3xl font-black tracking-wide text-white/80">前へ</span>
            </div>
          </motion.div>
          <motion.div
            style={{ opacity: nextOpacity }}
            className="absolute left-1/2 top-[32%] -translate-x-1/2"
          >
            <div className="rounded-2xl border-[3px] border-emerald-400 px-6 py-2">
              <span className="text-3xl font-black tracking-wide text-emerald-400">次へ</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
