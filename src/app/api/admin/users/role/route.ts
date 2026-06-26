import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getUserRole, setUserRole } from "@/lib/auth/roles";
import { createAuditLog } from "@/lib/security/auditLog";
import { sanitizeInput } from "@/lib/security/sanitize";

async function getAdminEmail(userId: string): Promise<string> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.emailAddresses?.[0]?.emailAddress || "";
  } catch {
    return "";
  }
}

export async function PUT(req: Request) {
  const { userId: adminUserId } = await auth();
  if (!adminUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getUserRole(adminUserId);
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { targetUserId, newRole } = body;

    if (!targetUserId || !newRole) {
      return NextResponse.json({ error: "targetUserId and newRole are required" }, { status: 400 });
    }

    const sanitizedUserId = sanitizeInput(targetUserId);
    const sanitizedRole = sanitizeInput(newRole) as "admin" | "customer";

    if (sanitizedRole !== "admin" && sanitizedRole !== "customer") {
      return NextResponse.json({ error: "Invalid role value" }, { status: 400 });
    }

    // Prevent self-role-demotion
    if (sanitizedUserId === adminUserId && sanitizedRole !== "admin") {
      return NextResponse.json({ error: "Forbidden: You cannot revoke your own admin rights" }, { status: 400 });
    }

    await setUserRole(sanitizedUserId, sanitizedRole);

    const adminEmail = await getAdminEmail(adminUserId);
    await createAuditLog(
      adminUserId,
      adminEmail,
      "CHANGE_USER_ROLE",
      `Changed user role of ${sanitizedUserId} to ${sanitizedRole}`,
      { targetUserId: sanitizedUserId, role: sanitizedRole }
    );

    return NextResponse.json({ success: true, message: `User role successfully set to ${sanitizedRole}` });
  } catch (error: any) {
    console.error("Admin change user role error:", error);
    return NextResponse.json({ error: error.message || "Failed to update user role" }, { status: 500 });
  }
}
