"use client";
import { useState } from "react";
import type { StoreSettings } from "@/lib/settings";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [form, setForm] = useState(settings);
  const [msg, setMsg] = useState("");
  return (
    <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault();
      const res = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setMsg(res.ok ? "Saved. Store name and logo update across the site." : "Error");
    }}>
      <input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} placeholder="Store name" />
      <input value={form.storeLogo} onChange={(e) => setForm({ ...form, storeLogo: e.target.value })} placeholder="Logo path" />
      <input value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} placeholder="Hero title EN" />
      <input value={form.heroTitleAr} onChange={(e) => setForm({ ...form, heroTitleAr: e.target.value })} placeholder="Hero title AR" />
      <textarea value={form.heroDescription} onChange={(e) => setForm({ ...form, heroDescription: e.target.value })} />
      <textarea value={form.heroDescriptionAr} onChange={(e) => setForm({ ...form, heroDescriptionAr: e.target.value })} />
      <input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
      <input value={form.socialDiscord} onChange={(e) => setForm({ ...form, socialDiscord: e.target.value })} placeholder="Discord URL" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.announcementEnabled} onChange={(e) => setForm({ ...form, announcementEnabled: e.target.checked })} />
        Announcement bar
      </label>
      <input value={form.announcement} onChange={(e) => setForm({ ...form, announcement: e.target.value })} />
      <button className="btn-primary rounded-full px-6 py-3">Save</button>
      {msg && <p className="text-sm text-zinc-400">{msg}</p>}
    </form>
  );
}
