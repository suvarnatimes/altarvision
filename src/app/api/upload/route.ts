import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { r2Client } from "@/lib/cloudflare/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
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

    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const publicDomain = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

    if (!bucketName || !publicDomain) {
      return NextResponse.json({ error: "Cloudflare R2 storage is not configured on the server." }, { status: 500 });
    }

    // Upload to Cloudflare R2 via S3 client
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      Body: buffer,
      ContentType: file.type,
    });

    await r2Client.send(command);

    // Generate public URL using the configured public bucket domain
    const cleanDomain = publicDomain.replace(/\/$/, "");
    const publicUrl = `${cleanDomain}/${filePath}`;

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

