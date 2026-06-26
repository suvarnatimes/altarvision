import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase/admin";
import { getUserRole } from "@/lib/auth/roles";
import { createAuditLog } from "@/lib/security/auditLog";
import { sanitizeInput, sanitizeObject } from "@/lib/security/sanitize";

async function getAdminEmail(userId: string): Promise<string> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.emailAddresses?.[0]?.emailAddress || "";
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getUserRole(userId);
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const sanitizedBody = sanitizeObject(body);
    const {
      title,
      slug,
      description,
      categoryId,
      thumbnail,
      previewImages,
      promptContent,
      tags,
      price,
      featured,
      status,
      videoUrl,
    } = sanitizedBody;

    if (!title || !slug || !description || !categoryId || !promptContent || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newPrompt = {
      title,
      slug,
      description,
      categoryId,
      thumbnail: thumbnail || "",
      previewImages: previewImages || [],
      promptContent,
      tags: tags || [],
      price: Number(price),
      featured: Boolean(featured),
      status: status || "draft",
      videoUrl: videoUrl || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection("prompts").add(newPrompt);
    const adminEmail = await getAdminEmail(userId);
    await createAuditLog(userId, adminEmail, "CREATE_PROMPT", `Created prompt: ${title}`, {
      promptId: docRef.id,
      title,
    });

    return NextResponse.json({ success: true, id: docRef.id, message: "Prompt created successfully" });
  } catch (error: any) {
    console.error("Admin prompt create error:", error);
    return NextResponse.json({ error: error.message || "Failed to create prompt" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getUserRole(userId);
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const sanitizedBody = sanitizeObject(body);
    const {
      id,
      title,
      slug,
      description,
      categoryId,
      thumbnail,
      previewImages,
      promptContent,
      tags,
      price,
      featured,
      status,
      videoUrl,
    } = sanitizedBody;

    if (!id) {
      return NextResponse.json({ error: "Prompt ID is required for update" }, { status: 400 });
    }

    const promptRef = adminDb.collection("prompts").doc(id);
    const promptDoc = await promptRef.get();
    if (!promptDoc.exists) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (previewImages !== undefined) updateData.previewImages = previewImages;
    if (promptContent !== undefined) updateData.promptContent = promptContent;
    if (tags !== undefined) updateData.tags = tags;
    if (price !== undefined) updateData.price = Number(price);
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (status !== undefined) updateData.status = status;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;

    await promptRef.update(updateData);
    
    const adminEmail = await getAdminEmail(userId);
    await createAuditLog(userId, adminEmail, "UPDATE_PROMPT", `Updated prompt: ${title || id}`, {
      promptId: id,
    });

    return NextResponse.json({ success: true, message: "Prompt updated successfully" });
  } catch (error: any) {
    console.error("Admin prompt update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update prompt" }, { status: 500 });
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
      return NextResponse.json({ error: "Prompt ID is required for deletion" }, { status: 400 });
    }

    const promptRef = adminDb.collection("prompts").doc(id);
    const promptDoc = await promptRef.get();
    if (!promptDoc.exists) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const title = promptDoc.data()?.title || "Unknown Prompt";
    await promptRef.delete();
    
    const adminEmail = await getAdminEmail(userId);
    await createAuditLog(userId, adminEmail, "DELETE_PROMPT", `Deleted prompt: ${title} (${id})`, {
      promptId: id,
    });

    return NextResponse.json({ success: true, message: "Prompt deleted successfully" });
  } catch (error: any) {
    console.error("Admin prompt delete error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete prompt" }, { status: 500 });
  }
}
