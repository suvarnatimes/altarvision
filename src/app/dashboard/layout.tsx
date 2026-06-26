import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pt-28 pb-16 bg-[var(--bg-root)] geo-grid dot-matrix">
      <div className="wrap">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar */}
          <DashboardSidebar />

          {/* Main Content Area */}
          <div className="flex-1 w-full min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
