import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getStripe, stripeConfigured } from "@/lib/payments/stripe";
import { buildOrderFromCart } from "@/server/checkout";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!stripeConfigured()) return NextResponse.json({ error: "Stripe is not configured. Add keys to .env" }, { status: 503 });
  const { coupon } = await req.json().catch(() => ({ coupon: "" }));
  const order = await buildOrderFromCart(user.id, coupon);
  const stripe = getStripe()!;
  const app = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(Number(order.total) * 100),
          product_data: { name: `CR Store order ${order.number}` },
        },
      },
    ],
    metadata: { orderId: order.id, orderNumber: order.number, userId: user.id },
    success_url: `${app}/checkout/success?order=${order.number}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${app}/checkout?canceled=1`,
  });
  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "STRIPE",
      status: "PENDING",
      amount: order.total,
      stripeSessionId: session.id,
      providerRef: session.id,
    },
  });
  return NextResponse.json({ url: session.url });
}
