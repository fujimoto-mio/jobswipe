"use client";

import { Play, Volume2, VolumeX, Heart, Send, FileText, MapPin, Briefcase } from "lucide-react";
import type { Job } from "@/lib/types";
import { useVideoPlayback } from "@/hooks/useVideoPlayback";

function displayVideoTag(tag: string) {
  return tag.trim().replace(/^#/, "");
}

type VideoFeedItemProps = {
  job: Job;
  isActive: boolean;
  isNext?: boolean;
  swipeEnabled?: boolean;
  chromeVisible?: boolean;
  isSaved: boolean;
  onSave: () => void;
  onApply: () => void;
  onDetail: () => void;
  onChromeActivity?: () => void;
};

function ActionButton({
  onClick,
  onChromeActivity,
  label,
  children,
  active,
}: {
  onClick: () => void;
  onChromeActivity?: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => {
        onChromeActivity?.();
        onClick();
      }}
      className="flex flex-col items-center gap-1 transition active:scale-90"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md transition ${
          active
            ? "bg-[#fe2c55] shadow-lg shadow-[#fe2c55]/40"
            : "bg-black/35 ring-1 ring-white/15"
        }`}
      >
        {children}
      </div>
      <span className="text-[11px] font-semibold text-white drop-shadow-md">{label}</span>
    </button>
  );
}

export default function VideoFeedItem({
  job,
  isActive,
  isNext = false,
  swipeEnabled = false,
  chromeVisible = true,
  isSaved,
  onSave,
  onApply,
  onDetail,
  onChromeActivity,
}: VideoFeedItemProps) {
  const { videoRef, isPlaying, isBuffering, isMuted, togglePlay, toggleMute } = useVideoPlayback({
    src: job.videoUrl,
    isActive,
  });

  const showPoster = isBuffering || (!isPlaying && isActive);

  return (
    <section className="seeker-video-feed-item relative h-full w-full shrink-0 overflow-hidden bg-black">
      <div className="absolute inset-0">
        <img
          src={job.thumbnailUrl}
          alt=""
          aria-hidden
          draggable={false}
          className={`absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-300 ${
            showPoster ? "opacity-100" : "opacity-0"
          } ${swipeEnabled ? "pointer-events-none" : ""}`}
        />

        <video
          ref={videoRef}
          poster={job.thumbnailUrl}
          className={`absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover ${
            swipeEnabled ? "pointer-events-none" : ""
          }`}
          loop
          muted={isMuted}
          playsInline
          draggable={false}
          preload={isActive ? "auto" : isNext ? "auto" : "metadata"}
          onDragStart={(e) => e.preventDefault()}
          onClick={swipeEnabled ? undefined : togglePlay}
        />
      </div>

      {/* TikTok-style vignette */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 transition-opacity duration-200 ${
          chromeVisible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 transition-opacity duration-200 ${
          chromeVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {!isPlaying && isActive && !isBuffering && chromeVisible && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={togglePlay}
          className="seeker-video-feed-chrome absolute left-1/2 top-1/2 z-[6] flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 ring-1 ring-white/20 backdrop-blur-sm transition active:scale-95"
          aria-label="再生"
        >
          <Play className="ml-1 h-9 w-9 fill-white text-white" />
        </button>
      )}

      {/* Right action rail — TikTok pattern */}
      <div
        className={`seeker-video-feed-chrome seeker-video-feed-rail absolute right-3 z-20 flex flex-col items-center gap-5 transition-opacity duration-200 ${
          chromeVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            onChromeActivity?.();
            onDetail();
          }}
          className="relative transition active:scale-90"
        >
          <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-white bg-white/10">
            <img src={job.companyLogo} alt={job.company} className="h-full w-full object-cover" />
          </div>
          <span className="absolute -bottom-1 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-[#fe2c55] text-[10px] font-bold text-white ring-2 ring-black">
            +
          </span>
        </button>

        <ActionButton onChromeActivity={onChromeActivity} onClick={onSave} label="気になる" active={isSaved}>
          <Heart className={`h-6 w-6 text-white ${isSaved ? "fill-white" : ""}`} strokeWidth={isSaved ? 0 : 2} />
        </ActionButton>

        <ActionButton onChromeActivity={onChromeActivity} onClick={onApply} label="応募">
          <Send className="h-5 w-5 text-white" />
        </ActionButton>

        <ActionButton onChromeActivity={onChromeActivity} onClick={onDetail} label="詳細">
          <FileText className="h-5 w-5 text-white" />
        </ActionButton>

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            onChromeActivity?.();
            toggleMute();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 ring-1 ring-white/15 backdrop-blur-md transition active:scale-90"
          aria-label={isMuted ? "ミュート解除" : "ミュート"}
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
        </button>
      </div>

      {/* Bottom-left info overlay — spec §2.3 */}
      <div
        className={`seeker-video-feed-chrome seeker-video-feed-info absolute left-0 right-16 z-20 px-4 transition-opacity duration-200 ${
          chromeVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            onChromeActivity?.();
            onDetail();
          }}
          className="w-full text-left"
        >
          <div className="flex items-center gap-2.5">
            <img
              src={job.companyLogo}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/30"
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-white drop-shadow-lg">{job.company}</p>
              <p className="text-xs font-medium text-white/75 drop-shadow">{job.employmentType}</p>
            </div>
          </div>

          <p className="mt-2 text-xl font-bold leading-snug text-white drop-shadow-lg">{job.title}</p>

          <p className="mt-1.5 flex items-start gap-1.5 text-sm text-white/90 drop-shadow-md">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/80" aria-hidden />
            <span>{job.location}</span>
          </p>

          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-400 drop-shadow-md">
            <Briefcase className="h-4 w-4 shrink-0" aria-hidden />
            <span>{job.salary}</span>
          </p>

          {job.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/35 bg-white/12 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm"
                >
                  {displayVideoTag(tag)}
                </span>
              ))}
            </div>
          )}
        </button>
      </div>

      {isActive && (
        <div
          className={`seeker-video-feed-chrome seeker-video-feed-swipe-hint pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 transition-opacity duration-200 ${
            chromeVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-medium text-white/50 backdrop-blur-sm">
            ↑次 · ↓前
          </span>
        </div>
      )}
    </section>
  );
}
