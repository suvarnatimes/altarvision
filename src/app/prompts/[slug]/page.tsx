import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { checkPromptOwnership } from "@/lib/auth/ownership";
import PromptDetailsClient from "./PromptDetailsClient";

export const dynamic = "force-dynamic";

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loggedInUser = await currentUser();

  // 1. Fetch the prompt details by slug
  const promptSnapshot = await adminDb
    .collection("prompts")
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();

  if (promptSnapshot.empty) {
    notFound();
  }

  const promptDoc = promptSnapshot.docs[0];
  const promptData = promptDoc.data();

  // Omit promptContent from public load (sent only via secure content endpoint)
  const prompt = {
    id: promptDoc.id,
    title: promptData.title || "",
    slug: promptData.slug || "",
    description: promptData.description || "",
    categoryId: promptData.categoryId || "",
    thumbnail: promptData.thumbnail || "",
    previewImages: promptData.previewImages || [],
    tags: promptData.tags || [],
    price: promptData.price || 0,
    featured: promptData.featured || false,
    videoUrl: promptData.videoUrl || "",
    createdAt: promptData.createdAt?.toDate?.() || new Date(),
  };

  // 2. Fetch category details
  const categoryDoc = await adminDb.collection("categories").doc(prompt.categoryId).get();
  const categoryName = categoryDoc.exists ? categoryDoc.data()?.name : "AI Prompt";

  // 3. Fetch reviews for the prompt
  const reviewsSnapshot = await adminDb
    .collection("reviews")
    .where("promptId", "==", prompt.id)
    .orderBy("createdAt", "desc")
    .get();

  const reviews = reviewsSnapshot.docs.map((doc: any) => {
    const data = doc.data();
    return {
      id: doc.id,
      userName: data.userName || "Anonymous",
      userAvatar: data.userAvatar || "",
      rating: data.rating || 5,
      review: data.review || "",
      createdAt: data.createdAt?.toDate?.() || new Date(),
    };
  });

  // Calculate Average Rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "4.8";

  // 4. Fetch related prompts (same category, excluding current)
  const relatedSnapshot = await adminDb
    .collection("prompts")
    .where("status", "==", "published")
    .where("categoryId", "==", prompt.categoryId)
    .limit(4)
    .get();

  const relatedPrompts = relatedSnapshot.docs
    .map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        slug: data.slug || "",
        description: data.description || "",
        thumbnail: data.thumbnail || "",
        price: data.price || 0,
        featured: data.featured || false,
      };
    })
    .filter((p: any) => p.id !== prompt.id)
    .slice(0, 3);

  // 5. Check if user already owns the prompt
  let hasOwned = false;
  if (loggedInUser) {
    hasOwned = await checkPromptOwnership(loggedInUser.id, prompt.id);
  }

  const prefillUser = loggedInUser
    ? {
        name: `${loggedInUser.firstName || ""} ${loggedInUser.lastName || ""}`.trim() || "User",
        email: loggedInUser.emailAddresses?.[0]?.emailAddress || "",
      }
    : null;

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[var(--bg-root)] geo-grid dot-matrix">
      <div className="wrap">
        <PromptDetailsClient
          prompt={prompt}
          categoryName={categoryName}
          reviews={reviews}
          avgRating={avgRating}
          relatedPrompts={relatedPrompts}
          hasOwned={hasOwned}
          prefillUser={prefillUser}
        />
      </div>
    </div>
  );
}
