import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase/admin";
import { getUserRole } from "@/lib/auth/roles";
import { createAuditLog } from "@/lib/security/auditLog";

async function getAdminEmail(userId: string): Promise<string> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.emailAddresses?.[0]?.emailAddress || "";
  } catch {
    return "";
  }
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getUserRole(userId);
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const querySnapshot = await adminDb.collection("reviews").orderBy("createdAt", "desc").get();
    const reviews = querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }));
    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error("Admin fetch reviews error:", error);
    return NextResponse.json({ error: error.message || "Failed to load reviews" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getUserRole(userId);
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review ID is required for deletion" }, { status: 400 });
    }

    const reviewRef = adminDb.collection("reviews").doc(id);
    const reviewDoc = await reviewRef.get();
    if (!reviewDoc.exists) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const reviewData = reviewDoc.data();
    await reviewRef.delete();
    
    const adminEmail = await getAdminEmail(userId);
    await createAuditLog(userId, adminEmail, "MODERATE_DELETE_REVIEW", `Moderator deleted review by user ${reviewData?.userName} for prompt ${reviewData?.promptId}`, {
      reviewId: id,
      reviewText: reviewData?.review,
    });

    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error: any) {
    console.error("Admin review moderate delete error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete review" }, { status: 500 });
  }
}
