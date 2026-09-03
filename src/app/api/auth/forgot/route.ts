import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail, templates } from "@/lib/email";
import { randomBytes } from "crypto";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "ip";
  if (!rateLimit(`forgot:${ip}`, 5).ok) return NextResponse.json({ ok: true });
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: String(email || "").toLowerCase() } });
  if (user) {
    const token = randomBytes(24).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 3600_000) },
    });
    const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    await sendMail({ to: user.email, ...templates.reset(url) });
  }
  return NextResponse.json({ ok: true });
}
