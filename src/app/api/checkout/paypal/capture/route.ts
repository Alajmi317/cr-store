import { NextRequest, NextResponse } from "next/server";
import { capturePaypalOrder } from "@/lib/payments/paypal";
import { prisma } from "@/lib/prisma";
import { fulfillPaidOrder } from "@/server/fulfillment";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!token || !orderId) return NextResponse.redirect(new URL("/checkout?failed=1", req.url));
  const captured = await capturePaypalOrder(token);
  if (captured.status !== "COMPLETED") return NextResponse.redirect(new URL("/checkout?failed=1", req.url));
  await prisma.payment.updateMany({
    where: { orderId, paypalOrderId: token },
    data: { status: "SUCCEEDED", providerRef: captured.id },
  });
  await fulfillPaidOrder(orderId);
  await prisma.cartItem.deleteMany({ where: { userId: (await prisma.order.findUnique({ where: { id: orderId } }))!.userId } });
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  return NextResponse.redirect(new URL(`/checkout/success?order=${order?.number}`, req.url));
}
