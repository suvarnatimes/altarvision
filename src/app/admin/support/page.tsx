import { adminDb } from "@/lib/firebase/admin";
import AdminSupportClient from "./AdminSupportClient";

export default async function AdminSupportPage() {
  const querySnapshot = await adminDb
    .collection("supportTickets")
    .orderBy("createdAt", "desc")
    .get();

  const tickets = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      messages: (data.messages || []).map((m: any) => ({
        ...m,
        createdAt: m.createdAt?.toDate?.() || m.createdAt || new Date(),
      })),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Manage Tickets
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Review customer inquiries, reply to active messages, or close tickets.
        </p>
      </div>

      <AdminSupportClient initialTickets={tickets} />
    </div>
  );
}
