import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase/admin";
import { checkPromptOwnership } from "@/lib/auth/ownership";
import { sanitizeInput } from "@/lib/security/sanitize";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const sanitizedSlug = sanitizeInput(slug);

    // Fetch the prompt
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
    const prompt = doc.data();

    // Verify ownership (purchased or admin)
    const hasAccess = await checkPromptOwnership(userId, doc.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access Denied: You must purchase this prompt to view its instructions" },
        { status: 403 }
      );
    }

    // Capture access download event for logs/analytics
    try {
      await adminDb.collection("downloads").add({
        userId,
        promptId: doc.id,
        downloadedAt: new Date(),
      });
    } catch (downloadLogError) {
      console.error("Failed to log download activity:", downloadLogError);
    }

    // Return the secure prompt content
    return NextResponse.json({
      promptContent: prompt.promptContent,
    });
  } catch (error: any) {
    console.error("Failed to retrieve secure prompt content:", error);
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}
