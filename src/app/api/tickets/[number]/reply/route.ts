import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyDiscord } from "@/lib/discord";
import { sendMail, templates } from "@/lib/email";
import { NextResponse } from "next/server";
import type { TicketStatus } from "@prisma/client";

export async function POST(req: Request, { params }: { params: Promise<{ number: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { number } = await params;
  const ticket = await prisma.ticket.findUnique({ where: { number }, include: { user: true } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const staff = user.role === "SUPPORT" || user.role === "ADMIN" || user.role === "OWNER";
  if (ticket.userId !== user.id && !staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { body, internal, status } = await req.json();
  await prisma.ticketMessage.create({
    data: { ticketId: ticket.id, userId: user.id, body: String(body).slice(0, 5000), internal: Boolean(internal) && staff },
  });
  const data: { status?: TicketStatus } = {};
  if (staff && status && ["OPEN", "PENDING", "ANSWERED", "CLOSED"].includes(status)) data.status = status;
  else if (!staff) data.status = "PENDING";
  else if (staff && !internal) data.status = "ANSWERED";
  await prisma.ticket.update({ where: { id: ticket.id }, data });
  if (staff && !internal) {
    await sendMail({ to: ticket.user.email, ...templates.ticketReply(ticket.number) });
    await prisma.notification.create({ data: { userId: ticket.userId, type: "TICKET_REPLY", title: "New ticket reply", body: ticket.number, href: `/tickets/${ticket.number}` } });
  }
  if (data.status === "CLOSED") await notifyDiscord(`Ticket closed ${ticket.number}`);
  return NextResponse.json({ ok: true });
}
