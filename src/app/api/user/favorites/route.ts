import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase/admin";
import { sanitizeInput } from "@/lib/security/sanitize";
import { FieldPath } from "firebase-admin/firestore";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const favoritesSnapshot = await adminDb
      .collection("favorites")
      .where("userId", "==", userId)
      .get();

    const promptIds = favoritesSnapshot.docs.map((doc: any) => doc.data().promptId);

    if (promptIds.length === 0) {
      return NextResponse.json([]);
    }

    // Paginate queries using Firestore's "in" operator (chunks of 10 items)
    const chunks = [];
    for (let i = 0; i < promptIds.length; i += 10) {
      chunks.push(promptIds.slice(i, i + 10));
    }

    let prompts: any[] = [];
    for (const chunk of chunks) {
      const snap = await adminDb
        .collection("prompts")
        .where(FieldPath.documentId(), "in", chunk)
        .where("status", "==", "published")
        .get();

      const chunkPrompts = snap.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          slug: data.slug,
          description: data.description,
          categoryId: data.categoryId,
          thumbnail: data.thumbnail,
          price: data.price,
          featured: data.featured,
        };
      });
      prompts = [...prompts, ...chunkPrompts];
    }

    return NextResponse.json(prompts);
  } catch (error: any) {
    console.error("Failed to fetch favorites:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { promptId } = body;

    if (!promptId) {
      return NextResponse.json({ error: "Missing promptId" }, { status: 400 });
    }

    const sanitizedPromptId = sanitizeInput(promptId);
    const favoriteDocId = `${userId}_${sanitizedPromptId}`;
    const favoriteRef = adminDb.collection("favorites").doc(favoriteDocId);
    const doc = await favoriteRef.get();

    if (doc.exists) {
      await favoriteRef.delete();
      return NextResponse.json({ favorited: false, message: "Removed from wishlist" });
    } else {
      await favoriteRef.set({
        userId,
        promptId: sanitizedPromptId,
        createdAt: new Date(),
      });
      return NextResponse.json({ favorited: true, message: "Added to wishlist" });
    }
  } catch (error: any) {
    console.error("Failed to toggle favorite:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update wishlist" },
      { status: 500 }
    );
  }
}
