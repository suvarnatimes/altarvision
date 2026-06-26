import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { validateRazorpayWebhook } from "@/lib/security/validateWebhook";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers.get("x-razorpay-signature");

  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    // 1. Verify Webhook Signature if secret is configured
    if (WEBHOOK_SECRET) {
      if (!signature) {
        return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
      }
      const isValid = validateRazorpayWebhook(rawBody, signature, WEBHOOK_SECRET);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else {
      console.warn("WARNING: RAZORPAY_WEBHOOK_SECRET is not set. Processing Razorpay webhook without verification.");
    }

    const event = payload.event;
    
    // We handle both 'order.paid' and 'payment.captured' events
    if (event === "order.paid" || event === "payment.captured") {
      const paymentEntity = payload.payload.payment?.entity;
      const orderId = paymentEntity?.order_id || payload.payload.order?.entity?.id;
      const paymentId = paymentEntity?.id;

      if (!orderId) {
        return NextResponse.json({ error: "No order ID found in webhook payload" }, { status: 400 });
      }

      // 2. Fetch Order doc from Firestore
      const orderRef = adminDb.collection("orders").doc(orderId);
      const orderDoc = await orderRef.get();

      if (orderDoc.exists) {
        const orderData = orderDoc.data();
        
        if (orderData?.paymentStatus !== "completed") {
          // 3. Mark order as completed
          await orderRef.update({
            paymentStatus: "completed",
            razorpayPaymentId: paymentId || orderData?.razorpayPaymentId || "",
            updatedAt: new Date(),
          });

          // Write sync conversion analytics
          await adminDb.collection("analytics").add({
            event: "webhook_payment_success",
            userId: orderData?.userId,
            metadata: {
              orderId,
              paymentId,
              amount: orderData?.amount,
              items: orderData?.purchasedItems,
            },
            createdAt: new Date(),
          });

          console.log(`Razorpay webhook: Order ${orderId} successfully completed.`);
        }
      } else {
        console.error(`Razorpay webhook: Order document ${orderId} not found in database.`);
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Razorpay Webhook handler error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing error" }, { status: 500 });
  }
}
