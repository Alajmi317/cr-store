import { NextResponse } from "next/server";
import { getStripe } from "@/lib/payments/stripe";
import { prisma } from "@/lib/prisma";
import { fulfillPaidOrder } from "@/server/fulfillment";
import Stripe from "stripe";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 503 });
  const raw = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true, ignored: "not_paid" });
    }
    const orderId = session.metadata?.orderId;
    if (!orderId) return NextResponse.json({ received: true });
    await prisma.payment.updateMany({
      where: { stripeSessionId: session.id },
      data: { status: "SUCCEEDED", stripePaymentIntentId: String(session.payment_intent || ""), rawPayload: event as never },
    });
    await fulfillPaidOrder(orderId);
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order) await prisma.cartItem.deleteMany({ where: { userId: order.userId } });
  }
  return NextResponse.json({ received: true });
}
