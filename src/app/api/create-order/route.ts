import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Razorpay from "razorpay";
import { adminDb } from "@/lib/firebase/admin";
import { rateLimit } from "@/lib/security/rateLimit";
import { sanitizeInput } from "@/lib/security/sanitize";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: Request) {
  // Rate limiting check
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!rateLimit(ip, 30)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  // Authentication check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { promptId, bundleId, couponCode } = body;

    if (!promptId && !bundleId) {
      return NextResponse.json({ error: "Either promptId or bundleId must be provided" }, { status: 400 });
    }

    let itemTitle = "";
    let itemPrice = 0;
    let itemId = "";
    let itemType: "prompt" | "bundle" = "prompt";

    // 1. Fetch item from database to verify price (do not trust client-sent prices)
    if (promptId) {
      const sanitizedId = sanitizeInput(promptId);
      const promptDoc = await adminDb.collection("prompts").doc(sanitizedId).get();
      if (!promptDoc.exists) {
        return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
      }
      const data = promptDoc.data();
      itemTitle = data?.title || "AI Prompt";
      itemPrice = data?.price || 0;
      itemId = sanitizedId;
      itemType = "prompt";

      // Prevent buying already purchased prompts
      const existingPurchases = await adminDb
        .collection("orders")
        .where("userId", "==", userId)
        .where("paymentStatus", "==", "completed")
        .get();

      const alreadyPurchased = existingPurchases.docs.some((doc: any) => {
        const order = doc.data();
        return order.purchasedItems?.some((item: any) => item.id === itemId && item.type === "prompt");
      });

      if (alreadyPurchased) {
        return NextResponse.json({ error: "You already own this prompt" }, { status: 400 });
      }
    } else if (bundleId) {
      const sanitizedId = sanitizeInput(bundleId);
      const bundleDoc = await adminDb.collection("bundles").doc(sanitizedId).get();
      if (!bundleDoc.exists) {
        return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
      }
      const data = bundleDoc.data();
      itemTitle = data?.title || "AI Prompt Bundle";
      itemPrice = data?.price || 0;
      itemId = sanitizedId;
      itemType = "bundle";
    }

    // 2. Validate Coupon Code if provided
    let finalPrice = itemPrice;
    let couponApplied = "";

    if (couponCode) {
      const sanitizedCoupon = sanitizeInput(couponCode).toUpperCase();
      const couponQuery = await adminDb
        .collection("coupons")
        .where("code", "==", sanitizedCoupon)
        .where("active", "==", true)
        .limit(1)
        .get();

      if (!couponQuery.empty) {
        const couponDoc = couponQuery.docs[0];
        const couponData = couponDoc.data();
        const expiryDate = new Date(couponData.expiryDate);
        const now = new Date();

        if (expiryDate >= now) {
          couponApplied = sanitizedCoupon;
          if (couponData.type === "percentage") {
            finalPrice = finalPrice - (finalPrice * couponData.discount) / 100;
          } else if (couponData.type === "fixed") {
            finalPrice = Math.max(0, finalPrice - couponData.discount);
          }
        }
      }
    }

    // Razorpay minimum order amount check (must be at least 1 Rupee = 100 Paise)
    const amountInPaise = Math.round(finalPrice * 100);
    if (amountInPaise < 100) {
      return NextResponse.json({ error: "Minimum order amount must be at least ₹1.00" }, { status: 400 });
    }

    // 3. Create Order via Razorpay SDK
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 4. Create Pending Order record in Firestore
    const orderData = {
      id: razorpayOrder.id, // Store Razorpay Order ID as Document ID
      userId,
      amount: finalPrice,
      paymentStatus: "pending" as const,
      razorpayOrderId: razorpayOrder.id,
      purchasedItems: [
        {
          id: itemId,
          type: itemType,
          title: itemTitle,
          price: itemPrice,
        },
      ],
      couponUsed: couponApplied || null,
      createdAt: new Date(),
    };

    await adminDb.collection("orders").doc(razorpayOrder.id).set(orderData);

    // 5. Return details to client
    return NextResponse.json({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error: any) {
    console.error("Failed to create Razorpay order:", error);
    return NextResponse.json({ error: error.message || "Failed to initiate payment transaction" }, { status: 500 });
  }
}
