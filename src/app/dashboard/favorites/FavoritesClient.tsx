"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, Sparkles, ArrowRight } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface FavoritePrompt {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  price: number;
  featured: boolean;
}

export default function FavoritesClient({
  initialFavorites,
}: {
  initialFavorites: FavoritePrompt[];
}) {
  const [favorites, setFavorites] = useState(initialFavorites);

  const handleRemoveFavorite = async (promptId: string) => {
    try {
      const res = await fetch("/api/user/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to remove favorite");
      }

      setFavorites(favorites.filter((fav) => fav.id !== promptId));
      toast.success("Removed from wishlist");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove item");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Toaster position="top-center" />

      {favorites.length === 0 ? (
        <div className="crystal p-12 text-center text-[var(--ink-500)] font-semibold text-sm">
          Your wishlist is currently empty.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((p) => (
            <div
              key={p.id}
              className="crystal p-5 flex gap-4 relative overflow-hidden group hover:shadow-[0_8px_32px_rgba(91,79,207,0.06)] transition-all"
            >
              {p.featured && (
                <span className="absolute top-2 left-2 z-10 badge-prism text-[9px] py-0.5 px-1.5 font-bold">
                  Featured
                </span>
              )}

              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/40 bg-[var(--bg-prism)] shrink-0">
                {p.thumbnail ? (
                  <Image src={p.thumbnail} alt={p.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[var(--ink-300)] uppercase geo-grid text-center">
                    No Preview
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-[var(--ink-900)] line-clamp-1">{p.title}</h3>
                  <p className="text-[10px] font-bold text-[var(--prism-violet)] mt-1">₹{p.price}</p>
                </div>
                <div className="flex gap-2 mt-3.5">
                  <Link
                    href={`/prompts/${p.slug}`}
                    className="btn-prism text-[10px] py-1.5 px-3 font-bold flex items-center gap-1"
                  >
                    Buy Now
                    <ArrowRight size={10} />
                  </Link>
                  <button
                    onClick={() => handleRemoveFavorite(p.id)}
                    className="btn-crystal text-[10px] py-1.5 px-3 font-bold border-white/60 text-[var(--prism-rose)] hover:bg-red-50 hover:border-red-200"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
