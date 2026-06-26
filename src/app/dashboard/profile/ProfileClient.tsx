"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Upload, User, Mail, Sparkles, Loader } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface ProfileData {
  name: string;
  email: string;
  avatar: string;
}

export default function ProfileClient({
  initialProfile,
}: {
  initialProfile: ProfileData;
}) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [name, setName] = useState(initialProfile.name);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(initialProfile.avatar);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));

    // Auto-upload selected avatar
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "avatars");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload avatar");
      }

      setProfile((prev) => ({ ...prev, avatar: data.url }));
      toast.success("Profile photo uploaded!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
      setAvatarPreview(profile.avatar);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          avatar: profile.avatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="crystal p-6 md:p-8 max-w-xl">
      <Toaster position="top-center" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Avatar Upload Container */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/50 bg-[var(--bg-prism)] flex items-center justify-center shadow-sm shrink-0">
            {avatarPreview ? (
              <Image src={avatarPreview} alt={name} fill className="object-cover" />
            ) : (
              <User size={36} className="text-[var(--ink-300)]" />
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader size={18} className="text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-black text-[var(--ink-900)] uppercase tracking-wider">
              Profile Photo
            </span>
            <span className="text-[10px] text-[var(--ink-500)] font-semibold leading-relaxed">
              Support JPG, PNG or WEBP. Max size 2MB.
            </span>
            <label className="btn-crystal text-[10px] py-2 px-4 font-bold border-white/60 w-fit cursor-pointer flex items-center gap-1">
              <Upload size={12} />
              Choose Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Input fields */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider flex items-center gap-1.5">
              <User size={13} className="text-[var(--prism-violet)]" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name..."
              className="h-11 px-4 rounded-xl bg-white/40 border border-white/60 text-xs font-semibold focus:outline-none focus:border-[var(--prism-violet)] focus:bg-white/80 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-[var(--ink-700)] uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={13} className="text-[var(--prism-violet)]" />
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              readOnly
              className="h-11 px-4 rounded-xl bg-white/20 border border-white/30 text-xs font-semibold text-[var(--ink-500)] focus:outline-none cursor-not-allowed select-all"
            />
            <span className="text-[9px] text-[var(--ink-300)] font-bold italic leading-none pl-1">
              Email addresses are managed via authentication account settings.
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={saving || uploading}
          className="btn-prism text-xs font-bold py-3 px-6 mt-2 w-full sm:w-fit self-end flex items-center justify-center gap-1.5"
        >
          {saving && <Loader size={13} className="animate-spin" />}
          Save Profile
        </button>
      </form>
    </div>
  );
}
