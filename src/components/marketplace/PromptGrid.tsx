"use client";

import PromptCard from "./PromptCard";
import { Prompt } from "@/types";

interface PromptGridProps {
  prompts: Omit<Prompt, "promptContent">[];
  favorites?: string[];
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
  categoriesMap?: Record<string, string>;
}

export default function PromptGrid({
  prompts,
  favorites = [],
  onToggleFavorite,
  categoriesMap = {},
}: PromptGridProps) {
  if (prompts.length === 0) {
    return (
      <div className="crystal p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-[var(--ink-500)] font-semibold text-lg">No prompts found matching your criteria.</p>
        <p className="text-xs text-[var(--ink-300)] mt-1">Try resetting filters or expanding your search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          isFavorited={favorites.includes(prompt.id)}
          onToggleFavorite={onToggleFavorite}
          categoryName={categoriesMap[prompt.categoryId] || "AI Prompt"}
        />
      ))}
    </div>
  );
}
