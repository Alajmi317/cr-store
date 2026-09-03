import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password || String(password).length < 8) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { resetToken: String(token) } });
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return NextResponse.json({ error: "Expired" }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(String(password)), resetToken: null, resetTokenExpiry: null },
  });
  return NextResponse.json({ ok: true });
}
