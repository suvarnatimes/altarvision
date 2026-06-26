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
    const querySnapshot = await adminDb.collection("supportTickets").orderBy("createdAt", "desc").get();
    const tickets = querySnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        messages: (data.messages || []).map((m: any) => ({
          ...m,
          createdAt: m.createdAt?.toDate?.() || m.createdAt || new Date(),
        })),
      };
    });
    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error("Admin fetch support tickets error:", error);
    return NextResponse.json({ error: error.message || "Failed to load support tickets" }, { status: 500 });
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
    const { id, status, replyMessage } = sanitizedBody;

    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const ticketRef = adminDb.collection("supportTickets").doc(id);
    const ticketDoc = await ticketRef.get();
    if (!ticketDoc.exists) {
      return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};

    if (status !== undefined) {
      updateData.status = status; // 'open' | 'replied' | 'closed'
    }

    if (replyMessage) {
      const newReply = {
        sender: "admin",
        message: replyMessage,
        createdAt: new Date(),
      };
      
      // Get current messages list
      const currentMessages = ticketDoc.data()?.messages || [];
      updateData.messages = [...currentMessages, newReply];
      updateData.status = "replied"; // Auto transition to replied on admin message
    }

    await ticketRef.update(updateData);
    
    const adminEmail = await getAdminEmail(userId);
    await createAuditLog(userId, adminEmail, "REPLY_SUPPORT_TICKET", `Admin processed ticket ${id} (status: ${updateData.status || status})`, {
      ticketId: id,
    });

    return NextResponse.json({ success: true, message: "Ticket updated successfully" });
  } catch (error: any) {
    console.error("Admin ticket update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update support ticket" }, { status: 500 });
  }
}
