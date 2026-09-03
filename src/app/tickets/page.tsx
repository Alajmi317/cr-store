import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
export default async function TicketsPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const tickets = await prisma.ticket.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } });
  return (
    <div className="container-cr py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="display text-4xl">Tickets</h1>
        <Link href="/tickets/new" className="btn-primary rounded-full px-5 py-2">New</Link>
      </div>
      {tickets.length === 0 ? <p className="text-zinc-500">No tickets.</p> : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Link key={t.id} href={`/tickets/${t.number}`} className="glass flex justify-between rounded-2xl p-4">
              <span>{t.number} — {t.subject}</span>
              <span className="text-zinc-400">{t.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
