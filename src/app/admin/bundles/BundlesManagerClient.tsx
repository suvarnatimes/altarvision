"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, X, Loader, Upload, Sparkles } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface BundleItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  prompts: string[]; // Prompt IDs
}

interface PromptOption {
  id: string;
  title: string;
}

export default function BundlesManagerClient({
  initialBundles,
  prompts,
}: {
  initialBundles: BundleItem[];
  prompts: PromptOption[];
}) {
  const [bundles, setBundles] = useState<BundleItem[]>(initialBundles);
  const [activeBundle, setActiveBundle] = useState<BundleItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [thumbnail, setThumbnail] = useState("");
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
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

      setThumbnail(data.url);
      toast.success("Bundle image uploaded!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleTogglePrompt = (promptId: string) => {
    if (selectedPrompts.includes(promptId)) {
      setSelectedPrompts(selectedPrompts.filter((id) => id !== promptId));
    } else {
      setSelectedPrompts([...selectedPrompts, promptId]);
    }
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setActiveBundle(null);
    setTitle("");
    setDescription("");
    setPrice("0");
    setThumbnail("");
    setSelectedPrompts([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bundle: BundleItem) => {
    setIsEditMode(true);
    setActiveBundle(bundle);
    setTitle(bundle.title);
    setDescription(bundle.description);
    setPrice(bundle.price.toString());
    setThumbnail(bundle.thumbnail);
    setSelectedPrompts(bundle.prompts || []);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, bundleTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete bundle "${bundleTitle}"?`)) return;

    try {
      const res = await fetch(`/api/admin/bundles?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deletion failed");

      setBundles(bundles.filter((b) => b.id !== id));
      toast.success("Bundle deleted!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete bundle");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || price === "") {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedPrompts.length === 0) {
      toast.error("Please select at least one prompt for this bundle");
      return;
    }

    setSubmitting(true);

    const payload = {
      ...(isEditMode ? { id: activeBundle?.id } : {}),
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      thumbnail,
      prompts: selectedPrompts,
    };

    try {
      const res = await fetch("/api/admin/bundles", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      if (isEditMode && activeBundle) {
        setBundles(
          bundles.map((b) =>
            b.id === activeBundle.id ? { ...b, ...payload } : b
          )
        );
        toast.success("Bundle updated!");
      } else {
        setBundles([
          { id: data.id, ...payload } as BundleItem,
          ...bundles,
        ]);
        toast.success("Bundle created!");
      }

      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save bundle");
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
          Create Bundle
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bundles.length === 0 ? (
          <div className="crystal p-12 text-center text-[var(--ink-500)] col-span-full font-semibold text-sm">
            No bundles defined yet.
          </div>
        ) : (
          bundles.map((b) => (
            <div
              key={b.id}
              className="crystal p-5 flex flex-col justify-between hover:shadow-[0_8px_32px_rgba(91,79,207,0.06)] transition-all font-semibold"
            >
              <div>
                {b.thumbnail && (
                  <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden mb-4 border border-slate-200/50 bg-[var(--bg-prism)]">
                    <img src={b.thumbnail} alt={b.title} className="object-cover w-full h-full" />
                  </div>
                )}
                <h3 className="text-sm font-black text-[var(--ink-900)] line-clamp-1">{b.title}</h3>
                <span className="text-[10px] text-[var(--prism-violet)] block font-bold mt-1">₹{b.price}</span>
                <span className="text-[10px] text-[var(--ink-300)] block font-bold mt-0.5">{b.prompts?.length || 0} prompts combined</span>
                <p className="text-xs text-[var(--ink-500)] mt-2 line-clamp-2 leading-relaxed">{b.description}</p>
              </div>

              <div className="flex gap-2.5 mt-5 pt-3 border-t border-[rgba(91,79,207,0.08)] justify-end">
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/50 border border-white/60 text-[var(--prism-violet)] hover:bg-[rgba(91,79,207,0.08)] transition-all"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(b.id, b.title)}
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
          <div className="crystal-solid w-full max-w-lg overflow-hidden relative flex flex-col max-h-[90vh] animate-[slide-in-up_0.2s_ease-out]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--prism-violet)] to-[var(--prism-sky)] shrink-0"></div>

            <div className="p-5 border-b border-[rgba(91,79,207,0.12)] flex items-center justify-between shrink-0">
              <h3 className="text-xs font-black text-[var(--ink-900)] uppercase tracking-wider">
                {isEditMode ? "Edit Bundle" : "Create Bundle"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/40 hover:bg-white/70 text-[var(--ink-700)] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
                    Bundle Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Christian Graphic Bundle..."
                    className="h-10 px-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 499"
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
                  placeholder="Describe what premium prompts are included in this bundle deal..."
                  className="p-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)] resize-none"
                />
              </div>

              {/* thumbnail image */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
                  Bundle Thumbnail Image
                </label>
                <div className="flex items-center gap-4">
                  {thumbnail && (
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-[var(--bg-prism)] shrink-0">
                      <img src={thumbnail} alt="preview" className="object-cover w-full h-full" />
                    </div>
                  )}
                  <label className="btn-crystal text-xs font-bold py-2.5 px-4 border-white/60 cursor-pointer flex items-center gap-1.5">
                    {uploadingThumbnail ? <Loader size={13} className="animate-spin" /> : <Upload size={13} />}
                    Upload Thumbnail
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      disabled={uploadingThumbnail}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* select prompts list checkboxes */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
                  Combine Prompts (Select all that apply) *
                </label>
                <div className="border border-white/60 bg-white/40 rounded-xl max-h-[150px] overflow-y-auto p-3 flex flex-col gap-2.5">
                  {prompts.map((p) => (
                    <label key={p.id} className="flex items-center gap-2.5 text-xs text-[var(--ink-700)] font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPrompts.includes(p.id)}
                        onChange={() => handleTogglePrompt(p.id)}
                        className="w-4 h-4 rounded border-white/60 bg-white/40 text-[var(--prism-violet)] accent-[var(--prism-violet)] focus:ring-0"
                      />
                      {p.title}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-2 border-t border-[rgba(91,79,207,0.12)] pt-4 shrink-0">
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
                  {isEditMode ? "Update Bundle" : "Create Bundle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
