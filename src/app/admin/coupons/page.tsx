import { adminDb } from "@/lib/firebase/admin";
import CouponsManagerClient from "./CouponsManagerClient";

export default async function AdminCouponsPage() {
  const querySnapshot = await adminDb
    .collection("coupons")
    .orderBy("code", "asc")
    .get();

  const coupons = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      code: data.code || "",
      type: data.type || "percentage",
      discount: data.discount || 0,
      expiryDate: data.expiryDate || "",
      active: data.active === undefined ? true : Boolean(data.active),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Manage Coupons
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Create, edit, or disable coupon discount code deals.
        </p>
      </div>

      <CouponsManagerClient initialCoupons={coupons} />
    </div>
  );
}
