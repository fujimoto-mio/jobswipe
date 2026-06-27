"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import type { Job } from "@/lib/types";
import { getJobThumbnail, getJobThumbnailFallback } from "@/lib/job-image";

type JobThumbnailProps = {
  job: Pick<Job, "id" | "thumbnailUrl" | "companyLogo" | "company" | "title">;
  className?: string;
  showLogoBadge?: boolean;
};

export default function JobThumbnail({
  job,
  className = "h-16 w-16 rounded-xl object-cover",
  showLogoBadge = true,
}: JobThumbnailProps) {
  const [src, setSrc] = useState(getJobThumbnail(job));
  const [logoSrc, setLogoSrc] = useState(job.companyLogo);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`relative flex shrink-0 items-center justify-center bg-zinc-800 ${className}`}>
        <Building2 className="h-6 w-6 text-zinc-500" />
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 ${className.includes("h-") ? "" : "h-16 w-16"}`}>
      <img
        src={src}
        alt={job.title}
        className={`bg-zinc-800 ${className}`}
        onError={() => {
          const fallback = getJobThumbnailFallback(job);
          if (src !== fallback) setSrc(fallback);
          else setFailed(true);
        }}
      />
      {showLogoBadge && logoSrc && (
        <img
          src={logoSrc}
          alt={job.company}
          className="absolute -bottom-1 -right-1 h-6 w-6 rounded-md border-2 border-zinc-900 bg-white object-cover shadow"
          onError={() => setLogoSrc("")}
        />
      )}
    </div>
  );
}
