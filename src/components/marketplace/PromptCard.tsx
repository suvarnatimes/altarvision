"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowUpRight, Star } from "lucide-react";
import { Prompt } from "@/types";

interface PromptCardProps {
  prompt: Omit<Prompt, "promptContent">;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
  categoryName?: string;
}

export default function PromptCard({
  prompt,
  isFavorited = false,
  onToggleFavorite,
  categoryName = "AI Prompt",
}: PromptCardProps) {
  const { id, title, slug, description, thumbnail, price, featured } = prompt;

  return (
    <div className="crystal crystal-hover group relative flex flex-col h-full overflow-hidden transition-all duration-300">
      {/* Glow highlight line */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--prism-violet)] via-[var(--prism-sky)] to-[var(--prism-cyan)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Badge for featured prompts */}
      {featured && (
        <span className="absolute top-3 left-3 z-10 badge-prism text-[10px] font-black uppercase tracking-wider py-1 px-2.5">
          Featured
        </span>
      )}

      {/* Wishlist Button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => onToggleFavorite(id, e)}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-lg bg-white/60 backdrop-blur-md border border-white/40 text-[var(--ink-700)] hover:text-[var(--prism-rose)] hover:bg-white/90 active:scale-95 transition-all duration-200"
          aria-label="Add to wishlist"
        >
          <Heart
            size={18}
            className={`transition-transform duration-300 hover:scale-110 ${
              isFavorited ? "fill-[var(--prism-rose)] text-[var(--prism-rose)]" : ""
            }`}
          />
        </button>
      )}

      {/* Thumbnail */}
      <Link href={`/prompts/${slug}`} className="relative block aspect-[16/10] w-full overflow-hidden bg-[var(--bg-prism)]">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--ink-300)] font-bold text-xs uppercase tracking-widest geo-grid">
            No Preview Image
          </div>
        )}
        {/* Hover overlay overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink-900)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <span className="text-[10px] font-bold text-[var(--prism-violet)] uppercase tracking-wider mb-1">
          {categoryName}
        </span>
        <Link href={`/prompts/${slug}`}>
          <h3 className="text-base font-bold text-[var(--ink-900)] group-hover:text-[var(--prism-violet)] transition-colors duration-200 line-clamp-1 flex items-center gap-1.5">
            {title}
            <ArrowUpRight size={15} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-250 text-[var(--prism-violet)] shrink-0" />
          </h3>
        </Link>
        <p className="text-xs text-[var(--ink-500)] line-clamp-2 mt-2 leading-relaxed flex-1">
          {description}
        </p>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-[rgba(91,79,207,0.12)] pt-4 mt-4">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-[var(--prism-amber)] text-[var(--prism-amber)]" />
            <span className="text-xs font-bold text-[var(--ink-700)]">4.8</span>
            <span className="text-[10px] text-[var(--ink-300)]">(12)</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-[var(--ink-300)] block leading-none">Price</span>
            <span className="text-base font-black text-[var(--ink-900)]">
              {price === 0 ? "Free" : `₹${price}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
