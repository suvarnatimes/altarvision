import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { FieldPath } from "firebase-admin/firestore";
import FavoritesClient from "./FavoritesClient";

export default async function FavoritesPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userId = user.id;

  // 1. Fetch user favorites documents from Firestore
  const favoritesSnapshot = await adminDb
    .collection("favorites")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  const promptIds = favoritesSnapshot.docs.map((doc: any) => doc.data().promptId);

  let favoritedPrompts: any[] = [];

  if (promptIds.length > 0) {
    const chunks = [];
    for (let i = 0; i < promptIds.length; i += 10) {
      chunks.push(promptIds.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const snap = await adminDb
        .collection("prompts")
        .where(FieldPath.documentId(), "in", chunk)
        .where("status", "==", "published")
        .get();

      const chunkPrompts = snap.docs.map((doc: any) => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title,
          slug: d.slug,
          description: d.description,
          thumbnail: d.thumbnail || "",
          price: d.price,
          featured: d.featured || false,
        };
      });
      favoritedPrompts = [...favoritedPrompts, ...chunkPrompts];
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          My Wishlist
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Keep track of prompts you plan to purchase later.
        </p>
      </div>

      <FavoritesClient initialFavorites={favoritedPrompts} />
    </div>
  );
}
