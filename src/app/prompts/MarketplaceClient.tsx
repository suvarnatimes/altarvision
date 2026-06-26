"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/marketplace/SearchBar";
import FilterSidebar from "@/components/marketplace/FilterSidebar";
import PromptGrid from "@/components/marketplace/PromptGrid";
import { Category, Prompt } from "@/types";
import { toast, Toaster } from "react-hot-toast";

interface MarketplaceClientProps {
  initialPrompts: Omit<Prompt, "promptContent">[];
  categories: Category[];
}

export default function MarketplaceClient({
  initialPrompts,
  categories,
}: {
  initialPrompts: any[];
  categories: Category[];
}) {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Search/Filters states
  const [prompts, setPrompts] = useState<any[]>(initialPrompts);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create categories ID to Name map
  const categoriesMap = categories.reduce<Record<string, string>>((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  // Fetch wishlist favorites if logged in
  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/user/favorites")
        .then((res) => {
          if (res.ok) return res.json();
          return [];
        })
        .then((data) => {
          setFavorites(data.map((f: any) => f.id));
        })
        .catch(() => {});
    }
  }, [isSignedIn]);

  // Trigger search/filters API query
  const queryPrompts = async (
    queryStr: string,
    catId: string,
    sortStr: string,
    feat: boolean,
    pageNum: number,
    append = false
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        searchQuery: queryStr,
        categoryId: catId,
        sortBy: sortStr,
        featured: feat ? "true" : "false",
        page: pageNum.toString(),
        limit: "12",
      });

      const res = await fetch(`/api/prompts?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to query prompts");

      if (append) {
        setPrompts((prev) => [...prev, ...data.prompts]);
      } else {
        setPrompts(data.prompts);
      }
      setTotalPages(data.pagination.totalPages);
      setPage(data.pagination.page);
    } catch (error: any) {
      toast.error(error.message || "Failed to search prompts");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    queryPrompts(q, categoryId, sortBy, featuredOnly, 1);
  };

  const handleCategorySelect = (id: string) => {
    setCategoryId(id);
    queryPrompts(searchQuery, id, sortBy, featuredOnly, 1);
  };

  const handleSortSelect = (sort: string) => {
    setSortBy(sort);
    queryPrompts(searchQuery, categoryId, sort, featuredOnly, 1);
  };

  const handleToggleFeatured = (feat: boolean) => {
    setFeaturedOnly(feat);
    queryPrompts(searchQuery, categoryId, sortBy, feat, 1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryId("");
    setSortBy("newest");
    setFeaturedOnly(false);
    queryPrompts("", "", "newest", false, 1);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      queryPrompts(searchQuery, categoryId, sortBy, featuredOnly, page + 1, true);
    }
  };

  const handleToggleFavorite = async (promptId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      toast.error("Please sign in to add prompts to your wishlist");
      router.push("/sign-in");
      return;
    }

    try {
      const res = await fetch("/api/user/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update wishlist");

      if (data.favorited) {
        setFavorites([...favorites, promptId]);
        toast.success("Added to wishlist!");
      } else {
        setFavorites(favorites.filter((id) => id !== promptId));
        toast.success("Removed from wishlist");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle wishlist");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Toaster position="top-center" />

      {/* Header Info */}
      <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
        <span className="badge-prism text-[10px] font-black uppercase tracking-widest py-1 px-3 self-center">
          AI Prompt Marketplace
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--ink-900)] tracking-tight">
          Supercharge Your AI with <span className="text-prism">Premium Prompts</span>
        </h1>
        <p className="text-xs text-[var(--ink-500)] leading-relaxed font-semibold">
          Unlock the true potential of Midjourney, ChatGPT, Claude, and Stable Diffusion. Handcrafted copy-paste templates curated for creators and developers.
        </p>
      </div>

      {/* Search Container */}
      <div className="max-w-2xl mx-auto w-full">
        <SearchBar initialValue={searchQuery} onSearch={handleSearch} />
      </div>

      {/* Marketplace Layout Grid */}
      <div className="flex flex-col md:flex-row gap-8 items-start mt-4">
        {/* Sidebar filters */}
        <aside className="w-full md:w-64 shrink-0">
          <FilterSidebar
            categories={categories}
            selectedCategoryId={categoryId}
            onSelectCategory={handleCategorySelect}
            selectedSort={sortBy}
            onSelectSort={handleSortSelect}
            featuredOnly={featuredOnly}
            onToggleFeatured={handleToggleFeatured}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Prompts list grid */}
        <div className="flex-1 w-full flex flex-col gap-8 min-w-0">
          {loading && page === 1 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--prism-violet)] border-t-transparent animate-spin"></div>
              <p className="text-[10px] font-bold text-[var(--ink-300)] uppercase tracking-wider">
                Searching prompt index...
              </p>
            </div>
          ) : (
            <>
              <PromptGrid
                prompts={prompts}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                categoriesMap={categoriesMap}
              />

              {/* Load More Pagination */}
              {page < totalPages && (
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="btn-crystal py-2.5 px-8 font-bold border-white/60 self-center text-xs flex items-center gap-1.5"
                >
                  {loading && <div className="w-3.5 h-3.5 border border-[var(--prism-violet)] border-t-transparent rounded-full animate-spin"></div>}
                  Load More Prompts
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
