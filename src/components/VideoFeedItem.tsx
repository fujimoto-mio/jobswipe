"use client";

import { Volume2, VolumeX, Heart, Send, FileText, MapPin, Briefcase, UserRound } from "lucide-react";
import type { JobFeedItem } from "@/lib/types";
import { useVideoPlayback } from "@/hooks/useVideoPlayback";

function displayVideoTag(tag: string) {
  return tag.trim().replace(/^#/, "");
}

type VideoFeedItemProps = {
  job: JobFeedItem;
  isActive: boolean;
  preloadVideo?: boolean;
  swipeEnabled?: boolean;
  chromeVisible?: boolean;
  isSaved: boolean;
  onSave: () => void;
  onApply: () => void;
  onDetail: () => void;
  onChromeActivity?: () => void;
};

function RailIconButton({
  onClick,
  onChromeActivity,
  label,
  className = "h-12 w-12",
  children,
}: {
  onClick: () => void;
  onChromeActivity?: () => void;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => {
        onChromeActivity?.();
        onClick();
      }}
      className={`group relative flex items-center justify-center rounded-full border-2 border-transparent transition-[transform,border-color,box-shadow] duration-150 hover:border-white/70 active:scale-90 active:border-white focus-visible:border-white/80 focus-visible:outline-none ${className}`}
    >
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute right-[calc(100%+0.625rem)] top-1/2 z-30 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {label}
      </span>
    </button>
  );
}

export default function VideoFeedItem({
  job,
  isActive,
  preloadVideo = false,
  swipeEnabled = false,
  chromeVisible = true,
  isSaved,
  onSave,
  onApply,
  onDetail,
  onChromeActivity,
}: VideoFeedItemProps) {
  const { videoRef, isMuted, toggleMute } = useVideoPlayback({
    src: job.videoUrl,
    isActive,
    preload: preloadVideo,
  });
  const shouldAttachSrc = isActive || preloadVideo;
  const chromeOffClass = chromeVisible ? "" : "seeker-video-feed-chrome--off";
  const vignetteOffClass = chromeVisible ? "" : "seeker-video-feed-vignette--off";

  return (
    <section className="seeker-video-feed-item relative h-full w-full shrink-0 overflow-hidden bg-black">
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          src={shouldAttachSrc ? job.videoUrl : undefined}
          className={`absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover ${
            swipeEnabled ? "pointer-events-none" : ""
          }`}
          loop
          muted={isMuted}
          playsInline
          draggable={false}
          preload={shouldAttachSrc ? "auto" : "metadata"}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>

      {/* TikTok-style vignette */}
      <div
        className={`seeker-video-feed-vignette pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 ${vignetteOffClass}`}
      />
      <div
        className={`seeker-video-feed-vignette pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 ${vignetteOffClass}`}
      />

      {/* Right action rail — TikTok pattern */}
      <div
        className={`seeker-video-feed-chrome seeker-video-feed-rail absolute right-3 z-20 flex flex-col items-center gap-5 ${chromeOffClass}`}
      >
        <RailIconButton onChromeActivity={onChromeActivity} onClick={onSave} label="気になる">
          <Heart
            className={`h-7 w-7 drop-shadow-md fill-none ${isSaved ? "text-[#fe2c55]" : "text-white"}`}
            strokeWidth={2}
          />
        </RailIconButton>

        <RailIconButton onChromeActivity={onChromeActivity} onClick={onApply} label="応募">
          <Send className="h-6 w-6 text-white drop-shadow-md" />
        </RailIconButton>

        <RailIconButton onChromeActivity={onChromeActivity} onClick={onDetail} label="詳細">
          <FileText className="h-6 w-6 text-white drop-shadow-md" />
        </RailIconButton>

        <RailIconButton
          onChromeActivity={onChromeActivity}
          onClick={toggleMute}
          label={isMuted ? "ミュート解除" : "ミュート"}
          className="h-10 w-10"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-white drop-shadow-md" />
          ) : (
            <Volume2 className="h-5 w-5 text-white drop-shadow-md" />
          )}
        </RailIconButton>

        <RailIconButton
          onChromeActivity={onChromeActivity}
          onClick={onDetail}
          label={job.company}
          className="h-12 w-12"
        >
          <div className="h-12 w-12 overflow-hidden rounded-full bg-white">
            <img src={job.companyLogo} alt="" className="h-full w-full object-cover" />
          </div>
        </RailIconButton>
      </div>

      {/* Bottom-left info overlay — spec §2.3 */}
      <div
        className={`seeker-video-feed-chrome seeker-video-feed-info absolute left-0 right-16 z-20 px-4 ${chromeOffClass}`}
      >
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            onChromeActivity?.();
            onDetail();
          }}
          className="w-full text-left text-[10px] leading-snug text-white/90"
        >
          <p className="truncate text-sm font-bold leading-tight text-white drop-shadow-md">{job.company}</p>

          <p className="mt-1.5 line-clamp-2 font-semibold text-white drop-shadow-md">{job.title}</p>

          {job.employmentType ? (
            <p className="mt-1 flex items-start gap-1 font-medium text-white/85">
              <UserRound className="mt-0.5 h-3 w-3 shrink-0 text-white/75" aria-hidden />
              <span>{job.employmentType}</span>
            </p>
          ) : null}

          <p className="mt-1 flex items-start gap-1 font-medium text-white/85">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-white/75" aria-hidden />
            <span className="line-clamp-2">{job.location}</span>
          </p>

          <p className="mt-0.5 flex items-center gap-1 font-medium text-emerald-300">
            <Briefcase className="h-3 w-3 shrink-0" aria-hidden />
            <span>{job.salary}</span>
          </p>

          {job.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/30 bg-white/10 px-1.5 py-0.5 text-[9px] font-medium leading-tight text-white/85 backdrop-blur-sm"
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
          className={`seeker-video-feed-chrome seeker-video-feed-swipe-hint pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 ${chromeOffClass}`}
        >
          <span className="rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-medium text-white/50 backdrop-blur-sm">
            ↑次 · ↓前
          </span>
        </div>
      )}
    </section>
  );
}
