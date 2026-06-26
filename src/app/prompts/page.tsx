import { adminDb } from "@/lib/firebase/admin";
import MarketplaceClient from "./MarketplaceClient";

export const dynamic = "force-dynamic";

export default async function PromptsMarketplacePage() {
  // 1. Fetch categories
  const categoriesSnapshot = await adminDb
    .collection("categories")
    .orderBy("name", "asc")
    .get();

  const categories = categoriesSnapshot.docs.map((doc: any) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || "",
      slug: data.slug || "",
      description: data.description || "",
      image: data.image || "",
      createdAt: data.createdAt?.toDate?.() || new Date(),
    };
  });

  // 2. Fetch initial published prompts (default newest)
  const promptsSnapshot = await adminDb
    .collection("prompts")
    .where("status", "==", "published")
    .orderBy("createdAt", "desc")
    .limit(12)
    .get();

  const initialPrompts = promptsSnapshot.docs.map((doc: any) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || "",
      slug: data.slug || "",
      description: data.description || "",
      categoryId: data.categoryId || "",
      thumbnail: data.thumbnail || "",
      previewImages: data.previewImages || [],
      tags: data.tags || [],
      price: data.price || 0,
      featured: data.featured || false,
      status: data.status || "draft",
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    };
  });

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[var(--bg-root)] geo-grid dot-matrix">
      <div className="wrap">
        <MarketplaceClient initialPrompts={initialPrompts} categories={categories} />
      </div>
    </div>
  );
}
