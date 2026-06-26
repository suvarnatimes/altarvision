import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { ShoppingBag, Download, CreditCard, ArrowRight, Star, Terminal } from "lucide-react";
import { syncUserToFirestore } from "@/lib/db/sync-user";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userId = user.id;

  // Double-check sync to Firestore on dashboard page load (robust client sync fallback)
  const email = user.emailAddresses?.[0]?.emailAddress || "";
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "AltarVision User";
  const avatar = user.imageUrl || "";
  await syncUserToFirestore(userId, email, name, avatar);

  // 1. Fetch completed orders to calculate spent amount & purchases count
  const ordersSnapshot = await adminDb
    .collection("orders")
    .where("userId", "==", userId)
    .where("paymentStatus", "==", "completed")
    .orderBy("createdAt", "desc")
    .get();

  let totalSpent = 0;
  const purchasesList: any[] = [];

  ordersSnapshot.docs.forEach((doc: any) => {
    const order = doc.data();
    totalSpent += Number(order.amount || 0);
    order.purchasedItems?.forEach((item: any) => {
      purchasesList.push({
        id: item.id,
        type: item.type,
        title: item.title,
        price: item.price,
        orderId: doc.id,
        purchasedAt: order.createdAt?.toDate?.() || new Date(),
      });
    });
  });

  // 2. Fetch downloads count
  const downloadsSnapshot = await adminDb
    .collection("downloads")
    .where("userId", "==", userId)
    .get();
  const totalDownloads = downloadsSnapshot.size;

  // 3. Fetch recommended prompts (featured ones the user doesn't own yet)
  const ownedPromptIds = purchasesList
    .filter((p: any) => p.type === "prompt")
    .map((p: any) => p.id);

  const promptsSnapshot = await adminDb
    .collection("prompts")
    .where("status", "==", "published")
    .where("featured", "==", true)
    .limit(5)
    .get();

  const recommendedPrompts = promptsSnapshot.docs
    .map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((p: any) => !ownedPromptIds.includes(p.id))
    .slice(0, 3);

  const isAdmin = user.publicMetadata?.role === "admin";

  return (
    <div className="flex flex-col gap-8">
      {isAdmin && (
        <div className="crystal p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div>
              <p className="text-sm font-bold text-amber-800">Admin Account Active</p>
              <p className="text-xs text-amber-600">You are currently viewing the customer workspace dashboard. Access your admin panel tools below.</p>
            </div>
          </div>
          <Link href="/admin" className="btn-prism text-xs font-bold py-2 px-4 shrink-0 bg-amber-500 hover:bg-amber-600 border-amber-600/30">
            Go to Admin Dashboard
          </Link>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="crystal p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[var(--prism-violet)] to-[var(--prism-sky)]"></div>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/50 shadow-sm shrink-0">
            <Image
              src={avatar || "/altarvisionlogo.png"}
              alt={name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--ink-900)]">
              Welcome back, <span className="text-prism">{user.firstName || "User"}</span>!
            </h1>
            <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
              Manage your purchases, download instructions, and manage your account.
            </p>
          </div>
        </div>
        <Link href="/prompts" className="btn-prism text-xs font-bold shrink-0">
          Browse Marketplace
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Purchases */}
        <div className="crystal p-6 relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[rgba(91,79,207,0.1)] border border-[rgba(91,79,207,0.2)] flex items-center justify-center text-[var(--prism-violet)]">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-[var(--ink-300)] uppercase tracking-wider block">
              Purchased Items
            </span>
            <span className="stat-num block mt-1">{purchasesList.length}</span>
          </div>
        </div>

        {/* Total Downloads */}
        <div className="crystal p-6 relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center text-[var(--prism-cyan)]">
            <Download size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-[var(--ink-300)] uppercase tracking-wider block">
              Total Downloads
            </span>
            <span className="stat-num block mt-1" style={{ backgroundImage: "linear-gradient(130deg, #06b6d4, #3b82f6)" }}>
              {totalDownloads}
            </span>
          </div>
        </div>

        {/* Amount Spent */}
        <div className="crystal p-6 relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[rgba(16,119,129,0.1)] border border-[rgba(16,119,129,0.2)] flex items-center justify-center text-[var(--prism-emerald)]">
            <CreditCard size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black text-[var(--ink-300)] uppercase tracking-wider block">
              Total Spent
            </span>
            <span className="stat-num block mt-1" style={{ backgroundImage: "linear-gradient(130deg, #10b981, #06b6d4)" }}>
              ₹{totalSpent}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Purchases & Recommended */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Recent Purchases */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[var(--ink-900)] uppercase tracking-wider pl-1.5 border-l-3 border-[var(--prism-violet)]">
              Recent Purchases
            </h2>
            <Link
              href="/dashboard/purchases"
              className="text-xs font-bold text-[var(--prism-violet)] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="crystal overflow-hidden">
            {purchasesList.length === 0 ? (
              <div className="p-12 text-center text-[var(--ink-500)] font-semibold text-sm">
                You haven&apos;t purchased any prompts yet.
              </div>
            ) : (
              <div className="divide-y divide-[rgba(91,79,207,0.12)]">
                {purchasesList.slice(0, 4).map((p, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-[rgba(91,79,207,0.03)] transition-colors">
                    <div>
                      <h4 className="text-xs font-black text-[var(--ink-900)] line-clamp-1">
                        {p.title}
                      </h4>
                      <p className="text-[10px] text-[var(--ink-300)] font-semibold mt-1">
                        Purchased on {new Date(p.purchasedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-[var(--ink-700)]">
                        ₹{p.price}
                      </span>
                      <Link
                        href={`/dashboard/purchases`}
                        className="btn-crystal text-[10px] py-1.5 px-3 font-bold border-white/60"
                      >
                        Access
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Recommended Prompts */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-black text-[var(--ink-900)] uppercase tracking-wider pl-1.5 border-l-3 border-[var(--prism-sky)]">
            Recommended Prompts
          </h2>

          <div className="flex flex-col gap-4">
            {recommendedPrompts.length === 0 ? (
              <div className="crystal p-6 text-center text-xs text-[var(--ink-500)] font-semibold">
                No recommendations right now.
              </div>
            ) : (
              recommendedPrompts.map((p: any) => (
                <div key={p.id} className="crystal p-4 flex gap-4 hover:bg-[rgba(91,79,207,0.03)] transition-colors">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/40 bg-[var(--bg-prism)] shrink-0">
                    {p.thumbnail && (
                      <Image
                        src={p.thumbnail}
                        alt={p.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-[var(--ink-900)] line-clamp-1">
                      {p.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Star size={11} className="fill-[var(--prism-amber)] text-[var(--prism-amber)] shrink-0" />
                      <span className="text-[10px] font-bold text-[var(--ink-700)]">4.8</span>
                      <span className="text-[10px] text-[var(--ink-300)] font-semibold">| ₹{p.price}</span>
                    </div>
                    <Link
                      href={`/prompts/${p.slug}`}
                      className="text-[10px] font-bold text-[var(--prism-violet)] hover:underline mt-2 inline-flex items-center gap-0.5"
                    >
                      View details <ArrowRight size={10} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
