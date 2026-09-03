import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";

export default async function AdminProducts() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { updatedAt: "desc" } });
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="display text-3xl">Products</h1>
        <Link href="/admin/products/new" className="btn-primary rounded-full px-4 py-2">Add product</Link>
      </div>
      <div className="space-y-2">
        {products.map((p) => (
          <Link key={p.id} href={"/admin/products/" + p.id} className="glass flex justify-between rounded-xl p-4 text-sm">
            <span>{p.name} · {p.status}</span>
            <span>{formatMoney(Number(p.price))} · {p.category.nameEn}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
