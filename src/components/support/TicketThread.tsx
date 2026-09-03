"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function TicketThread({ number, staff, messages }: { number: string; staff: boolean; messages: { id: string; body: string; internal: boolean; name: string; createdAt: string }[] }) {
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [status, setStatus] = useState("");
  const router = useRouter();
  return (
    <div className="space-y-4">
      {messages.filter((m) => !m.internal || staff).map((m) => (
        <div key={m.id} className="glass rounded-2xl p-4">
          <div className="text-xs text-zinc-500">{m.name} · {new Date(m.createdAt).toLocaleString()} {m.internal ? "· internal" : ""}</div>
          <p className="mt-2 whitespace-pre-wrap">{m.body}</p>
        </div>
      ))}
      <form className="space-y-3" onSubmit={async (e) => {
        e.preventDefault();
        await fetch(`/api/tickets/${number}/reply`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body, internal, status }) });
        setBody("");
        router.refresh();
      }}>
        <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} required />
        {staff && (
          <div className="flex gap-3 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Internal note</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Keep status</option>
              <option value="OPEN">Open</option>
              <option value="PENDING">Pending</option>
              <option value="ANSWERED">Answered</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        )}
        <button className="btn-primary rounded-full px-6 py-2">Reply</button>
      </form>
    </div>
  );
}
