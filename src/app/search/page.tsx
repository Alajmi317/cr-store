import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import type { Locale } from "@/i18n/dictionaries";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const locale = ((await cookies()).get("cr_locale")?.value as Locale) === "en" ? "en" : "ar";
  const products = q.trim() ? await prisma.product.findMany({
    where: { status: "PUBLISHED", OR: [
      { name: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { tags: { has: q.toLowerCase() } },
    ] },
    take: 40,
  }) : [];
  return (
    <div className="container-cr py-12">
      <h1 className="display mb-2 text-4xl">Search</h1>
      <p className="mb-8 text-zinc-400">{q ? `${products.length} results for "${q}"` : "Type a query in the search bar."}</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} locale={locale} p={{
            slug: p.slug, name: p.name, nameAr: p.nameAr, shortDescription: p.shortDescription,
            price: Number(p.price), salePrice: p.salePrice != null ? Number(p.salePrice) : null,
            images: p.images, ratingAvg: p.ratingAvg, ratingCount: p.ratingCount,
          }} />
        ))}
      </div>
    </div>
  );
}
