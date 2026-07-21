"use client";

import { AREAS, EMPLOYMENT_TYPES, JOB_CATEGORIES } from "@/lib/constants";
import SeekerBrandHeader from "@/components/seeker/SeekerBrandHeader";
import type { JobFilters } from "@/lib/types";
import { MapPin, Briefcase, Clock } from "lucide-react";

type FilterScreenProps = {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
  onContinue: () => void;
  onCancel: () => void;
};

export default function FilterScreen({ filters, onChange, onContinue, onCancel }: FilterScreenProps) {
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

  const canContinue =
    filters.areas.length > 0 || filters.categories.length > 0 || filters.employmentTypes.length > 0;

  return (
    <div className="seeker-filter-page flex h-full min-h-0 flex-col">
      <header className="page-header shrink-0">
        <SeekerBrandHeader />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="mb-6 mt-2">
          <h1 className="seeker-filter-title">あなたに合う求人を探す</h1>
          <p className="seeker-filter-subtitle mt-2">
            エリア・職種・希望雇用形態のいずれかを選んで、動画フィードをスタート
          </p>
        </div>

        <section className="seeker-filter-section">
          <div className="seeker-filter-section-header">
            <div className="seeker-filter-section-icon">
              <MapPin className="h-4 w-4" />
            </div>
            <h2 className="seeker-filter-section-title">エリア</h2>
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

        <section className="seeker-filter-section mt-3">
          <div className="seeker-filter-section-header">
            <div className="seeker-filter-section-icon">
              <Briefcase className="h-4 w-4" />
            </div>
            <h2 className="seeker-filter-section-title">職種</h2>
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

        <section className="seeker-filter-section mt-3">
          <div className="seeker-filter-section-header">
            <div className="seeker-filter-section-icon">
              <Clock className="h-4 w-4" />
            </div>
            <h2 className="seeker-filter-section-title">希望雇用形態</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {EMPLOYMENT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleEmploymentType(type)}
                className={`chip ${filters.employmentTypes.includes(type) ? "chip-active" : ""}`}
              >
                {type}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="seeker-filter-footer shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            キャンセル
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className="btn-primary flex-1 disabled:opacity-40"
          >
            動画を見る
          </button>
        </div>
        {!canContinue && (
          <p className="mt-2.5 text-center text-xs text-[rgba(22,24,35,0.45)]">
            エリア・職種・希望雇用形態のいずれかを1つ以上選択
          </p>
        )}
      </div>
    </div>
  );
}
