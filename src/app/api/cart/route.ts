import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.cartItem.findMany({ where: { userId: user.id }, include: { product: true } });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId, quantity = 1 } = await req.json();
  const product = await prisma.product.findUnique({ where: { id: String(productId) } });
  if (!product || product.status !== "PUBLISHED") return NextResponse.json({ error: "Product unavailable" }, { status: 400 });
  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId: product.id } },
    update: { quantity: Number(quantity) || 1 },
    create: { userId: user.id, productId: product.id, quantity: Number(quantity) || 1 },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId } = await req.json();
  await prisma.cartItem.deleteMany({ where: { userId: user.id, productId: String(productId) } });
  return NextResponse.json({ ok: true });
}
