import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import type { Locale } from "@/i18n/dictionaries";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = ((await cookies()).get("cr_locale")?.value as Locale) === "en" ? "en" : "ar";
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) notFound();
  const products = await prisma.product.findMany({ where: { categoryId: cat.id, status: "PUBLISHED" }, orderBy: { createdAt: "desc" } });
  return (
    <div className="container-cr py-12">
      <h1 className="display mb-8 text-4xl">{locale === "ar" ? cat.nameAr : cat.nameEn}</h1>
      {products.length === 0 ? <div className="glass rounded-2xl p-12 text-center text-zinc-500">Empty category.</div> : (
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
