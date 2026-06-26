"use client";

import { useState } from "react";
import { Search, Download, CheckCircle, Clock, AlertTriangle, Check, RefreshCw } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface OrderItem {
  id: string;
  userId: string;
  amount: number;
  paymentStatus: "pending" | "completed" | "failed";
  razorpayOrderId: string;
  razorpayPaymentId: string;
  purchasedItems: any[];
  createdAt: Date;
}

export default function OrdersManagerClient({
  initialOrders,
}: {
  initialOrders: OrderItem[];
}) {
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.razorpayPaymentId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || o.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    if (
      !window.confirm(
        `Are you sure you want to change order ${id} status to ${nextStatus.toUpperCase()}?`
      )
    )
      return;

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, paymentStatus: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");

      setOrders(
        orders.map((o) => (o.id === id ? { ...o, paymentStatus: nextStatus as any } : o))
      );
      toast.success("Order status updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update order status");
    }
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Order ID", "User ID", "Amount", "Status", "Razorpay Payment ID", "Purchased Items", "Created At"];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.userId,
      o.amount,
      o.paymentStatus,
      o.razorpayPaymentId || "",
      o.purchasedItems?.map((i) => i.title).join("; ") || "",
      new Date(o.createdAt).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `altarvision-orders-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported orders CSV successfully!");
  };

  return (
    <div className="flex flex-col gap-4">
      <Toaster position="top-center" />

      {/* Filter and Search Action Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by Order/User ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/50 backdrop-blur-md border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-300)]" />
        </div>

        {/* Filters */}
        <div className="flex w-full sm:w-auto items-center gap-3 justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 rounded-xl bg-white/50 border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed (Paid)</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="btn-crystal text-xs font-bold py-2.5 px-4 border-white/60 flex items-center gap-1.5 shrink-0"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table grid */}
      <div className="crystal overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-[var(--ink-500)] font-semibold text-sm">
            No orders found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[rgba(91,79,207,0.05)] border-b border-[rgba(91,79,207,0.12)] text-[var(--ink-500)] font-black uppercase tracking-wider">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(91,79,207,0.08)] font-semibold">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[rgba(91,79,207,0.02)] transition-colors">
                    <td className="p-4 font-mono text-[10px] text-[var(--ink-900)] max-w-[120px] truncate">
                      {o.id}
                    </td>
                    <td className="p-4 text-[var(--ink-700)] max-w-[120px] truncate font-mono text-[10px]">
                      {o.userId}
                    </td>
                    <td className="p-4 text-[var(--ink-900)] font-bold">
                      ₹{o.amount}
                    </td>
                    <td className="p-4 text-[var(--ink-700)] max-w-[180px] truncate">
                      {o.purchasedItems?.map((i) => i.title).join(", ")}
                    </td>
                    <td className="p-4">
                      {o.paymentStatus === "completed" ? (
                        <span className="inline-flex items-center gap-1 text-[var(--prism-emerald)]">
                          <CheckCircle size={12} />
                          Paid
                        </span>
                      ) : o.paymentStatus === "pending" ? (
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
                    <td className="p-4 text-right flex justify-end gap-2.5">
                      <button
                        onClick={() => handleUpdateStatus(o.id, o.paymentStatus)}
                        className="btn-crystal text-[10px] py-1.5 px-3 border-white/60 font-bold flex items-center gap-1"
                        title="Toggle paid status"
                      >
                        <RefreshCw size={11} />
                        Toggle Status
                      </button>
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
