import Link from "next/link";
import Image from "next/image";
import { discountPercent, effectivePrice, formatMoney } from "@/lib/utils";

export type ProductCardData = {
  slug: string;
  name: string;
  nameAr?: string | null;
  shortDescription: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  ratingAvg: number;
  ratingCount: number;
};

export function ProductCard({ p, locale }: { p: ProductCardData; locale: "ar" | "en" }) {
  const price = effectivePrice(p.price, p.salePrice);
  const off = discountPercent(p.price, p.salePrice);
  const title = locale === "ar" && p.nameAr ? p.nameAr : p.name;
  const img = p.images[0] || "/brand/logo.png";
  return (
    <Link href={`/products/${p.slug}`} className="group glass rise block overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:border-white/20">
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        <Image src={img} alt={title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
        {off > 0 && (
          <span className="absolute start-3 top-3 rounded-full bg-white text-black px-2 py-0.5 text-xs font-bold">-{off}%</span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-base font-semibold">{title}</h3>
        <p className="line-clamp-2 text-sm text-zinc-400">{p.shortDescription}</p>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-lg font-bold text-zinc-100">{formatMoney(price)}</div>
            {off > 0 && <div className="text-xs text-zinc-500 line-through">{formatMoney(p.price)}</div>}
          </div>
          <div className="text-xs text-zinc-400">★ {p.ratingAvg.toFixed(1)} ({p.ratingCount})</div>
        </div>
      </div>
    </Link>
  );
}
