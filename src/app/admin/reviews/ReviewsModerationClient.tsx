"use client";

import { useState } from "react";
import { Star, Trash2, Search, AlertOctagon } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface ModerationReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  promptId: string;
  rating: number;
  review: string;
  createdAt: Date;
}

export default function ReviewsModerationClient({
  initialReviews,
  promptsMap,
}: {
  initialReviews: ModerationReview[];
  promptsMap: Record<string, string>;
}) {
  const [reviews, setReviews] = useState<ModerationReview[]>(initialReviews);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReviews = reviews.filter(
    (r) =>
      r.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this buyer review?")) return;

    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete review");

      setReviews(reviews.filter((r) => r.id !== id));
      toast.success("Review deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete review");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Toaster position="top-center" />

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search reviews by comment content or buyer name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/50 backdrop-blur-md border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
        />
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-300)]" />
      </div>

      {/* Reviews list */}
      <div className="flex flex-col gap-4">
        {filteredReviews.length === 0 ? (
          <div className="crystal p-12 text-center text-[var(--ink-500)] font-semibold text-sm">
            No reviews found matching search.
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div
              key={r.id}
              className="crystal p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-[0_8px_32px_rgba(91,79,207,0.04)] transition-all font-semibold"
            >
              <div className="flex gap-4">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/40 shrink-0 bg-[var(--bg-prism)] flex items-center justify-center text-xs text-[var(--ink-300)] font-bold">
                  {r.userAvatar ? (
                    <img src={r.userAvatar} alt={r.userName} className="object-cover w-full h-full" />
                  ) : (
                    "AV"
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-xs font-black text-[var(--ink-900)]">{r.userName}</h4>
                    <span className="text-[10px] text-[var(--ink-300)]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-[10px] text-[var(--prism-violet)] mt-1">
                    Reviewed: <strong className="font-bold">{promptsMap[r.promptId] || "AI Prompt"}</strong>
                  </p>

                  <div className="flex items-center gap-0.5 mt-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={`stroke-none ${
                          i < r.rating ? "fill-[var(--prism-amber)]" : "fill-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-[var(--ink-700)] mt-2.5 leading-relaxed font-semibold">
                    &ldquo;{r.review}&rdquo;
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex justify-end">
                <button
                  onClick={() => handleDelete(r.id)}
                  className="btn-crystal text-[10px] py-1.5 px-3 border-white/60 font-bold text-[var(--prism-rose)] hover:bg-red-50 hover:border-red-200 flex items-center gap-1.5"
                >
                  <Trash2 size={12} />
                  Delete Review
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
