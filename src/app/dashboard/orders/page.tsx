import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { History, FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default async function OrdersPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userId = user.id;

  // Fetch all orders for the user sorted by newest first
  const ordersSnapshot = await adminDb
    .collection("orders")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  const orders: any[] = ordersSnapshot.docs.map((doc: any) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Order History
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Track transaction statuses, view payments, and download invoices.
        </p>
      </div>

      <div className="crystal overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-[var(--ink-500)] font-semibold text-sm">
            No orders found in your billing history.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[rgba(91,79,207,0.05)] border-b border-[rgba(91,79,207,0.12)] text-[var(--ink-500)] font-black uppercase tracking-wider">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(91,79,207,0.08)] font-semibold">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[rgba(91,79,207,0.02)] transition-colors">
                    <td className="p-4 font-mono text-[10px] text-[var(--ink-900)] max-w-[120px] truncate">
                      {order.id}
                    </td>
                    <td className="p-4 text-[var(--ink-700)]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-[var(--ink-700)] max-w-[200px] truncate">
                      {order.purchasedItems?.map((i: any) => i.title).join(", ") || "No items"}
                    </td>
                    <td className="p-4 text-[var(--ink-900)] font-bold">
                      ₹{order.amount}
                    </td>
                    <td className="p-4">
                      {order.paymentStatus === "completed" ? (
                        <span className="inline-flex items-center gap-1 text-[var(--prism-emerald)]">
                          <CheckCircle size={12} />
                          Paid
                        </span>
                      ) : order.paymentStatus === "pending" ? (
                        <span className="inline-flex items-center gap-1 text-[var(--prism-amber)]">
                          <Clock size={12} />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[var(--prism-rose)]">
                          <AlertTriangle size={12} />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {order.paymentStatus === "completed" && (
                        <Link
                          href={`/dashboard/orders/${order.id}/invoice`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[var(--prism-violet)] hover:underline"
                        >
                          <FileText size={13} />
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
