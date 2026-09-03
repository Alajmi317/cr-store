"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
function Form() {
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    if (!res.ok) { setErr("Invalid or expired token"); return; }
    router.push("/login");
  }
  return (
    <form onSubmit={onSubmit} className="glass mx-auto mt-16 w-full max-w-md space-y-4 rounded-3xl p-8">
      <h1 className="display text-3xl">New password</h1>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <input type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
      <button className="btn-primary w-full rounded-full py-3">Save</button>
    </form>
  );
}
export default function ResetPage() { return <Suspense><Form /></Suspense>; }
