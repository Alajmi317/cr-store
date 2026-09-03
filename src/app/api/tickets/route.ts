import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ticketNumber } from "@/lib/utils";
import { notifyDiscord } from "@/lib/discord";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { subject, department, body } = await req.json();
  if (!subject || !body) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const ticket = await prisma.ticket.create({
    data: {
      number: ticketNumber(),
      userId: user.id,
      subject: String(subject).slice(0, 160),
      department: String(department || "Technical").slice(0, 40),
      messages: { create: { userId: user.id, body: String(body).slice(0, 5000) } },
    },
  });
  await notifyDiscord(`New ticket ${ticket.number} from ${user.email}: ${ticket.subject}`);
  await prisma.notification.create({ data: { userId: user.id, type: "TICKET_UPDATED", title: "Ticket created", body: ticket.number, href: `/tickets/${ticket.number}` } });
  return NextResponse.json({ number: ticket.number });
}
