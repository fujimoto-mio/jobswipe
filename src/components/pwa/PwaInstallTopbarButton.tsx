"use client";

import { useEffect } from "react";
import { Download } from "lucide-react";
import { usePwaInstallOptional } from "@/components/pwa/PwaInstallProvider";

type PwaInstallTopbarButtonProps = {
  variant?: "default" | "overlay";
  onOpenChange?: (open: boolean) => void;
};

export default function PwaInstallTopbarButton({
  variant = "default",
  onOpenChange,
}: PwaInstallTopbarButtonProps) {
  const pwa = usePwaInstallOptional();

  useEffect(() => {
    onOpenChange?.(pwa?.installModalOpen ?? false);
  }, [onOpenChange, pwa?.installModalOpen]);

  if (!pwa?.showInstallUi) return null;

  const buttonClass =
    variant === "overlay"
      ? `flex h-10 w-10 items-center justify-center rounded-full border-0 bg-transparent p-0 text-white/92 shadow-none transition hover:bg-white/10 active:scale-95 ${
          pwa.installModalOpen ? "bg-white/15" : ""
        }`
      : `btn-icon btn-icon-muted h-10 w-10 transition-[border-color,background-color] ${
          pwa.installModalOpen ? "ring-2 ring-slate-300" : ""
        }`;

  return (
    <button
      type="button"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={() => pwa.openInstallModal()}
      className={buttonClass}
      aria-label="ホーム画面に追加"
      aria-haspopup="dialog"
      aria-expanded={pwa.installModalOpen}
      title="ホーム画面に追加"
    >
      <Download className="h-5 w-5" strokeWidth={2} />
    </button>
  );
}
