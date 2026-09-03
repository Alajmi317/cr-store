"use client";
import { useState } from "react";
export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [n, setN] = useState(name);
  const [msg, setMsg] = useState("");
  return (
    <form className="glass space-y-4 rounded-2xl p-6" onSubmit={async (e) => {
      e.preventDefault();
      const res = await fetch("/api/account/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: n }) });
      setMsg(res.ok ? "Saved" : "Error");
    }}>
      <input value={n} onChange={(e) => setN(e.target.value)} />
      <input value={email} disabled />
      <button className="btn-primary rounded-full px-6 py-2">Save</button>
      {msg && <p className="text-sm text-zinc-400">{msg}</p>}
    </form>
  );
}
