import { adminDb } from "@/lib/firebase/admin";
import CategoriesManagerClient from "./CategoriesManagerClient";

export default async function AdminCategoriesPage() {
  const categoriesSnapshot = await adminDb
    .collection("categories")
    .orderBy("name", "asc")
    .get();

  const categories = categoriesSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || "",
      slug: data.slug || "",
      description: data.description || "",
      image: data.image || "",
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Manage Categories
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Create, edit, or delete marketplace category sections.
        </p>
      </div>

      <CategoriesManagerClient initialCategories={categories} />
    </div>
  );
}
