"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
    const data = await res.json();
    if (!res.ok) { setErr(data.error || "Failed"); return; }
    router.push("/account");
    router.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="glass mx-auto mt-16 w-full max-w-md space-y-4 rounded-3xl p-8">
      <h1 className="display text-3xl">Create account</h1>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" required minLength={8} placeholder="Password (min 8)" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="btn-primary w-full rounded-full py-3">Register</button>
      <Link href="/login" className="block text-sm text-zinc-400">Already have an account?</Link>
    </form>
  );
}
