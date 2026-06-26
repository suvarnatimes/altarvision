"use client";

import { Category } from "@/types";
import { SlidersHorizontal, Grid, Star, Sparkles, IndianRupee } from "lucide-react";

interface FilterSidebarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  selectedSort: string;
  onSelectSort: (sort: string) => void;
  featuredOnly: boolean;
  onToggleFeatured: (featured: boolean) => void;
  onReset: () => void;
}

export default function FilterSidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  selectedSort,
  onSelectSort,
  featuredOnly,
  onToggleFeatured,
  onReset,
}: FilterSidebarProps) {
  return (
    <div className="crystal p-6 flex flex-col gap-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h3 className="text-sm font-black text-[var(--ink-900)] flex items-center gap-2 uppercase tracking-wider">
          <SlidersHorizontal size={16} className="text-[var(--prism-violet)]" />
          Filters
        </h3>
        <button
          onClick={onReset}
          className="text-xs font-bold text-[var(--prism-violet)] hover:underline cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* Sort Section */}
      <div>
        <h4 className="text-xs font-black text-[var(--ink-500)] uppercase tracking-wider mb-3">
          Sort By
        </h4>
        <div className="flex flex-col gap-2">
          {[
            { id: "newest", label: "Newest Arrivals" },
            { id: "price-low", label: "Price: Low to High" },
            { id: "price-high", label: "Price: High to Low" },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2.5 text-xs text-[var(--ink-700)] font-semibold cursor-pointer"
            >
              <input
                type="radio"
                name="sort"
                checked={selectedSort === item.id}
                onChange={() => onSelectSort(item.id)}
                className="w-4 h-4 rounded-full accent-[var(--prism-violet)] border-white/60 bg-white/40 focus:ring-0"
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      {/* Options Section */}
      <div>
        <h4 className="text-xs font-black text-[var(--ink-500)] uppercase tracking-wider mb-3">
          Status
        </h4>
        <label className="flex items-center gap-2.5 text-xs text-[var(--ink-700)] font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => onToggleFeatured(e.target.checked)}
            className="w-4 h-4 rounded border-white/60 bg-white/40 text-[var(--prism-violet)] accent-[var(--prism-violet)] focus:ring-0"
          />
          Featured Prompts Only
        </label>
      </div>

      {/* Categories Section */}
      <div>
        <h4 className="text-xs font-black text-[var(--ink-500)] uppercase tracking-wider mb-3">
          Categories
        </h4>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onSelectCategory("")}
            className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
              selectedCategoryId === ""
                ? "bg-[rgba(91,79,207,0.1)] text-[var(--prism-violet)] border-l-2 border-[var(--prism-violet)]"
                : "text-[var(--ink-700)] hover:bg-[rgba(91,79,207,0.05)]"
            }`}
          >
            <Grid size={13} />
            All Prompts
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-between ${
                selectedCategoryId === cat.id
                  ? "bg-[rgba(91,79,207,0.1)] text-[var(--prism-violet)] border-l-2 border-[var(--prism-violet)]"
                  : "text-[var(--ink-700)] hover:bg-[rgba(91,79,207,0.05)]"
              }`}
            >
              <span className="flex items-center gap-2 line-clamp-1">
                <Sparkles size={13} className="shrink-0" />
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
