"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, ShieldAlert, ShieldCheck, RefreshCw, UserCheck } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface UserItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "customer";
  createdAt: Date;
  totalSpent: number;
  purchaseCount: number;
}

export default function UsersListClient({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "admin" ? "customer" : "admin";
    if (
      !window.confirm(
        `Are you sure you want to change this user's role to ${nextRole.toUpperCase()}?`
      )
    )
      return;

    try {
      const res = await fetch("/api/admin/users/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, newRole: nextRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: nextRole as any } : u))
      );
      toast.success("User role updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update user role");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Toaster position="top-center" />

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/50 backdrop-blur-md border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)]"
        />
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-300)]" />
      </div>

      {/* Table Grid */}
      <div className="crystal overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-[var(--ink-500)] font-semibold text-sm">
            No users found matching query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[rgba(91,79,207,0.05)] border-b border-[rgba(91,79,207,0.12)] text-[var(--ink-500)] font-black uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Purchases</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(91,79,207,0.08)] font-semibold">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[rgba(91,79,207,0.02)] transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/40 shrink-0">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-[var(--bg-prism)] flex items-center justify-center text-[10px] font-bold text-[var(--ink-300)]">
                            AV
                          </div>
                        )}
                      </div>
                      <span className="text-[var(--ink-900)] font-bold">{u.name}</span>
                    </td>
                    <td className="p-4 text-[var(--ink-700)]">{u.email}</td>
                    <td className="p-4">
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-0.5 text-[var(--prism-rose)]">
                          <ShieldAlert size={12} /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[var(--ink-300)]">
                          <ShieldCheck size={12} /> Customer
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-[var(--ink-700)]">{u.purchaseCount} items</td>
                    <td className="p-4 text-[var(--ink-900)] font-bold">₹{u.totalSpent}</td>
                    <td className="p-4 text-right flex justify-end gap-2.5">
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className="btn-crystal text-[10px] py-1.5 px-3 border-white/60 font-bold flex items-center gap-1"
                        title="Toggle user role"
                      >
                        <RefreshCw size={11} />
                        Toggle Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
