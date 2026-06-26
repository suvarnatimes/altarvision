import { adminDb } from "@/lib/firebase/admin";
import { IndianRupee, ShoppingBag, Users, Download, ArrowRight, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  // 1. Fetch completed orders metrics
  const completedOrdersSnapshot = await adminDb
    .collection("orders")
    .where("paymentStatus", "==", "completed")
    .get();

  let totalRevenue = 0;
  const totalCompletedOrders = completedOrdersSnapshot.size;

  completedOrdersSnapshot.docs.forEach((doc: any) => {
    totalRevenue += Number(doc.data().amount || 0);
  });

  // 2. Fetch users count
  const usersSnapshot = await adminDb.collection("users").get();
  const totalUsers = usersSnapshot.size;

  // 3. Fetch downloads count
  const downloadsSnapshot = await adminDb.collection("downloads").get();
  const totalDownloads = downloadsSnapshot.size;

  // 4. Fetch recent orders (limit 5)
  const recentOrdersSnapshot = await adminDb
    .collection("orders")
    .orderBy("createdAt", "desc")
    .limit(5)
    .get();

  const recentOrders: any[] = recentOrdersSnapshot.docs.map((doc: any) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
    };
  });

  // 5. Aggregate top selling prompts
  const promptSalesMap: Record<string, { title: string; count: number }> = {};
  completedOrdersSnapshot.docs.forEach((doc: any) => {
    const order = doc.data();
    order.purchasedItems?.forEach((item: any) => {
      if (!promptSalesMap[item.id]) {
        promptSalesMap[item.id] = { title: item.title, count: 0 };
      }
      promptSalesMap[item.id].count += 1;
    });
  });

  const topSellers = Object.entries(promptSalesMap)
    .map(([id, stats]: [string, any]) => ({ id, ...stats }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      {/* Header Banner */}
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Admin Overview
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Aggregate platform statistics, track daily revenue, and moderate users.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="crystal p-6 relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] flex items-center justify-center text-[var(--prism-emerald)]">
            <IndianRupee size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-[var(--ink-300)] uppercase tracking-wider block">
              Total Revenue
            </span>
            <span className="stat-num block mt-1" style={{ backgroundImage: "linear-gradient(130deg, #10b981, #3b82f6)" }}>
              ₹{totalRevenue}
            </span>
          </div>
        </div>

        {/* Orders */}
        <div className="crystal p-6 relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[rgba(91,79,207,0.1)] border border-[rgba(91,79,207,0.2)] flex items-center justify-center text-[var(--prism-violet)]">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-[var(--ink-300)] uppercase tracking-wider block">
              Paid Orders
            </span>
            <span className="stat-num block mt-1">{totalCompletedOrders}</span>
          </div>
        </div>

        {/* Users */}
        <div className="crystal p-6 relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[rgba(232,121,160,0.1)] border border-[rgba(232,121,160,0.2)] flex items-center justify-center text-[var(--prism-rose)]">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-[var(--ink-300)] uppercase tracking-wider block">
              Registered Users
            </span>
            <span className="stat-num block mt-1" style={{ backgroundImage: "linear-gradient(130deg, #e879a0, #5b4fcf)" }}>
              {totalUsers}
            </span>
          </div>
        </div>

        {/* Downloads */}
        <div className="crystal p-6 relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center text-[var(--prism-cyan)]">
            <Download size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-[var(--ink-300)] uppercase tracking-wider block">
              Prompt Decrypts
            </span>
            <span className="stat-num block mt-1" style={{ backgroundImage: "linear-gradient(130deg, #06b6d4, #3b82f6)" }}>
              {totalDownloads}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[var(--ink-900)] uppercase tracking-wider pl-1.5 border-l-3 border-[var(--prism-violet)]">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[var(--prism-violet)] hover:underline flex items-center gap-1"
            >
              Manage Orders <ArrowRight size={12} />
            </Link>
          </div>

          <div className="crystal overflow-hidden">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--ink-500)] font-semibold">
                No orders placed on the platform yet.
              </div>
            ) : (
              <div className="divide-y divide-[rgba(91,79,207,0.12)]">
                {recentOrders.map((o) => (
                  <div key={o.id} className="p-4 flex items-center justify-between hover:bg-[rgba(91,79,207,0.02)] transition-colors font-semibold">
                    <div>
                      <h4 className="text-xs font-black text-[var(--ink-900)] font-mono text-[10px] truncate max-w-[200px]">
                        ID: {o.id}
                      </h4>
                      <p className="text-[10px] text-[var(--ink-300)] mt-1">
                        Placed on {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-[var(--ink-700)]">
                        ₹{o.amount}
                      </span>
                      {o.paymentStatus === "completed" ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[var(--prism-emerald)]">
                          <CheckCircle size={10} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[var(--prism-amber)]">
                          <Clock size={10} /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Prompts */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-black text-[var(--ink-900)] uppercase tracking-wider pl-1.5 border-l-3 border-[var(--prism-rose)]">
            Top Sellers
          </h2>

          <div className="crystal overflow-hidden divide-y divide-[rgba(91,79,207,0.12)]">
            {topSellers.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--ink-500)] font-semibold">
                No sales data recorded.
              </div>
            ) : (
              topSellers.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-[rgba(91,79,207,0.02)] transition-colors font-semibold">
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-black text-[var(--ink-900)] line-clamp-1">
                      {item.title}
                    </h4>
                  </div>
                  <span className="badge-prism text-[9px] font-bold py-0.5 px-1.5 shrink-0">
                    {item.count} sales
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
