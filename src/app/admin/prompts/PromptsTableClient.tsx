"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Search, CheckCircle, HelpCircle, Star } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface AdminPromptItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  status: "draft" | "published";
  featured: boolean;
  categoryId: string;
  createdAt: Date;
}

export default function PromptsTableClient({
  initialPrompts,
  categoriesMap,
}: {
  initialPrompts: AdminPromptItem[];
  categoriesMap: Record<string, string>;
}) {
  const [prompts, setPrompts] = useState<AdminPromptItem[]>(initialPrompts);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrompts = prompts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the prompt "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/prompts?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete prompt");
      }

      setPrompts(prompts.filter((p) => p.id !== id));
      toast.success("Prompt deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete prompt");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Toaster position="top-center" />

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search prompts by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/50 backdrop-blur-md border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)] focus:bg-white/80 transition-all"
        />
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-300)]" />
      </div>

      {/* Table Container */}
      <div className="crystal overflow-hidden">
        {filteredPrompts.length === 0 ? (
          <div className="p-12 text-center text-[var(--ink-500)] font-semibold text-sm">
            No prompts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[rgba(91,79,207,0.05)] border-b border-[rgba(91,79,207,0.12)] text-[var(--ink-500)] font-black uppercase tracking-wider">
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(91,79,207,0.08)] font-semibold">
                {filteredPrompts.map((p) => (
                  <tr key={p.id} className="hover:bg-[rgba(91,79,207,0.02)] transition-colors">
                    <td className="p-4 text-[var(--ink-900)] font-bold max-w-[200px] truncate">
                      {p.title}
                    </td>
                    <td className="p-4 text-[var(--ink-700)]">
                      {categoriesMap[p.categoryId] || "Unassigned"}
                    </td>
                    <td className="p-4 text-[var(--ink-900)] font-bold">
                      ₹{p.price}
                    </td>
                    <td className="p-4">
                      {p.status === "published" ? (
                        <span className="inline-flex items-center gap-1 text-[var(--prism-emerald)]">
                          <CheckCircle size={12} /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[var(--ink-300)]">
                          <HelpCircle size={12} /> Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {p.featured ? (
                        <span className="inline-flex items-center gap-1 text-[var(--prism-rose)]">
                          <Star size={12} className="fill-[var(--prism-rose)]" /> Yes
                        </span>
                      ) : (
                        <span className="text-[var(--ink-300)]">No</span>
                      )}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2.5">
                      <Link
                        href={`/admin/prompts/${p.id}/edit`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/50 border border-white/60 text-[var(--prism-violet)] hover:bg-[rgba(91,79,207,0.08)] transition-all"
                      >
                        <Edit size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/50 border border-white/60 text-[var(--prism-rose)] hover:bg-red-50 hover:border-red-200 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
