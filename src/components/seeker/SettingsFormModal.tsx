"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useSeekerThemeOptional } from "@/components/seeker/SeekerThemeProvider";
import SeekerBottomSheet from "@/components/seeker/SeekerBottomSheet";

type SettingsFormModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function SettingsFormModal({ title, onClose, children }: SettingsFormModalProps) {
  const seekerTheme = useSeekerThemeOptional();
  const isDark = seekerTheme?.theme === "dark";

  return (
    <SeekerBottomSheet
      onClose={onClose}
      overlayClassName={isDark ? "settings-form-modal-overlay--dark !bg-black/70" : ""}
      panelClassName={`settings-form-modal-panel modal-sheet relative flex max-h-[92vh] w-full flex-col p-6 ${
        isDark ? "settings-form-modal-panel--dark" : ""
      }`}
    >
      <div className="mb-1 flex justify-center">
        <div className="settings-form-modal-handle h-1 w-10 rounded-full bg-slate-200" />
      </div>

      <div className="settings-form-modal-content min-h-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-30 h-0 overflow-visible">
          <button
            type="button"
            onClick={onClose}
            className="apply-modal-close absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--seeker-border,#e2e8f0)] bg-white text-[var(--seeker-text,#0f172a)] shadow-[0_2px_12px_rgba(15,23,42,0.18)] transition active:scale-95"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </div>

        <h2 className="mb-5 pr-12 text-lg font-bold text-slate-900">{title}</h2>

        {children}
      </div>
    </SeekerBottomSheet>
  );
}
