"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import VideoFeedItem from "./VideoFeedItem";
import type { Job } from "@/lib/types";

const SWIPE_THRESHOLD = 80;

type SwipeCardProps = {
  job: Job;
  isTop: boolean;
  isSaved: boolean;
  canSwipeLeft?: boolean;
  canSwipeRight?: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSave: () => void;
  onApply: () => void;
  onDetail: () => void;
};

export default function SwipeCard({
  job,
  isTop,
  isSaved,
  canSwipeLeft = true,
  canSwipeRight = true,
  onSwipeLeft,
  onSwipeRight,
  onSave,
  onApply,
  onDetail,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-6, 0, 6]);
  const prevOpacity = useTransform(x, [0, 100], [0, 1]);
  const nextOpacity = useTransform(x, [-100, 0], [1, 0]);

  useEffect(() => {
    x.set(0);
  }, [job.id, x]);

  const snapBack = () => {
    animate(x, 0, { type: "spring", stiffness: 500, damping: 35 });
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset } = info;

    if (offset.x < -SWIPE_THRESHOLD) {
      if (!canSwipeLeft) {
        snapBack();
        return;
      }
      animate(x, -500, { duration: 0.22 }).then(() => {
        onSwipeLeft();
        x.set(0);
      });
    } else if (offset.x > SWIPE_THRESHOLD) {
      if (!canSwipeRight) {
        snapBack();
        return;
      }
      animate(x, 500, { duration: 0.22 }).then(() => {
        onSwipeRight();
        x.set(0);
      });
    } else {
      snapBack();
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab select-none active:cursor-grabbing"
      style={{ x, rotate, zIndex: isTop ? 10 : 0, touchAction: "none" }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.98, opacity: isTop ? 1 : 0.85 }}
      animate={{ scale: isTop ? 1 : 0.98, opacity: isTop ? 1 : 0.85 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      <div className="relative h-full w-full overflow-hidden">
        <VideoFeedItem
          job={job}
          isActive={isTop}
          swipeEnabled={isTop}
          isSaved={isSaved}
          onSave={onSave}
          onApply={onApply}
          onDetail={onDetail}
        />

        {isTop && (
          <>
            <motion.div
              style={{ opacity: prevOpacity }}
              className="pointer-events-none absolute left-1/2 top-[38%] z-30 -translate-x-1/2"
            >
              <div className="rounded-2xl border-[3px] border-white/60 px-6 py-2">
                <span className="text-3xl font-black tracking-wide text-white/80">前へ</span>
              </div>
            </motion.div>
            <motion.div
              style={{ opacity: nextOpacity }}
              className="pointer-events-none absolute left-1/2 top-[38%] z-30 -translate-x-1/2"
            >
              <div className="rounded-2xl border-[3px] border-emerald-400 px-6 py-2">
                <span className="text-3xl font-black tracking-wide text-emerald-400">次へ</span>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
