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
    const { name, slug, description, image } = sanitizedBody;

    if (!name || !slug || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newCategory = {
      name,
      slug,
      description,
      image: image || "",
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection("categories").add(newCategory);
    const adminEmail = await getAdminEmail(userId);
    await createAuditLog(userId, adminEmail, "CREATE_CATEGORY", `Created category: ${name}`, {
      categoryId: docRef.id,
      name,
    });

    return NextResponse.json({ success: true, id: docRef.id, message: "Category created successfully" });
  } catch (error: any) {
    console.error("Admin category create error:", error);
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
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
    const { id, name, slug, description, image } = sanitizedBody;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required for update" }, { status: 400 });
    }

    const categoryRef = adminDb.collection("categories").doc(id);
    const categoryDoc = await categoryRef.get();
    if (!categoryDoc.exists) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;

    await categoryRef.update(updateData);
    
    const adminEmail = await getAdminEmail(userId);
    await createAuditLog(userId, adminEmail, "UPDATE_CATEGORY", `Updated category: ${name || id}`, {
      categoryId: id,
    });

    return NextResponse.json({ success: true, message: "Category updated successfully" });
  } catch (error: any) {
    console.error("Admin category update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
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
      return NextResponse.json({ error: "Category ID is required for deletion" }, { status: 400 });
    }

    const categoryRef = adminDb.collection("categories").doc(id);
    const categoryDoc = await categoryRef.get();
    if (!categoryDoc.exists) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const name = categoryDoc.data()?.name || "Unknown Category";
    await categoryRef.delete();
    
    const adminEmail = await getAdminEmail(userId);
    await createAuditLog(userId, adminEmail, "DELETE_CATEGORY", `Deleted category: ${name} (${id})`, {
      categoryId: id,
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Admin category delete error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
