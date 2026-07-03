"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, Settings, SlidersHorizontal } from "lucide-react";
import { seekerLogout } from "@/lib/auth/seeker-logout";

type SeekerAccountMenuProps = {
  variant?: "default" | "overlay";
  onOpenChange?: (open: boolean) => void;
};

export default function SeekerAccountMenu({ variant = "default", onOpenChange }: SeekerAccountMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const buttonClass = `seeker-topbar-icon-btn flex h-10 w-10 items-center justify-center rounded-full border-0 bg-transparent p-0 shadow-none transition active:scale-95 ${
    variant === "overlay" ? "seeker-topbar-icon-btn--overlay" : ""
  }`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setOpen((v) => !v)}
        className={buttonClass}
        aria-label="メニュー"
        aria-expanded={open}
      >
        <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
      </button>

      {open && (
        <div className="seeker-account-menu-panel absolute right-0 top-full z-[100] mt-1.5 flex w-44 flex-col gap-0.5 overflow-hidden rounded-xl p-1.5">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="seeker-account-menu-item flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition"
          >
            <Settings className="h-4 w-4 shrink-0 opacity-70" />
            設定
          </Link>
          <button
            type="button"
            onClick={() => void seekerLogout()}
            className="seeker-account-menu-item seeker-account-menu-item--danger flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}
