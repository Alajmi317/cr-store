"use client";
import { useState } from "react";
export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState("");
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setOk("If the email exists, a reset link was sent.");
  }
  return (
    <form onSubmit={onSubmit} className="glass mx-auto mt-16 w-full max-w-md space-y-4 rounded-3xl p-8">
      <h1 className="display text-3xl">Reset password</h1>
      {ok && <p className="text-sm text-emerald-400">{ok}</p>}
      <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className="btn-primary w-full rounded-full py-3">Send link</button>
    </form>
  );
}
