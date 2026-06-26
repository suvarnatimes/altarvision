"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, X, Check, Loader, Tag, AlertCircle } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface CouponItem {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  discount: number;
  expiryDate: string;
  active: boolean;
}

export default function CouponsManagerClient({
  initialCoupons,
}: {
  initialCoupons: CouponItem[];
}) {
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);
  const [activeCoupon, setActiveCoupon] = useState<CouponItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [discount, setDiscount] = useState("0");
  const [expiryDate, setExpiryDate] = useState("");
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setActiveCoupon(null);
    setCode("");
    setType("percentage");
    setDiscount("0");
    setExpiryDate("");
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: CouponItem) => {
    setIsEditMode(true);
    setActiveCoupon(coupon);
    setCode(coupon.code);
    setType(coupon.type);
    setDiscount(coupon.discount.toString());
    setExpiryDate(coupon.expiryDate);
    setActive(coupon.active);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, codeName: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${codeName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deletion failed");

      setCoupons(coupons.filter((c) => c.id !== id));
      toast.success("Coupon deleted!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete coupon");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || priceDiscountInvalid()) {
      toast.error("Please provide a valid code and discount value");
      return;
    }

    if (!expiryDate) {
      toast.error("Please specify coupon expiry date");
      return;
    }

    setSubmitting(true);

    const payload = {
      ...(isEditMode ? { id: activeCoupon?.id } : {}),
      code: code.trim().toUpperCase(),
      type,
      discount: Number(discount),
      expiryDate,
      active,
    };

    try {
      const res = await fetch("/api/admin/coupons", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      if (isEditMode && activeCoupon) {
        setCoupons(
          coupons.map((c) =>
            c.id === activeCoupon.id ? { ...c, ...payload } : c
          )
        );
        toast.success("Coupon updated!");
      } else {
        setCoupons([
          { id: data.id, ...payload } as CouponItem,
          ...coupons,
        ]);
        toast.success("Coupon created!");
      }

      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const priceDiscountInvalid = () => {
    const val = Number(discount);
    if (isNaN(val) || val <= 0) return true;
    if (type === "percentage" && val > 100) return true;
    return false;
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
          Create Coupon
        </button>
      </div>

      {/* Coupons Table Grid */}
      <div className="crystal overflow-hidden">
        {coupons.length === 0 ? (
          <div className="p-12 text-center text-[var(--ink-500)] font-semibold text-sm">
            No coupon codes defined.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[rgba(91,79,207,0.05)] border-b border-[rgba(91,79,207,0.12)] text-[var(--ink-500)] font-black uppercase tracking-wider">
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Active</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(91,79,207,0.08)] font-semibold">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[rgba(91,79,207,0.02)] transition-colors">
                    <td className="p-4 font-mono font-bold text-xs text-[var(--ink-900)] flex items-center gap-1.5">
                      <Tag size={13} className="text-[var(--prism-violet)]" />
                      {c.code}
                    </td>
                    <td className="p-4 text-[var(--ink-700)] capitalize">{c.type}</td>
                    <td className="p-4 text-[var(--ink-900)] font-bold">
                      {c.type === "percentage" ? `${c.discount}%` : `₹${c.discount}`}
                    </td>
                    <td className="p-4 text-[var(--ink-700)]">{c.expiryDate}</td>
                    <td className="p-4">
                      {c.active ? (
                        <span className="inline-flex items-center gap-0.5 text-[var(--prism-emerald)]">
                          <Check size={13} /> Active
                        </span>
                      ) : (
                        <span className="text-[var(--ink-300)]">Disabled</span>
                      )}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2.5">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/50 border border-white/60 text-[var(--prism-violet)] hover:bg-[rgba(91,79,207,0.08)] transition-all"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
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

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="crystal-solid w-full max-w-md overflow-hidden relative animate-[slide-in-up_0.2s_ease-out]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--prism-violet)] to-[var(--prism-sky)]"></div>

            <div className="p-5 border-b border-[rgba(91,79,207,0.12)] flex items-center justify-between">
              <h3 className="text-xs font-black text-[var(--ink-900)] uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={14} className="text-[var(--prism-violet)]" />
                {isEditMode ? "Edit Coupon" : "Create Coupon"}
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
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. SAVE20"
                    className="h-10 px-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
                    Discount Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="h-10 px-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="e.g. 20"
                    className="h-10 px-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="h-10 px-4 rounded-xl bg-white border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 h-full pt-3">
                <input
                  type="checkbox"
                  id="coupon-active-check"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded border-white/60 bg-white/40 text-[var(--prism-violet)] accent-[var(--prism-violet)] focus:ring-0"
                />
                <label htmlFor="coupon-active-check" className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider cursor-pointer select-none">
                  Enable coupon for use
                </label>
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
                  {isEditMode ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
