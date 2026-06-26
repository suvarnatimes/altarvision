import { adminDb } from "@/lib/firebase/admin";
import BundlesManagerClient from "./BundlesManagerClient";

export default async function AdminBundlesPage() {
  // 1. Fetch all bundles
  const bundlesSnapshot = await adminDb
    .collection("bundles")
    .orderBy("createdAt", "desc")
    .get();

  const bundles = bundlesSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || "",
      description: data.description || "",
      thumbnail: data.thumbnail || "",
      price: data.price || 0,
      prompts: data.prompts || [],
    };
  });

  // 2. Fetch all prompts to select from in form
  const promptsSnapshot = await adminDb
    .collection("prompts")
    .where("status", "==", "published")
    .orderBy("title", "asc")
    .get();

  const promptsOptions = promptsSnapshot.docs.map((doc) => ({
    id: doc.id,
    title: doc.data().title || "AI Prompt",
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Manage Bundles
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Create, edit, or delete bundle packages combining multiple prompts.
        </p>
      </div>

      <BundlesManagerClient initialBundles={bundles} prompts={promptsOptions} />
    </div>
  );
}
