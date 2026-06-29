"use client";

import { useEffect, useState } from "react";
import { getSeekerAvatarUrl, resolveSeekerAvatarUrl } from "@/lib/job-image";

type SeekerAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: "md" | "lg" | "hero";
  className?: string;
};

const SIZE_CLASS = {
  md: "h-11 w-11 text-sm",
  lg: "h-12 w-12 text-sm",
  hero: "h-[5.5rem] w-[5.5rem] text-2xl",
} as const;

export default function SeekerAvatar({
  name,
  avatarUrl,
  size = "hero",
  className = "",
}: SeekerAvatarProps) {
  const hasCustomAvatar = Boolean(avatarUrl?.trim());
  const fallback = getSeekerAvatarUrl(name);
  const [src, setSrc] = useState(() => resolveSeekerAvatarUrl(name, avatarUrl));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(resolveSeekerAvatarUrl(name, avatarUrl));
    setFailed(false);
  }, [name, avatarUrl]);

  const ringClass = `flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fe2c55] to-[#25f4ee] p-[3px] shadow-[0_8px_24px_rgb(254_44_85/0.18)] ${SIZE_CLASS[size]} ${className}`;

  if (!hasCustomAvatar || failed) {
    const initial = name.trim().charAt(0) || "?";
    return (
      <div className={ringClass} aria-hidden>
        <span className="flex h-full w-full items-center justify-center rounded-full bg-[#161823] font-extrabold text-white">
          {initial}
        </span>
      </div>
    );
  }

  return (
    <div className={ringClass}>
      <img
        src={src}
        alt={name}
        className="h-full w-full rounded-full bg-[#161823] object-cover"
        onError={() => {
          if (src !== fallback) setSrc(fallback);
          else setFailed(true);
        }}
      />
    </div>
  );
}
