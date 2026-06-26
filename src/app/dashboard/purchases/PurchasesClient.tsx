"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Eye, Copy, Download, X, Check, Sparkles, AlertCircle } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface EnrichedPrompt {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  description: string;
  price: number;
  purchasedAt: Date;
  bundleTitle?: string;
}

export default function PurchasesClient({
  initialPrompts,
}: {
  initialPrompts: EnrichedPrompt[];
}) {
  const [prompts] = useState(initialPrompts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<EnrichedPrompt | null>(null);
  const [promptContent, setPromptContent] = useState<string>("");
  const [loadingContent, setLoadingContent] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredPrompts = prompts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.bundleTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRevealPrompt = async (prompt: EnrichedPrompt) => {
    setSelectedPrompt(prompt);
    setLoadingContent(true);
    setPromptContent("");
    setCopied(false);

    try {
      const res = await fetch(`/api/prompts/${prompt.slug}/content`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load prompt content");
      }

      setPromptContent(data.promptContent);
    } catch (error: any) {
      toast.error(error.message || "Failed to load secure prompt contents");
      setSelectedPrompt(null);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleCopy = () => {
    if (!promptContent) return;
    navigator.clipboard.writeText(promptContent);
    setCopied(true);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!promptContent || !selectedPrompt) return;
    const element = document.createElement("a");
    const file = new Blob([promptContent], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedPrompt.slug}-prompt.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Downloaded prompt TXT file!");
  };

  return (
    <div className="flex flex-col gap-6">
      <Toaster position="top-center" />

      {/* Search purchases */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search your purchased prompts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/50 backdrop-blur-md border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)] focus:bg-white/80 transition-all"
        />
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-300)]" />
      </div>

      {/* Grid of purchases */}
      {filteredPrompts.length === 0 ? (
        <div className="crystal p-12 text-center text-[var(--ink-500)] font-semibold text-sm">
          No purchased prompts found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrompts.map((p) => (
            <div key={p.id} className="crystal p-5 flex gap-4 relative overflow-hidden group hover:shadow-[0_8px_32px_rgba(91,79,207,0.06)] transition-all">
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
                  {p.bundleTitle && (
                    <span className="inline-block badge-prism text-[9px] py-0.5 px-1.5 mt-1 font-bold">
                      Via: {p.bundleTitle}
                    </span>
                  )}
                  <p className="text-[10px] text-[var(--ink-300)] font-semibold mt-1">
                    Purchased on {new Date(p.purchasedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 mt-3.5">
                  <button
                    onClick={() => handleRevealPrompt(p)}
                    className="btn-prism text-[10px] py-1.5 px-3 font-bold"
                  >
                    <Eye size={12} />
                    Reveal Prompt
                  </button>
                  <Link
                    href={`/prompts/${p.slug}`}
                    className="btn-crystal text-[10px] py-1.5 px-3 font-bold border-white/60"
                  >
                    Product Page
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reveal Prompt Modal */}
      {selectedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="crystal-solid w-full max-w-2xl overflow-hidden relative flex flex-col animate-[slide-in-up_0.25s_ease-out]">
            {/* Header */}
            <div className="p-5 border-b border-[rgba(91,79,207,0.12)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--prism-violet)]" />
                <h2 className="text-xs font-black text-[var(--ink-900)] uppercase tracking-wider line-clamp-1">
                  {selectedPrompt.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPrompt(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/40 hover:bg-white/70 text-[var(--ink-700)] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-4">
              {loadingContent ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--prism-violet)] border-t-transparent animate-spin"></div>
                  <p className="text-[10px] font-bold text-[var(--ink-500)] uppercase tracking-wider">
                    Decrypting Secure Prompt...
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-[rgba(91,79,207,0.04)] border border-[rgba(91,79,207,0.15)] rounded-xl p-4 flex gap-3 items-start">
                    <AlertCircle size={16} className="text-[var(--prism-violet)] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-[var(--ink-900)]">How to use this prompt:</h4>
                      <p className="text-[10px] text-[var(--ink-500)] mt-1 font-semibold leading-relaxed">
                        Copy the template text below and paste it into your AI assistant (e.g. ChatGPT, Midjourney, Claude). Fill in any bracketed fields with your specific requirements.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <pre className="w-full bg-[var(--ink-900)] text-[var(--ink-100)] p-5 rounded-xl text-xs font-mono whitespace-pre-wrap select-all max-h-[300px] overflow-y-auto leading-relaxed border border-black/10">
                      {promptContent}
                    </pre>
                  </div>
                </>
              )}
            </div>

            {/* Actions Footer */}
            {!loadingContent && (
              <div className="p-5 bg-white/40 border-t border-[rgba(91,79,207,0.12)] flex justify-end gap-3">
                <button
                  onClick={handleCopy}
                  disabled={!promptContent}
                  className="btn-crystal text-xs font-bold py-2.5 px-4 border-white/60"
                >
                  <Copy size={13} />
                  {copied ? "Copied!" : "Copy Prompt"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!promptContent}
                  className="btn-prism text-xs font-bold py-2.5 px-4"
                >
                  <Download size={13} />
                  Download TXT
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
