"use client";

import { AREAS, JOB_CATEGORIES } from "@/lib/constants";
import Logo from "@/components/ui/Logo";
import SeekerAccountMenu from "@/components/seeker/SeekerAccountMenu";
import type { JobFilters } from "@/lib/types";
import { MapPin, Briefcase, Sparkles } from "lucide-react";

type FilterScreenProps = {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
  onContinue: () => void;
};

export default function FilterScreen({ filters, onChange, onContinue }: FilterScreenProps) {
  const toggleArea = (area: string) => {
    const areas = filters.areas.includes(area)
      ? filters.areas.filter((a) => a !== area)
      : [...filters.areas, area];
    onChange({ ...filters, areas });
  };

  const toggleCategory = (category: string) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories });
  };

  const canContinue = filters.areas.length > 0 || filters.categories.length > 0;

  return (
    <div className="page-shell relative">
      <div className="absolute right-4 top-3.5 z-10">
        <SeekerAccountMenu />
      </div>
      <div className="page-scroll flex-1">
        <div className="page-container py-8">
          <div className="mb-8">
            <Logo size="md" />
            <div className="mt-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">あなたに合う求人を探す</h1>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              エリアと職種を選んで、動画フィードをスタート
            </p>
          </div>

          <section className="card mb-5 p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">エリア</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleArea(area)}
                className={`chip ${filters.areas.includes(area) ? "chip-active" : ""}`}
              >
                {area}
              </button>
            ))}
          </div>
        </section>

        <section className="card mb-6 p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <Briefcase className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">職種</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {JOB_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`chip ${filters.categories.includes(cat) ? "chip-active" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>
          </section>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="page-container py-4">
          <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="btn-primary w-full disabled:opacity-40"
        >
          動画を見る
          </button>
          {!canContinue && (
            <p className="mt-2.5 text-center text-xs text-slate-400">
              エリアまたは職種を1つ以上選択
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
