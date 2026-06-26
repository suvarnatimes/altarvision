"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Terminal,
  Grid,
  Layers,
  ShoppingBag,
  Users,
  Star,
  Tag,
  LifeBuoy,
  BarChart3,
  LogOut,
  ChevronLeft,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/prompts", label: "Manage Prompts", icon: Terminal },
  { href: "/admin/categories", label: "Manage Categories", icon: Grid },
  { href: "/admin/bundles", label: "Manage Bundles", icon: Layers },
  { href: "/admin/orders", label: "Manage Orders", icon: ShoppingBag },
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/reviews", label: "Moderate Reviews", icon: Star },
  { href: "/admin/coupons", label: "Manage Coupons", icon: Tag },
  { href: "/admin/support", label: "Support Tickets", icon: LifeBuoy },
  { href: "/admin/analytics", label: "View Analytics", icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="crystal h-fit p-5 flex flex-col gap-1.5 md:w-64 shrink-0">
      <div className="mb-4 pb-4 border-b border-[rgba(91,79,207,0.12)]">
        <h2 className="text-xs font-black text-[var(--prism-rose)] uppercase tracking-widest pl-3">
          Admin Portal
        </h2>
        <Link
          href="/dashboard"
          className="flex items-center gap-1 mt-2.5 pl-3 text-[10px] font-bold text-[var(--ink-500)] hover:text-[var(--prism-violet)] transition-colors"
        >
          <ChevronLeft size={10} />
          Back to Client Area
        </Link>
      </div>

      <nav className="flex flex-col gap-1">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "bg-[rgba(232,121,160,0.1)] text-[var(--prism-rose)] border-l-2 border-[var(--prism-rose)]"
                  : "text-[var(--ink-700)] hover:bg-[rgba(91,79,207,0.05)] hover:text-[var(--prism-rose)]"
              }`}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 pt-4 border-t border-[rgba(91,79,207,0.12)]">
        <SignOutButton redirectUrl="/">
          <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-[var(--prism-rose)] hover:bg-red-50 transition-all duration-200 text-left">
            <LogOut size={16} />
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
