import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import PromptForm from "../../PromptForm";

export default async function EditPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let prompt: any = null;
  let categories: { id: string; name: string }[] = [];

  try {
    // 1. Fetch prompt details
    const promptDoc = await adminDb.collection("prompts").doc(id).get();
    if (!promptDoc.exists) {
      notFound();
    }

    prompt = {
      id: promptDoc.id,
      ...promptDoc.data(),
    };

    // 2. Fetch categories
    const categoriesSnapshot = await adminDb.collection("categories").orderBy("name", "asc").get();
    categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "Unknown",
    }));
  } catch (error: any) {
    // If it's a notFound redirect, re-throw it
    if (error?.digest?.startsWith("NEXT_NOT_FOUND")) throw error;
    // Otherwise show a helpful error instead of a silent 404
    console.error("EditPromptPage error:", error);
    throw new Error(`Failed to load prompt for editing: ${error.message}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Edit Prompt: <span className="text-prism">{prompt.title}</span>
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Update pricing, preview thumbnails, status or decryption instructions.
        </p>
      </div>

      <PromptForm categories={categories} initialPrompt={prompt} />
    </div>
  );
}

