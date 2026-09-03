import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminTickets() {
  const tickets = await prisma.ticket.findMany({ orderBy: { updatedAt: "desc" }, include: { user: true } });
  return (
    <div>
      <h1 className="display mb-6 text-3xl">Tickets</h1>
      <div className="space-y-2">
        {tickets.map((t) => (
          <Link key={t.id} href={"/tickets/" + t.number} className="glass flex justify-between rounded-xl p-4 text-sm">
            <span>{t.number} · {t.subject} · {t.user.email}</span>
            <span>{t.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
