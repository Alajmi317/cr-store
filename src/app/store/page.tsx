import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import { dictionaries, type Locale } from "@/i18n/dictionaries";
import Link from "next/link";

export default async function StorePage({ searchParams }: { searchParams: Promise<{ sort?: string; cat?: string }> }) {
  const sp = await searchParams;
  const locale = ((await cookies()).get("cr_locale")?.value as Locale) === "en" ? "en" : "ar";
  const dict = dictionaries[locale];
  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (sp.cat) {
    const cat = await prisma.category.findUnique({ where: { slug: sp.cat } });
    if (cat) where.categoryId = cat.id;
  }
  const orderBy = sp.sort === "best" ? { salesCount: "desc" as const } : sp.sort === "price" ? { price: "asc" as const } : { createdAt: "desc" as const };
  const products = await prisma.product.findMany({ where, orderBy, take: 48, include: { category: true } });
  return (
    <div className="container-cr py-10">
      <div className="mb-6 text-sm text-zinc-500"><Link href="/">Home</Link> / Store</div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-4xl">{dict.nav.store}</h1>
        <div className="flex gap-2 text-sm">
          <Link className="btn-ghost rounded-full px-4 py-2" href="/store">Latest</Link>
          <Link className="btn-ghost rounded-full px-4 py-2" href="/store?sort=best">Best</Link>
          <Link className="btn-ghost rounded-full px-4 py-2" href="/store?sort=price">Price</Link>
        </div>
      </div>
      {products.length === 0 ? <div className="glass rounded-2xl p-12 text-center text-zinc-500">No products published yet.</div> : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} locale={locale} p={{
              slug: p.slug, name: p.name, nameAr: p.nameAr, shortDescription: p.shortDescription,
              price: Number(p.price), salePrice: p.salePrice != null ? Number(p.salePrice) : null,
              images: p.images, ratingAvg: p.ratingAvg, ratingCount: p.ratingCount,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
