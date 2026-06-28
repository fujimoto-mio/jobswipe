"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { getStaffAvatarUrl, resolveStaffAvatarUrl } from "@/lib/job-image";

type StaffAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZE_CLASS = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-12 w-12 text-sm",
  xl: "h-16 w-16 text-base",
} as const;

export default function StaffAvatar({
  name,
  avatarUrl,
  size = "md",
  className = "",
}: StaffAvatarProps) {
  const fallback = getStaffAvatarUrl(name);
  const [src, setSrc] = useState(() => resolveStaffAvatarUrl(name, avatarUrl));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(resolveStaffAvatarUrl(name, avatarUrl));
    setFailed(false);
  }, [name, avatarUrl]);

  if (failed) {
    const initial = name.trim().charAt(0) || "?";
    return (
      <span
        className={`chat-message-avatar chat-message-avatar--company-hr ${SIZE_CLASS[size]} ${className}`}
        aria-hidden
      >
        {initial}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`chat-message-avatar chat-message-avatar--image ${SIZE_CLASS[size]} ${className}`}
      onError={() => {
        if (src !== fallback) setSrc(fallback);
        else setFailed(true);
      }}
    />
  );
}
