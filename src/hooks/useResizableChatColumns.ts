"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";

const STORAGE_KEY = "company-chat-column-percents-v2";
const DEFAULT_JOBS = 20;
const DEFAULT_SEEKERS = 20;
const MIN_JOBS = 15;
const MAX_JOBS = 42;
const MIN_SEEKERS = 10;
const MAX_SEEKERS = 32;
const MIN_CHAT = 28;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type ColumnPercents = {
  jobs: number;
  seekers: number;
};

function normalizePercents(jobs: number, seekers: number): ColumnPercents {
  let nextJobs = clamp(jobs, MIN_JOBS, MAX_JOBS);
  let nextSeekers = clamp(seekers, MIN_SEEKERS, MAX_SEEKERS);

  if (nextJobs + nextSeekers > 100 - MIN_CHAT) {
    const overflow = nextJobs + nextSeekers - (100 - MIN_CHAT);
    nextSeekers = clamp(nextSeekers - overflow, MIN_SEEKERS, MAX_SEEKERS);
  }

  if (nextJobs + nextSeekers > 100 - MIN_CHAT) {
    nextJobs = clamp(100 - MIN_CHAT - nextSeekers, MIN_JOBS, MAX_JOBS);
  }

  return { jobs: nextJobs, seekers: nextSeekers };
}

function loadPercents(): ColumnPercents {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { jobs: DEFAULT_JOBS, seekers: DEFAULT_SEEKERS };
    const parsed = JSON.parse(raw) as Partial<ColumnPercents>;
    if (typeof parsed.jobs !== "number" || typeof parsed.seekers !== "number") {
      return { jobs: DEFAULT_JOBS, seekers: DEFAULT_SEEKERS };
    }
    return normalizePercents(parsed.jobs, parsed.seekers);
  } catch {
    return { jobs: DEFAULT_JOBS, seekers: DEFAULT_SEEKERS };
  }
}

function savePercents(jobs: number, seekers: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ jobs, seekers }));
  } catch {
    // ignore storage errors
  }
}

export function useResizableChatColumns(containerRef: RefObject<HTMLElement | null>) {
  const [jobsPercent, setJobsPercent] = useState(DEFAULT_JOBS);
  const [seekersPercent, setSeekersPercent] = useState(DEFAULT_SEEKERS);
  const percentsRef = useRef<ColumnPercents>({ jobs: DEFAULT_JOBS, seekers: DEFAULT_SEEKERS });

  useEffect(() => {
    const loaded = loadPercents();
    percentsRef.current = loaded;
    setJobsPercent(loaded.jobs);
    setSeekersPercent(loaded.seekers);
  }, []);

  useEffect(() => {
    percentsRef.current = { jobs: jobsPercent, seekers: seekersPercent };
  }, [jobsPercent, seekersPercent]);

  const applyPercents = useCallback((jobs: number, seekers: number) => {
    const next = normalizePercents(jobs, seekers);
    percentsRef.current = next;
    setJobsPercent(next.jobs);
    setSeekersPercent(next.seekers);
  }, []);

  const startJobsResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);

      const containerWidth = containerRef.current?.getBoundingClientRect().width ?? 1;
      const startX = event.clientX;
      const startJobs = percentsRef.current.jobs;
      const startSeekers = percentsRef.current.seekers;

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== event.pointerId) return;
        const deltaPercent = ((moveEvent.clientX - startX) / containerWidth) * 100;
        applyPercents(startJobs + deltaPercent, startSeekers - deltaPercent);
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== event.pointerId) return;
        handle.releasePointerCapture(event.pointerId);
        handle.removeEventListener("pointermove", onPointerMove);
        handle.removeEventListener("pointerup", onPointerUp);
        handle.removeEventListener("pointercancel", onPointerUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        savePercents(percentsRef.current.jobs, percentsRef.current.seekers);
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      handle.addEventListener("pointermove", onPointerMove);
      handle.addEventListener("pointerup", onPointerUp);
      handle.addEventListener("pointercancel", onPointerUp);
    },
    [applyPercents, containerRef]
  );

  const startSeekersResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);

      const containerWidth = containerRef.current?.getBoundingClientRect().width ?? 1;
      const startX = event.clientX;
      const startJobs = percentsRef.current.jobs;
      const startSeekers = percentsRef.current.seekers;

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== event.pointerId) return;
        const deltaPercent = ((moveEvent.clientX - startX) / containerWidth) * 100;
        applyPercents(startJobs, startSeekers + deltaPercent);
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== event.pointerId) return;
        handle.releasePointerCapture(event.pointerId);
        handle.removeEventListener("pointermove", onPointerMove);
        handle.removeEventListener("pointerup", onPointerUp);
        handle.removeEventListener("pointercancel", onPointerUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        savePercents(percentsRef.current.jobs, percentsRef.current.seekers);
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      handle.addEventListener("pointermove", onPointerMove);
      handle.addEventListener("pointerup", onPointerUp);
      handle.addEventListener("pointercancel", onPointerUp);
    },
    [applyPercents, containerRef]
  );

  return {
    jobsPercent,
    seekersPercent,
    chatPercent: 100 - jobsPercent - seekersPercent,
    startJobsResize,
    startSeekersResize,
  };
}
