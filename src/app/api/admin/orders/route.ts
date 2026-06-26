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
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let ordersQuery: any = adminDb.collection("orders");

    if (status) {
      ordersQuery = ordersQuery.where("paymentStatus", "==", sanitizeInput(status));
    }

    ordersQuery = ordersQuery.orderBy("createdAt", "desc");
    const snapshot = await ordersQuery.get();

    const orders = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || null,
      };
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Admin fetch orders error:", error);
    return NextResponse.json({ error: error.message || "Failed to load orders" }, { status: 500 });
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
    const { id, paymentStatus } = sanitizedBody;

    if (!id || !paymentStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const orderRef = adminDb.collection("orders").doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await orderRef.update({
      paymentStatus,
      updatedAt: new Date(),
    });

    const adminEmail = await getAdminEmail(userId);
    await createAuditLog(userId, adminEmail, "MANUAL_ORDER_UPDATE", `Manually set order ${id} status to ${paymentStatus}`, {
      orderId: id,
      newStatus: paymentStatus,
    });

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (error: any) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update order status" }, { status: 500 });
  }
}
