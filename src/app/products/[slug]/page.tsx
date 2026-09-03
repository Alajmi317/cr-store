import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { dictionaries, type Locale } from "@/i18n/dictionaries";
import { discountPercent, effectivePrice, formatMoney } from "@/lib/utils";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductActions } from "@/components/store/ProductActions";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug } });
  if (!p) return { title: "Product" };
  return {
    title: p.name,
    description: p.shortDescription,
    openGraph: { title: p.name, description: p.shortDescription, images: p.images },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = ((await cookies()).get("cr_locale")?.value as Locale) === "en" ? "en" : "ar";
  const dict = dictionaries[locale];
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, reviews: { include: { user: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!product || product.status !== "PUBLISHED") notFound();
  const related = await prisma.product.findMany({
    where: { status: "PUBLISHED", categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
  });
  const price = effectivePrice(Number(product.price), product.salePrice != null ? Number(product.salePrice) : null);
  const off = discountPercent(Number(product.price), product.salePrice != null ? Number(product.salePrice) : null);
  const title = locale === "ar" && product.nameAr ? product.nameAr : product.name;
  const desc = locale === "ar" && product.descriptionAr ? product.descriptionAr : product.description;
  const img = product.images[0] || "/brand/logo.png";
  return (
    <div className="container-cr py-10">
      <div className="mb-6 text-sm text-zinc-500">
        <Link href="/">Home</Link> / <Link href="/store">Store</Link> / <Link href={`/categories/${product.category.slug}`}>{product.category.nameEn}</Link> / {title}
      </div>
      <div className="grid gap-10 md:grid-cols-2">
        <div className="glass overflow-hidden rounded-3xl">
          <div className="relative aspect-square bg-black">
            <Image src={img} alt={title} fill className="object-contain p-6" />
          </div>
        </div>
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">{product.category.nameEn}</p>
          <h1 className="display text-4xl">{title}</h1>
          <p className="text-zinc-400">{locale === "ar" && product.shortDescriptionAr ? product.shortDescriptionAr : product.shortDescription}</p>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold">{formatMoney(price)}</div>
            {off > 0 && <div className="text-zinc-500 line-through">{formatMoney(Number(product.price))}</div>}
            {off > 0 && <span className="rounded-full bg-white text-black px-2 text-xs font-bold">-{off}%</span>}
          </div>
          <div className="text-sm text-zinc-400">★ {product.ratingAvg.toFixed(1)} ({product.ratingCount}) · {dict.product.version} {product.version}</div>
          <ProductActions productId={product.id} dict={dict.product} />
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="glass rounded-xl p-3"><dt className="text-zinc-500">{dict.product.compatibility}</dt><dd>{product.compatibility || "-"}</dd></div>
            <div className="glass rounded-xl p-3"><dt className="text-zinc-500">{dict.product.license}</dt><dd>{product.license || "-"}</dd></div>
          </dl>
        </div>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <section className="glass rounded-2xl p-6 md:col-span-2">
          <h2 className="display mb-3 text-2xl">{dict.product.details}</h2>
          <div className="whitespace-pre-wrap text-zinc-300">{desc}</div>
          {product.features && <><h3 className="mt-6 font-semibold">Features</h3><div className="whitespace-pre-wrap text-zinc-300">{product.features}</div></>}
          {product.requirements && <><h3 className="mt-6 font-semibold">{dict.product.requirements}</h3><div className="whitespace-pre-wrap text-zinc-300">{product.requirements}</div></>}
          {product.changelog && <><h3 className="mt-6 font-semibold">{dict.product.changelog}</h3><div className="whitespace-pre-wrap text-zinc-300">{product.changelog}</div></>}
        </section>
        <section className="glass rounded-2xl p-6">
          <h2 className="display mb-3 text-2xl">{dict.product.reviews}</h2>
          {product.reviews.length === 0 ? <p className="text-zinc-500">No reviews yet.</p> : product.reviews.map((r) => (
            <article key={r.id} className="border-b border-white/10 py-3">
              <div className="text-sm">★ {r.rating} · {r.user.name}</div>
              <p className="text-zinc-400 text-sm">{r.body}</p>
            </article>
          ))}
        </section>
      </div>
      <section className="mt-12">
        <h2 className="display mb-6 text-2xl">{dict.product.related}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} locale={locale} p={{
              slug: p.slug, name: p.name, nameAr: p.nameAr, shortDescription: p.shortDescription,
              price: Number(p.price), salePrice: p.salePrice != null ? Number(p.salePrice) : null,
              images: p.images, ratingAvg: p.ratingAvg, ratingCount: p.ratingCount,
            }} />
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.shortDescription,
        image: product.images,
        offers: { "@type": "Offer", priceCurrency: "USD", price: price, availability: "https://schema.org/InStock" },
        aggregateRating: product.ratingCount ? { "@type": "AggregateRating", ratingValue: product.ratingAvg, reviewCount: product.ratingCount } : undefined,
      }) }} />
    </div>
  );
}
