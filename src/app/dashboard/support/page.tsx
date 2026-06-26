import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import SupportClient from "./SupportClient";

export default async function SupportPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userId = user.id;

  // Fetch support tickets for user sorted by newest first
  const ticketsSnapshot = await adminDb
    .collection("supportTickets")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  const tickets = ticketsSnapshot.docs.map((doc: any) => {
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
          Support Tickets
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Ask questions, report issues, or contact AltarVision marketplace support.
        </p>
      </div>

      <SupportClient initialTickets={tickets} />
    </div>
  );
}
