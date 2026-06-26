import { adminDb } from "../firebase/admin";
import { getUserRole } from "./roles";

/**
 * Checks if a user has purchased a specific prompt (directly or via a bundle) or is an Admin.
 * @param userId Clerk User ID
 * @param promptId Firestore Prompt ID
 */
export async function checkPromptOwnership(
  userId: string,
  promptId: string
): Promise<boolean> {
  if (!userId || !promptId) return false;

  // 1. Admin bypass - admins own all prompts
  const role = await getUserRole(userId);
  if (role === "admin") return true;

  // 2. Check purchased items in completed orders
  const ordersSnapshot = await adminDb
    .collection("orders")
    .where("userId", "==", userId)
    .where("paymentStatus", "==", "completed")
    .get();

  if (ordersSnapshot.empty) return false;

  // Set of bundle IDs the user purchased (for batch lookups if needed)
  const purchasedBundleIds: string[] = [];

  for (const doc of ordersSnapshot.docs) {
    const order = doc.data();
    
    // Check direct prompt purchases
    const hasDirectPrompt = order.purchasedItems?.some(
      (item: any) => item.id === promptId && item.type === "prompt"
    );
    if (hasDirectPrompt) return true;

    // Collect purchased bundles to verify if prompt belongs to any bundle
    order.purchasedItems?.forEach((item: any) => {
      if (item.type === "bundle") {
        purchasedBundleIds.push(item.id);
      }
    });
  }

  // 3. Check if prompt is part of any purchased bundles
  if (purchasedBundleIds.length > 0) {
    for (const bundleId of purchasedBundleIds) {
      const bundleDoc = await adminDb.collection("bundles").doc(bundleId).get();
      if (bundleDoc.exists) {
        const bundlePrompts = bundleDoc.data()?.prompts as string[] | undefined;
        if (bundlePrompts && bundlePrompts.includes(promptId)) {
          return true;
        }
      }
    }
  }

  return false;
}
