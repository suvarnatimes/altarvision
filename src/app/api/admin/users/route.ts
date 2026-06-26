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
    // 1. Fetch users list
    const usersSnapshot = await adminDb.collection("users").get();
    
    // 2. Fetch completed orders to aggregate spending
    const ordersSnapshot = await adminDb
      .collection("orders")
      .where("paymentStatus", "==", "completed")
      .get();

    // Map order aggregates by userId
    const userAggregates: Record<string, { totalSpent: number; purchaseCount: number }> = {};
    ordersSnapshot.docs.forEach((doc: any) => {
      const order = doc.data();
      const oUserId = order.userId;
      const amount = Number(order.amount || 0);

      if (!userAggregates[oUserId]) {
        userAggregates[oUserId] = { totalSpent: 0, purchaseCount: 0 };
      }

      userAggregates[oUserId].totalSpent += amount;
      userAggregates[oUserId].purchaseCount += 1;
    });

    // 3. Assemble users with aggregated metrics
    const users = usersSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      const uId = doc.id;
      const metrics = userAggregates[uId] || { totalSpent: 0, purchaseCount: 0 };

      return {
        id: uId,
        clerkId: data.clerkId || uId,
        name: data.name || "Unknown User",
        email: data.email || "",
        avatar: data.avatar || "",
        role: data.role || "customer",
        createdAt: data.createdAt?.toDate?.() || new Date(),
        totalSpent: metrics.totalSpent,
        purchaseCount: metrics.purchaseCount,
      };
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Admin fetch users aggregates error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load users data" },
      { status: 500 }
    );
  }
}
