import { adminDb } from "@/lib/firebase/admin";
import PromptForm from "../PromptForm";

export default async function NewPromptPage() {
  // Fetch categories to select in form
  const categoriesSnapshot = await adminDb.collection("categories").orderBy("name", "asc").get();
  const categories = categoriesSnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name || "Unknown",
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Create Prompt
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Design a new premium AI prompt with thumbnails, previews, and instructions.
        </p>
      </div>

      <PromptForm categories={categories} />
    </div>
  );
}
