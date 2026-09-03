import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const statics = ["", "/store", "/categories", "/about", "/terms", "/privacy", "/refund"].map((p) => ({ url: `${base}${p || "/"}` }));
  try {
    const products = await prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } });
    return [...statics, ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt }))];
  } catch {
    return statics;
  }
}
