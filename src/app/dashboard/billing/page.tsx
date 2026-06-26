import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { CreditCard, IndianRupee, FileText, CheckCircle, Clock, Tag } from "lucide-react";

export default async function BillingPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userId = user.id;

  // Fetch completed orders to calculate spending analytics
  const ordersSnapshot = await adminDb
    .collection("orders")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  const orders = ordersSnapshot.docs.map((doc: any) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
    };
  });

  const completedOrders = orders.filter((o: any) => o.paymentStatus === "completed");
  const totalSpent = completedOrders.reduce((sum: number, o: any) => sum + Number(o.amount || 0), 0);
  const averageSpent = completedOrders.length > 0 ? Math.round(totalSpent / completedOrders.length) : 0;
  const couponCount = completedOrders.filter((o: any) => o.couponUsed).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Billing & Spending
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Review financial summaries, purchase metrics, and transaction receipts.
        </p>
      </div>

      {/* Financial Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Spent */}
        <div className="crystal p-6 relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] flex items-center justify-center text-[var(--prism-emerald)]">
            <IndianRupee size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-[var(--ink-300)] uppercase tracking-wider block">
              Total Spending
            </span>
            <span className="stat-num block mt-1" style={{ backgroundImage: "linear-gradient(130deg, #10b981, #3b82f6)" }}>
              ₹{totalSpent}
            </span>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="crystal p-6 relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[rgba(91,79,207,0.1)] border border-[rgba(91,79,207,0.2)] flex items-center justify-center text-[var(--prism-violet)]">
            <CreditCard size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-[var(--ink-300)] uppercase tracking-wider block">
              Average Order Value
            </span>
            <span className="stat-num block mt-1">₹{averageSpent}</span>
          </div>
        </div>

        {/* Coupon Discount Count */}
        <div className="crystal p-6 relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[rgba(232,121,160,0.1)] border border-[rgba(232,121,160,0.2)] flex items-center justify-center text-[var(--prism-rose)]">
            <Tag size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-[var(--ink-300)] uppercase tracking-wider block">
              Coupons Redeemed
            </span>
            <span className="stat-num block mt-1" style={{ backgroundImage: "linear-gradient(130deg, #e879a0, #5b4fcf)" }}>
              {couponCount}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-black text-[var(--ink-900)] uppercase tracking-wider pl-1.5 border-l-3 border-[var(--prism-violet)]">
          Payment History
        </h2>

        <div className="crystal overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-[var(--ink-500)] font-semibold text-sm">
              No transactions recorded.
            </div>
          ) : (
            <div className="divide-y divide-[rgba(91,79,207,0.12)]">
              {orders.map((o: any) => (
                <div key={o.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-[rgba(91,79,207,0.02)] transition-colors font-semibold">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[var(--ink-900)] font-mono text-[10px]">
                        Order ID: {o.id}
                      </span>
                      {o.couponUsed && (
                        <span className="badge-prism text-[9px] font-bold py-0.5 px-1.5 flex items-center gap-0.5">
                          <Tag size={8} /> {o.couponUsed}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--ink-300)] font-semibold mt-1">
                      Processed on {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <span className="text-xs font-bold text-[var(--ink-900)] block">₹{o.amount}</span>
                      <span className="text-[9px] text-[var(--ink-300)] block">Price</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {o.paymentStatus === "completed" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--prism-emerald)]">
                          <CheckCircle size={12} />
                          Captured
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--prism-amber)]">
                          <Clock size={12} />
                          Pending
                        </span>
                      )}

                      {o.paymentStatus === "completed" && (
                        <Link
                          href={`/dashboard/orders/${o.id}/invoice`}
                          target="_blank"
                          className="btn-crystal text-[10px] py-1.5 px-3 font-bold border-white/60 flex items-center gap-1 shrink-0"
                        >
                          <FileText size={12} />
                          Invoice
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
