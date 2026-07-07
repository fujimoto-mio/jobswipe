"use client";

import { Download } from "lucide-react";
import { usePwaInstallOptional } from "@/components/pwa/PwaInstallProvider";

const TOOLTIP_LABEL = "アプリをインストール";

type LandingPwaInstallButtonProps = {
  className?: string;
};

export default function LandingPwaInstallButton({
  className = "btn-nav btn-nav--outline btn-nav--icon-only",
}: LandingPwaInstallButtonProps) {
  const pwa = usePwaInstallOptional();

  if (!pwa?.showInstallUi) return null;

  return (
    <button
      type="button"
      className={className}
      onClick={() => pwa.openInstallModal()}
      aria-label={TOOLTIP_LABEL}
      title={TOOLTIP_LABEL}
    >
      <Download className="btn-nav__icon" aria-hidden />
      <span className="btn-nav__tooltip" role="tooltip">
        {TOOLTIP_LABEL}
      </span>
    </button>
  );
}
