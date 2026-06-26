import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { getUserRole } from "@/lib/auth/roles";
import { Check } from "lucide-react";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { orderId } = await params;

  // Fetch the order
  const orderDoc = await adminDb.collection("orders").doc(orderId).get();
  if (!orderDoc.exists) {
    notFound();
  }

  const order = orderDoc.data();

  // Validate ownership
  const role = await getUserRole(user.id);
  if (order?.userId !== user.id && role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-bold p-8">
        Access Denied: You do not have permission to view this invoice.
      </div>
    );
  }

  const formattedDate = order?.createdAt?.toDate?.()
    ? order.createdAt.toDate().toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 border border-gray-200 rounded-2xl shadow-sm print:shadow-none print:border-none print:p-0">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-8 gap-6">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">ALTARVISION</h1>
            <p className="text-xs text-gray-500 mt-1">Premium Digital Agency</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Machilipatnam, Andhra Pradesh, India</p>
          </div>
          <div className="text-right sm:text-right">
            <h2 className="text-2xl font-black text-indigo-600 tracking-tight">INVOICE</h2>
            <p className="text-xs text-gray-500 mt-1">Order Ref: <span className="font-mono text-[10px]">{orderId}</span></p>
            <p className="text-xs text-gray-500">Date: {formattedDate}</p>
          </div>
        </div>

        {/* Billing Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Billed To</span>
            <p className="text-sm font-bold text-gray-800 mt-1">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user.emailAddresses?.[0]?.emailAddress}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Payment Details</span>
            <p className="text-sm font-bold text-green-600 mt-1 flex items-center gap-1">
              <Check size={14} /> Paid via Razorpay
            </p>
            {order?.razorpayPaymentId && (
              <p className="text-[10px] text-gray-500 mt-1">
                Transaction ID: <span className="font-mono">{order.razorpayPaymentId}</span>
              </p>
            )}
          </div>
        </div>

        {/* Invoice Items Table */}
        <table className="w-full border-collapse text-left my-8">
          <thead>
            <tr className="border-b-2 border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3">Item Description</th>
              <th className="py-3 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
            {order?.purchasedItems?.map((item: any, i: number) => (
              <tr key={i}>
                <td className="py-4">
                  <span className="font-bold text-gray-900">{item.title}</span>
                  <span className="block text-[10px] text-gray-400 mt-0.5 capitalize">{item.type}</span>
                </td>
                <td className="py-4 text-right font-bold text-gray-900">₹{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end pt-4">
          <div className="w-full sm:w-64">
            <div className="flex justify-between text-xs py-1 text-gray-500 font-semibold">
              <span>Subtotal</span>
              <span>₹{order?.amount}</span>
            </div>
            {order?.couponUsed && (
              <div className="flex justify-between text-xs py-1 text-indigo-600 font-bold">
                <span>Coupon Applied ({order.couponUsed})</span>
                <span>Discounted</span>
              </div>
            )}
            <div className="flex justify-between text-sm py-3 border-t border-gray-200 font-black text-gray-900 mt-2">
              <span>Total Paid</span>
              <span className="text-base text-indigo-600">₹{order?.amount}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-8 mt-12 text-center">
          <p className="text-xs text-gray-500 font-semibold">Thank you for your purchase!</p>
          <p className="text-[10px] text-gray-400 mt-1">If you have any questions, please open a support ticket in your client dashboard.</p>
          
          <button
            onClick={() => window.print()}
            className="mt-6 px-6 py-2 border border-indigo-600 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors print:hidden"
          >
            Download Invoice PDF
          </button>
        </div>

      </div>
    </div>
  );
}
