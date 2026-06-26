"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Heart, Sparkles, Tag, ShieldCheck, HelpCircle, ArrowRight, Loader } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

function getYouTubeEmbedUrl(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

interface PromptDetailsClientProps {
  prompt: any;
  categoryName: string;
  reviews: any[];
  avgRating: string;
  relatedPrompts: any[];
  hasOwned: boolean;
  prefillUser: { name: string; email: string } | null;
}

export default function PromptDetailsClient({
  prompt,
  categoryName,
  reviews,
  avgRating,
  relatedPrompts,
  hasOwned,
  prefillUser,
}: PromptDetailsClientProps) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(prompt.thumbnail);
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<"none" | "valid" | "invalid">("none");
  const [discountedPrice, setDiscountedPrice] = useState(prompt.price);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [buying, setBuying] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  // Load Razorpay Standard Checkout Script on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Check if item is in wishlist on load
  useEffect(() => {
    if (prefillUser) {
      fetch("/api/user/favorites")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          const isFav = data.some((f: any) => f.id === prompt.id);
          setWishlisted(isFav);
        })
        .catch(() => {});
    }
  }, [prefillUser, prompt.id]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    setCouponStatus("none");

    try {
      // Look up coupon via checkout order mock checks
      const sanitizedCoupon = couponCode.trim().toUpperCase();
      const res = await fetch(`/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: prompt.id,
          couponCode: sanitizedCoupon,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setCouponStatus("invalid");
        setDiscountedPrice(prompt.price);
        toast.error(data.error || "Invalid coupon code");
      } else {
        setCouponStatus("valid");
        // data.amount is in paise
        setDiscountedPrice(data.amount / 100);
        toast.success(`Coupon applied successfully!`);
      }
    } catch (error) {
      setCouponStatus("invalid");
      toast.error("Failed to validate coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!prefillUser) {
      toast.error("Please sign in to add prompts to your wishlist");
      router.push("/sign-in");
      return;
    }

    try {
      const res = await fetch("/api/user/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: prompt.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle wishlist");

      setWishlisted(data.favorited);
      toast.success(data.favorited ? "Added to wishlist!" : "Removed from wishlist");
    } catch (error: any) {
      toast.error(error.message || "Failed to update wishlist");
    }
  };

  const handleCheckout = async () => {
    if (!prefillUser) {
      toast.error("Please sign in to purchase prompts");
      router.push("/sign-in");
      return;
    }

    setBuying(true);

    try {
      // 1. Create order on server (verifies price on server side)
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: prompt.id,
          couponCode: couponStatus === "valid" ? couponCode.trim().toUpperCase() : null,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || "Failed to initialize payment order");
      }

      // 2. Open Razorpay Standard checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_T5Jnectk4BmLhJ",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AltarVision AI",
        description: prompt.title,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment signature on backend (secure verification)
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Signature verification failed");
            }

            toast.success("Payment verified and completed!");
            router.push("/dashboard/purchases");
          } catch (verifyError: any) {
            toast.error(verifyError.message || "Failed to finalize order transaction");
          }
        },
        prefill: {
          name: prefillUser.name,
          email: prefillUser.email,
        },
        theme: {
          color: "#5b4fcf",
        },
        modal: {
          ondismiss: function () {
            toast.error("Checkout cancelled");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment transaction failed");
      });

      rzp.open();
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate checkout");
    } finally {
      setBuying(false);
    }
  };

  const imagesList = [prompt.thumbnail, ...(prompt.previewImages || [])].filter((url) => !!url);

  return (
    <div className="flex flex-col gap-12">
      <Toaster position="top-center" />

      {/* Main product showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: Images Display */}
        <div className="flex flex-col gap-4 w-full">
          <div className="crystal relative aspect-[16/10] overflow-hidden border border-white/60 bg-[var(--bg-prism)]">
            {activeImage ? (
              <Image src={activeImage} alt={prompt.title} fill className="object-cover" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--ink-300)] uppercase tracking-wider geo-grid">
                No Preview
              </div>
            )}
          </div>

          {imagesList.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {imagesList.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(url)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border shrink-0 bg-white/40 transition-all ${
                    activeImage === url
                      ? "border-[var(--prism-violet)] shadow-[0_0_12px_rgba(91,79,207,0.18)] scale-95"
                      : "border-white/50 hover:border-[var(--prism-violet)]/40"
                  }`}
                >
                  <img src={url} alt="thumbnail" className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Configuration & Checkout details */}
        <div className="crystal p-6 sm:p-8 flex flex-col gap-6 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--prism-violet)] to-[var(--prism-sky)]"></div>

          {/* Heading */}
          <div>
            <span className="text-[10px] font-bold text-[var(--prism-violet)] uppercase tracking-wider block mb-1">
              {categoryName}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--ink-900)] leading-tight">
              {prompt.title}
            </h1>
            <div className="flex items-center gap-2.5 mt-2.5 font-bold text-xs">
              <div className="flex items-center gap-0.5">
                <Star size={13} className="fill-[var(--prism-amber)] text-[var(--prism-amber)]" />
                <span className="text-[var(--ink-900)]">{avgRating}</span>
              </div>
              <span className="text-[var(--ink-300)] font-normal">|</span>
              <span className="text-[var(--ink-500)]">{reviews.length} reviews</span>
              <span className="text-[var(--ink-300)] font-normal">|</span>
              <span className="text-[var(--prism-emerald)] flex items-center gap-0.5">
                <ShieldCheck size={13} /> Verified Safe
              </span>
            </div>
          </div>

          <p className="text-xs text-[var(--ink-500)] leading-relaxed font-semibold">
            {prompt.description}
          </p>

          <div className="border-t border-b border-[rgba(91,79,207,0.12)] py-5 my-1 flex items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-black text-[var(--ink-300)] uppercase tracking-wider block">Price</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[var(--ink-900)]">
                  ₹{discountedPrice}
                </span>
                {discountedPrice < prompt.price && (
                  <span className="text-xs font-bold text-[var(--ink-300)] line-through">
                    ₹{prompt.price}
                  </span>
                )}
              </div>
            </div>

            {hasOwned ? (
              <span className="badge-prism text-[9px] py-1 px-2.5 font-bold">
                Owned (Unlocked)
              </span>
            ) : (
              <div className="flex flex-col items-end gap-1.5 shrink-0 max-w-[180px]">
                <div className="flex gap-1.5 w-full">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="h-8 w-full px-2.5 rounded-lg bg-white/40 border border-white/60 text-[10px] uppercase font-bold focus:outline-none focus:border-[var(--prism-violet)]"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="btn-crystal py-1.5 px-3 h-8 text-[10px] font-bold border-white/60 shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {couponStatus === "valid" && (
                  <span className="text-[9px] font-bold text-[var(--prism-emerald)] leading-none mr-1">
                    Discount applied!
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {hasOwned ? (
              <Link
                href="/dashboard/purchases"
                className="btn-prism text-xs font-bold py-3 px-6 flex-1 justify-center"
              >
                Access Decrypted Prompt
                <ArrowRight size={14} />
              </Link>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={buying}
                className="btn-prism text-xs font-bold py-3 px-6 flex-1 justify-center"
              >
                {buying && <Loader size={14} className="animate-spin" />}
                Buy Now
                <ArrowRight size={14} />
              </button>
            )}

            <button
              onClick={handleToggleFavorite}
              className="w-11 h-11 rounded-xl bg-white/60 border border-white/50 flex items-center justify-center text-[var(--ink-700)] hover:bg-white/80 active:scale-95 transition-all"
            >
              <Heart
                size={18}
                className={wishlisted ? "fill-[var(--prism-rose)] text-[var(--prism-rose)]" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* How to use Video Box */}
      {prompt.videoUrl && getYouTubeEmbedUrl(prompt.videoUrl) && (
        <div className="crystal p-6 sm:p-8 flex flex-col gap-6 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--prism-sky)] to-[var(--prism-violet)]"></div>
          <div>
            <h3 className="text-sm font-black text-[var(--ink-900)] uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--prism-violet)] animate-pulse" />
              How to Use Video Tutorial
            </h3>
            <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
              Watch this quick video tutorial to learn how to copy, customize, and execute this prompt effectively.
            </p>
          </div>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/50 shadow-md max-w-4xl mx-auto">
            <iframe
              src={getYouTubeEmbedUrl(prompt.videoUrl)!}
              title="How to use video"
              className="absolute top-0 left-0 w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Reviews list testimonials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Testimonials summary */}
        <div className="crystal p-6 flex flex-col gap-4">
          <h3 className="text-xs font-black text-[var(--ink-900)] uppercase tracking-wider">
            Rating Summary
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--ink-900)]">{avgRating}</span>
            <span className="text-xs text-[var(--ink-500)] font-semibold">out of 5.0</span>
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={`stroke-none ${
                  i < Math.round(Number(avgRating)) ? "fill-[var(--prism-amber)]" : "fill-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-[var(--ink-300)] font-bold">
            Based on {reviews.length} customer ratings
          </span>
        </div>

        {/* Right Side: Reviews items list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-black text-[var(--ink-900)] uppercase tracking-wider pl-1.5 border-l-3 border-[var(--prism-violet)]">
            Buyer Testimonials
          </h3>

          {reviews.length === 0 ? (
            <div className="crystal p-8 text-center text-xs text-[var(--ink-500)] font-semibold">
              No reviews left yet. Be the first to purchase and review this prompt!
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="crystal p-5 flex flex-col gap-3 font-semibold">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-white/40 bg-[var(--bg-prism)] flex items-center justify-center text-[10px] font-bold text-[var(--ink-300)]">
                        {r.userAvatar ? (
                          <img src={r.userAvatar} alt={r.userName} className="object-cover w-full h-full" />
                        ) : (
                          "AV"
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[var(--ink-900)]">{r.userName}</h4>
                        <span className="text-[9px] text-[var(--ink-300)] font-bold mt-0.5 block">
                          Verified Buyer
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] text-[var(--ink-300)]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        className={`stroke-none ${
                          i < r.rating ? "fill-[var(--prism-amber)]" : "fill-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-[var(--ink-700)] leading-relaxed italic">
                    &ldquo;{r.review}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Prompts Grid list */}
      {relatedPrompts.length > 0 && (
        <div className="flex flex-col gap-6 border-t border-[rgba(91,79,207,0.12)] pt-10">
          <h2 className="text-sm font-black text-[var(--ink-900)] uppercase tracking-wider pl-1.5 border-l-3 border-[var(--prism-sky)]">
            Related Prompts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPrompts.map((p) => (
              <div key={p.id} className="crystal crystal-hover overflow-hidden flex flex-col justify-between h-full group">
                <Link href={`/prompts/${p.slug}`} className="relative block aspect-[16/10] bg-[var(--bg-prism)]">
                  {p.thumbnail && <Image src={p.thumbnail} alt={p.title} fill className="object-cover" />}
                </Link>
                <div className="p-4 flex-1 flex flex-col justify-between font-semibold">
                  <div>
                    <Link href={`/prompts/${p.slug}`}>
                      <h4 className="text-xs font-black text-[var(--ink-900)] line-clamp-1 group-hover:text-[var(--prism-violet)] transition-colors">
                        {p.title}
                      </h4>
                    </Link>
                    <p className="text-[10px] text-[var(--ink-500)] line-clamp-2 mt-1.5">{p.description}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-[rgba(91,79,207,0.08)] pt-3 mt-3">
                    <span className="text-[10px] text-[var(--ink-300)]">Price</span>
                    <span className="text-xs font-black text-[var(--ink-900)]">₹{p.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
