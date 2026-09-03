import { NextResponse } from "next/server";
import { getSessionUser, canAccessAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { ProductStatus } from "@prisma/client";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !canAccessAdmin(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const slug = slugify(body.slug || name) || `product-${Date.now()}`;
  const status = (["DRAFT", "PUBLISHED", "HIDDEN"].includes(body.status) ? body.status : "DRAFT") as ProductStatus;
  const data = {
    name,
    slug,
    shortDescription: String(body.shortDescription || "").slice(0, 240),
    description: String(body.description || ""),
    price: Number(body.price || 0),
    salePrice: body.salePrice ? Number(body.salePrice) : null,
    categoryId: String(body.categoryId),
    version: String(body.version || "1.0.0"),
    compatibility: String(body.compatibility || ""),
    requirements: String(body.requirements || ""),
    features: String(body.features || ""),
    changelog: String(body.changelog || ""),
    license: String(body.license || ""),
    status,
    featured: Boolean(body.featured),
    bestSeller: Boolean(body.bestSeller),
    tags: String(body.tags || "").split(",").map((t: string) => t.trim().toLowerCase()).filter(Boolean),
  };
  const product = body.id
    ? await prisma.product.update({ where: { id: String(body.id) }, data })
    : await prisma.product.create({ data });
  await prisma.auditLog.create({ data: { userId: user.id, action: body.id ? "product.update" : "product.create", entity: "product", entityId: product.id } });
  return NextResponse.json({ id: product.id });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user || !canAccessAdmin(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await req.json();
  await prisma.product.delete({ where: { id: String(id) } });
  return NextResponse.json({ ok: true });
}
