import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminStorage } from "@/lib/firebase/admin";
import { getUserRole } from "@/lib/auth/roles";
import { sanitizeInput } from "@/lib/security/sanitize";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null; // 'thumbnails' | 'previews' | 'avatars'

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!folder) {
      return NextResponse.json({ error: "Target folder is required" }, { status: 400 });
    }

    const sanitizedFolder = sanitizeInput(folder);
    
    // Authorization Check
    const role = await getUserRole(userId);
    if (sanitizedFolder === "thumbnails" || sanitizedFolder === "previews") {
      if (role !== "admin") {
        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
      }
    } else if (sanitizedFolder === "avatars") {
      // Allowed for any logged in user
    } else {
      return NextResponse.json({ error: "Invalid target folder" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop();
    const fileName = `${userId}_${Date.now()}.${fileExtension}`;
    const filePath = `${sanitizedFolder}/${fileName}`;

    const bucket = adminStorage.bucket();
    const blob = bucket.file(filePath);

    // Upload the file
    await blob.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make the file publicly readable for web client rendering
    await blob.makePublic();

    // Generate public firebase storage download link
    const bucketName = bucket.name;
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(filePath)}?alt=media`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filePath,
    });
  } catch (error: any) {
    console.error("Storage upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file to storage" }, { status: 500 });
  }
}
