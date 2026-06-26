import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { sanitizeInput } from "@/lib/security/sanitize";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const sanitizedSlug = sanitizeInput(slug);

    const snapshot = await adminDb
      .collection("prompts")
      .where("slug", "==", sanitizedSlug)
      .where("status", "==", "published")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Securely Omit promptContent from public details route
    const promptDetails = {
      id: doc.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      categoryId: data.categoryId,
      thumbnail: data.thumbnail,
      previewImages: data.previewImages || [],
      tags: data.tags || [],
      price: data.price,
      featured: data.featured,
      status: data.status,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    };

    return NextResponse.json(promptDetails);
  } catch (error: any) {
    console.error("Failed to fetch prompt details:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve prompt details" }, { status: 500 });
  }
}
