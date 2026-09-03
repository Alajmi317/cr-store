import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  if (!name || String(name).length < 2) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await prisma.user.update({ where: { id: user.id }, data: { name: String(name).slice(0, 80) } });
  return NextResponse.json({ ok: true });
}
