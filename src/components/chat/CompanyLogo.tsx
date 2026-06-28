"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { getCompanyLogoUrl, resolveCompanyLogoUrl } from "@/lib/job-image";

type CompanyLogoProps = {
  company: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASS = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-11 w-11 rounded-xl",
  lg: "h-12 w-12 rounded-xl",
} as const;

export default function CompanyLogo({
  company,
  logoUrl,
  size = "md",
  className = "",
}: CompanyLogoProps) {
  const fallback = getCompanyLogoUrl(company);
  const [src, setSrc] = useState(() => resolveCompanyLogoUrl(company, logoUrl));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(resolveCompanyLogoUrl(company, logoUrl));
    setFailed(false);
  }, [company, logoUrl]);

  if (failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center border border-slate-100 bg-slate-100 text-slate-500 shadow-sm ${SIZE_CLASS[size]} ${className}`}
        aria-hidden
      >
        <Building2 className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={company}
      className={`shrink-0 border border-slate-100 object-cover shadow-sm ${SIZE_CLASS[size]} ${className}`}
      onError={() => {
        if (src !== fallback) setSrc(fallback);
        else setFailed(true);
      }}
    />
  );
}
