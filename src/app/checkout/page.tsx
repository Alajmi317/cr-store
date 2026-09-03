import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { effectivePrice, formatMoney } from "@/lib/utils";
import { stripeConfigured } from "@/lib/payments/stripe";
import { paypalConfigured } from "@/lib/payments/paypal";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export default async function CheckoutPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const items = await prisma.cartItem.findMany({ where: { userId: user.id }, include: { product: true } });
  const subtotal = items.reduce((s, i) => s + effectivePrice(Number(i.product.price), i.product.salePrice != null ? Number(i.product.salePrice) : null) * i.quantity, 0);
  return (
    <div className="container-cr grid gap-8 py-12 md:grid-cols-2">
      <div>
        <h1 className="display mb-6 text-4xl">Checkout</h1>
        {items.length === 0 ? <p className="text-zinc-400">Cart is empty.</p> : items.map((i) => (
          <div key={i.id} className="flex justify-between border-b border-white/10 py-3">
            <span>{i.product.name} × {i.quantity}</span>
            <span>{formatMoney(effectivePrice(Number(i.product.price), i.product.salePrice != null ? Number(i.product.salePrice) : null) * i.quantity)}</span>
          </div>
        ))}
        <div className="mt-4 flex justify-between text-lg font-semibold"><span>Total</span><span>{formatMoney(subtotal)}</span></div>
      </div>
      <CheckoutForm stripeOn={stripeConfigured()} paypalOn={paypalConfigured()} />
    </div>
  );
}
