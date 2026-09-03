"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function NewTicket() {
  const [subject, setSubject] = useState("");
  const [department, setDepartment] = useState("Technical");
  const [body, setBody] = useState("");
  const router = useRouter();
  return (
    <form className="container-cr max-w-xl space-y-4 py-12" onSubmit={async (e) => {
      e.preventDefault();
      const res = await fetch("/api/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, department, body }) });
      const data = await res.json();
      if (res.ok) router.push(`/tickets/${data.number}`);
    }}>
      <h1 className="display text-4xl">New ticket</h1>
      <input required placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <select value={department} onChange={(e) => setDepartment(e.target.value)}>
        <option>Technical</option>
        <option>Billing</option>
        <option>Sales</option>
      </select>
      <textarea required rows={6} placeholder="Describe the issue" value={body} onChange={(e) => setBody(e.target.value)} />
      <button className="btn-primary rounded-full px-6 py-3">Submit</button>
    </form>
  );
}
