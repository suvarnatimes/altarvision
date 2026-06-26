import { adminDb } from "@/lib/firebase/admin";
import OrdersManagerClient from "./OrdersManagerClient";

export default async function AdminOrdersPage() {
  const ordersSnapshot = await adminDb
    .collection("orders")
    .orderBy("createdAt", "desc")
    .get();

  const orders = ordersSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId || "",
      amount: data.amount || 0,
      paymentStatus: data.paymentStatus || "pending",
      razorpayOrderId: data.razorpayOrderId || "",
      razorpayPaymentId: data.razorpayPaymentId || "",
      purchasedItems: data.purchasedItems || [],
      createdAt: data.createdAt?.toDate?.() || new Date(),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Manage Orders
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Verify payments, manually update statuses, and export billing transactions records.
        </p>
      </div>

      <OrdersManagerClient initialOrders={orders} />
    </div>
  );
}
