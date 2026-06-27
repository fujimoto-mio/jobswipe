import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  dark?: boolean;
};

export default function EmptyState({ icon: Icon, title, description, action, dark = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
          dark ? "bg-white/5 ring-1 ring-white/10" : "bg-slate-100"
        }`}
      >
        <Icon className={`h-8 w-8 ${dark ? "text-white/25" : "text-slate-300"}`} strokeWidth={1.5} />
      </div>
      <div>
        <p className={`font-semibold ${dark ? "text-white" : "text-slate-800"}`}>{title}</p>
        {description && (
          <p className={`mt-1.5 text-sm leading-relaxed ${dark ? "text-white/45" : "text-slate-500"}`}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
