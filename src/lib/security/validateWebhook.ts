import crypto from "crypto";

/**
 * Validates Razorpay Webhook Signatures using SHA256 HMAC
 * @param rawBody The raw request body as string
 * @param signature Signature received in 'x-razorpay-signature' header
 * @param secret The Razorpay webhook secret configured in Razorpay Dashboard
 */
export function validateRazorpayWebhook(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
    
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "utf-8"),
    Buffer.from(signature, "utf-8")
  );
}
