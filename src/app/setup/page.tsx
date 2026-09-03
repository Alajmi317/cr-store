"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const [name, setName] = useState("CR Owner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [ready, setReady] = useState<"loading" | "open" | "done">("loading");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((d) => setReady(d.configured ? "done" : "open"))
      .catch(() => setReady("open"));
  }, []);

  if (ready === "loading") return <div className="container-cr py-20 text-center">Loading...</div>;
  if (ready === "done") {
    return (
      <div className="container-cr py-20 text-center">
        <h1 className="display text-4xl">Already set up</h1>
        <p className="mt-3 text-zinc-400">Use the login page.</p>
        <a href="/login" className="btn-primary mt-6 inline-block rounded-full px-6 py-3">Login</a>
      </div>
    );
  }

  return (
    <form
      className="glass mx-auto mt-16 w-full max-w-md space-y-4 rounded-3xl p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr("");
        const res = await fetch("/api/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErr(data.error || "Setup failed. Check DATABASE_URL on Netlify.");
          return;
        }
        router.push("/login");
      }}
    >
      <h1 className="display text-3xl">First setup</h1>
      <p className="text-sm text-zinc-400">Create the Owner account. This page works only once.</p>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" required minLength={8} placeholder="Password (min 8)" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="btn-primary w-full rounded-full py-3">Create Owner</button>
    </form>
  );
}
