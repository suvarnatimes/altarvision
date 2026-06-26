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
    const querySnapshot = await adminDb.collection("coupons").orderBy("code", "asc").get();
    const coupons = querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(coupons);
  } catch (error: any) {
    console.error("Admin fetch coupons error:", error);
    return NextResponse.json({ error: error.message || "Failed to load coupons" }, { status: 500 });
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
    const { code, type, discount, expiryDate, active } = sanitizedBody;

    if (!code || !type || discount === undefined || !expiryDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const upperCode = code.trim().toUpperCase();

    const existingCheck = await adminDb.collection("coupons").where("code", "==", upperCode).limit(1).get();
    if (!existingCheck.empty) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }

    const newCoupon = {
      code: upperCode,
      type, // 'percentage' | 'fixed'
      discount: Number(discount),
      expiryDate, // YYYY-MM-DD
      active: active === undefined ? true : Boolean(active),
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection("coupons").add(newCoupon);
    const adminEmail = await getAdminEmail(userId);
    await createAuditLog(userId, adminEmail, "CREATE_COUPON", `Created coupon code: ${upperCode}`, {
      couponId: docRef.id,
      code: upperCode,
    });

    return NextResponse.json({ success: true, id: docRef.id, message: "Coupon created successfully" });
  } catch (error: any) {
    console.error("Admin coupon create error:", error);
    return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 });
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
    const { id, code, type, discount, expiryDate, active } = sanitizedBody;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required for update" }, { status: 400 });
    }

    const couponRef = adminDb.collection("coupons").doc(id);
    const couponDoc = await couponRef.get();
    if (!couponDoc.exists) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (code !== undefined) updateData.code = code.trim().toUpperCase();
    if (type !== undefined) updateData.type = type;
    if (discount !== undefined) updateData.discount = Number(discount);
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate;
    if (active !== undefined) updateData.active = Boolean(active);

    await couponRef.update(updateData);
    
    const adminEmail = await getAdminEmail(userId);
    await createAuditLog(userId, adminEmail, "UPDATE_COUPON", `Updated coupon: ${code || id}`, {
      couponId: id,
    });

    return NextResponse.json({ success: true, message: "Coupon updated successfully" });
  } catch (error: any) {
    console.error("Admin coupon update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update coupon" }, { status: 500 });
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
      return NextResponse.json({ error: "Coupon ID is required for deletion" }, { status: 400 });
    }

    const couponRef = adminDb.collection("coupons").doc(id);
    const couponDoc = await couponRef.get();
    if (!couponDoc.exists) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const code = couponDoc.data()?.code || "Unknown Coupon";
    await couponRef.delete();
    
    const adminEmail = await getAdminEmail(userId);
    await createAuditLog(userId, adminEmail, "DELETE_COUPON", `Deleted coupon: ${code} (${id})`, {
      couponId: id,
    });

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error: any) {
    console.error("Admin coupon delete error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete coupon" }, { status: 500 });
  }
}
