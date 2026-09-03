import { prisma } from "@/lib/prisma";
import { sendMail, templates } from "@/lib/email";
import { notifyDiscord } from "@/lib/discord";
import { formatMoney } from "@/lib/utils";
import { randomBytes } from "crypto";

export async function fulfillPaidOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });
  if (!order) throw new Error("Order not found");
  if (order.status === "PAID") return order;

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID", paidAt: new Date() },
  });

  for (const item of order.items) {
    const files = await prisma.productFile.findMany({ where: { productId: item.productId } });
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: { salesCount: { increment: item.quantity } },
      });
    }
    if (files.length === 0) {
      await prisma.download.create({
        data: {
          token: randomBytes(24).toString("hex"),
          userId: order.userId,
          orderId: order.id,
          productId: item.productId,
          remaining: 5,
          enabled: true,
        },
      });
    } else {
      for (const file of files) {
        await prisma.download.create({
          data: {
            token: randomBytes(24).toString("hex"),
            userId: order.userId,
            orderId: order.id,
            productId: item.productId,
            fileId: file.id,
            remaining: file.maxDownloads,
            enabled: true,
          },
        });
      }
    }
  }

  await prisma.notification.create({
    data: {
      userId: order.userId,
      type: "PAYMENT_SUCCESS",
      title: "Payment successful",
      body: `Order ${order.number} is paid. Downloads are ready.`,
      href: "/account/downloads",
    },
  });

  const mail = templates.order(order.number, formatMoney(Number(order.total), order.currency));
  await sendMail({ to: order.customerEmail, ...mail });
  await notifyDiscord(`Payment success — ${order.number} — ${formatMoney(Number(order.total), order.currency)} — ${order.customerEmail}`);
  return order;
}
