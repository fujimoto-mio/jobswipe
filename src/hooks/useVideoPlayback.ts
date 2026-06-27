"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PlaybackState = "idle" | "loading" | "playing" | "buffering" | "paused" | "error";

type UseVideoPlaybackOptions = {
  src: string;
  isActive: boolean;
  muted?: boolean;
};

export function useVideoPlayback({ src, isActive, muted = true }: UseVideoPlaybackOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<PlaybackState>("idle");
  const [isMuted, setIsMuted] = useState(muted);
  const retryCount = useRef(0);

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setState("playing");
    } catch {
      setState("paused");
    }
  }, []);

  const pause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setState("paused");
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) play();
    else pause();
  }, [play, pause]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  // Active/inactive lifecycle
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      if (video.src !== src) video.src = src;
      video.preload = "auto";
      video.load();
      setState("loading");
      play();
    } else {
      video.pause();
      setState("idle");
      // Release buffer for off-screen videos (keep src for quick return)
      if (video.readyState > 0) {
        video.preload = "metadata";
      }
    }
  }, [isActive, src, play]);

  // Wire up media events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onWaiting = () => setState("buffering");
    const onPlaying = () => {
      setState("playing");
      retryCount.current = 0;
    };
    const onPause = () => {
      if (isActive) setState("paused");
    };
    const onCanPlay = () => {
      if (isActive && video.paused) play();
    };
    const onError = () => setState("error");
    const onStalled = () => {
      setState("buffering");
      // Retry once after stall
      if (retryCount.current < 2 && isActive) {
        retryCount.current += 1;
        setTimeout(() => video.load(), 800);
      }
    };

    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);
    video.addEventListener("stalled", onStalled);

    return () => {
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
      video.removeEventListener("stalled", onStalled);
    };
  }, [isActive, play]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = isMuted;
  }, [isMuted]);

  return {
    videoRef,
    state,
    isMuted,
    isPlaying: state === "playing",
    isBuffering: state === "loading" || state === "buffering",
    togglePlay,
    toggleMute,
    play,
    pause,
  };
}
