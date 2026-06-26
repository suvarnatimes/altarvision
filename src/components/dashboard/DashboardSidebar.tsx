"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import {
  Home,
  ShoppingBag,
  History,
  Download,
  Heart,
  User,
  CreditCard,
  LifeBuoy,
  LogOut,
} from "lucide-react";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/purchases", label: "My Purchases", icon: ShoppingBag },
  { href: "/dashboard/orders", label: "Order History", icon: History },
  { href: "/dashboard/downloads", label: "Downloads", icon: Download },
  { href: "/dashboard/favorites", label: "Wishlist", icon: Heart },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
  { href: "/dashboard/billing", label: "Billing & Spending", icon: CreditCard },
  { href: "/dashboard/support", label: "Support Tickets", icon: LifeBuoy },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="crystal h-fit p-5 flex flex-col gap-1.5 md:w-64 shrink-0">
      <div className="mb-4 pb-4 border-b border-[rgba(91,79,207,0.12)]">
        <h2 className="text-xs font-black text-[var(--prism-violet)] uppercase tracking-widest pl-3">
          Customer Area
        </h2>
      </div>

      <nav className="flex flex-col gap-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "bg-[rgba(91,79,207,0.1)] text-[var(--prism-violet)] border-l-2 border-[var(--prism-violet)]"
                  : "text-[var(--ink-700)] hover:bg-[rgba(91,79,207,0.05)] hover:text-[var(--prism-violet)]"
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
          <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-[var(--prism-rose)] hover:bg-red-50 hover:text-[var(--prism-rose)] transition-all duration-200 text-left">
            <LogOut size={16} />
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
