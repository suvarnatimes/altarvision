import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase/admin";
import { getUserRole } from "@/lib/auth/roles";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getUserRole(userId);
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
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

      // Group revenue by date (YYYY-MM-DD)
      const orderDate = order.createdAt?.toDate?.() || new Date();
      const dateKey = orderDate.toISOString().split("T")[0];
      revenueOverTimeMap[dateKey] = (revenueOverTimeMap[dateKey] || 0) + amount;

      // Track item sales
      order.purchasedItems?.forEach((item: any) => {
        if (!promptSalesMap[item.id]) {
          promptSalesMap[item.id] = { title: item.title, count: 0, revenue: 0 };
        }
        promptSalesMap[item.id].count += 1;
        // In orders, the item.price is the unit price
        promptSalesMap[item.id].revenue += Number(item.price || 0);
      });
    });

    // Sort top selling prompts
    const topSelling = Object.entries(promptSalesMap)
      .map(([id, stats]) => ({
        id,
        title: stats.title,
        salesCount: stats.count,
        totalRevenue: stats.revenue,
      }))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);

    // Format revenue over time array (sort by date)
    const revenueOverTime = Object.entries(revenueOverTimeMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days of activity

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        totalUsers,
        totalDownloads,
      },
      topSelling,
      revenueOverTime,
    });
  } catch (error: any) {
    console.error("Admin fetch analytics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load analytics summaries" },
      { status: 500 }
    );
  }
}
