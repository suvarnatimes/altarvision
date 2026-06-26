import { adminDb } from "@/lib/firebase/admin";
import ReviewsModerationClient from "./ReviewsModerationClient";

export default async function AdminReviewsPage() {
  // 1. Fetch all reviews
  const reviewsSnapshot = await adminDb
    .collection("reviews")
    .orderBy("createdAt", "desc")
    .get();

  const reviews = reviewsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId || "",
      userName: data.userName || "Anonymous",
      userAvatar: data.userAvatar || "",
      promptId: data.promptId || "",
      rating: data.rating || 5,
      review: data.review || "",
      createdAt: data.createdAt?.toDate?.() || new Date(),
    };
  });

  // 2. Fetch prompts names mapping
  const promptsSnapshot = await adminDb.collection("prompts").get();
  const promptsMap: Record<string, string> = {};
  promptsSnapshot.docs.forEach((doc) => {
    promptsMap[doc.id] = doc.data().title || "AI Prompt";
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Moderate Reviews
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Audit buyer testimonials, moderate feedback, and manage prompt ratings.
        </p>
      </div>

      <ReviewsModerationClient initialReviews={reviews} promptsMap={promptsMap} />
    </div>
  );
}
