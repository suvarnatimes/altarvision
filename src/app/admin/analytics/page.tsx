import { adminDb } from "@/lib/firebase/admin";
import { IndianRupee, ShoppingBag, Users, Download, ArrowUpRight } from "lucide-react";

export default async function AdminAnalyticsPage() {
  // 1. Fetch completed orders
  const ordersSnapshot = await adminDb
    .collection("orders")
    .where("paymentStatus", "==", "completed")
    .get();

  // 2. Fetch users count
  const usersSnapshot = await adminDb.collection("users").get();
  const totalUsers = usersSnapshot.size;

  // 3. Fetch downloads count
  const downloadsSnapshot = await adminDb.collection("downloads").get();
  const totalDownloads = downloadsSnapshot.size;

  let totalRevenue = 0;
  const totalOrders = ordersSnapshot.size;
  const promptSalesMap: Record<string, { title: string; count: number; revenue: number }> = {};
  const revenueOverTimeMap: Record<string, number> = {};

  ordersSnapshot.docs.forEach((doc) => {
    const order = doc.data();
    const amount = Number(order.amount || 0);
    totalRevenue += amount;

    // Group by date (YYYY-MM-DD)
    const orderDate = order.createdAt?.toDate?.() || new Date();
    const dateKey = orderDate.toISOString().split("T")[0];
    revenueOverTimeMap[dateKey] = (revenueOverTimeMap[dateKey] || 0) + amount;

    // Track item sales
    order.purchasedItems?.forEach((item: any) => {
      if (!promptSalesMap[item.id]) {
        promptSalesMap[item.id] = { title: item.title, count: 0, revenue: 0 };
      }
      promptSalesMap[item.id].count += 1;
      promptSalesMap[item.id].revenue += Number(item.price || 0);
    });
  });

  // Daily revenue formatted
  const dailySales = Object.entries(revenueOverTimeMap)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10); // Last 10 sales days

  // Prompt sales list sorted by sales count
  const bestSellers = Object.entries(promptSalesMap)
    .map(([id, stats]) => ({
      id,
      title: stats.title,
      salesCount: stats.count,
      totalRevenue: stats.revenue,
    }))
    .sort((a, b) => b.salesCount - a.salesCount);

  // Maximum value for custom CSS bar chart representation
  const maxDayRevenue = Math.max(...Object.values(revenueOverTimeMap), 100);

  return (
    <div className="flex flex-col gap-8">
      {/* Header Banner */}
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Revenue & Sales Analytics
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Inspect visual analytics, daily sales charts, and top-selling product metrics.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="crystal p-6 relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[rgba(91,79,207,0.1)] border border-[rgba(91,79,207,0.2)] flex items-center justify-center text-[var(--prism-violet)]">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-[var(--ink-300)] uppercase tracking-wider block">
              Paid Transactions
            </span>
            <span className="stat-num block mt-1">{totalOrders}</span>
          </div>
        </div>

        <div className="crystal p-6 relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[rgba(232,121,160,0.1)] border border-[rgba(232,121,160,0.2)] flex items-center justify-center text-[var(--prism-rose)]">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-[var(--ink-300)] uppercase tracking-wider block">
              Buyer Accounts
            </span>
            <span className="stat-num block mt-1" style={{ backgroundImage: "linear-gradient(130deg, #e879a0, #5b4fcf)" }}>
              {totalUsers}
            </span>
          </div>
        </div>

        <div className="crystal p-6 relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center text-[var(--prism-cyan)]">
            <Download size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-[var(--ink-300)] uppercase tracking-wider block">
              Downloads
            </span>
            <span className="stat-num block mt-1" style={{ backgroundImage: "linear-gradient(130deg, #06b6d4, #3b82f6)" }}>
              {totalDownloads}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Chart Panel (CSS representation of last 10 days sales volume) */}
      <div className="crystal p-6">
        <h3 className="text-xs font-black text-[var(--ink-900)] uppercase tracking-wider mb-6">
          Daily Revenue Volume (Last 10 active days)
        </h3>

        <div className="h-[200px] flex items-end gap-3 sm:gap-6 border-b border-[rgba(91,79,207,0.15)] pb-2 pt-6">
          {dailySales.slice().reverse().map((day, i) => {
            const pct = Math.max(10, Math.round((day.revenue / maxDayRevenue) * 100));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-[9px] font-bold text-[var(--ink-700)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  ₹{day.revenue}
                </div>
                <div
                  style={{ height: `${pct}%` }}
                  className="w-full rounded-t-md bg-gradient-to-t from-[var(--prism-violet)] to-[var(--prism-sky)] shadow-sm group-hover:brightness-105 transition-all duration-300"
                ></div>
                <div className="text-[8px] font-bold text-[var(--ink-300)] rotate-[-45deg] sm:rotate-0 mt-1">
                  {day.date.substring(5)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Daily Sales list & Top Selling Prompts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Sales table */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-sm font-black text-[var(--ink-900)] uppercase tracking-wider pl-1.5 border-l-3 border-[var(--prism-violet)]">
            Daily Summaries
          </h2>

          <div className="crystal overflow-hidden">
            {dailySales.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--ink-500)] font-semibold">
                No revenue logs yet.
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-[rgba(91,79,207,0.05)] border-b border-[rgba(91,79,207,0.12)] text-[var(--ink-500)] font-black uppercase tracking-wider">
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Daily Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(91,79,207,0.08)] font-semibold">
                  {dailySales.map((day, i) => (
                    <tr key={i} className="hover:bg-[rgba(91,79,207,0.02)] transition-colors">
                      <td className="p-4 text-[var(--ink-700)]">
                        {new Date(day.date).toLocaleDateString([], {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-right text-[var(--ink-900)] font-bold">
                        ₹{day.revenue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Best sellers list */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-black text-[var(--ink-900)] uppercase tracking-wider pl-1.5 border-l-3 border-[var(--prism-rose)]">
            Product Revenue Breakdown
          </h2>

          <div className="crystal overflow-hidden">
            {bestSellers.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--ink-500)] font-semibold">
                No products sold yet.
              </div>
            ) : (
              <div className="divide-y divide-[rgba(91,79,207,0.12)]">
                {bestSellers.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-[rgba(91,79,207,0.02)] transition-colors font-semibold">
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs font-black text-[var(--ink-900)] line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[9px] text-[var(--ink-300)] mt-0.5">
                        {item.salesCount} units sold
                      </p>
                    </div>
                    <span className="text-xs font-black text-[var(--prism-rose)] shrink-0">
                      ₹{item.totalRevenue}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
