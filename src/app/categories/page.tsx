import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/i18n/dictionaries";

export default async function CategoriesPage() {
  const locale = ((await cookies()).get("cr_locale")?.value as Locale) === "en" ? "en" : "ar";
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <div className="container-cr py-12">
      <h1 className="display mb-8 text-4xl">{locale === "ar" ? "الأقسام" : "Categories"}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c) => (
          <Link key={c.id} href={`/categories/${c.slug}`} className="glass rounded-2xl p-6 transition hover:-translate-y-0.5">
            <h2 className="text-xl">{locale === "ar" ? c.nameAr : c.nameEn}</h2>
            <p className="text-sm text-zinc-500">{c._count.products} products</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
