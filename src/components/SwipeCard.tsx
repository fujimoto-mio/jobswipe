"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import VideoFeedItem from "./VideoFeedItem";
import type { JobFeedItem } from "@/lib/types";

const SWIPE_THRESHOLD = 80;

type SwipeCardProps = {
  job: JobFeedItem;
  isTop: boolean;
  isNext?: boolean;
  isSaved: boolean;
  chromeVisible?: boolean;
  canSwipeUp?: boolean;
  canSwipeDown?: boolean;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onToggleChrome?: () => void;
  onChromeActivity?: () => void;
  onSave: () => void;
  onApply: () => void;
  onDetail: () => void;
};

export default function SwipeCard({
  job,
  isTop,
  isSaved,
  chromeVisible = true,
  canSwipeUp = true,
  canSwipeDown = true,
  isNext = false,
  onSwipeUp,
  onSwipeDown,
  onToggleChrome,
  onChromeActivity,
  onSave,
  onApply,
  onDetail,
}: SwipeCardProps) {
  const y = useMotionValue(0);
  const prevOpacity = useTransform(y, [0, 100], [0, 1]);
  const nextOpacity = useTransform(y, [-100, 0], [1, 0]);

  useEffect(() => {
    y.set(0);
  }, [job.id, y]);

  const snapBack = () => {
    animate(y, 0, { type: "spring", stiffness: 500, damping: 35 });
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset } = info;

    if (offset.y < -SWIPE_THRESHOLD) {
      if (!canSwipeUp) {
        snapBack();
        return;
      }
      animate(y, -600, { duration: 0.22 }).then(() => {
        onSwipeUp();
        y.set(0);
      });
    } else if (offset.y > SWIPE_THRESHOLD) {
      if (!canSwipeDown) {
        snapBack();
        return;
      }
      animate(y, 600, { duration: 0.22 }).then(() => {
        onSwipeDown();
        y.set(0);
      });
    } else {
      snapBack();
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab select-none active:cursor-grabbing"
      style={{ y, zIndex: isTop ? 10 : 0, touchAction: "none" }}
      drag={isTop ? "y" : false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onTap={isTop ? onToggleChrome : undefined}
      initial={{ scale: isTop ? 1 : 0.98, opacity: isTop ? 1 : 0.85 }}
      animate={{ scale: isTop ? 1 : 0.98, opacity: isTop ? 1 : 0.85 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      <div className="relative h-full w-full overflow-hidden">
        <VideoFeedItem
          job={job}
          isActive={isTop}
          isNext={isNext}
          swipeEnabled={isTop}
          chromeVisible={chromeVisible}
          isSaved={isSaved}
          onChromeActivity={onChromeActivity}
          onSave={onSave}
          onApply={onApply}
          onDetail={onDetail}
        />

        {isTop && chromeVisible && (
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
              className="pointer-events-none absolute left-1/2 top-[32%] z-30 -translate-x-1/2"
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
