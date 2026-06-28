import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import PromptForm from "../../PromptForm";

export default async function EditPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let promptData: any = null;
  let categories: { id: string; name: string }[] = [];
  let promptExists = false;

  try {
    // 1. Fetch prompt details
    console.log(`[EDIT PAGE DEBUG] Fetching prompt with ID: ${id}`);
    const promptDoc = await adminDb.collection("prompts").doc(id).get();
    promptExists = promptDoc.exists;
    console.log(`[EDIT PAGE DEBUG] Prompt exists: ${promptExists}`);

    if (promptExists) {
      const data = promptDoc.data() || {};
      promptData = {
        id: promptDoc.id,
        title: data.title || "",
        slug: data.slug || "",
        description: data.description || "",
        categoryId: data.categoryId || "",
        thumbnail: data.thumbnail || "",
        previewImages: data.previewImages || [],
        promptContent: data.promptContent || "",
        tags: data.tags || [],
        price: data.price || 0,
        featured: data.featured || false,
        status: data.status || "draft",
        videoUrl: data.videoUrl || "",
      };
    }

    // 2. Fetch categories
    const categoriesSnapshot = await adminDb.collection("categories").orderBy("name", "asc").get();
    categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "Unknown",
    }));
  } catch (error: any) {
    // Re-throw any Next.js navigation errors (redirect, notFound, etc.)
    if (
      error?.digest?.startsWith("NEXT_NOT_FOUND") ||
      error?.digest?.startsWith("NEXT_HTTP_ERROR_FALLBACK") ||
      error?.digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("EditPromptPage error:", error);
    throw new Error(`Failed to load prompt for editing: ${error.message}`);
  }

  // Call notFound() OUTSIDE the try/catch so it cannot be accidentally swallowed
  if (!promptExists) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Edit Prompt: <span className="text-prism">{promptData.title}</span>
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Update pricing, preview thumbnails, status or decryption instructions.
        </p>
      </div>

      <PromptForm categories={categories} initialPrompt={promptData} />
    </div>
  );
}

