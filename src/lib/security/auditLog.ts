import { adminDb } from "../firebase/admin";

/**
 * Creates a record in the auditLogs collection for administrator or security-sensitive actions
 */
export async function createAuditLog(
  userId: string,
  userEmail: string,
  action: string,
  details: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    await adminDb.collection("auditLogs").add({
      userId,
      userEmail,
      action,
      details,
      metadata,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
