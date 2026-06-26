import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase/admin";
import { checkPromptOwnership } from "@/lib/auth/ownership";
import { rateLimit } from "@/lib/security/rateLimit";
import { sanitizeObject } from "@/lib/security/sanitize";

async function getUserDetails(userId: string) {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return {
      email: user.emailAddresses?.[0]?.emailAddress || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      avatar: user.imageUrl || "",
    };
  } catch {
    return { email: "", name: "User", avatar: "" };
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!rateLimit(ip, 10)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { promptId, rating, review } = sanitizeObject(body);

    if (!promptId || rating === undefined || !review) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // 1. Verify prompt ownership (Only actual purchasers can leave reviews)
    const hasAccess = await checkPromptOwnership(userId, promptId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Forbidden: You can only review prompts you have purchased" },
        { status: 403 }
      );
    }

    // 2. Check if user already reviewed this prompt
    const existingCheck = await adminDb
      .collection("reviews")
      .where("userId", "==", userId)
      .where("promptId", "==", promptId)
      .limit(1)
      .get();

    if (!existingCheck.empty) {
      return NextResponse.json({ error: "You have already reviewed this prompt" }, { status: 400 });
    }

    // 3. Fetch user info for embedding in review document (denormalized for faster reads)
    const { name, avatar } = await getUserDetails(userId);

    const reviewData = {
      userId,
      userName: name,
      userAvatar: avatar,
      promptId,
      rating: ratingNum,
      review,
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection("reviews").add(reviewData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Review submitted successfully",
    });
  } catch (error: any) {
    console.error("Failed to submit review:", error);
    return NextResponse.json({ error: error.message || "Failed to submit review" }, { status: 500 });
  }
}
