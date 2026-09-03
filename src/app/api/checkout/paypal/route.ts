import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { paypalConfigured, createPaypalOrder } from "@/lib/payments/paypal";
import { buildOrderFromCart } from "@/server/checkout";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!paypalConfigured()) return NextResponse.json({ error: "PayPal is not configured. Add keys to .env" }, { status: 503 });
  const { coupon } = await req.json().catch(() => ({ coupon: "" }));
  const order = await buildOrderFromCart(user.id, coupon);
  const app = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const created = await createPaypalOrder({
    total: Number(order.total).toFixed(2),
    currency: "USD",
    reference: order.id,
    returnUrl: `${app}/api/checkout/paypal/capture?orderId=${order.id}`,
    cancelUrl: `${app}/checkout?canceled=1`,
  });
  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "PAYPAL",
      status: "PENDING",
      amount: order.total,
      paypalOrderId: created.id,
      providerRef: created.id,
    },
  });
  const approve = created.links.find((l) => l.rel === "approve")?.href;
  return NextResponse.json({ url: approve });
}
