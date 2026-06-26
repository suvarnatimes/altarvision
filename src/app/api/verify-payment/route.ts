import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase/admin";
import { rateLimit } from "@/lib/security/rateLimit";
import { sanitizeInput } from "@/lib/security/sanitize";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!rateLimit(ip, 30)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 });
    }

    const orderId = sanitizeInput(razorpay_order_id);
    const paymentId = sanitizeInput(razorpay_payment_id);
    const signature = sanitizeInput(razorpay_signature);

    // 1. Verify Razorpay Signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf-8"),
      Buffer.from(signature, "utf-8")
    );

    if (!isMatch) {
      return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
    }

    // 2. Fetch Order doc from Firestore
    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderDoc.data();

    // Prevent modifying already completed orders
    if (orderData?.paymentStatus === "completed") {
      return NextResponse.json({ success: true, message: "Payment already processed successfully" });
    }

    // 3. Update Order record in Firestore
    await orderRef.update({
      paymentStatus: "completed",
      razorpayPaymentId: paymentId,
      updatedAt: new Date(),
    });

    // 4. Trigger analytics conversion event
    try {
      await adminDb.collection("analytics").add({
        event: "checkout_success",
        userId,
        metadata: {
          orderId,
          paymentId,
          amount: orderData?.amount || 0,
          items: orderData?.purchasedItems || [],
        },
        createdAt: new Date(),
      });
    } catch (analyticsError) {
      console.error("Failed to write payment analytics:", analyticsError);
    }

    return NextResponse.json({ success: true, message: "Payment verified and order finalized" });
  } catch (error: any) {
    console.error("Payment verification failure:", error);
    return NextResponse.json({ error: error.message || "Failed to verify transaction signature" }, { status: 500 });
  }
}
