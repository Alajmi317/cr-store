import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { bootstrapStore } from "@/server/bootstrap";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(120),
});

export async function GET() {
  try {
    const owners = await prisma.user.count({ where: { role: "OWNER" } });
    return NextResponse.json({ configured: owners > 0 });
  } catch {
    return NextResponse.json({ configured: false, db: "error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "ip";
  if (!rateLimit(`setup:${ip}`, 5, 60_000).ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  try {
    await bootstrapStore(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    if (msg === "ALREADY_SETUP") return NextResponse.json({ error: "Store already set up" }, { status: 409 });
    return NextResponse.json({ error: "Database not ready" }, { status: 500 });
  }
}
