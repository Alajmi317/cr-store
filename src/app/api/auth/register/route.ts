import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sendMail, templates } from "@/lib/email";
import { randomBytes } from "crypto";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(120),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "ip";
  if (!rateLimit(`reg:${ip}`, 8, 60_000).ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email already used" }, { status: 409 });
  const verifyToken = randomBytes(24).toString("hex");
  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
      verifyToken,
    },
  });
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify?token=${verifyToken}`;
  const mail = templates.verify(user.name, url);
  await sendMail({ to: user.email, ...mail });
  const welcome = templates.welcome(user.name);
  await sendMail({ to: user.email, ...welcome });
  await createSession(user, { userAgent: req.headers.get("user-agent") || "", ip });
  return NextResponse.json({ ok: true });
}
