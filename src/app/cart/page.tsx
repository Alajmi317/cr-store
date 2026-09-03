import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { effectivePrice, formatMoney } from "@/lib/utils";
import Link from "next/link";
import { CartControls } from "@/components/store/CartControls";

export default async function CartPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const items = await prisma.cartItem.findMany({ where: { userId: user.id }, include: { product: true } });
  const lines = items.map((i) => {
    const unit = effectivePrice(Number(i.product.price), i.product.salePrice != null ? Number(i.product.salePrice) : null);
    return { ...i, unit, line: unit * i.quantity };
  });
  const subtotal = lines.reduce((s, l) => s + l.line, 0);
  return (
    <div className="container-cr py-12">
      <h1 className="display mb-8 text-4xl">Cart</h1>
      {lines.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-zinc-400">Your cart is empty.</p>
          <Link href="/store" className="btn-primary mt-4 inline-block rounded-full px-6 py-3">Browse store</Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            {lines.map((l) => (
              <div key={l.id} className="glass flex items-center justify-between rounded-2xl p-4">
                <div>
                  <Link href={`/products/${l.product.slug}`} className="font-semibold">{l.product.name}</Link>
                  <div className="text-sm text-zinc-400">{formatMoney(l.unit)}</div>
                </div>
                <CartControls productId={l.productId} quantity={l.quantity} />
              </div>
            ))}
          </div>
          <aside className="glass h-fit rounded-2xl p-6">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
            <Link href="/checkout" className="btn-primary mt-6 block rounded-full py-3 text-center">Checkout</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
