"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  initialValue = "",
  onSearch,
  placeholder = "Search premium prompts (e.g. logo generator, midjourney bible verse)...",
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative flex items-center">
      <div className="relative w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full h-14 pl-12 pr-28 rounded-xl bg-white/50 backdrop-blur-md border border-white/60 text-[var(--ink-900)] placeholder-[var(--ink-300)] font-semibold text-sm focus:outline-none focus:border-[var(--prism-violet)] focus:bg-white/80 focus:shadow-[0_8px_32px_rgba(91,79,207,0.08)] transition-all duration-300"
        />
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-300)]"
        />
      </div>
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 btn-prism text-xs py-2 px-5 font-bold shadow-md hover:translate-y-[-2px] transition-all duration-200"
      >
        Search
      </button>
    </form>
  );
}
