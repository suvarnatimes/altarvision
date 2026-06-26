import { adminDb } from "@/lib/firebase/admin";
import UsersListClient from "./UsersListClient";

export default async function AdminUsersPage() {
  // 1. Fetch users list
  const usersSnapshot = await adminDb.collection("users").get();
  
  // 2. Fetch completed orders to aggregate spending metrics
  const ordersSnapshot = await adminDb
    .collection("orders")
    .where("paymentStatus", "==", "completed")
    .get();

  const userStats: Record<string, { totalSpent: number; purchaseCount: number }> = {};
  ordersSnapshot.docs.forEach((doc) => {
    const order = doc.data();
    const uId = order.userId;
    const amount = Number(order.amount || 0);

    if (!userStats[uId]) {
      userStats[uId] = { totalSpent: 0, purchaseCount: 0 };
    }
    userStats[uId].totalSpent += amount;
    userStats[uId].purchaseCount += 1;
  });

  const users = usersSnapshot.docs.map((doc) => {
    const data = doc.data();
    const uId = doc.id;
    const stats = userStats[uId] || { totalSpent: 0, purchaseCount: 0 };

    return {
      id: uId,
      name: data.name || "Unknown User",
      email: data.email || "",
      avatar: data.avatar || "",
      role: data.role || "customer",
      createdAt: data.createdAt?.toDate?.() || new Date(),
      totalSpent: stats.totalSpent,
      purchaseCount: stats.purchaseCount,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Manage Users
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Review buyer stats, inspect spending volume, and assign administrator roles.
        </p>
      </div>

      <UsersListClient initialUsers={users} />
    </div>
  );
}
