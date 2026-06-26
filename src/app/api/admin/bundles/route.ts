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
    const { title, description, thumbnail, price, prompts } = sanitizedBody;

    if (!title || !description || price === undefined || !prompts || !Array.isArray(prompts)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newBundle = {
      title,
      description,
      thumbnail: thumbnail || "",
      price: Number(price),
      prompts, // Array of prompt IDs
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection("bundles").add(newBundle);
    const adminEmail = await getAdminEmail(userId);
    await createAuditLog(userId, adminEmail, "CREATE_BUNDLE", `Created bundle: ${title}`, {
      bundleId: docRef.id,
      title,
    });

    return NextResponse.json({ success: true, id: docRef.id, message: "Bundle created successfully" });
  } catch (error: any) {
    console.error("Admin bundle create error:", error);
    return NextResponse.json({ error: error.message || "Failed to create bundle" }, { status: 500 });
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
    const { id, title, description, thumbnail, price, prompts } = sanitizedBody;

    if (!id) {
      return NextResponse.json({ error: "Bundle ID is required for update" }, { status: 400 });
    }

    const bundleRef = adminDb.collection("bundles").doc(id);
    const bundleDoc = await bundleRef.get();
    if (!bundleDoc.exists) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (price !== undefined) updateData.price = Number(price);
    if (prompts !== undefined && Array.isArray(prompts)) updateData.prompts = prompts;

    await bundleRef.update(updateData);
    
    const adminEmail = await getAdminEmail(userId);
    await createAuditLog(userId, adminEmail, "UPDATE_BUNDLE", `Updated bundle: ${title || id}`, {
      bundleId: id,
    });

    return NextResponse.json({ success: true, message: "Bundle updated successfully" });
  } catch (error: any) {
    console.error("Admin bundle update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update bundle" }, { status: 500 });
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
      return NextResponse.json({ error: "Bundle ID is required for deletion" }, { status: 400 });
    }

    const bundleRef = adminDb.collection("bundles").doc(id);
    const bundleDoc = await bundleRef.get();
    if (!bundleDoc.exists) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    const title = bundleDoc.data()?.title || "Unknown Bundle";
    await bundleRef.delete();
    
    const adminEmail = await getAdminEmail(userId);
    await createAuditLog(userId, adminEmail, "DELETE_BUNDLE", `Deleted bundle: ${title} (${id})`, {
      bundleId: id,
    });

    return NextResponse.json({ success: true, message: "Bundle deleted successfully" });
  } catch (error: any) {
    console.error("Admin bundle delete error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete bundle" }, { status: 500 });
  }
}
