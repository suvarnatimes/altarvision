import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth/roles";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const role = await getUserRole(user.id);
  if (role !== "admin") {
    // Safety role protection block
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[var(--bg-root)] geo-grid dot-matrix">
      <div className="wrap">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Admin Sidebar Navigation */}
          <AdminSidebar />

          {/* Admin Panels View */}
          <div className="flex-1 w-full min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
