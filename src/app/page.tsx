import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { dictionaries, type Locale } from "@/i18n/dictionaries";
import { ProductCard } from "@/components/store/ProductCard";

export default async function HomePage() {
  const locale = ((await cookies()).get("cr_locale")?.value as Locale) === "en" ? "en" : "ar";
  const dict = dictionaries[locale];
  const settings = await getSettings();
  let categories: { slug: string; nameEn: string; nameAr: string }[] = [];
  let featured: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let latest: typeof featured = [];
  let best: typeof featured = [];
  let deals: typeof featured = [];
  try {
    categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
    featured = await prisma.product.findMany({ where: { status: "PUBLISHED", featured: true }, take: 8, orderBy: { updatedAt: "desc" } });
    latest = await prisma.product.findMany({ where: { status: "PUBLISHED" }, take: 8, orderBy: { createdAt: "desc" } });
    best = await prisma.product.findMany({ where: { status: "PUBLISHED", bestSeller: true }, take: 8, orderBy: { salesCount: "desc" } });
    deals = await prisma.product.findMany({ where: { status: "PUBLISHED", salePrice: { not: null } }, take: 8, orderBy: { updatedAt: "desc" } });
  } catch {}
  const mapP = (p: (typeof featured)[number]) => ({
    slug: p.slug, name: p.name, nameAr: p.nameAr,
    shortDescription: locale === "ar" && p.shortDescriptionAr ? p.shortDescriptionAr : p.shortDescription,
    price: Number(p.price), salePrice: p.salePrice != null ? Number(p.salePrice) : null,
    images: p.images, ratingAvg: p.ratingAvg, ratingCount: p.ratingCount,
  });
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="container-cr grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="rise space-y-6">
            <span className="inline-block rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-300">{dict.hero.badge}</span>
            <h1 className="display text-5xl font-bold leading-tight md:text-6xl">{locale === "ar" ? settings.heroTitleAr : settings.heroTitle}</h1>
            <p className="max-w-xl text-lg text-zinc-400">{locale === "ar" ? settings.heroDescriptionAr : settings.heroDescription}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/store" className="btn-primary rounded-full px-6 py-3">{dict.hero.cta}</Link>
              <Link href="/store?sort=best" className="btn-ghost rounded-full px-6 py-3">{dict.hero.cta2}</Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-8 rounded-full bg-white/5 blur-3xl" />
            <Image src={settings.heroImage || "/brand/logo.png"} alt={settings.storeName} fill className="object-contain" priority />
          </div>
        </div>
      </section>
      <section className="container-cr py-10">
        <h2 className="display mb-6 text-2xl">{dict.sections.categories}</h2>
        {categories.length === 0 ? <p className="text-zinc-500">No categories yet.</p> : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((c) => (
              <Link key={c.slug} href={`/categories/${c.slug}`} className="glass rounded-xl px-4 py-6 text-center transition hover:border-white/25">
                {locale === "ar" ? c.nameAr : c.nameEn}
              </Link>
            ))}
          </div>
        )}
      </section>
      {([[dict.sections.featured, featured],[dict.sections.latest, latest],[dict.sections.bestsellers, best],[dict.sections.offers, deals]] as const).map(([title, list]) => (
        <section key={title} className="container-cr py-10">
          <h2 className="display mb-6 text-2xl">{title}</h2>
          {list.length === 0 ? <div className="glass rounded-2xl p-10 text-center text-zinc-500">No products yet.</div> : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{list.map((p) => <ProductCard key={p.id} p={mapP(p)} locale={locale} />)}</div>
          )}
        </section>
      ))}
    </div>
  );
}
