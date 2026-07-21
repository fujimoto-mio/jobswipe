"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { AREAS, EMPLOYMENT_TYPES, JOB_CATEGORIES } from "@/lib/constants";
import { DEFAULT_JOB_FILTERS } from "@/lib/job-filters";
import type { JobFilters } from "@/lib/types";

type FilterBarProps = {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
};

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const [open, setOpen] = useState(false);

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

  const toggleEmploymentType = (type: string) => {
    const employmentTypes = filters.employmentTypes.includes(type)
      ? filters.employmentTypes.filter((t) => t !== type)
      : [...filters.employmentTypes, type];
    onChange({ ...filters, employmentTypes });
  };

  const activeCount =
    filters.areas.length + filters.categories.length + filters.employmentTypes.length;

  const clearAll = () => onChange(DEFAULT_JOB_FILTERS);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#334155] shadow-sm backdrop-blur-sm"
      >
        <SlidersHorizontal className="h-3.5 w-3.5 text-[#2563EB]" />
        絞り込み
        {activeCount > 0 && (
          <span className="rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1E293B]">求人を絞り込む</h3>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9]"
              >
                <X className="h-4 w-4 text-[#64748B]" />
              </button>
            </div>

            <section className="mb-5">
              <h4 className="mb-2 text-sm font-semibold text-[#334155]">場所（エリア）</h4>
              <div className="flex flex-wrap gap-2">
                {AREAS.map((area) => (
                  <button
                    key={area}
                    onClick={() => toggleArea(area)}
                    className={`chip ${filters.areas.includes(area) ? "chip-active" : ""}`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-5">
              <h4 className="mb-2 text-sm font-semibold text-[#334155]">職種</h4>
              <div className="flex flex-wrap gap-2">
                {JOB_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`chip ${filters.categories.includes(cat) ? "chip-active" : ""}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-6">
              <h4 className="mb-2 text-sm font-semibold text-[#334155]">希望雇用形態</h4>
              <div className="flex flex-wrap gap-2">
                {EMPLOYMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleEmploymentType(type)}
                    className={`chip ${filters.employmentTypes.includes(type) ? "chip-active" : ""}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </section>

            <div className="flex gap-3">
              <button onClick={clearAll} className="btn-secondary flex-1">
                クリア
              </button>
              <button onClick={() => setOpen(false)} className="btn-primary flex-1">
                適用する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
