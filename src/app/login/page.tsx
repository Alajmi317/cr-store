"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function Form() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  const next = useSearchParams().get("next") || "/account";
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) { setErr(data.error || "Login failed"); return; }
    router.push(next);
    router.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="glass mx-auto mt-16 w-full max-w-md space-y-4 rounded-3xl p-8">
      <h1 className="display text-3xl">Sign in</h1>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="btn-primary w-full rounded-full py-3">Login</button>
      <div className="flex justify-between text-sm text-zinc-400">
        <Link href="/forgot-password">Forgot password?</Link>
        <Link href="/register">Create account</Link>
      </div>
    </form>
  );
}
export default function LoginPage() {
  return <Suspense><Form /></Suspense>;
}
