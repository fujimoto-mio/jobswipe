"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PlaybackState = "idle" | "loading" | "playing" | "buffering" | "paused" | "error";

function videoMatchesSrc(video: HTMLVideoElement, src: string) {
  if (!src) return false;
  return video.src === src || video.currentSrc === src || video.src.endsWith(src);
}

function warmVideoElement(video: HTMLVideoElement, src: string) {
  const srcChanged = !videoMatchesSrc(video, src);
  if (srcChanged) {
    video.src = src;
  }
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  if (srcChanged || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    video.load();
  }
}

type UseVideoPlaybackOptions = {
  src: string;
  isActive: boolean;
  /** Preload src/buffer for off-screen adjacent feed slides. */
  preload?: boolean;
  muted?: boolean;
};

export function useVideoPlayback({ src, isActive, preload = false, muted = true }: UseVideoPlaybackOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<PlaybackState>("idle");
  const [hasFrame, setHasFrame] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const retryCount = useRef(0);
  const shouldWarm = isActive || preload;

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      if (!videoMatchesSrc(video, src)) {
        video.src = src;
        video.preload = "auto";
        video.load();
        setState("loading");
      } else if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        setHasFrame(true);
        setState("playing");
      } else {
        video.preload = "auto";
        setState("loading");
      }
      void play();
    } else if (shouldWarm) {
      warmVideoElement(video, src);
      video.pause();
      setState("idle");
    } else {
      video.pause();
      setState("idle");
      if (video.readyState > 0) {
        video.preload = "metadata";
      }
    }
  }, [isActive, shouldWarm, src, play]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onWaiting = () => {
      if (isActive) setState("buffering");
    };
    const onPlaying = () => {
      setState("playing");
      setHasFrame(true);
      retryCount.current = 0;
    };
    const onPause = () => {
      if (isActive) setState("paused");
    };
    const onCanPlay = () => {
      setHasFrame(true);
      if (isActive && video.paused) void play();
    };
    const onLoadedData = () => setHasFrame(true);
    const onError = () => setState("error");
    const onStalled = () => {
      if (!isActive) return;
      setState("buffering");
      if (retryCount.current < 2) {
        retryCount.current += 1;
        setTimeout(() => video.load(), 800);
      }
    };

    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("error", onError);
    video.addEventListener("stalled", onStalled);

    return () => {
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("error", onError);
      video.removeEventListener("stalled", onStalled);
    };
  }, [isActive, play]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && videoMatchesSrc(video, src) && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setHasFrame(true);
      return;
    }
    setHasFrame(false);
  }, [src]);

  useEffect(() => {
    if (isActive || !preload) return;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const markReady = () => {
      if (!cancelled && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        setHasFrame(true);
      }
    };

    const prime = async () => {
      if (cancelled) return;
      markReady();
      if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) return;
      try {
        video.muted = true;
        await video.play();
        if (cancelled) return;
        video.pause();
        if (video.currentTime > 0.01) {
          video.currentTime = 0;
        }
        setHasFrame(true);
      } catch {
        markReady();
      }
    };

    const onReady = () => void prime();

    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      void prime();
    } else {
      video.addEventListener("canplaythrough", onReady, { once: true });
      video.addEventListener("loadeddata", markReady);
    }

    return () => {
      cancelled = true;
      video.removeEventListener("canplaythrough", onReady);
      video.removeEventListener("loadeddata", markReady);
    };
  }, [isActive, preload, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = isMuted;
  }, [isMuted]);

  return {
    videoRef,
    state,
    hasFrame,
    isMuted,
    isPlaying: state === "playing",
    isBuffering: isActive && (state === "loading" || state === "buffering"),
    togglePlay,
    toggleMute,
    play,
    pause,
  };
}
