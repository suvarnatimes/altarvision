import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const profileData = {
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "AltarVision User",
    email: user.emailAddresses?.[0]?.emailAddress || "",
    avatar: user.imageUrl || "",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[rgba(91,79,207,0.12)] pb-4">
        <h1 className="text-xl font-black text-[var(--ink-900)] uppercase tracking-wider">
          Profile Settings
        </h1>
        <p className="text-xs text-[var(--ink-500)] mt-1 font-semibold">
          Update your personal billing name and profile photo.
        </p>
      </div>

      <ProfileClient initialProfile={profileData} />
    </div>
  );
}
