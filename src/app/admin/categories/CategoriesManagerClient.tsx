"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, X, Loader, Upload, Sparkles } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export default function CategoriesManagerClient({
  initialCategories,
}: {
  initialCategories: CategoryItem[];
}) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [activeCategory, setActiveCategory] = useState<CategoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditMode) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "thumbnails");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setImage(data.url);
      toast.success("Category banner image uploaded!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setActiveCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setImage("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setIsEditMode(true);
    setActiveCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImage(cat.image);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deletion failed");

      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Category deleted!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    const payload = {
      ...(isEditMode ? { id: activeCategory?.id } : {}),
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      image,
    };

    try {
      const res = await fetch("/api/admin/categories", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      if (isEditMode && activeCategory) {
        setCategories(
          categories.map((c) =>
            c.id === activeCategory.id ? { ...c, ...payload } : c
          )
        );
        toast.success("Category updated!");
      } else {
        setCategories([
          { id: data.id, ...payload } as CategoryItem,
          ...categories,
        ]);
        toast.success("Category created!");
      }

      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Toaster position="top-center" />

      {/* Trigger Header */}
      <div className="flex justify-end">
        <button
          onClick={handleOpenCreate}
          className="btn-prism text-xs font-bold py-2.5 px-4 flex items-center gap-1.5"
        >
          <Plus size={15} />
          Create Category
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="crystal p-12 text-center text-[var(--ink-500)] col-span-full font-semibold text-sm">
            No categories defined yet.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="crystal p-5 flex flex-col justify-between hover:shadow-[0_8px_32px_rgba(91,79,207,0.06)] transition-all font-semibold"
            >
              <div>
                {cat.image && (
                  <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden mb-4 border border-slate-200/50 bg-[var(--bg-prism)]">
                    <img src={cat.image} alt={cat.name} className="object-cover w-full h-full" />
                  </div>
                )}
                <h3 className="text-sm font-black text-[var(--ink-900)] line-clamp-1">{cat.name}</h3>
                <span className="text-[10px] text-[var(--prism-violet)] block font-mono mt-1">/{cat.slug}</span>
                <p className="text-xs text-[var(--ink-500)] mt-2 line-clamp-2 leading-relaxed">{cat.description}</p>
              </div>

              <div className="flex gap-2.5 mt-5 pt-3 border-t border-[rgba(91,79,207,0.08)] justify-end">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/50 border border-white/60 text-[var(--prism-violet)] hover:bg-[rgba(91,79,207,0.08)] transition-all"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/50 border border-white/60 text-[var(--prism-rose)] hover:bg-red-50 hover:border-red-200 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="crystal-solid w-full max-w-lg overflow-hidden relative animate-[slide-in-up_0.2s_ease-out]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--prism-violet)] to-[var(--prism-sky)]"></div>

            <div className="p-5 border-b border-[rgba(91,79,207,0.12)] flex items-center justify-between">
              <h3 className="text-xs font-black text-[var(--ink-900)] uppercase tracking-wider">
                {isEditMode ? "Edit Category" : "Create Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/40 hover:bg-white/70 text-[var(--ink-700)] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Graphic Prompts..."
                    className="h-10 px-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. graphic-prompts"
                    className="h-10 px-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
                  Description *
                  </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what kind of prompts will belong to this category..."
                  className="p-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)] resize-none"
                />
              </div>

              {/* banner image */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
                  Banner Image
                </label>
                <div className="flex items-center gap-4">
                  {image && (
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-[var(--bg-prism)] shrink-0">
                      <img src={image} alt="preview" className="object-cover w-full h-full" />
                    </div>
                  )}
                  <label className="btn-crystal text-xs font-bold py-2.5 px-4 border-white/60 cursor-pointer flex items-center gap-1.5">
                    {uploadingImage ? <Loader size={13} className="animate-spin" /> : <Upload size={13} />}
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-2 border-t border-[rgba(91,79,207,0.12)] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-crystal text-xs font-bold py-2.5 px-4 border-white/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-prism text-xs font-bold py-2.5 px-5 flex items-center gap-1.5"
                >
                  {submitting && <Loader size={13} className="animate-spin" />}
                  {isEditMode ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
