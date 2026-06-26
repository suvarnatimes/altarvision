import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase/admin";
import { rateLimit } from "@/lib/security/rateLimit";
import { sanitizeInput, sanitizeObject } from "@/lib/security/sanitize";
import { sendSupportTicketEmail } from "@/lib/mail/mailer";

async function getUserDetails(userId: string) {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return {
      email: user.emailAddresses?.[0]?.emailAddress || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
    };
  } catch {
    return { email: "", name: "User" };
  }
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const querySnapshot = await adminDb
      .collection("supportTickets")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

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
    console.error("Failed to load user support tickets:", error);
    return NextResponse.json({ error: error.message || "Failed to load support tickets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!rateLimit(ip, 10)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { subject, message } = sanitizeObject(body);

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const { email, name } = await getUserDetails(userId);

    const ticketData = {
      userId,
      userEmail: email,
      userName: name,
      subject,
      message,
      status: "open" as const,
      messages: [
        {
          sender: "user" as const,
          message,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection("supportTickets").add(ticketData);

    // Send support email using Resend
    if (email) {
      await sendSupportTicketEmail(email, name, subject, message);
    }

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Support ticket created successfully",
    });
  } catch (error: any) {
    console.error("Failed to create support ticket:", error);
    return NextResponse.json({ error: error.message || "Failed to create support ticket" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, message } = sanitizeObject(body);

    if (!id || !message) {
      return NextResponse.json({ error: "Ticket ID and message are required" }, { status: 400 });
    }

    const ticketRef = adminDb.collection("supportTickets").doc(id);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
    }

    const ticketData = ticketDoc.data();
    if (ticketData?.userId !== userId) {
      return NextResponse.json({ error: "Forbidden: Not your ticket" }, { status: 403 });
    }

    const newMessage = {
      sender: "user" as const,
      message,
      createdAt: new Date(),
    };

    const currentMessages = ticketData?.messages || [];
    
    await ticketRef.update({
      messages: [...currentMessages, newMessage],
      status: "open", // Reopen or set back to open when user sends a new message
    });

    return NextResponse.json({ success: true, message: "Reply added successfully" });
  } catch (error: any) {
    console.error("Failed to update support ticket:", error);
    return NextResponse.json({ error: error.message || "Failed to add reply" }, { status: 500 });
  }
}
