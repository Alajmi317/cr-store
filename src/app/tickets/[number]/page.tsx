import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TicketThread } from "@/components/support/TicketThread";
export default async function TicketPage({ params }: { params: Promise<{ number: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const { number } = await params;
  const ticket = await prisma.ticket.findFirst({
    where: { number },
    include: { messages: { include: { user: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!ticket) notFound();
  const staff = user.role === "SUPPORT" || user.role === "ADMIN" || user.role === "OWNER";
  if (ticket.userId !== user.id && !staff) notFound();
  return (
    <div className="container-cr py-12">
      <h1 className="display text-3xl">{ticket.number} — {ticket.subject}</h1>
      <p className="mb-6 text-zinc-400">{ticket.department} · {ticket.status}</p>
      <TicketThread number={ticket.number} staff={staff} messages={ticket.messages.map((m) => ({
        id: m.id, body: m.body, internal: m.internal, name: m.user.name, createdAt: m.createdAt.toISOString(),
      }))} />
    </div>
  );
}
