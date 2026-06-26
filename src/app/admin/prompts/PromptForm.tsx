"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader, Sparkles, AlertCircle, Trash2 } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface CategoryOption {
  id: string;
  name: string;
}

interface PromptFormProps {
  categories: CategoryOption[];
  initialPrompt?: any;
}

export default function PromptForm({ categories, initialPrompt }: PromptFormProps) {
  const router = useRouter();
  const isEdit = !!initialPrompt;

  const [title, setTitle] = useState(initialPrompt?.title || "");
  const [slug, setSlug] = useState(initialPrompt?.slug || "");
  const [description, setDescription] = useState(initialPrompt?.description || "");
  const [categoryId, setCategoryId] = useState(initialPrompt?.categoryId || "");
  const [thumbnail, setThumbnail] = useState(initialPrompt?.thumbnail || "");
  const [previewImages, setPreviewImages] = useState<string[]>(initialPrompt?.previewImages || []);
  const [promptContent, setPromptContent] = useState(initialPrompt?.promptContent || "");
  const [tagsInput, setTagsInput] = useState(initialPrompt?.tags?.join(", ") || "");
  const [price, setPrice] = useState(initialPrompt?.price?.toString() || "0");
  const [featured, setFeatured] = useState(initialPrompt?.featured || false);
  const [status, setStatus] = useState<"draft" | "published">(initialPrompt?.status || "draft");
  const [videoUrl, setVideoUrl] = useState(initialPrompt?.videoUrl || "");

  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingPreviews, setUploadingPreviews] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Auto-slugify helper
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

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
      if (!res.ok) throw new Error(data.error || "Failed to upload thumbnail");

      setThumbnail(data.url);
      toast.success("Thumbnail uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload thumbnail");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handlePreviewsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPreviews(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("folder", "previews");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          uploadedUrls.push(data.url);
        }
      }

      setPreviewImages((prev) => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} preview images uploaded!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload preview images");
    } finally {
      setUploadingPreviews(false);
    }
  };

  const handleRemovePreview = (index: number) => {
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !slug.trim() || !description.trim() || !categoryId || !promptContent.trim() || price === "") {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    const payload = {
      ...(isEdit ? { id: initialPrompt.id } : {}),
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      categoryId,
      thumbnail,
      previewImages,
      promptContent: promptContent.trim(),
      tags: tagsInput.split(",").map((t: string) => t.trim()).filter((t: string) => t !== ""),
      price: Number(price),
      featured,
      status,
      videoUrl: videoUrl.trim(),
    };

    try {
      const res = await fetch("/api/admin/prompts", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save prompt");

      toast.success(isEdit ? "Prompt updated!" : "Prompt published!");
      router.push("/admin/prompts");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save prompt");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crystal p-6 md:p-8">
      <Toaster position="top-center" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Core details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
              Prompt Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Midjourney Christian Poster Generator..."
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
              placeholder="auto-generated-url-slug"
              className="h-10 px-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
            />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
            Short Description *
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a clear, compelling summary of what this prompt creates..."
            className="p-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)] resize-none"
          />
        </div>

        {/* How to use Video Link */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
            How to Use Video (YouTube Link)
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            className="h-10 px-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
          />
        </div>

        {/* Pricing, Category & Config */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
              Price (INR) *
            </label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 199"
              className="h-10 px-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-10 px-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="h-10 px-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Assets Uploads: Thumbnail & Previews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Thumbnail */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
              Card Thumbnail Image
            </label>
            <div className="flex items-center gap-4">
              {thumbnail && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                  <img src={thumbnail} alt="thumbnail" className="object-cover w-full h-full" />
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

          {/* Preview Images */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
              Preview / Carousel Images
            </label>
            <div className="flex flex-wrap gap-2.5 mb-2">
              {previewImages.map((img, i) => (
                <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 group">
                  <img src={img} alt="preview" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => handleRemovePreview(i)}
                    className="absolute inset-0 bg-red-600/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <label className="btn-crystal text-xs font-bold py-2.5 px-4 border-white/60 cursor-pointer flex items-center gap-1.5 w-fit">
              {uploadingPreviews ? <Loader size={13} className="animate-spin" /> : <Upload size={13} />}
              Add Preview Images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePreviewsUpload}
                disabled={uploadingPreviews}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Secure Instructions */}
        <div className="flex flex-col gap-2 bg-[rgba(91,79,207,0.02)] border border-[rgba(91,79,207,0.1)] rounded-2xl p-5">
          <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-[var(--prism-violet)]" />
            Decrypted Prompt Content (Secure) *
          </label>
          <p className="text-[10px] text-[var(--ink-500)] font-semibold flex items-center gap-1">
            <AlertCircle size={12} className="text-[var(--prism-violet)] shrink-0" />
            This content is encrypted and strictly hidden from public views. Only verified purchasers can decrypt it.
          </p>
          <textarea
            rows={6}
            value={promptContent}
            onChange={(e) => setPromptContent(e.target.value)}
            placeholder="e.g. /imagine prompt: Christian poster of [verse] in crystal prism aesthetics --ar 16:9 --v 6.0"
            className="p-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)] resize-none font-mono mt-2"
          />
        </div>

        {/* Tags & Configurations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. midjourney, bible, church event"
              className="h-10 px-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
            />
          </div>

          <div className="flex items-center gap-2.5 h-full pt-6">
            <input
              type="checkbox"
              id="featured-check"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-white/60 bg-white/40 text-[var(--prism-violet)] accent-[var(--prism-violet)] focus:ring-0"
            />
            <label htmlFor="featured-check" className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider cursor-pointer select-none">
              Mark as Featured Product
            </label>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={submitting}
          className="btn-prism text-xs font-bold py-3 px-6 mt-4 flex items-center justify-center gap-1.5 self-end w-full sm:w-auto"
        >
          {submitting && <Loader size={13} className="animate-spin" />}
          {isEdit ? "Update Product" : "Publish Product"}
        </button>
      </form>
    </div>
  );
}
