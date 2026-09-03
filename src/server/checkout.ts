import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { effectivePrice, orderNumber } from "@/lib/utils";

export async function buildOrderFromCart(userId: string, couponCode?: string) {
  const items = await prisma.cartItem.findMany({ where: { userId }, include: { product: true } });
  if (!items.length) throw new Error("EMPTY_CART");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const settings = await getSettings();
  let subtotal = 0;
  const lines = items.map((i) => {
    const price = effectivePrice(Number(i.product.price), i.product.salePrice != null ? Number(i.product.salePrice) : null);
    subtotal += price * i.quantity;
    return { productId: i.productId, name: i.product.name, price, quantity: i.quantity };
  });
  let discount = 0;
  let couponId: string | undefined;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (coupon && coupon.active && (!coupon.expiresAt || coupon.expiresAt > new Date()) && (!coupon.maxUses || coupon.usedCount < coupon.maxUses)) {
      if (coupon.percentOff) discount = subtotal * (coupon.percentOff / 100);
      if (coupon.amountOff) discount += Number(coupon.amountOff);
      couponId = coupon.id;
    }
  }
  const tax = settings.taxEnabled ? (subtotal - discount) * (settings.taxRate / 100) : 0;
  const total = Math.max(0, subtotal - discount + tax);
  const order = await prisma.order.create({
    data: {
      number: orderNumber(),
      userId,
      status: "PENDING",
      subtotal,
      discount,
      tax,
      total,
      couponId,
      couponCode: couponCode?.toUpperCase(),
      customerEmail: user.email,
      customerName: user.name,
      items: { create: lines },
    },
  });
  return order;
}
