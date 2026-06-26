import { adminDb } from "@/lib/firebase/admin";
import Link from "next/link";
import { Plus } from "lucide-react";
import PromptsTableClient from "./PromptsTableClient";

export default async function AdminPromptsPage() {
  // 1. Fetch all prompts
  const promptsSnapshot = await adminDb
    .collection("prompts")
    .orderBy("createdAt", "desc")
    .get();

  const prompts = promptsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || "",
      slug: data.slug || "",
      price: data.price || 0,
      status: data.status || "draft",
      featured: data.featured || false,
      categoryId: data.categoryId || "",
      createdAt: data.createdAt?.toDate?.() || new Date(),
    };
  });

  // 2. Fetch categories to map ID to name
  const categoriesSnapshot = await adminDb.collection("categories").get();
  const categoriesMap: Record<string, string> = {};
  categoriesSnapshot.docs.forEach((doc) => {
    categoriesMap[doc.id] = doc.data().name || "Unknown";
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[rgba(91,79,207,0.12)] pb-4">
        <div>
          <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
            Manage Prompts
          </h1>
          <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
            Publish, edit, delete, or structure prompt collections.
          </p>
        </div>
        <Link
          href="/admin/prompts/new"
          className="btn-prism text-xs font-bold py-2.5 px-4 flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
        >
          <Plus size={15} />
          Create Prompt
        </Link>
      </div>

      <PromptsTableClient initialPrompts={prompts} categoriesMap={categoriesMap} />
    </div>
  );
}
