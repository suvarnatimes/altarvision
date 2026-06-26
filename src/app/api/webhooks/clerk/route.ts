import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { syncUserToFirestore } from "@/lib/db/sync-user";
import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.warn(
      "WARNING: CLERK_WEBHOOK_SECRET is not set. Processing Clerk webhook without signature verification (Development fallback)."
    );
    try {
      const payload = await req.json();
      const { data, type } = payload;

      if (type === "user.created" || type === "user.updated") {
        const id = data.id;
        const email = data.email_addresses?.[0]?.email_address || "";
        const name = `${data.first_name || ""} ${data.last_name || ""}`.trim();
        const avatar = data.image_url || "";
        await syncUserToFirestore(id, email, name, avatar);
      } else if (type === "user.deleted") {
        const id = data.id;
        if (id) {
          await adminDb.collection("users").doc(id).delete();
        }
      }
      return NextResponse.json({ success: true, verified: false });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err: any) {
    console.error("Clerk Webhook verification failed:", err.message);
    return new Response("Verification failed", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const data = evt.data;
    const id = data.id;
    const email = data.email_addresses?.[0]?.email_address || "";
    const name = `${data.first_name || ""} ${data.last_name || ""}`.trim();
    const avatar = data.image_url || "";
    await syncUserToFirestore(id, email, name, avatar);
  } else if (eventType === "user.deleted") {
    const id = evt.data.id;
    if (id) {
      await adminDb.collection("users").doc(id).delete();
    }
  }

  return NextResponse.json({ success: true, verified: true });
}
