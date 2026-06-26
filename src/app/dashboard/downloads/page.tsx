import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { FieldPath } from "firebase-admin/firestore";
import { Download, Terminal, ArrowRight } from "lucide-react";

export default async function DownloadsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userId = user.id;

  // 1. Fetch user download logs from Firestore
  const downloadsSnapshot = await adminDb
    .collection("downloads")
    .where("userId", "==", userId)
    .orderBy("downloadedAt", "desc")
    .limit(50)
    .get();

  const downloadLogs = downloadsSnapshot.docs.map((doc: any) => {
    const data = doc.data();
    return {
      id: doc.id,
      promptId: data.promptId,
      downloadedAt: data.downloadedAt?.toDate?.() || new Date(),
    };
  });

  // 2. Fetch unique prompt details
  const uniquePromptIds = Array.from(new Set(downloadLogs.map((l: any) => l.promptId)));
  const promptsMap: Record<string, { title: string; slug: string }> = {};

  if (uniquePromptIds.length > 0) {
    const chunks = [];
    for (let i = 0; i < uniquePromptIds.length; i += 10) {
      chunks.push(uniquePromptIds.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const snap = await adminDb
        .collection("prompts")
        .where(FieldPath.documentId(), "in", chunk)
        .get();

      snap.docs.forEach((doc: any) => {
        promptsMap[doc.id] = {
          title: doc.data().title || "AI Prompt",
          slug: doc.data().slug || "",
        };
      });
    }
  }

  const enrichedLogs = downloadLogs.map((log: any) => ({
    ...log,
    ...(promptsMap[log.promptId] || { title: "Deleted Prompt", slug: "" }),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Download History
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Review prompts you have accessed or downloaded files for.
        </p>
      </div>

      <div className="crystal overflow-hidden">
        {enrichedLogs.length === 0 ? (
          <div className="p-12 text-center text-[var(--ink-500)] font-semibold text-sm">
            No downloads recorded yet. Access prompts in your Purchases dashboard to trigger downloads.
          </div>
        ) : (
          <div className="divide-y divide-[rgba(91,79,207,0.12)]">
            {enrichedLogs.map((log: any) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-[rgba(91,79,207,0.02)] transition-colors font-semibold">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center text-[var(--prism-cyan)]">
                    <Download size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[var(--ink-900)]">{log.title}</h4>
                    <p className="text-[10px] text-[var(--ink-300)] mt-1">
                      Accessed on {new Date(log.downloadedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {log.slug && (
                  <Link
                    href={`/dashboard/purchases`}
                    className="text-[10px] font-bold text-[var(--prism-violet)] hover:underline flex items-center gap-0.5"
                  >
                    View instructions <ArrowRight size={10} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
