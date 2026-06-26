import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase/admin";
import { sanitizeInput } from "@/lib/security/sanitize";

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, avatar } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedAvatar = avatar ? sanitizeInput(avatar) : "";

    const nameParts = sanitizedName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // 1. Update user profile in Clerk Auth
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      firstName,
      lastName,
      ...(sanitizedAvatar ? { imageUrl: sanitizedAvatar } : {}),
    });

    // 2. Sync changes to Firestore user document
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.update({
      name: sanitizedName,
      ...(sanitizedAvatar ? { avatar: sanitizedAvatar } : {}),
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: { name: sanitizedName, avatar: sanitizedAvatar },
    });
  } catch (error: any) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile details" },
      { status: 500 }
    );
  }
}
