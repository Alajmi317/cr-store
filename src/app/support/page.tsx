import Link from "next/link";
export default function SupportPage() {
  return (
    <div className="container-cr py-16">
      <h1 className="display text-4xl">Support</h1>
      <p className="mt-3 max-w-2xl text-zinc-400">Open a ticket for installation help, missing files, or billing questions. Average first reply depends on staff availability.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/tickets/new" className="btn-primary rounded-full px-6 py-3">Create ticket</Link>
        <Link href="/tickets" className="btn-ghost rounded-full px-6 py-3">My tickets</Link>
      </div>
    </div>
  );
}
