import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { FieldPath } from "firebase-admin/firestore";
import PurchasesClient from "./PurchasesClient";

export default async function PurchasesPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userId = user.id;

  // 1. Fetch completed orders
  const ordersSnapshot = await adminDb
    .collection("orders")
    .where("userId", "==", userId)
    .where("paymentStatus", "==", "completed")
    .get();

  const purchasedPrompts: any[] = [];
  const bundlePromises: Promise<any>[] = [];

  for (const doc of ordersSnapshot.docs) {
    const order = doc.data();
    for (const item of order.purchasedItems || []) {
      if (item.type === "prompt") {
        purchasedPrompts.push({
          id: item.id,
          title: item.title,
          price: item.price,
          purchasedAt: order.createdAt?.toDate?.() || new Date(),
        });
      } else if (item.type === "bundle") {
        bundlePromises.push(
          adminDb.collection("bundles").doc(item.id).get().then(async (bundleDoc: any) => {
            if (bundleDoc.exists) {
              const bundleData = bundleDoc.data();
              const bundlePrompts: any[] = [];
              if (bundleData?.prompts && bundleData.prompts.length > 0) {
                const promptSnaps = await adminDb
                  .collection("prompts")
                  .where(FieldPath.documentId(), "in", bundleData.prompts)
                  .get();
                promptSnaps.docs.forEach((pDoc: any) => {
                  bundlePrompts.push({
                    id: pDoc.id,
                    title: pDoc.data().title,
                    price: pDoc.data().price,
                    purchasedAt: order.createdAt?.toDate?.() || new Date(),
                    bundleTitle: item.title,
                  });
                });
              }
              return bundlePrompts;
            }
            return [];
          })
        );
      }
    }
  }

  // Resolve bundle prompts and merge
  const bundlePromptsList = await Promise.all(bundlePromises);
  bundlePromptsList.forEach((list: any) => {
    purchasedPrompts.push(...list);
  });

  // Unique prompts check (in case they purchased directly and via bundle)
  const uniquePromptsMap = new Map<string, any>();
  purchasedPrompts.forEach((p: any) => {
    if (!uniquePromptsMap.has(p.id)) {
      uniquePromptsMap.set(p.id, p);
    }
  });

  const finalPrompts = Array.from(uniquePromptsMap.values()).sort(
    (a, b) => b.purchasedAt.getTime() - a.purchasedAt.getTime()
  );

  // Fetch prompts details to get thumbnails/slugs/descriptions
  const promptIds = finalPrompts.map((p) => p.id);
  const promptDetailsMap: Record<string, any> = {};

  if (promptIds.length > 0) {
    const chunks = [];
    for (let i = 0; i < promptIds.length; i += 10) {
      chunks.push(promptIds.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const snap = await adminDb
        .collection("prompts")
        .where(FieldPath.documentId(), "in", chunk)
        .get();
      
      snap.docs.forEach((doc: any) => {
        const d = doc.data();
        promptDetailsMap[doc.id] = {
          slug: d.slug,
          thumbnail: d.thumbnail || "",
          description: d.description || "",
        };
      });
    }
  }

  const enrichedPrompts = finalPrompts.map((p) => ({
    ...p,
    ...(promptDetailsMap[p.id] || { slug: "", thumbnail: "", description: "" }),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Purchased Prompts
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Unlock instructions, copy prompt contents, and download prompt TXT files.
        </p>
      </div>

      <PurchasesClient initialPrompts={enrichedPrompts} />
    </div>
  );
}
