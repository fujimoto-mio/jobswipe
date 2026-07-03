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

  const buttonClass =
    variant === "overlay"
      ? `flex h-10 w-10 items-center justify-center rounded-full border-0 bg-transparent p-0 text-white/92 shadow-none transition hover:bg-white/10 active:scale-95 ${
          open ? "bg-white/15" : ""
        }`
      : `btn-icon btn-icon-muted h-10 w-10 transition-[border-color,background-color] ${
          open ? "ring-2 ring-slate-300" : ""
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
        <div className="absolute right-0 top-full z-[100] mt-1.5 flex w-44 flex-col gap-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/60">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Settings className="h-4 w-4 text-slate-500" />
            設定
          </Link>
          <button
            type="button"
            onClick={() => void seekerLogout()}
            className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}
