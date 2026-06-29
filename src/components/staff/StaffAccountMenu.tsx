"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, MoreVertical, Settings, User } from "lucide-react";

type StaffAccountMenuProps = {
  accountHref: string;
  accountLabel?: string;
  onLogout: () => void | Promise<void>;
};

export default function StaffAccountMenu({
  accountHref,
  accountLabel = "プロフィール",
  onLogout,
}: StaffAccountMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const AccountIcon = accountLabel === "設定" ? Settings : User;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-icon btn-icon-muted h-10 w-10"
        aria-label="メニュー"
        aria-expanded={open}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[100] mt-1.5 w-44 overflow-hidden rounded-2xl bg-white py-1 shadow-lg shadow-slate-200/60 ring-1 ring-slate-100">
          <Link
            href={accountHref}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <AccountIcon className="h-4 w-4 text-slate-500" />
            {accountLabel}
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void onLogout();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}
