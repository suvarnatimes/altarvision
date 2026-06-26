import { clerkClient } from "@clerk/nextjs/server";
import { adminDb } from "../firebase/admin";

/**
 * Gets a user's role from Clerk public metadata, or falls back to Firestore
 */
export async function getUserRole(userId: string): Promise<"admin" | "customer"> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role as "admin" | "customer" | undefined;
    if (role) return role;
  } catch (error) {
    console.error("Clerk getUserRole failed, falling back to Firestore check:", error);
  }

  // Fallback to Firestore
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (userDoc.exists) {
      return (userDoc.data()?.role as "admin" | "customer") || "customer";
    }
  } catch (error) {
    console.error("Firestore user role check failed:", error);
  }

  return "customer";
}

/**
 * Sets a user's role in Clerk public metadata and syncs it with Firestore
 */
export async function setUserRole(userId: string, role: "admin" | "customer"): Promise<void> {
  // Sync to Clerk
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
      },
    });
  } catch (error) {
    console.error("Failed to update user role metadata in Clerk:", error);
  }

  // Sync to Firestore
  try {
    await adminDb.collection("users").doc(userId).update({
      role,
    });
  } catch (error) {
    console.error("Failed to update user role in Firestore:", error);
  }
}
